import { Agent, Company, UploadedFiles } from '@/types/agent';

export const AGENT_ROLES = {
  bidManager: { name: 'Bid Manager', icon: '🎯', color: '#ff6b35' },
  legalAnalyst: { name: 'Legal Analyst', icon: '⚖️', color: '#4a90e2' },
  productSpecialist: { name: 'Product Specialist', icon: '🔬', color: '#2ecc71' },
  riskAssessor: { name: 'Risk Assessor', icon: '📊', color: '#e74c3c' },
  financialAnalyst: { name: 'Financial Analyst', icon: '💰', color: '#9b59b6' },
  criticalThinker: { name: 'Critical Thinker', icon: '🤔', color: '#f1c40f' },
} as const;

export type AgentId = keyof typeof AGENT_ROLES;

export function initializeAgents(): Agent[] {
  return Object.entries(AGENT_ROLES).map(([id, role]) => ({
    id,
    name: role.name,
    icon: role.icon,
    color: role.color,
    status: 'idle' as const,
    output: '',
    questions: [],
  }));
}

export function generateMockAgentOutput(agentId: string, company: Company): string {
  const companyName = company.toUpperCase();
  
  switch(agentId) {
    case 'bidManager':
      return `<strong>🎯 BID STRATEGY ANALYSIS</strong><br/>
        Key Win Themes Identified:<br/>
        • Fast delivery (2-4 weeks) vs standard 12 weeks<br/>
        • Cost-effective solution with 15% savings<br/>
        • Proven track record with ${companyName}<br/>
        • Local support team availability<br/><br/>
        <strong>Competitive Positioning:</strong><br/>
        • Emphasize speed and reliability<br/>
        • Highlight existing ${companyName} partnership<br/>
        • Focus on total cost of ownership`;

    case 'legalAnalyst':
      return `<strong>⚖️ LEGAL RISK ASSESSMENT</strong><br/>
        Contract Analysis:<br/>
        • Liability: Standard limitation possible<br/>
        • Payment terms: 30 days acceptable<br/>
        • IP rights: Clear ownership structure<br/>
        • Compliance: GDPR and local regulations covered<br/><br/>
        <strong>Risk Mitigation:</strong><br/>
        • Insurance coverage adequate<br/>
        • Termination clauses favorable<br/>
        • Dispute resolution: Arbitration preferred`;

    case 'productSpecialist':
      return `<strong>🔬 TECHNICAL CAPABILITY ASSESSMENT</strong><br/>
        Solution Fit:<br/>
        • 95% requirements match with current platform<br/>
        • Integration capabilities confirmed<br/>
        • Scalability supports 10x growth<br/>
        • Security standards exceed requirements<br/><br/>
        <strong>Implementation Plan:</strong><br/>
        • Phase 1: Core system (Week 1-2)<br/>
        • Phase 2: Integration (Week 3)<br/>
        • Phase 3: Testing & Go-live (Week 4)`;

    case 'riskAssessor':
      return `<strong>📊 RISK ANALYSIS</strong><br/>
        Project Risks:<br/>
        • Technical: LOW - Proven technology stack<br/>
        • Timeline: MEDIUM - Aggressive but achievable<br/>
        • Resource: LOW - Team available<br/>
        • Market: LOW - Stable demand<br/><br/>
        <strong>Mitigation Strategies:</strong><br/>
        • Dedicated project manager assigned<br/>
        • Weekly milestone reviews<br/>
        • Backup resource pool identified`;

    case 'financialAnalyst':
      return `<strong>💰 FINANCIAL ANALYSIS</strong><br/>
        Cost Structure:<br/>
        • Development: €45,000<br/>
        • Implementation: €15,000<br/>
        • Support (1 year): €12,000<br/>
        • Total Project Value: €72,000<br/><br/>
        <strong>Profitability:</strong><br/>
        • Gross Margin: 35%<br/>
        • ROI: 28% (12 months)<br/>
        • Break-even: Month 8`;

    case 'criticalThinker':
      return `<strong>🤔 CRITICAL CONSIDERATIONS</strong><br/>
        Key Questions:<br/>
        • Is the timeline realistic given scope?<br/>
        • Do we have adequate resources for parallel projects?<br/>
        • What are the hidden costs not mentioned?<br/>
        • How does this align with our strategic goals?<br/><br/>
        <strong>Recommendations:</strong><br/>
        • Request 2-week buffer in timeline<br/>
        • Clarify maintenance responsibilities<br/>
        • Negotiate milestone-based payments`;

    default:
      return `Mock analysis from ${AGENT_ROLES[agentId as AgentId]?.name} for ${companyName}`;
  }
}

