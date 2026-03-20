import { 
  Activity, 
  Check, 
  Users, 
  Folder, 
  GitBranch, 
  Building2 
} from 'lucide-react';

interface OverviewProps {
  className?: string;
}

export default function Overview({ className = '' }: OverviewProps) {
  // Mock data for overview cards
  const stats = [
    { title: 'Total Tasks', value: 0, icon: Activity, color: 'text-blue-600' },
    { title: 'Pending Approvals', value: 0, icon: Check, color: 'text-green-600' },
    { title: 'Active Agents', value: 7, icon: Users, color: 'text-purple-600' },
    { title: 'Outputs Generated', value: 0, icon: Folder, color: 'text-orange-600' },
    { title: 'Delegation Flows', value: 0, icon: GitBranch, color: 'text-red-600' },
    { title: 'Office Activity', value: 0, icon: Building2, color: 'text-gray-600' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Overview</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-4 flex items-center space-x-3">
            <div className={`flex-shrink-0 h-10 w-10 rounded-lg bg-${stat.color.slice(0, -3)}-100 flex items-center justify-center`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-500">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
