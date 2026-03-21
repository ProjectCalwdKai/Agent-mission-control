"use client";

import { Check, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAutoRefresh, formatLastUpdated } from '@/hooks/useAutoRefresh';
import { Database } from '@/lib/supabase';

type Approval = Database['public']['Tables']['approvals']['Row'];

interface ApprovalWithTask extends Approval {
  task?: Database['public']['Tables']['tasks']['Row'] | null;
}

export default function ApprovalsCenter() {
  const fetchApprovals = async (): Promise<ApprovalWithTask[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('approvals')
        .select(`
          *,
          task:tasks (
            id,
            title,
            description,
            status
          )
        `)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err: any) {
      console.error('Error fetching approvals:', err);
      throw err;
    }
  };

  const {
    data: approvals = [],
    loading,
    error,
    refresh,
    refreshing,
    lastUpdatedAgo,
    connectionLost,
    resetConnection,
  } = useAutoRefresh<ApprovalWithTask[]>({
    fetchFn: fetchApprovals,
    interval: 5000,
    initialData: [],
  });

  const handleApprove = async (approvalId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('approvals')
        .update({
          status: 'approved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', approvalId);

      if (updateError) throw updateError;
      await refresh();
    } catch (err) {
      console.error('Error approving:', err);
    }
  };

  const handleReject = async (approvalId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('approvals')
        .update({
          status: 'rejected',
          resolved_at: new Date().toISOString()
        })
        .eq('id', approvalId);

      if (updateError) throw updateError;
      await refresh();
    } catch (err) {
      console.error('Error rejecting:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Approvals</h1>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {connectionLost ? (
              <span className="text-red-600 font-medium">Connection lost</span>
            ) : (
              `Updated ${formatLastUpdated(lastUpdatedAgo)}`
            )}
          </span>
          {connectionLost ? (
            <button
              onClick={resetConnection}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
              title="Reconnect"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={refresh}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              title="Refresh approvals"
              disabled={refreshing}
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">Error: {error.message}</p>
          </div>
        </div>
      )}

      {connectionLost && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-700">Connection lost. Attempting to reconnect...</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Check className="h-5 w-5 text-green-600 mr-3" />
          <h2 className="text-lg font-medium text-gray-800">Pending Approvals ({approvals.length})</h2>
        </div>
        <div className="space-y-4">
          {loading && !approvals.length ? (
            <div className="text-center py-8 text-gray-500">Loading approvals...</div>
          ) : approvals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending approvals
            </div>
          ) : (
            approvals.map((approval) => (
              <div
                key={approval.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900">
                      {approval.task?.title || 'Approval Request'}
                    </h3>
                    {approval.task?.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {approval.task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          Requested {new Date(approval.requested_at).toLocaleString()}
                        </span>
                      </div>
                      {approval.requested_by && (
                        <div className="flex items-center space-x-1">
                          <Check className="h-3 w-3" />
                          <span>By: {approval.requested_by}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleApprove(approval.id)}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(approval.id)}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
