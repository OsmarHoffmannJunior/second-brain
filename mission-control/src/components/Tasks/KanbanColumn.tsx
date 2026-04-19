'use client';

import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import type { Task, TaskStatus } from '@/lib/tasks-db';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  pendingId: string | null;
  onCardClick: (task: Task) => void;
  onQuickAdd: (title: string, status: TaskStatus) => void;
}

const COLUMN_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const COLUMN_COLORS: Record<TaskStatus, string> = {
  backlog: 'var(--text-muted)',
  in_progress: 'var(--accent)',
  review: 'var(--warning)',
  done: 'var(--success)',
};

export default function KanbanColumn({ status, tasks, pendingId, onCardClick, onQuickAdd }: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleAddClick = () => {
    setIsAdding(true);
    setNewTitle('');
  };

  const handleSubmit = () => {
    const trimmed = newTitle.trim();
    if (trimmed) {
      onQuickAdd(trimmed, status);
    }
    setIsAdding(false);
    setNewTitle('');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px] bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: COLUMN_COLORS[status] }}
        />
        <span className="text-sm font-medium text-[var(--text-primary)] flex-1">
          {COLUMN_LABELS[status]}
        </span>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--bg)] text-[var(--text-secondary)]">
          {tasks.length}
        </span>
        <button
          onClick={handleAddClick}
          className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
          aria-label="Add task"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Quick Add Input */}
      {isAdding && (
        <div className="px-3 py-2 border-b border-[var(--border)]">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTitle.trim()) handleCancel();
            }}
            autoFocus
            placeholder="Task title..."
            className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--accent)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={handleSubmit}
              disabled={!newTitle.trim()}
              className="px-3 py-1 rounded-md text-xs font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 px-3 py-2 min-h-[120px] transition-colors duration-150 ${
              snapshot.isDraggingOver ? 'bg-[var(--accent)]/10' : ''
            }`}
          >
            {tasks.length === 0 && !isAdding && (
              <div className="flex items-center justify-center h-20 text-sm text-[var(--text-muted)]">
                No tasks
              </div>
            )}
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => onCardClick(task)}
                isPending={pendingId === task.id}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}