"use client";

import { useState } from 'react';
import { MessageSquare, Clock, Users, ArrowRight, RefreshCw, AlertCircle, MessageSquarePlus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import AgentSwitcher from '@/components/agents/AgentSwitcher';
import { useAutoRefresh, formatLastUpdated } from '@/hooks/useAutoRefresh';

type ConversationThread = Database['public']['Tables']['conversation_threads']['Row'];
type SessionChain = Database['public']['Tables']['session_chain']['Row'];

interface ThreadWithHistory extends ConversationThread {
  sessionHistory?: SessionChain[];
}

export default function ThreadList() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadModel, setNewThreadModel] = useState('openrouter/qwen/qwen3.5-plus-02-15');
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchThreads = async (): Promise<ThreadWithHistory[]> => {
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

      return threadsWithHistory;
    } catch (err: any) {
      console.error('Error fetching threads:', err);
      throw err;
    }
  };

  const {
    data: threads = [],
    loading,
    error,
    refresh,
    refreshing,
    lastUpdatedAgo,
    connectionLost,
    resetConnection,
  } = useAutoRefresh({
    fetchFn: fetchThreads,
    interval: 5000,
  });

  const handleSwitchComplete = () => {
    refresh();
    setSelectedThread(null);
  };

  const handleCreateThread = async () => {
    setIsCreatingThread(true);
    setCreateError(null);

    try {
      const response = await fetch('/api/threads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newThreadTitle,
          model: newThreadModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create new thread');
      }

      const result = await response.json();
      setIsNewThreadModalOpen(false);
      setNewThreadTitle('');
      setNewThreadModel('openrouter/qwen/qwen3.5-plus-02-15');
      refresh();
    } catch (err: any) {
      console.error('Error creating thread:', err);
      setCreateError(err.message);
    } finally {
      setIsCreatingThread(false);
    }
  };

  if (loading && !threads.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-500">Loading threads...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Conversation Threads ({threads.length})
        </h2>
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${connectionLost ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            {connectionLost ? 'Connection lost' : `Updated ${formatLastUpdated(lastUpdatedAgo)}`}
          </span>
          <button
            onClick={() => setIsNewThreadModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>New Thread</span>
          </button>
          {connectionLost ? (
            <button
              onClick={resetConnection}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reconnect</span>
            </button>
          ) : (
            <button
              onClick={refresh}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">Error loading threads: {error.message}</p>
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

      {threads.length === 0 && !loading && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No threads yet</h3>
          <p className="text-gray-500 mt-1">Create a new conversation to get started</p>
        </div>
      )}

      {/* New Thread Modal */}
      {isNewThreadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Conversation Thread</h3>
              <button
                onClick={() => setIsNewThreadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Start a new conversation with a specific agent model.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Debugging Supabase auth"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <select
                  value={newThreadModel}
                  onChange={(e) => setNewThreadModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="openrouter/qwen/qwen3.5-plus-02-15">Default (Qwen 3.5)</option>
                  <option value="openrouter/google/gemini-pro">Gemini Pro</option>
                  <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
                </select>
              </div>
              {createError && (
                <p className="text-red-500 text-sm">{createError}</p>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsNewThreadModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateThread}
                disabled={isCreatingThread || !newThreadTitle.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreatingThread ? 'Creating...' : 'Create Thread'}
              </button>
            </div>
          </div>
        </div>
      )}

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
