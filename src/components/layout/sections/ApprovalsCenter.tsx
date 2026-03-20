import { Check, Clock } from 'lucide-react';

export default function ApprovalsCenter() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Approvals</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Check className="h-5 w-5 text-green-600 mr-3" />
          <h2 className="text-lg font-medium text-gray-800">Pending Approvals</h2>
        </div>
        <div className="space-y-4">
          {/* In a real app, we would list pending approvals here */}
          <div className="text-center py-8 text-gray-500">
            No pending approvals
          </div>
        </div>
      </div>
    </div>
  );
}