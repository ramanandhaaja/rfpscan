import React, { useState } from 'react';
import { Agent, Company } from '@/types/agent';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  selectedCompany: Company;
}

export default function ProposalModal({ isOpen, onClose, agents, selectedCompany }: ProposalModalProps) {
  const [proposalTitle, setProposalTitle] = useState('');
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState('');

  if (!isOpen) return null;

  const generateFullProposal = async () => {
    setIsGenerating(true);
    
    // Simulate proposal generation
    setTimeout(() => {
      const proposal = `
        <div class="proposal-document">
          <div class="proposal-header">
            <h1>${proposalTitle || 'RFP Response Proposal'}</h1>
            <p class="company-info">Prepared for: ${selectedCompany.toUpperCase()}</p>
            <p class="date">Date: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="proposal-section">
            <h2>Executive Summary</h2>
            <p>${executiveSummary || 'This proposal outlines our comprehensive response to your RFP requirements.'}</p>
          </div>

          <div class="proposal-section">
            <h2>🎯 Strategic Approach</h2>
            ${agents.find(a => a.id === 'bidManager')?.output || '<p>Strategic analysis pending...</p>'}
          </div>

          <div class="proposal-section">
            <h2>⚖️ Legal Compliance</h2>
            ${agents.find(a => a.id === 'legalAnalyst')?.output || '<p>Legal analysis pending...</p>'}
          </div>

          <div class="proposal-section">
            <h2>🔬 Technical Solution</h2>
            ${agents.find(a => a.id === 'productSpecialist')?.output || '<p>Technical analysis pending...</p>'}
          </div>

          <div class="proposal-section">
            <h2>📊 Risk Assessment</h2>
            ${agents.find(a => a.id === 'riskAssessor')?.output || '<p>Risk analysis pending...</p>'}
          </div>

          <div class="proposal-section">
            <h2>💰 Financial Analysis</h2>
            ${agents.find(a => a.id === 'financialAnalyst')?.output || '<p>Financial analysis pending...</p>'}
          </div>

          <div class="proposal-section">
            <h2>🤔 Critical Considerations</h2>
            ${agents.find(a => a.id === 'criticalThinker')?.output || '<p>Critical analysis pending...</p>'}
          </div>

          <div class="proposal-section">
            <h2>Conclusion</h2>
            <p>Based on our comprehensive analysis, we are confident in our ability to deliver exceptional results for this project. Our multi-agent approach ensures thorough evaluation from all critical perspectives.</p>
          </div>
        </div>
      `;
      
      setGeneratedProposal(proposal);
      setIsGenerating(false);
    }, 3000);
  };

  const downloadProposal = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedProposal.replace(/<[^>]*>/g, '')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${proposalTitle || 'RFP_Proposal'}_${selectedCompany}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadProposalPdf = async () => {
    if (!generatedProposal) return;
    // Dynamic import to avoid SSR issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2pdf: any = (await import('html2pdf.js')).default;

    // Create a container with consistent print styles
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="font-family: 'Times New Roman', serif; line-height: 1.6; font-size: 12pt; color: #111;">
        ${generatedProposal}
      </div>
    `;

    const filename = `${proposalTitle || 'RFP_Proposal'}_${selectedCompany}.pdf`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opt: any = {
      margin:       [10, 12, 12, 12], // top, left, bottom, right (mm)
      filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'] },
    };

    // Trigger save
    await html2pdf().from(container).set(opt).save();

    // Cleanup
    container.remove();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">📄 Generate Complete Proposal</h2>
            <div className="flex items-center gap-2">
              {generatedProposal && (
                <button
                  onClick={downloadProposal}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                >
                  💾 Download
                </button>
              )}
              {generatedProposal && (
                <button
                  onClick={downloadProposalPdf}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                >
                  📑 Download PDF
                </button>
              )}
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!generatedProposal ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proposal Title
                </label>
                <input
                  type="text"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter proposal title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Executive Summary
                </label>
                <textarea
                  rows={4}
                  value={executiveSummary}
                  onChange={(e) => setExecutiveSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter executive summary"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">Agent Insights to Include:</h3>
                <div className="space-y-2">
                  {agents.filter(a => a.status === 'completed').map(agent => (
                    <div key={agent.id} className="flex items-center">
                      <span className="mr-2">{agent.icon}</span>
                      <span className="text-sm text-gray-600">{agent.name}</span>
                      <span className="ml-auto text-green-500">✅</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  onClick={generateFullProposal}
                  disabled={isGenerating}
                  className={`w-full py-3 px-4 rounded-xl font-medium text-white ${
                    isGenerating
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors`}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Proposal...
                    </div>
                  ) : (
                    'Generate Complete Proposal'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="proposal-content">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: generatedProposal }}
                style={{
                  fontFamily: 'Times New Roman, serif',
                  lineHeight: '1.6',
                  fontSize: '14px'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
