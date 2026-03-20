import { Building2 } from 'lucide-react';

export default function OfficeCenter() {
  // Mock data for office center
  const officeActivities = [
    { id: 1, description: 'Meeting scheduled: Team sync', time: '1 hour ago' },
    { id: 2, description: 'Document shared: Project proposal', time: '2 hours ago' },
    { id: 3, description: 'Update posted: Sprint planning notes', time: '3 hours ago' },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Office Activity</h1>
      <div className="space-y-4">
        {officeActivities.map(activity => (
          <div key={activity.id} className="bg-white rounded-lg shadow p-4 flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
        {officeActivities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No office activity
          </div>
        )}
      </div>
    </div>
  );
}