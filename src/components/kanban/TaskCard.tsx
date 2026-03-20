"use client";

import { 
  Trash2, 
  Check, 
  Clock, 
  Users, 
  Folder, 
  ChevronDown, 
  MessageSquare, 
  GitBranch, 
  Sliders 
} from 'lucide-react';
import { useState } from 'react';
import { Task, Priority, TaskCategory } from '@/types';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: Task['status']) => void;
}

export default function TaskCard({ 
  task, 
  onUpdate, 
  onDelete, 
  onChangeStatus 
}: TaskCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } catch (error) {
      console.error('Failed to delete task', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Task['status'];
    onChangeStatus(task.id, newStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {/* Status indicator dot */}
            <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(task.status)}`} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{task.prompt}</h3>
            {task.details && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.details}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {task.category}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {task.priority}
              </span>
              {task.assignedAgent && (
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  Assigned
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-gray-400 hover:text-gray-500">
          {isOpen ? (
            <ButtonGroup 
              task={task} 
              onUpdate={onUpdate} 
              onDelete={handleDelete} 
              isDeleting={isDeleting}
            />
          ) : (
            <MessageSquare className="h-4 w-4 cursor-pointer" onClick={() => setIsOpen(true)} />
          )}
        </div>
      </div>

      {/* Task details drawer */}
      {isOpen && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
            <div className="relative">
              <select
                value={task.status}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['Inbox', 'Planned', 'In Progress', 'Review', 'Blocked', 'Done'].map((status) => (
                  <option key={status} value={status as Task['status']}>
                    {status}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Priority</h4>
            <div className="relative">
              <select
                value={task.priority}
                onChange={(e) => {
                  onUpdate({ ...task, priority: e.target.value as Priority });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
                  <option key={p} value={p as Priority}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Assigned Agent</h4>
            <div className="relative">
              <select
                value={task.assignedAgent || ''}
                onChange={(e) => {
                  onUpdate({ ...task, assignedAgent: e.target.value || undefined });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {[ 
                  { id: 'chief-agent', name: 'Chief Agent', model: 'gpt-5.4' },
                  { id: 'coding-lead', name: 'Coding Lead', model: 'sonnet' },
                  { id: 'research-lead', name: 'Research Lead', model: 'gemini-pro' },
                  { id: 'fast-worker', name: 'Fast Worker', model: 'gemini-flash' },
                  { id: 'brainstormer', name: 'Brainstormer', model: 'qwen' },
                  { id: 'finance-lead', name: 'Finance Lead', model: 'minimax' },
                  { id: 'generalist', name: 'Generalist', model: 'minimax' }
                ].map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.model})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded"
            >
              Close
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded ${isDeleting ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: Task['status']): string {
  switch (status) {
    case 'Inbox': return 'bg-gray-400';
    case 'Planned': return 'bg-blue-400';
    case 'In Progress': return 'bg-yellow-400';
    case 'Review': return 'bg-purple-400';
    case 'Blocked': return 'bg-red-400';
    case 'Done': return 'bg-green-400';
    default: return 'bg-gray-400';
  }
}

function ButtonGroup({ 
  task, 
  onUpdate, 
  onDelete, 
  isDeleting 
}: { 
  task: Task; 
  onUpdate: (task: Task) => void; 
  onDelete: () => void; 
  isDeleting: boolean;
}) {
  return (
    <div className="flex space-x-2">
      <button
        onClick={() => onUpdate({ ...task, status: 'Done' })}
        className="px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
      >
        Done
      </button>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className={`px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded ${isDeleting ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}