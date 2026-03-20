import { Folder, Check, Activity } from 'lucide-react';

export default function OutputsCenter() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Outputs</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Folder className="h-5 w-5 text-blue-600 mr-3" />
          <h2 className="text-lg font-medium text-gray-800">Generated Outputs</h2>
        </div>
        <div className="space-y-4">
          {/* In a real app, we would list outputs here */}
          <div className="text-center py-8 text-gray-500">
            No outputs generated yet
          </div>
        </div>
      </div>
    </div>
  );
}