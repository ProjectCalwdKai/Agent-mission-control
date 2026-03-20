"use client";

import { 
  Check, 
  Users, 
  Folder, 
  ChevronDown,
  RefreshCw,
  Circle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Agent, Task } from '@/types';

export default function RightRail() {
  const [approvalQueueOpen, setApprovalQueueOpen] = useState(true);
  const [agentRosterOpen, setAgentRosterOpen] = useState(true);
  const [outputsOpen, setOutputsOpen] = useState(true);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [outputs, setOutputs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch approvals
      const { data: approvalData } = await supabase
        .from('approvals')
        .select('*, tasks(*)')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })
        .limit(5);
      
      // Fetch agents
      const { data: agentData } = await supabase
        .from('agents')
        .select('*')
        .order('name');
      
      // Fetch outputs
      const { data: outputData } = await supabase
        .from('outputs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setApprovals(approvalData || []);
      setAgents(agentData || []);
      setOutputs(outputData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (approvalId: string) => {
    try {
      await supabase
        .from('approvals')
        .update({ status: 'approved', resolved_at: new Date().toISOString() })
        .eq('id', approvalId);
      fetchData();
    } catch (err) {
      console.error('Error approving:', err);
    }
  };

  const handleReject = async (approvalId: string) => {
    try {
      await supabase
        .from('approvals')
        .update({ status: 'rejected', resolved_at: new Date().toISOString() })
        .eq('id', approvalId);
      fetchData();
    } catch (err) {
      console.error('Error rejecting:', err);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800">Quick View</h2>
        <button
          onClick={fetchData}
          className="p-1 text-gray-500 hover:text-gray-700 rounded"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

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
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : approvals.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No approvals pending
              </div>
            ) : (
              <div className="space-y-2">
                {approvals.map((approval) => (
                  <div key={approval.id} className="p-3 bg-gray-50 rounded">
                    <h4 className="text-sm font-medium text-gray-900">
                      {approval.tasks?.title || 'Task'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Requested: {new Date(approval.requested_at).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleApprove(approval.id)}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(approval.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
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
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : agents.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No agents</div>
            ) : (
              agents.map((agent) => (
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
              ))
            )}
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
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : outputs.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No outputs yet
              </div>
            ) : (
              <div className="space-y-2">
                {outputs.map((output, index) => (
                  <div key={output.id || index} className="p-3 bg-gray-50 rounded">
                    <h4 className="text-sm font-medium text-gray-900">{output.title || 'Output'}</h4>
                    <p className="text-xs text-gray-500">
                      {output.created_at ? new Date(output.created_at).toLocaleDateString() : 'Recently'}
                    </p>
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
