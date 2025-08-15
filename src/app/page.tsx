"use client";

import { useState, useEffect } from 'react';
import { Agent, Company, UploadedFile } from '@/types/agent';
import Header from '@/components/Header';
import CompanySelector from '@/components/CompanySelector';
import FileUpload from '@/components/FileUpload';
import AgentPreview from '@/components/AgentPreview';
import ActiveAgents from '@/components/ActiveAgents';
import ProposalModal from '@/components/ProposalModal';
import { initializeAgents, executeAgentWorkflow } from '@/services/agentService';



export default function Home() {
  const [selectedCompany, setSelectedCompany] = useState<Company>('orange');
  const [selectedUploadType, setSelectedUploadType] = useState<'rfp' | 'reference'>('rfp');
  const [uploadedFiles, setUploadedFiles] = useState<{
    rfp: UploadedFile[];
    reference: UploadedFile[];
  }>({ rfp: [], reference: [] });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);

  // Initialize agents
  useEffect(() => {
    setAgents(initializeAgents());
  }, []);

  // Handle files upload from FileUpload component
  const handleFilesUpload = (files: UploadedFile[], type: 'rfp' | 'reference') => {
    setUploadedFiles((prev) => ({
      ...prev,
      [type]: [...prev[type], ...files]
    }));
  };

  // (Removed) Unused mock file content generator

  // Handle upload type change
  const handleUploadTypeChange = (type: 'rfp' | 'reference') => {
    setSelectedUploadType(type);
    setUploadedFiles({ rfp: [], reference: [] });
  };



  // Start agent analysis
  const startAnalysis = async () => {
    if (uploadedFiles.rfp.length === 0) return;
    
    setIsAnalyzing(true);
    
    try {
      const updatedAgents = await executeAgentWorkflow(agents, selectedCompany, uploadedFiles);
      setAgents(updatedAgents);
    } catch (error) {
      console.error('Agent workflow failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };



  // Handle proposal generation
  const handleGenerateProposal = () => {
    setShowProposalModal(true);
  };

  // Compute proposal generation readiness
  const allCompleted = agents.length > 0 && agents.every(agent => agent.status === 'completed');
  const bidManagerCompleted = agents.find(agent => agent.id === 'bidManager' && agent.status === 'completed');
  const canGenerateProposal = Boolean(allCompleted && bidManagerCompleted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 text-gray-800 p-4">
      <div className="container mx-auto py-8 max-w-7xl">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <CompanySelector 
            selectedCompany={selectedCompany}
            onCompanyChange={setSelectedCompany}
          />
          
          <FileUpload
            selectedUploadType={selectedUploadType}
            uploadedFiles={uploadedFiles}
            onUploadTypeChange={handleUploadTypeChange}
            onFilesUpload={handleFilesUpload}
            onStartAnalysis={startAnalysis}
            isAnalyzing={isAnalyzing}
          />
          
          <AgentPreview uploadedFiles={uploadedFiles} />
        </div>

        <div className="space-y-6">
          <ActiveAgents 
            agents={agents}
          />
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Collaboration Flow</h2>
            <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">
              <p>Agent collaboration and chat interface will appear here</p>
            </div>
          </div>
        </div>
      </div>
      {canGenerateProposal && (
        <div className="fixed bottom-0 inset-x-0 z-40">
          <div className="container mx-auto max-w-7xl px-4 pb-4">
            <div className="bg-white shadow-xl rounded-xl p-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                ✅ All agent insights have been synthesized. Bid Manager is ready to generate the proposal.
              </div>
              <button
                onClick={handleGenerateProposal}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
              >
                📄 Generate Proposal
              </button>
            </div>
          </div>
        </div>
      )}

      <ProposalModal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        agents={agents}
        selectedCompany={selectedCompany}
      />
    </div>
  );
}
