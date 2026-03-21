"use client";

import { useState } from 'react';
import { 
  Users, 
  Circle, 
  Clock, 
  ChevronDown, 
  Sliders,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Agent } from '@/types';
import { useAutoRefresh, formatLastUpdated } from '@/hooks/useAutoRefresh';

export default function AgentsCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'busy'>('all');

  const fetchAgents = async (): Promise<Agent[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('agents')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      
      // Map to our Agent type
      const mappedAgents: Agent[] = (data || []).map(agent => ({
        id: agent.id,
        name: agent.name,
        model: agent.model,
        role: agent.role,
        availability: agent.availability as 'online' | 'offline' | 'busy',
        currentTask: agent.current_task || undefined
      }));
      
      return mappedAgents;
    } catch (err: any) {
      console.error('Error fetching agents:', err);
      throw err;
    }
  };

  const {
    data: agents = [],
    loading,
    error,
    refresh,
    refreshing,
    lastUpdatedAgo,
    connectionLost,
    resetConnection,
  } = useAutoRefresh<Agent[]>({
    fetchFn: fetchAgents,
    interval: 5000,
    initialData: [],
  });

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      filterStatus === 'all' || 
      agent.availability === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Agents</h1>
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
              title="Refresh agents"
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

      <div className="flex items-center space-x-3 mb-4">
        <input
          type="text"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
        />
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="busy">Busy</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading && !agents.length ? (
        <div className="text-center py-8 text-gray-500">Loading agents...</div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No agents found</div>
      ) : (
        <div className="space-y-4">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-lg shadow p-4 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                {agent.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                <p className="text-sm text-gray-500">{agent.model}</p>
                <p className="text-xs text-gray-400">{agent.role}</p>
              </div>
              <div className="flex-shrink-0 flex items-center space-x-2">
                <div className={`h-2.5 w-2.5 rounded-full ${getAvailabilityColor(agent.availability)}`} />
                <span className="text-xs text-gray-600">{agent.availability}</span>
              </div>
              <div className="flex-shrink-0">
                {agent.currentTask ? (
                  <div className="flex items-center space-x-2 text-xs">
                    <Circle className="h-3 w-3 text-blue-500" />
                    <span>Busy</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-xs">
                    <Circle className="h-3 w-3 text-green-500" />
                    <span>Available</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getAvailabilityColor(availability: string): string {
  switch (availability) {
    case 'online': return 'bg-green-400';
    case 'offline': return 'bg-gray-400';
    case 'busy': return 'bg-yellow-400';
    default: return 'bg-gray-400';
  }
}
