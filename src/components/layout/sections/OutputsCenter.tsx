"use client";

import { useEffect, useState } from 'react';
import { Folder, Check, Activity, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function OutputsCenter() {
  const [outputs, setOutputs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOutputs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('outputs')
        .select('*, agents(name), tasks(title)')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setOutputs(data || []);
    } catch (err: any) {
      console.error('Error fetching outputs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutputs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Outputs</h1>
        <button
          onClick={fetchOutputs}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          title="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Folder className="h-5 w-5 text-blue-600 mr-3" />
          <h2 className="text-lg font-semibold text-gray-800">Generated Outputs</h2>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Error: {error}</div>
          ) : outputs.length === 0 ? (
            <div className="text-center py-8 text-gray-600 font-medium">
              No outputs generated yet
            </div>
          ) : (
            outputs.map((output) => (
              <div key={output.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="text-base font-medium text-gray-900">
                  {output.title || 'Untitled Output'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {output.tasks?.title ? `Task: ${output.tasks.title}` : 'No linked task'}
                </p>
                {output.content && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{output.content}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Created: {new Date(output.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
