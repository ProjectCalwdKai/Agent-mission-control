"use client";

import Link from 'next/link';
import { 
  Home, 
  List, 
  Users, 
  Check, 
  Folder, 
  Activity, 
  GitBranch, 
  Building2, 
  Filter, 
  ChevronDown 
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar({ className = '' }: { className?: string }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const toggleFilters = () => setFiltersOpen(!filtersOpen);
  const toggleCategories = () => setCategoriesOpen(!categoriesOpen);

  return (
    <aside className="space-y-4 p-4">
      <nav className="space-y-2">
        <Link href="/" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
          <Home className="h-4 w-4" />
          <span>Overview</span>
        </Link>
        <Link href="/tasks" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
          <List className="h-4 w-4" />
          <span>Tasks</span>
        </Link>
        <Link href="/agents" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
          <Users className="h-4 w-4" />
          <span>Agents</span>
        </Link>
        <Link href="/approvals" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
          <Check className="h-4 w-4" />
          <span>Approvals</span>
        </Link>
        <Link href="/outputs" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
          <Folder className="h-4 w-4" />
          <span>Outputs</span>
        </Link>
        <Link href="/activity" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
          <Activity className="h-4 w-4" />
          <span>Activity</span>
        </Link>
        <Link href="/delegation" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
          <GitBranch className="h-4 w-4" />
          <span>Delegation</span>
        </Link>
        <Link href="/office" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
          <Building2 className="h-4 w-4" />
          <span>Office</span>
        </Link>
      </nav>

      {/* Filters Section */}
      <div className="border-t pt-4">
        <button onClick={toggleFilters} className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-50">
          <span>Filters</span>
          <ChevronDown className={`${filtersOpen ? 'rotate-180' : ''}`} />
        </button>
        {filtersOpen && (
          <div className="mt-2 space-y-2 px-4">
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input type="checkbox" className="h-4 w-4" />
              <span>High Priority</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input type="checkbox" className="h-4 w-4" />
              <span>Due Today</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input type="checkbox" className="h-4 w-4" />
              <span>Blocked</span>
            </label>
          </div>
        )}

        {/* Categories Section */}
        <button onClick={toggleCategories} className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 mt-4">
          <span>Task Categories</span>
          <ChevronDown className={`${categoriesOpen ? 'rotate-180' : ''}`} />
        </button>
        {categoriesOpen && (
          <div className="mt-2 space-y-1 px-4">
            {[ 
              'Marketing', 
              'AI video generation', 
              'Remotion videos', 
              'Product research', 
              'Accounting', 
              'Coding', 
              'Task automation' 
            ].map((category) => (
              <label key={category} className="flex items-center space-x-2 text-sm text-gray-700">
                <input type="checkbox" className="h-4 w-4" />
                <span>{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}