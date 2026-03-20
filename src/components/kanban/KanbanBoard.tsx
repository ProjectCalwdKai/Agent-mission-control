"use client";

import { useState } from 'react';
import TaskCard from './TaskCard';
import { Task, TaskCategory, Priority } from '@/types';

// Mock data for demonstration - in a real app, this would come from a backend
const initialTasks: Task[] = [
  // We are not seeding fake demo records as per requirements, so we start with an empty array.
  // However, for the UI to be meaningful during development, we can have an empty state.
  // We'll leave it empty and handle empty states in the column.
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');

  // In a real app, we would fetch tasks from an API and update the state.
  // For now, we simulate by setting an empty array and handling empty states.

  // We'll implement filtering by search query (for simplicity, we filter by prompt and details)
  // and by status (columns) will be handled by splitting the tasks into columns.

  // Since we are not implementing real backend, we'll just show empty states.

  const columns = [
    { id: 'Inbox', title: 'Inbox' },
    { id: 'Planned', title: 'Planned' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'Review', title: 'Review' },
    { id: 'Blocked', title: 'Blocked' },
    { id: 'Done', title: 'Done' },
  ];

  // Group tasks by status
  const groupedTasks = columns.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<string, Task[]>);

  // Handle adding a new task (from the form) - in a real app, this would be done via API
  // For now, we'll just simulate by adding a task to the Inbox column.
  // We'll leave this as a stub for future integration.
  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Inbox', // New tasks start in Inbox
    };
    setTasks(prev => [...prev, newTask]);
  };

  // Handle updating a task
  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  // Handle deleting a task
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // Handle changing status (drag and drop would be ideal, but for simplicity we use a dropdown in the card)
  // We already handle status change in TaskCard via onChangeStatus prop.

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Task Board</h2>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
          <button
            onClick={() => {
              // In a real app, we would open a form to create a task.
              // For now, we just log.
              console.log('Add task button clicked');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {columns.map((column) => (
          <div key={column.id} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-700">{column.title}</h3>
              <span className="text-sm text-gray-500">{groupedTasks[column.id].length}</span>
            </div>
            {groupedTasks[column.id].length === 0 ? (
              <div className="flex h-32 items-center justify-center text-gray-400">
                No tasks in {column.title.toLowerCase()}
              </div>
            ) : (
              <div className="space-y-3">
                {groupedTasks[column.id].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                    onChangeStatus={(id, status) => {
                      updateTask({ ...task, status });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}