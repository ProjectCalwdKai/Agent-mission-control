"use client";

import { 
  Plus, 
  ChevronDown, 
  Calendar, 
  Trash2, 
  Users, 
  Zap, 
  Sliders 
} from 'lucide-react';
import { useState } from 'react';
import { TaskCategory, Priority, Mode, AGENT_ROSTER, getSuggestedAgentForCategory } from '@/types';

export default function TaskForm() {
  const [prompt, setPrompt] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Marketing');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [preferredAgent, setPreferredAgent] = useState<string>('');
  const [autoRoute, setAutoRoute] = useState(true);
  const [mode, setMode] = useState<Mode>('Balanced');
  const [loading, setLoading] = useState(false);

  // Suggested agent based on category (if autoRoute is on and no preferred agent set)
  const suggestedAgent = autoRoute && !preferredAgent 
    ? getSuggestedAgentForCategory(category) 
    : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Here we would call an API to create the task
    // For now, we just simulate and reset
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Reset form
      setPrompt('');
      setDetails('');
      setCategory('Marketing');
      setPriority('Medium');
      setDueDate('');
      setPreferredAgent('');
      setAutoRoute(true);
      setMode('Balanced');
      // In a real app, we would show a success toast or update the task list
      console.log('Task submitted');
    } catch (error) {
      console.error('Failed to submit task', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the task you want to accomplish..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Details (Optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add more context or requirements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['Marketing', 'AI video generation', 'Remotion videos', 'Product research', 'Accounting', 'Coding', 'Task automation'].map((cat) => (
                  <option key={cat} value={cat as TaskCategory}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Agent</label>
            <div className="relative">
              <select
                value={preferredAgent}
                onChange={(e) => setPreferredAgent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None (auto-assign)</option>
                {AGENT_ROSTER.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.model})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={autoRoute}
                onChange={(e) => setAutoRoute(e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <span>Auto-route to best agent</span>
            </label>
          </div>
        </div>

        {(!autoRoute || preferredAgent) && suggestedAgent && (
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mt-4" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Suggested Agent</h3>
                <div className="text-sm">{suggestedAgent.name} ({suggestedAgent.model})</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={mode === 'Cheap'}
                onChange={(e) => setMode(e.target.checked ? 'Cheap' : 'Balanced')}
                className="h-4 w-4 text-blue-600"
              />
              <span>Cheap Mode</span>
            </label>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={mode === 'Premium'}
                onChange={(e) => setMode(e.target.checked ? 'Premium' : 'Balanced')}
                className="h-4 w-4 text-blue-600"
              />
              <span>Premium Mode</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'animate-pulse' : ''}`}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}