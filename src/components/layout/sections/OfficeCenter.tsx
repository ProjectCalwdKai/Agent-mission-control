"use client";

import { useEffect, useState } from 'react';
import { Building2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function OfficeCenter() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('activity_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;
      setActivities(data || []);
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Office</h1>
        <button
          onClick={fetchActivities}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          title="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Building2 className="h-5 w-5 text-blue-600 mr-3" />
          <h2 className="text-lg font-semibold text-gray-800">Office Activity</h2>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Error: {error}</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-600 font-medium">
              No office activity
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.event_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-gray-600">{activity.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
