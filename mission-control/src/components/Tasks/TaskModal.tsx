'use client';

import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, TaskCategory, TrackStatus } from '@/lib/tasks-db';

interface TaskModalProps {
  task: Partial<Task> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Task>) => void;
  onDelete?: (id: string) => void;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'normal', label: 'Normal' },
  { value: 'someday', label: 'Someday' },
];

const CATEGORY_OPTIONS: { value: TaskCategory; label: string }[] = [
  { value: 'work', label: 'Work' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'development', label: 'Development' },
  { value: 'personal', label: 'Personal' },
];

const TRACK_OPTIONS: { value: TrackStatus; label: string }[] = [
  { value: 'on_track', label: 'On Track' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'off_track', label: 'Off Track' },
];

const ASSIGNEE_OPTIONS = [
  { value: '@osmar', label: '@osmar' },
  { value: '@clara', label: '@clara' },
];

export default function TaskModal({ task, isOpen, onClose, onSave, onDelete }: TaskModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [assigned_to, setAssigned_to] = useState('');
  const [track_status, setTrack_status] = useState<TrackStatus>('on_track');
  const [due_date, setDue_date] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title ?? '');
      setDescription(task.description ?? '');
      setStatus(task.status ?? 'backlog');
      setPriority(task.priority ?? 'normal');
      setCategory(task.category ?? 'work');
      setAssigned_to(task.assigned_to ?? '');
      setTrack_status(task.track_status ?? 'on_track');
      setDue_date(task.due_date ?? '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('backlog');
      setPriority('normal');
      setCategory('work');
      setAssigned_to('');
      setTrack_status('on_track');
      setDue_date('');
    }
    setConfirmDelete(false);
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const data: Partial<Task> = {
      ...(task?.id ? { id: task.id } : {}),
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      category,
      assigned_to: assigned_to || null,
      track_status,
      due_date: due_date || null,
    };
    onSave(data);
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (task?.id && onDelete) {
      onDelete(task.id);
      onClose();
    }
  };

  const handleBackdropClick = () => {
    onClose();
  };

  const isCreate = !task?.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-[var(--card)] border border-[var(--border)] rounded-xl w-full max-w-lg mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            {isCreate ? 'Nova Tarefa' : 'Editar Tarefa'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
              placeholder="Optional description"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category + Track Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Track Status
              </label>
              <select
                value={track_status}
                onChange={(e) => setTrack_status(e.target.value as TrackStatus)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
              >
                {TRACK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned To + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Assigned to
              </label>
              <select
                value={assigned_to}
                onChange={(e) => setAssigned_to(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
              >
                <option value="">Unassigned</option>
                {ASSIGNEE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={due_date}
                onChange={(e) => setDue_date(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--border)]">
          <div>
            {task?.id && onDelete && (
              <button
                onClick={handleDelete}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  confirmDelete
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'text-red-400 hover:bg-red-500/10 border border-transparent'
                }`}
              >
                <Trash2 size={15} />
                {confirmDelete ? 'Confirm?' : 'Delete'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isCreate && !title.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--bg)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
