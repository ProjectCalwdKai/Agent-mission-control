import { 
  Activity, 
  Check, 
  Users, 
  Folder, 
  GitBranch, 
  Building2 
} from 'lucide-react';

export default function ActivityCenter() {
  // Mock data for activity center
  const activities = [
    { id: 1, type: 'task', description: 'Task created: Design new logo', time: '2 min ago' },
    { id: 2, type: 'approval', description: 'Task approved: Write blog post', time: '5 min ago' },
    { id: 3, type: 'agent', description: 'Agent started: CodeAgent', time: '10 min ago' },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Activity Feed</h1>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="bg-white rounded-lg shadow p-4 flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}