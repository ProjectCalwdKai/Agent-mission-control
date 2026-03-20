"use client";

import { useEffect, useState } from 'react';
import { Check, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ApprovalsCenter() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('approvals')
        .select('*, tasks(*)')
        .order('requested_at', { ascending: false });

      if (fetchError) throw fetchError;
      setApprovals(data || []);
    } catch (err: any) {
      console.error('Error fetching approvals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (approvalId: string) => {
    try {
      await supabase
        .from('approvals')
        .update({ status: 'approved', resolved_at: new Date().toISOString() })
        .eq('id', approvalId);
      fetchApprovals();
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
      fetchApprovals();
    } catch (err) {
      console.error('Error rejecting:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
        <button
          onClick={fetchApprovals}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          title="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Check className="h-5 w-5 text-green-600 mr-3" />
          <h2 className="text-lg font-semibold text-gray-800">Pending Approvals</h2>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Error: {error}</div>
          ) : approvals.length === 0 ? (
            <div className="text-center py-8 text-gray-600 font-medium">
              No pending approvals
            </div>
          ) : (
            approvals.map((approval) => (
              <div key={approval.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      {approval.tasks?.title || 'Task'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Category: {approval.tasks?.category || 'N/A'} | Priority: {approval.tasks?.priority || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Requested: {new Date(approval.requested_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(approval.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(approval.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
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
