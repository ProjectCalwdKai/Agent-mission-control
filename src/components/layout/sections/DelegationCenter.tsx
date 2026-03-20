"use client";

import { useEffect, useState } from 'react';
import { GitBranch, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DelegationCenter() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*, agents(name, model)')
        .not('assigned_agent_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Delegation</h1>
        <button
          onClick={fetchTasks}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          title="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <GitBranch className="h-5 w-5 text-blue-600 mr-3" />
          <h2 className="text-lg font-semibold text-gray-800">Delegation Flows</h2>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Error: {error}</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-600 font-medium">
              No delegation flows yet
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      {task.title || 'Untitled Task'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Status: {task.status} | Priority: {task.priority}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(task.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {task.agents && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {task.agents.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {task.agents.model}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
