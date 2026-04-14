'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import KanbanBoard from '@/components/Tasks/KanbanBoard';
import TaskModal from '@/components/Tasks/TaskModal';
import type { Task, TaskPriority, TaskCategory } from '@/lib/tasks-db';

type FilterPriority = TaskPriority | '';
type FilterCategory = TaskCategory | '';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (priorityFilter) params.set('priority', priorityFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      if (assignedFilter) params.set('assigned_to', assignedFilter);
      const res = await fetch(`/api/tasks?${params}`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [priorityFilter, categoryFilter, assignedFilter]);

  const handleSave = async (data: Partial<Task>) => {
    const isEdit = !!data.id;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch('/api/tasks', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setShowNewModal(false);
      fetchTasks();
    }
  };

  const clearFilters = () => {
    setPriorityFilter('');
    setCategoryFilter('');
    setAssignedFilter('');
  };

  const hasActiveFilters = priorityFilter || categoryFilter || assignedFilter;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tasks</h1>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as FilterPriority)}
          className="px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="normal">Normal</option>
          <option value="someday">Someday</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as FilterCategory)}
          className="px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
        >
          <option value="">All Categories</option>
          <option value="work">Work</option>
          <option value="marketing">Marketing</option>
          <option value="development">Development</option>
          <option value="personal">Personal</option>
        </select>

        <select
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
        >
          <option value="">All Assignees</option>
          <option value="@osmar">@osmar</option>
          <option value="@clara">@clara</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--text-muted)] transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      ) : (
        <KanbanBoard initialTasks={tasks} />
      )}

      {/* New task modal (separate from board's edit modal) */}
      <TaskModal
        task={null}
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={handleSave}
      />
    </div>
  );
}
