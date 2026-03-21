"use client";

import { useEffect, useState } from 'react';
import { MessageSquare, Clock, Users, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import AgentSwitcher from '@/components/agents/AgentSwitcher';

type ConversationThread = Database['public']['Tables']['conversation_threads']['Row'];
type SessionChain = Database['public']['Tables']['session_chain']['Row'];

interface ThreadWithHistory extends ConversationThread {
  sessionHistory?: SessionChain[];
}

export default function ThreadList() {
  const [threads, setThreads] = useState<ThreadWithHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchThreads = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('conversation_threads')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Fetch session history for each thread
      const threadsWithHistory = await Promise.all(
        (data || []).map(async (thread) => {
          const { data: chains } = await supabase
            .from('session_chain')
            .select('*')
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: false })
            .limit(5);

          return {
            ...thread,
            sessionHistory: chains || []
          };
        })
      );

      setThreads(threadsWithHistory);
    } catch (err: any) {
      console.error('Error fetching threads:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleSwitchComplete = () => {
    // Refresh the thread list after a successful switch
    fetchThreads();
    setSelectedThread(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-500">Loading threads...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">Error loading threads: {error}</p>
        </div>
        <button
          onClick={fetchThreads}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No threads yet</h3>
        <p className="text-gray-500 mt-1">Create a new conversation to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Conversation Threads ({threads.length})
        </h2>
        <button
          onClick={fetchThreads}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-3">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-base font-medium text-gray-900">
                    {thread.title || 'Untitled Thread'}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    thread.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : thread.status === 'paused'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {thread.status}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{thread.current_model}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{thread.session_count} session{thread.session_count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(thread.updated_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                {thread.sessionHistory && thread.sessionHistory.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-2">Recent switches:</p>
                    <div className="flex flex-wrap gap-2">
                      {thread.sessionHistory.slice(0, 3).map((chain, idx) => (
                        <span
                          key={chain.id}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {chain.model} → {chain.reason}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 ml-4">
                {selectedThread === thread.id ? (
                  <div className="w-64">
                    <AgentSwitcher
                      threadId={thread.id}
                      currentModel={thread.current_model}
                      onSwitchComplete={handleSwitchComplete}
                    />
                    <button
                      onClick={() => setSelectedThread(null)}
                      className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedThread(thread.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span>Switch Model</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
