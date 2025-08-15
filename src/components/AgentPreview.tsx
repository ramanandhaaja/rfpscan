import React from 'react';
import { UploadedFile } from '@/types/agent';

interface AgentPreviewProps {
  uploadedFiles: {
    rfp: UploadedFile[];
    reference: UploadedFile[];
  };
}

const AGENT_ROLES = {
  bidManager: { name: 'Bid Manager', icon: '🎯', color: '#ff6b35' },
  legalAnalyst: { name: 'Legal Analyst', icon: '⚖️', color: '#4a90e2' },
  productSpecialist: { name: 'Product Specialist', icon: '🔬', color: '#2ecc71' },
  riskAssessor: { name: 'Risk Assessor', icon: '📊', color: '#e74c3c' },
  financialAnalyst: { name: 'Financial Analyst', icon: '💰', color: '#9b59b6' },
  criticalThinker: { name: 'Critical Thinker', icon: '🤔', color: '#f1c40f' },
} as const;

type AgentId = keyof typeof AGENT_ROLES;

export default function AgentPreview({ uploadedFiles }: AgentPreviewProps) {
  const totalFiles = uploadedFiles.rfp.length + uploadedFiles.reference.length;
  const requiredAgents = Object.keys(AGENT_ROLES) as AgentId[];

  if (totalFiles === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-5xl mb-4">🎭</div>
        <p className="font-bold text-lg mb-2">Agents Waiting for Documents</p>
        <p className="text-gray-600 mb-4">
          Upload RFP documents to automatically deploy the right AI agents
        </p>
        <div className="text-sm text-gray-500">
          <p className="font-semibold mb-1">Available Agent Roles:</p>
          <p>🎯 Bid Manager • ⚖️ Legal Analyst • 🔬 Product Specialist</p>
          <p>📊 Risk Assessor • 💰 Financial Analyst • 🤔 Critical Thinker</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <div className="text-3xl mb-4">🤖</div>
      <p className="font-bold text-lg">{requiredAgents.length} AI Agents Identified</p>
      <p className="text-gray-600 mb-4">
        Based on {totalFiles} uploaded document(s)
      </p>
      <div className="flex flex-wrap gap-2">
        {requiredAgents.map((agentId) => {
          const agent = AGENT_ROLES[agentId];
          return (
            <span 
              key={agentId}
              className="text-white px-3 py-1 rounded-full text-sm"
              style={{ backgroundColor: agent.color }}
            >
              {agent.icon} {agent.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}
