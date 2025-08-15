import React from 'react';
import { Agent } from '@/types/agent';

interface ActiveAgentsProps {
  agents: Agent[];
}

export default function ActiveAgents({ agents }: ActiveAgentsProps) {
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Active Agents</h2>
      </div>
      
      <div className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.id} className="border rounded-xl p-4">
            <div className="flex items-center mb-2">
              <span 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3"
                style={{ backgroundColor: agent.color }}
              >
                {agent.icon}
              </span>
              <h3 className="font-medium">{agent.name}</h3>
              <span className="ml-auto text-sm">
                {agent.status === 'idle' && (
                  <span className="text-gray-500">⏳ Waiting...</span>
                )}
                {agent.status === 'analyzing' && (
                  <span className="text-blue-500">🔄 Analyzing...</span>
                )}
                {agent.status === 'completed' && (
                  <span className="text-green-500">✅ Completed</span>
                )}
              </span>
            </div>
            
            {agent.output && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                <div dangerouslySetInnerHTML={{ __html: agent.output }} />
              </div>
            )}
            
            {agent.questions && agent.questions.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Key Questions:</h4>
                <ul className="space-y-2">
                  {agent.questions.map((question) => (
                    <li key={question.id} className="flex items-start">
                      <span className={`mr-2 mt-1 ${
                        question.priority === 'high' ? 'text-red-500' : 
                        question.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        •
                      </span>
                      <span className="text-sm text-gray-700">{question.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
