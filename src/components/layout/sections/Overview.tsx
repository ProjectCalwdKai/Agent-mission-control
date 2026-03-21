"use client";

import { 
  Activity, 
  Check, 
  Users, 
  Folder, 
  GitBranch, 
  Building2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAutoRefresh, formatLastUpdated } from '@/hooks/useAutoRefresh';

interface OverviewProps {
  className?: string;
}

interface Stats {
  totalTasks: number;
  pendingApprovals: number;
  activeAgents: number;
  outputsGenerated: number;
  delegationFlows: number;
  officeActivity: number;
}

export default function Overview({ className = '' }: OverviewProps) {
  const fetchStats = async (): Promise<Stats> => {
    try {
      // Fetch task count
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });

      // Fetch pending approvals count
      const { count: approvalCount } = await supabase
        .from('approvals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch active agents count
      const { count: agentCount } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true })
        .eq('availability', 'online');

      // Fetch outputs count
      const { count: outputCount } = await supabase
        .from('outputs')
        .select('*', { count: 'exact', head: true });

      // Fetch activity events count (for office activity)
      const { count: activityCount } = await supabase
        .from('activity_events')
        .select('*', { count: 'exact', head: true });

      return {
        totalTasks: taskCount || 0,
        pendingApprovals: approvalCount || 0,
        activeAgents: agentCount || 0,
        outputsGenerated: outputCount || 0,
        delegationFlows: 0,
        officeActivity: activityCount || 0,
      };
    } catch (err) {
      console.error('Error fetching stats:', err);
      throw err;
    }
  };

  const {
    data: stats = {
      totalTasks: 0,
      pendingApprovals: 0,
      activeAgents: 0,
      outputsGenerated: 0,
      delegationFlows: 0,
      officeActivity: 0,
    },
    loading,
    error,
    refresh,
    refreshing,
    lastUpdatedAgo,
    connectionLost,
    resetConnection,
  } = useAutoRefresh<Stats>({
    fetchFn: fetchStats,
    interval: 5000,
    initialData: {
      totalTasks: 0,
      pendingApprovals: 0,
      activeAgents: 0,
      outputsGenerated: 0,
      delegationFlows: 0,
      officeActivity: 0,
    },
  });

  const statCards = [
    { title: 'Total Tasks', value: stats.totalTasks, icon: Activity, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Pending Approvals', value: stats.pendingApprovals, icon: Check, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'Active Agents', value: stats.activeAgents, icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { title: 'Outputs Generated', value: stats.outputsGenerated, icon: Folder, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { title: 'Delegation Flows', value: stats.delegationFlows, icon: GitBranch, color: 'text-red-600', bgColor: 'bg-red-50' },
    { title: 'Office Activity', value: stats.officeActivity, icon: Building2, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
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
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Reconnect"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={refresh}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
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
            <p className="text-red-700">Error loading stats: {error.message}</p>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
              <div className={`flex-shrink-0 h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
