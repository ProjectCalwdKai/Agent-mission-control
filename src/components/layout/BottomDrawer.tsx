"use client";

import { useState } from 'react';
import { 
  Activity, 
  GitBranch, 
  FileText, 
  ChevronDown 
} from 'lucide-react';

export default function BottomDrawer() {
  const [activeTab, setActiveTab] = useState<'activity' | 'delegation' | 'details'>('activity');

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="flex space-x-4 p-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('activity')}
          className={`${activeTab === 'activity' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} flex-1 text-center py-2`}
        >
          <Activity className="h-4 w-4 mr-2" />
          Activity Feed
        </button>
        <button
          onClick={() => setActiveTab('delegation')}
          className={`${activeTab === 'delegation' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} flex-1 text-center py-2`}
        >
          <GitBranch className="h-4 w-4 mr-2" />
          Delegation Flow
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} flex-1 text-center py-2`}
        >
          <FileText className="h-4 w-4 mr-2" />
          Task Details
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'activity' && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Activity Feed</h3>
            <div className="h-40 overflow-y-auto space-y-2">
              {/* In a real app, we would fetch activity from a backend */}
              <div className="text-center py-4 text-gray-500">
                No recent activity
              </div>
            </div>
          </div>
        )}
        {activeTab === 'delegation' && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Delegation Flow</h3>
            <div className="h-40 overflow-y-auto space-y-2">
              {/* In a real app, we would show the delegation chain for tasks */}
              <div className="text-center py-4 text-gray-500">
                No delegation flows
              </div>
            </div>
          </div>
        )}
        {activeTab === 'details' && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Task Details</h3>
            <div className="h-40 overflow-y-auto">
              {/* In a real app, we would show the details of the selected task */}
              <div className="text-center py-4 text-gray-500">
                Select a task to view details
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}