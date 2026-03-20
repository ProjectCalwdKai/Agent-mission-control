"use client";

import { useState, useEffect } from 'react';
import TaskCard from './TaskCard';
import { Task, TaskCategory, Priority } from '@/types';
import { supabase } from '@/lib/supabase';

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      // Map to our Task type
      const mappedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        prompt: task.prompt || undefined,
        details: task.details || undefined,
        category: task.category as TaskCategory,
        priority: task.priority as Priority,
        status: task.status,
        assignedAgentId: task.assigned_agent_id || undefined,
        requiresApproval: task.requires_approval,
        hasDelegation: task.has_delegation,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }));
      
      setTasks(mappedTasks);
      setFilteredTasks(mappedTasks);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter tasks when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTasks(tasks);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTasks(tasks.filter(task => 
        (task.title || '').toLowerCase().includes(query) ||
        (task.prompt || '').toLowerCase().includes(query) ||
        (task.details || '').toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
      ));
    }
  }, [searchQuery, tasks]);

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
    acc[column.id] = filteredTasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<string, Task[]>);

  // Handle adding a new task (from the form) - in a real app, this would be done via API
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description || null,
          prompt: task.prompt || null,
          details: task.details || null,
          category: task.category,
          priority: task.priority,
          status: 'Inbox',
          assigned_agent_id: task.assignedAgentId || null,
          requires_approval: task.requiresApproval || false,
          has_delegation: task.hasDelegation || false
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Refresh tasks after adding
      await fetchTasks();
      
      return data;
    } catch (err) {
      console.error('Error adding task:', err);
      throw err;
    }
  };

  // Handle updating a task
  const updateTask = async (updatedTask: Task) => {
    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          title: updatedTask.title,
          description: updatedTask.description || null,
          prompt: updatedTask.prompt || null,
          details: updatedTask.details || null,
          category: updatedTask.category,
          priority: updatedTask.priority,
          status: updatedTask.status,
          assigned_agent_id: updatedTask.assignedAgentId || null,
          requires_approval: updatedTask.requiresApproval || false,
          has_delegation: updatedTask.hasDelegation || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedTask.id);

      if (updateError) throw updateError;

      // Update local state
      setTasks(prev => prev.map(task => task.id === updatedTask.id ? {
        ...updatedTask,
        updatedAt: new Date().toISOString()
      } : task));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Handle deleting a task
  const deleteTask = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update local state
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Handle changing status
  const handleStatusChange = async (id: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask({ ...task, status: newStatus });
    }
  };

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
            onClick={fetchTasks}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading tasks...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      ) : (
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
                      onChangeStatus={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
