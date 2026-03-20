import { 
  Activity, 
  Check, 
  Users, 
  Folder, 
  GitBranch, 
  Building2 
} from 'lucide-react';

export default function DelegationCenter() {
  // Mock data for delegation center
  const delegationFlows = [
    { id: 1, description: 'Task delegated: Design new logo -> CodeAgent', time: '2 min ago' },
    { id: 2, description: 'Task delegated: Write blog post -> DesignAgent', time: '5 min ago' },
    { id: 3, description: 'Task delegated: Research AI trends -> ResearchAgent', time: '10 min ago' },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Delegation Flow</h1>
      <div className="space-y-4">
        {delegationFlows.map(flow => (
          <div key={flow.id} className="bg-white rounded-lg shadow p-4 flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <GitBranch className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{flow.description}</p>
              <p className="text-xs text-gray-500">{flow.time}</p>
            </div>
          </div>
        ))}
        {delegationFlows.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No delegation flows
          </div>
        )}
      </div>
    </div>
  );
}