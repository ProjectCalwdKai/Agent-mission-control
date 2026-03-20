"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  List, 
  Users, 
  Check, 
  Folder, 
  Activity, 
  GitBranch, 
  Building2, 
  ChevronDown 
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const toggleFilters = () => setFiltersOpen(!filtersOpen);
  const toggleCategories = () => setCategoriesOpen(!categoriesOpen);

  const navItems = [
    { href: '/', label: 'Overview', icon: Home },
    { href: '/tasks', label: 'Tasks', icon: List },
    { href: '/agents', label: 'Agents', icon: Users },
    { href: '/approvals', label: 'Approvals', icon: Check },
    { href: '/outputs', label: 'Outputs', icon: Folder },
    { href: '/activity', label: 'Activity', icon: Activity },
    { href: '/delegation', label: 'Delegation', icon: GitBranch },
    { href: '/office', label: 'Office', icon: Building2 },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className={`space-y-4 p-4 ${className}`}>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Filters Section */}
      <div className="border-t border-gray-200 pt-4">
        <button 
          onClick={toggleFilters} 
          className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
        >
          <span>Filters</span>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>
        {filtersOpen && (
          <div className="mt-2 space-y-2 px-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span>High Priority</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span>Due Today</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span>Blocked</span>
            </label>
          </div>
        )}

        {/* Categories Section */}
        <button 
          onClick={toggleCategories} 
          className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md mt-4"
        >
          <span>Task Categories</span>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
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
              <label key={category} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span>{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
