"use client";

import { useState, useCallback } from 'react';
import TaskForm from '@/components/forms/TaskForm';
import KanbanBoard from '@/components/kanban/KanbanBoard';

interface TasksCenterProps {
  className?: string;
}

export default function TasksCenter({ className = '' }: TasksCenterProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTaskCreated = useCallback(() => {
    // Trigger refresh of Kanban board
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className={`p-4 ${className}`}>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Tasks</h1>
      <div className="space-y-6">
        <TaskForm onTaskCreated={handleTaskCreated} />
        <KanbanBoard key={refreshKey} />
      </div>
    </div>
  );
}
