"use client";

import { useEffect, useState } from 'react';
import { 
  Activity, 
  Check, 
  Users, 
  Folder, 
  GitBranch, 
  Building2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface OverviewProps {
  className?: string;
}

export default function Overview({ className = '' }: OverviewProps) {
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingApprovals: 0,
    activeAgents: 0,
    outputsGenerated: 0,
    delegationFlows: 0,
    officeActivity: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
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

      setStats({
        totalTasks: taskCount || 0,
        pendingApprovals: approvalCount || 0,
        activeAgents: agentCount || 0,
        outputsGenerated: outputCount || 0,
        delegationFlows: 0, // Not implemented yet
        officeActivity: activityCount || 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Tasks', value: stats.totalTasks, icon: Activity, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Pending Approvals', value: stats.pendingApprovals, icon: Check, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Active Agents', value: stats.activeAgents, icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'Outputs Generated', value: stats.outputsGenerated, icon: Folder, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { title: 'Delegation Flows', value: stats.delegationFlows, icon: GitBranch, color: 'text-red-600', bgColor: 'bg-red-100' },
    { title: 'Office Activity', value: stats.officeActivity, icon: Building2, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <button
          onClick={fetchStats}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          title="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-4 flex items-center space-x-3">
              <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