export function generateMockAgentQuestions(agentId: string) {
  const baseQuestions = {
    bidManager: [
      { id: '1', text: 'Who are our main competitors for this project and what is their likely approach?', priority: 'high' as const },
      { id: '2', text: 'What is the client\'s budget range and decision timeline?', priority: 'high' as const },
      { id: '3', text: 'Are there any preferred vendors or existing relationships to consider?', priority: 'medium' as const }
    ],
    legalAnalyst: [
      { id: '1', text: 'Are there any regulatory requirements specific to this industry?', priority: 'high' as const },
      { id: '2', text: 'What are the liability caps and insurance requirements?', priority: 'high' as const },
      { id: '3', text: 'How are intellectual property rights handled?', priority: 'medium' as const }
    ],
    productSpecialist: [
      { id: '1', text: 'What are the exact technical specifications and performance requirements?', priority: 'high' as const },
      { id: '2', text: 'Are there any integration requirements with existing systems?', priority: 'high' as const },
      { id: '3', text: 'What is the expected user load and scalability requirements?', priority: 'medium' as const }
    ],
    riskAssessor: [
      { id: '1', text: 'What are the potential project risks and mitigation strategies?', priority: 'high' as const },
      { id: '2', text: 'Are there any dependencies on third-party systems or vendors?', priority: 'medium' as const },
      { id: '3', text: 'What is the contingency plan if timeline slips?', priority: 'medium' as const }
    ],
    financialAnalyst: [
      { id: '1', text: 'What is the total budget and payment schedule?', priority: 'high' as const },
      { id: '2', text: 'Are there any cost escalation clauses or penalties?', priority: 'high' as const },
      { id: '3', text: 'What are the ongoing maintenance and support costs?', priority: 'medium' as const }
    ],
    criticalThinker: [
      { id: '1', text: 'What assumptions are we making that could be wrong?', priority: 'high' as const },
      { id: '2', text: 'What are the long-term implications of this project?', priority: 'medium' as const },
      { id: '3', text: 'Are we missing any critical success factors?', priority: 'medium' as const }
    ]
  };

  return baseQuestions[agentId as keyof typeof baseQuestions] || [];
}

export async function executeAgentWorkflow(agents: Agent[], company: Company, uploadedFiles: UploadedFiles): Promise<Agent[]> {
  // Helper to call backend AI for a single agent
  const callAgent = async (agentId: string, companyName: Company, uploadedFiles: UploadedFiles) => {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, company: companyName, uploadedFiles }),
    });
    if (!res.ok) throw new Error(`Agent API failed: ${res.status}`);
    return (await res.json()) as { output: string; questions: { id: string; text: string; priority: 'high' | 'medium' | 'low' }[] };
  };

  return new Promise((resolve) => {
    let completedCount = 0;
    const totalAgents = agents.length;

    const updatedAgents: Agent[] = agents.map((agent): Agent => ({
      ...agent,
      status: 'analyzing',
      output: '',
      questions: [] as Agent['questions'],
    }));

    const completeAgent = (index: number) => {
      setTimeout(async () => {
        try {
          const { output, questions } = await callAgent(updatedAgents[index].id, company, uploadedFiles);
          updatedAgents[index] = {
            ...updatedAgents[index],
            status: 'completed' as const,
            output,
            questions: questions?.length ? questions : generateMockAgentQuestions(updatedAgents[index].id),
          };
        } catch (err) {
          console.error('Agent call failed', err);
          // Fallback to mock if API fails
          updatedAgents[index] = {
            ...updatedAgents[index],
            status: 'completed' as const,
            output: generateMockAgentOutput(updatedAgents[index].id, company),
            questions: generateMockAgentQuestions(updatedAgents[index].id),
          };
        } finally {
          completedCount++;
          if (completedCount === totalAgents) {
            resolve([...updatedAgents]);
          }
        }
      }, (index + 1) * 2000);
    };

    updatedAgents.forEach((_, index) => completeAgent(index));
  });
}
