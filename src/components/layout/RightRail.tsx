"use client";

import { 
  Check, 
  Users, 
  Folder, 
  ChevronDown 
} from 'lucide-react';
import { useState } from 'react';
import { Agent, Task } from '@/types';

export default function RightRail() {
  const [approvalQueueOpen, setApprovalQueueOpen] = useState(true);
  const [agentRosterOpen, setAgentRosterOpen] = useState(true);
  const [outputsOpen, setOutputsOpen] = useState(true);

  // Mock data - in a real app, this would come from a backend
  const approvalQueue: Task[] = [];
  const agentRoster: Agent[] = [
    { id: 'chief-agent', name: 'Chief Agent', model: 'gpt-5.4', role: 'Chief Agent', availability: 'online' },
    { id: 'coding-lead', name: 'Coding Lead', model: 'sonnet', role: 'Coding Lead', availability: 'online' },
    { id: 'research-lead', name: 'Research Lead', model: 'gemini-pro', role: 'Research Lead', availability: 'online' },
    { id: 'fast-worker', name: 'Fast Worker', model: 'gemini-flash', role: 'Fast Worker', availability: 'online' },
    { id: 'brainstormer', name: 'Brainstormer', model: 'qwen', role: 'Brainstormer', availability: 'online' },
    { id: 'finance-lead', name: 'Finance Lead', model: 'minimax', role: 'Finance Lead', availability: 'online' },
    { id: 'generalist', name: 'Generalist', model: 'minimax', role: 'Generalist', availability: 'online' },
  ];
  const outputs: string[] = [];

  return (
    <div className="space-y-4 p-4">
      {/* Approval Queue */}
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-700">Approval Queue</h3>
          <button
            onClick={() => setApprovalQueueOpen(!approvalQueueOpen)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {approvalQueueOpen ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronDown className="-rotate-180 ml-1 h-4 w-4" />}
          </button>
        </div>
        {approvalQueueOpen && (
          <div className="space-y-2">
            {approvalQueue.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No approvals pending
              </div>
            ) : (
              <div className="space-y-2">
                {approvalQueue.map((task) => (
                  <div key={task.id} className="p-3 bg-gray-50 rounded">
                    <h4 className="text-sm font-medium text-gray-900">{task.prompt}</h4>
                    <p className="text-xs text-gray-500">Requested by: {task.assignedAgent || 'Unknown'}</p>
                    <button
                      onClick={() => {
                        // In a real app, we would call an API to approve the task
                        console.log(`Approving task ${task.id}`);
                      }}
                      className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Agent Roster */}
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-700">Agent Roster</h3>
          <button
            onClick={() => setAgentRosterOpen(!agentRosterOpen)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {agentRosterOpen ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronDown className="-rotate-180 ml-1 h-4 w-4" />}
          </button>
        </div>
        {agentRosterOpen && (
          <div className="space-y-2">
            {agentRoster.map((agent) => (
              <div key={agent.id} className="flex items-center p-3 bg-gray-50 rounded">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {agent.name.charAt(0)}
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{agent.name}</h4>
                  <p className="text-xs text-gray-500">{agent.model}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${agent.availability === 'online' ? 'bg-green-100 text-green-800' : agent.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {agent.availability}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outputs */}
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-700">Outputs</h3>
          <button
            onClick={() => setOutputsOpen(!outputsOpen)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {outputsOpen ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronDown className="-rotate-180 ml-1 h-4 w-4" />}
          </button>
        </div>
        {outputsOpen && (
          <div className="space-y-2">
            {outputs.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No outputs yet
              </div>
            ) : (
              <div className="space-y-2">
                {outputs.map((output, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <h4 className="text-sm font-medium text-gray-900">Output {index + 1}</h4>
                    <p className="text-xs text-gray-500">Completed just now</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}