"use client";

import { useEffect, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ActivityCenter() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('activity_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setEvents(data || []);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'task_created':
        return '📝';
      case 'task_updated':
        return '✏️';
      case 'task_completed':
        return '✅';
      case 'approval_requested':
        return '⏳';
      case 'approval_granted':
        return '👍';
      case 'agent_assigned':
        return '👤';
      default:
        return '📌';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
        <button
          onClick={fetchEvents}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          title="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Activity className="h-5 w-5 text-blue-600 mr-3" />
          <h2 className="text-lg font-semibold text-gray-800">Activity Timeline</h2>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Error: {error}</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-600 font-medium">
              No activity yet
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              {events.map((event, index) => (
                <div key={event.id || index} className="relative flex items-start gap-4 pb-6 pl-10">
                  <div className="absolute left-2 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-sm">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900">
                      {event.event_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </h3>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
