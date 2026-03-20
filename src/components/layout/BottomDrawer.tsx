"use client";

import { useState, useEffect } from 'react';
import { 
  Activity, 
  GitBranch, 
  FileText, 
  ChevronDown 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function BottomDrawer() {
  const [activeTab, setActiveTab] = useState<'activity' | 'delegation' | 'details'>('activity');
  const [activityEvents, setActivityEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await supabase
          .from('activity_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        setActivityEvents(data || []);
      } catch (err) {
        console.error('Error fetching activity:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const tabs = [
    { id: 'activity', label: 'Activity Feed', icon: Activity },
    { id: 'delegation', label: 'Delegation Flow', icon: GitBranch },
    { id: 'details', label: 'Task Details', icon: FileText },
  ] as const;

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="flex space-x-1 p-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 max-h-48 overflow-y-auto">
        {activeTab === 'activity' && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Recent Activity</h3>
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : activityEvents.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No recent activity
              </div>
            ) : (
              <div className="space-y-2">
                {activityEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded text-sm">
                    <div className="w-2 h-2 mt-1 rounded-full bg-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700 font-medium">{event.event_type}</p>
                      {event.description && (
                        <p className="text-gray-500 text-xs">{event.description}</p>
                      )}
                      <p className="text-gray-400 text-xs">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'delegation' && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Delegation Flow</h3>
            <div className="text-center py-4 text-gray-500">
              No delegation flows
            </div>
          </div>
        )}
        {activeTab === 'details' && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Task Details</h3>
            <div className="text-center py-4 text-gray-500">
              Select a task to view details
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
