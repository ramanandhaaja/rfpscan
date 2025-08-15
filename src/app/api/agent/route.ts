import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';

export const runtime = 'nodejs';

// POST /api/agent
// Body: { agentId: string, company: string, context?: string, uploadedFiles?: { rfp: UploadedFile[]; reference: UploadedFile[] } }
export async function POST(req: Request) {
  try {
    const { agentId, company, context, uploadedFiles } = await req.json();
    if (!agentId || !company) {
      return NextResponse.json({ error: 'agentId and company are required' }, { status: 400 });
    }

    const roleMap: Record<string, { title: string; focus: string }>
      = {
        bidManager: { title: 'BID STRATEGY ANALYSIS', focus: 'win themes, competitive positioning, and proposal strategy' },
        legalAnalyst: { title: 'LEGAL RISK ASSESSMENT', focus: 'contractual risks, compliance, IP, and mitigation' },
        productSpecialist: { title: 'TECHNICAL CAPABILITY ASSESSMENT', focus: 'solution fit, architecture, scalability, security, and implementation plan' },
        riskAssessor: { title: 'RISK ANALYSIS', focus: 'project risks, likelihood/impact, and mitigations' },
        financialAnalyst: { title: 'FINANCIAL ANALYSIS', focus: 'cost structure, margins, ROI, and payment terms' },
        criticalThinker: { title: 'CRITICAL CONSIDERATIONS', focus: 'assumptions, blind spots, decision risks, and recommendations' },
      };

    const role = roleMap[agentId] ?? { title: 'ANALYSIS', focus: 'general analysis' };

    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const system = `You are an expert ${agentId} for proposal/RFP analysis. Output succinct, helpful content.`;

    // Expected output sections per agent to match frontend examples
    const expectedSectionsMap: Record<string, string> = {
      bidManager: `
Expected Sections (HTML):
<strong>🎯 BID STRATEGY ANALYSIS</strong><br/>
• Key Win Themes Identified (bullets)<br/>
<br/>
<strong>Competitive Positioning:</strong><br/>
• Guidance on emphasis (bullets)
`,
      legalAnalyst: `
Expected Sections (HTML):
<strong>⚖️ LEGAL RISK ASSESSMENT</strong><br/>
• Contract Analysis (bullets)<br/>
<br/>
<strong>Risk Mitigation:</strong><br/>
• Mitigation items (bullets)
`,
      productSpecialist: `
Expected Sections (HTML):
<strong>🔬 TECHNICAL CAPABILITY ASSESSMENT</strong><br/>
• Solution Fit points (bullets)<br/>
<br/>
<strong>Implementation Plan:</strong><br/>
• Phase breakdown (bullets)
`,
      riskAssessor: `
Expected Sections (HTML):
<strong>📊 RISK ANALYSIS</strong><br/>
• Project Risks with levels (bullets)<br/>
<br/>
<strong>Mitigation Strategies:</strong><br/>
• Strategies (bullets)
`,
      financialAnalyst: `
Expected Sections (HTML):
<strong>💰 FINANCIAL ANALYSIS</strong><br/>
• Cost Structure with amounts (bullets)<br/>
<br/>
<strong>Profitability:</strong><br/>
• Margin, ROI, Break-even (bullets)
`,
      criticalThinker: `
Expected Sections (HTML):
<strong>🤔 CRITICAL CONSIDERATIONS</strong><br/>
• Key Questions (bullets)<br/>
<br/>
<strong>Recommendations:</strong><br/>
• Actionable recommendations (bullets)
`,
    };
    const expectedSections = expectedSectionsMap[agentId] ?? '';

    // Build a compact summary of uploaded files and include content excerpts when available
    type UFile = {
      id?: string;
      name: string;
      size?: number;
      type?: 'rfp' | 'reference';
      content?: unknown;
      mime?: string;
      contentBase64?: string;
    };
    const rfpFiles: UFile[] = Array.isArray(uploadedFiles?.rfp) ? uploadedFiles.rfp : [];
    const refFiles: UFile[] = Array.isArray(uploadedFiles?.reference) ? uploadedFiles.reference : [];
    if (process.env.NODE_ENV !== 'production') {
      const first = rfpFiles[0];
      if (first) {
        console.log('API received RFP file meta:', {
          name: first.name,
          mime: first.mime,
          base64Len: first.contentBase64 ? String(first.contentBase64).length : 0,
          hasTextContent: typeof first.content === 'string' && first.content.length > 0,
        });
      }
    }
    const summarize = (files: UFile[]) => files.map(f => `- ${f.name}${typeof f.size === 'number' ? ` (${f.size} bytes)` : ''}`).join('\n');
    const filesSummary = `RFP Files (${rfpFiles.length}):\n${summarize(rfpFiles) || '- none'}\n\nReference Files (${refFiles.length}):\n${summarize(refFiles) || '- none'}`;

    // Prepare safe content excerpts (prefer text). Cap per-file and total to keep prompt small.
    const maxPerFile = 1500; // chars
    const maxTotal = 4000;   // chars across all files
    let totalSoFar = 0;
    const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    // Try to extract text from DOCX if base64 is present; fall back silently if mammoth is not installed
    const tryExtractDocx = async (base64?: string): Promise<string> => {
      if (!base64) return '';
      try {
        // Dynamic import to avoid hard dependency
        const mammoth = (await import('mammoth')) as unknown as typeof import('mammoth');
        const buffer = Buffer.from(base64, 'base64');
        // Prefer raw text in Node environment
        try {
          const { value } = await mammoth.extractRawText({ buffer });
          if (process.env.NODE_ENV !== 'production') {
            console.log('[mammoth.extractRawText] len:', value ? String(value).length : 0);
          }
          if (value && String(value).trim().length > 0) return String(value);
        } catch {
          // ignore and try HTML fallback
        }
        try {
          const { value } = await mammoth.convertToHtml({ buffer });
          const html = String(value || '');
          if (!html) return '';
          // Basic HTML strip to get text-only excerpt
          const text = html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
          if (process.env.NODE_ENV !== 'production') {
            console.log('[mammoth.convertToHtml] htmlLen:', html.length, ' textLen:', text.length, ' sample:', text.slice(0, 120));
          }
          return text.trim();
        } catch (e) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('[mammoth.convertToHtml] error:', e);
          }
          return '';
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[tryExtractDocx] outer error:', e);
        }
        return '';
      }
    };

    const extractText = async (f: UFile): Promise<string> => {
      if (typeof f?.content === 'string' && f.content) return f.content;
      const isDocxByMime = f?.mime === DOCX_MIME;
      const isDocxByName = typeof f?.name === 'string' && /\.docx$/i.test(f.name);
      if ((isDocxByMime || isDocxByName) && f?.contentBase64) {
        const html = await tryExtractDocx(f.contentBase64);
        return html;
      }
      // Could add PDF extraction here if needed in future
      return '';
    };

    const excerpt = async (label: string, files: UFile[]) => {
      const parts: string[] = [];
      for (const f of files) {
        if (totalSoFar >= maxTotal) break;
        const raw = await extractText(f);
        if (!raw) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('[excerpt] no text for file:', f.name, ' mime:', f.mime, ' hasBase64:', !!f.contentBase64);
          }
          continue;
        }
        const remaining = Math.max(0, maxTotal - totalSoFar);
        const slice = raw.slice(0, Math.min(maxPerFile, remaining));
        totalSoFar += slice.length;
        if (!slice) continue;
        parts.push(`File: ${f.name}\n--- BEGIN ${label} EXCERPT ---\n${slice}\n--- END EXCERPT ---`);
      }
      return parts.join('\n\n');
    };

    const rfpExcerpts = await excerpt('RFP', rfpFiles);
    const refExcerpts = await excerpt('REFERENCE', refFiles);
    // Ask for structured JSON to parse robustly
    
    const user = `Company: ${String(company).toUpperCase()}
    
    
Role Title: ${role.title}
Focus: ${role.focus}
Context (optional): ${context ?? 'N/A'}

Uploaded Files Summary:\n${filesSummary}

Uploaded Files Content Excerpts (truncated):\n${rfpExcerpts || '- none'}\n\n${refExcerpts || ''}

${expectedSections}

Return STRICT JSON with keys: output_html (string), questions (array of {id:string,text:string,priority:'high'|'medium'|'low'}). The HTML must use <strong> for section headers and <br/> for line breaks, like the examples in the app. Do not include backticks.
`;

    const ai = await model.invoke([
      { role: 'system', content: system },
      { role: 'user', content: user },
    ]);

    type Question = { id: string; text: string; priority: 'high' | 'medium' | 'low' };
    type Parsed = { output_html?: string; questions?: Question[] };
    let parsed: Parsed;
    try {
      // Some models wrap JSON in code fences; strip gently
      const text = typeof ai.content === 'string'
        ? ai.content
        : (Array.isArray(ai.content)
            ? ai.content.map((c: { text?: string }) => c?.text ?? '').join('\n')
            : '');
      const cleaned = text.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
      parsed = JSON.parse(cleaned);
      //console.log(parsed);
    } catch {
      // Fallback minimal output if parsing fails
      parsed = {
        output_html: `<strong>${role.title}</strong><br/>Generated analysis for ${String(company).toUpperCase()}.`,
        questions: [
          { id: '1', text: 'What are the top 3 risks and mitigations?', priority: 'high' },
          { id: '2', text: 'What is the expected decision timeline?', priority: 'medium' },
        ],
      };
    }

    // Basic validation
    const output: string = String(parsed.output_html ?? '');
    const questions: Question[] = Array.isArray(parsed.questions) ? parsed.questions : [];

    return NextResponse.json({ output, questions });
  } catch (err) {
    console.error('Agent API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
