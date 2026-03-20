"use client";

import { Search, Plus, Bot, Check, Clock } from 'lucide-react';
import { useState } from 'react';

interface TopBarProps {
  className?: string;
}

export default function TopBar({ className = '' }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<'Cheap' | 'Balanced' | 'Premium'>('Balanced');
  const [activeAgents, setActiveAgents] = useState(0);
  const [approvalsCount, setApprovalsCount] = useState(0);

  return (
    <div className={`flex items-center justify-between p-4 bg-white border-b border-gray-200 ${className}`}>
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-800">Agent Mission Control</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks, agents, outputs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Plus className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer" />
          <span className="text-sm text-gray-600">Quick Task</span>
        </div>
        <div className="relative">
          <Bot className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {activeAgents}
          </span>
          <span className="ml-1 text-sm text-gray-600">Active Agents</span>
        </div>
        <div className="relative">
          <Check className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {approvalsCount}
          </span>
          <span className="ml-1 text-sm text-gray-600">Approvals</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
          >
            <option value="Cheap">Cheap</option>
            <option value="Balanced">Balanced</option>
            <option value="Premium">Premium</option>
          </select>
        </div>
      </div>
    </div>
  );
}
