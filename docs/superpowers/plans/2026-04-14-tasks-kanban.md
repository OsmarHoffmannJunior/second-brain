# Tasks Kanban — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nova página `/tasks` no Mission Control — quadro Kanban com 4 colunas (Backlog, In Progress, Review, Done), drag-and-drop com confirmação, CRUD completo de tarefas via SQLite.

**Architecture:** Next.js App Router + `@hello-pangea/dnd` + SQLite via `better-sqlite3` (mesmo pattern do activities-db.ts existente). Drag state gerencia confirmação com spinner no card.

**Tech Stack:** Next.js, `@hello-pangea/dnd`, Tailwind CSS (existing), `better-sqlite3`, `lucide-react`.

---

## Task 1: Database Layer — `tasks-db.ts`

**Files:**
- Create: `mission-control/src/lib/tasks-db.ts`

- [ ] **Step 1: Criar o arquivo com schema SQLite e operações CRUD**

```typescript
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const DB_PATH = path.join(process.cwd(), 'data', 'tasks.db');

export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'urgent' | 'normal' | 'someday';
export type TaskCategory = 'work' | 'marketing' | 'development' | 'personal';
export type TrackStatus = 'on_track' | 'at_risk' | 'off_track';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assigned_to: string | null;
  track_status: TrackStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('synchronous = NORMAL');

  _db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id           TEXT PRIMARY KEY,
      title        TEXT NOT NULL,
      description  TEXT,
      status       TEXT NOT NULL DEFAULT 'backlog'
                   CHECK(status IN ('backlog','in_progress','review','done')),
      priority     TEXT NOT NULL DEFAULT 'normal'
                   CHECK(priority IN ('urgent','normal','someday')),
      category     TEXT NOT NULL DEFAULT 'work'
                   CHECK(category IN ('work','marketing','development','personal')),
      assigned_to  TEXT,
      track_status TEXT NOT NULL DEFAULT 'on_track'
                   CHECK(track_status IN ('on_track','at_risk','off_track')),
      due_date     TEXT,
      created_at   TEXT NOT NULL,
      updated_at   TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_status    ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned  ON tasks(assigned_to);
  `);

  return _db;
}

export function getAllTasks(filters?: {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  assigned_to?: string;
}): Task[] {
  const db = getDb();
  let sql = 'SELECT * FROM tasks WHERE 1=1';
  const params: unknown[] = [];

  if (filters?.status)   { sql += ' AND status = ?';       params.push(filters.status); }
  if (filters?.priority) { sql += ' AND priority = ?';      params.push(filters.priority); }
  if (filters?.category) { sql += ' AND category = ?';     params.push(filters.category); }
  if (filters?.assigned_to) { sql += ' AND assigned_to = ?'; params.push(filters.assigned_to); }

  sql += ' ORDER BY created_at DESC';

  return db.prepare(sql).all(...params) as Task[];
}

export function createTask(data: {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  assigned_to?: string;
  due_date?: string;
}): Task {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, category, assigned_to, track_status, due_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'on_track', ?, ?, ?)
  `).run(
    id,
    data.title,
    data.description || null,
    data.status || 'backlog',
    data.priority || 'normal',
    data.category || 'work',
    data.assigned_to || null,
    data.due_date || null,
    now,
    now
  );

  return getTaskById(id)!;
}

export function getTaskById(id: string): Task | null {
  const db = getDb();
  return (db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task) || null;
}

export function updateTask(id: string, data: Partial<{
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assigned_to: string | null;
  track_status: TrackStatus;
  due_date: string | null;
}>): Task | null {
  const db = getDb();
  const existing = getTaskById(id);
  if (!existing) return null;

  const now = new Date().toISOString();

  db.prepare(`
    UPDATE tasks SET
      title = ?, description = ?, status = ?, priority = ?,
      category = ?, assigned_to = ?, track_status = ?, due_date = ?, updated_at = ?
    WHERE id = ?
  `).run(
    data.title ?? existing.title,
    data.description !== undefined ? data.description : existing.description,
    data.status ?? existing.status,
    data.priority ?? existing.priority,
    data.category ?? existing.category,
    data.assigned_to !== undefined ? data.assigned_to : existing.assigned_to,
    data.track_status ?? existing.track_status,
    data.due_date !== undefined ? data.due_date : existing.due_date,
    now,
    id
  );

  return getTaskById(id);
}

export function deleteTask(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/.worktrees/tasks-kanban && git add mission-control/src/lib/tasks-db.ts && git commit -m "feat(tasks): add SQLite tasks database layer"
```

---

## Task 2: API Routes — CRUD `/api/tasks`

**Files:**
- Create: `mission-control/src/app/api/tasks/route.ts`

- [ ] **Step 1: Criar API route com GET, POST, PUT, DELETE**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, createTask, updateTask, deleteTask, type TaskStatus } from '@/lib/tasks-db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') as TaskStatus | undefined,
      priority: searchParams.get('priority') as string | undefined,
      category: searchParams.get('category') as string | undefined,
      assigned_to: searchParams.get('assigned_to') as string | undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach(k => {
      if (filters[k as keyof typeof filters] === undefined) {
        delete filters[k as keyof typeof filters];
      }
    });

    const tasks = getAllTasks(filters as Parameters<typeof getAllTasks>[0]);
    return NextResponse.json({ tasks, total: tasks.length });
  } catch (error) {
    console.error('[tasks/GET]', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const task = createTask({
      title: body.title.trim(),
      description: body.description || undefined,
      status: body.status || 'backlog',
      priority: body.priority || 'normal',
      category: body.category || 'work',
      assigned_to: body.assigned_to || undefined,
      due_date: body.due_date || undefined,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('[tasks/POST]', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const task = updateTask(body.id, {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      category: body.category,
      assigned_to: body.assigned_to,
      track_status: body.track_status,
      due_date: body.due_date,
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('[tasks/PUT]', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const deleted = deleteTask(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[tasks/DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/.worktrees/tasks-kanban && git add mission-control/src/app/api/tasks/route.ts && git commit -m "feat(tasks): add CRUD API routes for tasks"
```

---

## Task 3: Componentes UI — `PriorityBadge`, `AssigneeAvatar`, `TrackStatusDot`

**Files:**
- Create: `mission-control/src/components/Tasks/PriorityBadge.tsx`
- Create: `mission-control/src/components/Tasks/AssigneeAvatar.tsx`
- Create: `mission-control/src/components/Tasks/TrackStatusDot.tsx`

### 3.1 — `PriorityBadge.tsx`

- [ ] **Step 1: Criar componente**

```tsx
interface PriorityBadgeProps {
  priority: 'urgent' | 'normal' | 'someday';
}

const colors = {
  urgent:  'bg-red-500/20 text-red-400 border border-red-500/30',
  normal:  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  someday: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
};

const labels = {
  urgent: 'Urgent',
  normal: 'Normal',
  someday: 'Someday',
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${colors[priority]}`}>
      {labels[priority]}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/.worktrees/tasks-kanban && git add mission-control/src/components/Tasks/PriorityBadge.tsx && git commit -m "feat(tasks): add PriorityBadge component"
```

### 3.2 — `AssigneeAvatar.tsx`

- [ ] **Step 1: Criar componente**

```tsx
import { User, Bot } from 'lucide-react';

interface AssigneeAvatarProps {
  assigned_to: string | null;
}

export default function AssigneeAvatar({ assigned_to }: AssigneeAvatarProps) {
  if (!assigned_to) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
        <User className="w-3 h-3" />
        Unassigned
      </span>
    );
  }

  const isHuman = assigned_to.startsWith('@osmar');
  const label = assigned_to.replace('@', '');

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
      {isHuman ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/.worktrees/tasks-kanban && git add mission-control/src/components/Tasks/AssigneeAvatar.tsx && git commit -m "feat(tasks): add AssigneeAvatar component"
```

### 3.3 — `TrackStatusDot.tsx`

- [ ] **Step 1: Criar componente**

```tsx
interface TrackStatusDotProps {
  status: 'on_track' | 'at_risk' | 'off_track';
}

const config = {
  on_track: { color: 'bg-green-500', label: 'On Track' },
  at_risk:  { color: 'bg-orange-500', label: 'At Risk' },
  off_track: { color: 'bg-red-500', label: 'Off Track' },
};

export default function TrackStatusDot({ status }: TrackStatusDotProps) {
  const { color, label } = config[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
      <span className={`w-2 h-2 rounded-full ${color}`} title={label} />
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/.worktrees/tasks-kanban && git add mission-control/src/components/Tasks/TrackStatusDot.tsx && git commit -m "feat(tasks): add TrackStatusDot component"
```

---

## Task 4: Componentes UI — `TaskCard`

**Files:**
- Create: `mission-control/src/components/Tasks/TaskCard.tsx`

- [ ] **Step 1: Criar componente de card com drag e pending state**

```tsx
'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Calendar } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import AssigneeAvatar from './AssigneeAvatar';
import TrackStatusDot from './TrackStatusDot';
import type { Task } from '@/lib/tasks-db';

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
  isPending?: boolean;
}

export default function TaskCard({ task, index, onClick, isPending }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.5 : 1,
          }}
          className={`
            relative mb-2 p-3 rounded-lg cursor-pointer
            bg-[var(--card)] border border-[var(--border)]
            hover:border-[var(--accent)] transition-colors duration-150
            ${isPending ? 'pointer-events-none' : ''}
          `}
        >
          {/* Pending spinner overlay */}
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--card)]/80 rounded-lg z-10">
              <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Content */}
          <div className="flex flex-col gap-2">
            <PriorityBadge priority={task.priority} />
            <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
              {task.title}
            </p>
            <div className="flex items-center gap-3 text-xs">
              <AssigneeAvatar assigned_to={task.assigned_to} />
              <TrackStatusDot status={task.track_status} />
            </div>
            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Calendar className="w-3 h-3" />
                {new Date(task.due_date).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/.worktrees/tasks-kanban && git add mission-control/src/components/Tasks/TaskCard.tsx && git commit -m "feat(tasks): add TaskCard with drag support"
```

---

## Task 5: Componentes UI — `TaskModal`

**Files:**
- Create: `mission-control/src/components/Tasks/TaskModal.tsx`

- [ ] **Step 1: Criar modal de edição/criação**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import type { Task, TaskStatus, TaskPriority, TaskCategory, TrackStatus } from '@/lib/tasks-db';

interface TaskModalProps {
  task: Partial<Task> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Task>) => void;
  onDelete?: (id: string) => void;
}

const STATUS_OPTIONS: TaskStatus[] = ['backlog', 'in_progress', 'review', 'done'];
const PRIORITY_OPTIONS: TaskPriority[] = ['urgent', 'normal', 'someday'];
const CATEGORY_OPTIONS: TaskCategory[] = ['work', 'marketing', 'development', 'personal'];
const TRACK_OPTIONS: TrackStatus[] = ['on_track', 'at_risk', 'off_track'];
const ASSIGN_OPTIONS = [
  { value: '@osmar', label: '@osmar (Humano)' },
  { value: '@clara', label: '@clara (Agente)' },
  { value: '', label: 'Unassigned' },
];

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

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
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'backlog');
      setPriority(task.priority || 'normal');
      setCategory(task.category || 'work');
      setAssigned_to(task.assigned_to || '');
      setTrack_status(task.track_status || 'on_track');
      setDue_date(task.due_date || '');
      setConfirmDelete(false);
    }
  }, [task]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      ...(task?.id ? { id: task.id } : {}),
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      category,
      assigned_to: assigned_to || null,
      track_status,
      due_date: due_date || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {task?.id ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--border)]">
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Notes..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] text-sm resize-none focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Row: Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none"
              >
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p} value={p}><PriorityBadge priority={p} /></option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Category + Track */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none"
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Track</label>
              <select
                value={track_status}
                onChange={e => setTrack_status(e.target.value as TrackStatus)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none"
              >
                {TRACK_OPTIONS.map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Assigned + Due */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Assigned to</label>
              <select
                value={assigned_to}
                onChange={e => setAssigned_to(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none"
              >
                {ASSIGN_OPTIONS.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Due date</label>
              <input
                type="date"
                value={due_date}
                onChange={e => setDue_date(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--border)]">
          <div>
            {task?.id && onDelete && (
              <button
                onClick={() => confirmDelete ? onDelete(task.id!) : setConfirmDelete(true)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                  confirmDelete
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-red-400 hover:bg-red-500/10'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {confirmDelete ? 'Confirm delete?' : 'Delete'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--border)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--accent)] text-white disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/.worktrees/tasks-kanban && git add mission-control/src/components/Tasks/TaskModal.tsx && git commit -m "feat(tasks): add TaskModal for create/edit"
```

---

## Task 6: Componentes UI — `KanbanColumn` + `KanbanBoard`

**Files:**
- Create: `mission-control/src/components/Tasks/KanbanColumn.tsx`
- Create: `mission-control/src/components/Tasks/KanbanBoard.tsx`

### 6.1 — `KanbanColumn.tsx`

- [ ] **Step 1: Criar coluna com Droppable e quick-add**

```tsx
'use client';

import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import type { Task, TaskStatus } from '@/lib/tasks-db';

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

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  pendingId: string | null;
  onCardClick: (task: Task) => void;
  onQuickAdd: (title: string, status: TaskStatus) => void;
}

export default function KanbanColumn({ status, tasks, pendingId, onCardClick, onQuickAdd }: KanbanColumnProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = () => {
    if (newTitle.trim()) {
      onQuickAdd(newTitle.trim(), status);
      setNewTitle('');
      setAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') { setAdding(false); setNewTitle(''); }
  };

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: COLUMN_COLORS[status] }}
          />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {COLUMN_LABELS[status]}
          </span>
          <span className="text-xs text-[var(--text-muted)] bg-[var(--card)] px-1.5 py-0.5 rounded">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-muted)]"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 rounded-lg p-2 min-h-[120px] transition-colors
              ${snapshot.isDraggingOver ? 'bg-[var(--accent)]/10' : 'bg-[var(--surface)]'}
            `}
          >
            {/* Quick add input */}
            {adding && (
              <div className="mb-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => { if (!newTitle.trim()) setAdding(false); }}
                  autoFocus
                  placeholder="Task title..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--accent)] text-[var(--text)] text-sm focus:outline-none"
                />
              </div>
            )}

            {/* Cards */}
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => onCardClick(task)}
                isPending={pendingId === task.id}
              />
            ))}

            {/* Empty state */}
            {tasks.length === 0 && !adding && (
              <div className="text-center text-xs text-[var(--text-muted)] py-8">
                No tasks
              </div>
            )}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/.worktrees/tasks-kanban && git add mission-control/src/components/Tasks/KanbanColumn.tsx && git commit -m "feat(tasks): add KanbanColumn with droppable"
```

### 6.2 — `KanbanBoard.tsx`

- [ ] **Step 1: Criar board com DragDropContext e lógica de confirmação**

```tsx
'use client';

import { useState, useCallback } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';
import type { Task, TaskStatus } from '@/lib/tasks-db';

const COLUMNS: TaskStatus[] = ['backlog', 'in_progress', 'review', 'done'];

interface KanbanBoardProps {
  initialTasks: Task[];
}

interface PendingDrop {
  cardId: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
}

export default function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [pending, setPending] = useState<PendingDrop | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);

  const tasksByColumn = COLUMNS.reduce<Record<TaskStatus, Task[]>>((acc, col) => {
    acc[col] = tasks.filter(t => t.status === col);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const onDragEnd = useCallback(async (result: DropResult) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const fromStatus = source.droppableId as TaskStatus;
    const toStatus = destination.droppableId as TaskStatus;

    // Mark pending
    setPending({ cardId: draggableId, fromStatus, toStatus });

    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draggableId, status: toStatus }),
      });

      if (!res.ok) throw new Error('Update failed');

      const { task } = await res.json();

      setTasks(prev =>
        prev.map(t => t.id === draggableId ? { ...t, status: task.status } : t)
      );
    } catch {
      // Revert: move card back visually (optimistic revert)
      setTasks(prev =>
        prev.map(t => t.id === draggableId ? { ...t, status: fromStatus } : t)
      );
    } finally {
      setPending(null);
    }
  }, []);

  const handleCardClick = useCallback((task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  }, []);

  const handleQuickAdd = useCallback(async (title: string, status: TaskStatus) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, status }),
    });
    if (res.ok) {
      const { task } = await res.json();
      setTasks(prev => [task, ...prev]);
    }
  }, []);

  const handleSave = useCallback(async (data: Partial<Task>) => {
    const isNew = !data.id;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch('/api/tasks', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const { task } = await res.json();
      setTasks(prev =>
        isNew
          ? [task, ...prev]
          : prev.map(t => t.id === task.id ? task : t)
      );
      setModalOpen(false);
      setEditingTask(null);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTasks(prev => prev.filter(t => t.id !== id));
      setModalOpen(false);
      setEditingTask(null);
    }
  }, []);

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByColumn[status]}
              pendingId={pending?.cardId ?? null}
              onCardClick={handleCardClick}
              onQuickAdd={handleQuickAdd}
            />
          ))}
        </div>
      </DragDropContext>

      <TaskModal
        task={editingTask}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSave}
        onDelete={editingTask?.id ? handleDelete : undefined}
      />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/.worktrees/tasks-kanban && git add mission-control/src/components/Tasks/KanbanBoard.tsx && git commit -m "feat(tasks): add KanbanBoard with drag confirmation logic"
```

---

## Task 7: Página `/tasks`

**Files:**
- Create: `mission-control/src/app/(dashboard)/tasks/page.tsx`

- [ ] **Step 1: Criar página principal com filters**

```tsx
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
      if (priorityFilter)  params.set('priority', priorityFilter);
      if (categoryFilter)  params.set('category', categoryFilter);
      if (assignedFilter)  params.set('assigned_to', assignedFilter);

      const res = await fetch(`/api/tasks?${params}`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [priorityFilter, categoryFilter, assignedFilter]);

  const handleSave = async (data: Partial<Task>) => {
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/tasks', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const { task } = await res.json();
      setTasks(prev =>
        data.id ? prev.map(t => t.id === task.id ? task : t) : [task, ...prev]
      );
      setShowNewModal(false);
    }
  };

  const clearFilters = () => {
    setPriorityFilter('');
    setCategoryFilter('');
    setAssignedFilter('');
  };

  const hasFilters = priorityFilter || categoryFilter || assignedFilter;

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
            Tasks
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Quadro Kanban — drag cards between columns
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value as FilterPriority)}
          className="px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text)] text-sm"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="normal">Normal</option>
          <option value="someday">Someday</option>
        </select>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value as FilterCategory)}
          className="px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text)] text-sm"
        >
          <option value="">All Categories</option>
          <option value="work">Work</option>
          <option value="marketing">Marketing</option>
          <option value="development">Development</option>
          <option value="personal">Personal</option>
        </select>

        <select
          value={assignedFilter}
          onChange={e => setAssignedFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text)] text-sm"
        >
          <option value="">All Assignees</option>
          <option value="@osmar">@osmar</option>
          <option value="@clara">@clara</option>
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--border)]"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <KanbanBoard initialTasks={tasks} />
      )}

      <TaskModal
        task={null}
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={handleSave}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/.worktrees/tasks-kanban && git add mission-control/src/app/\(dashboard\)/tasks/page.tsx && git commit -m "feat(tasks): add /tasks page with filters"
```

---

## Task 8: Navegação — Adicionar link no Dock

**Files:**
- Modify: `mission-control/src/components/TenacitOS/Dock.tsx`

- [ ] **Step 1: Encontrar onde outros links são definidos e adicionar Tasks**

Procurar no Dock.tsx por `{ href: "/cron"` ou similar e adicionar:

```tsx
{ href: "/tasks", label: "Tasks", icon: CheckSquare },
```

Importar `CheckSquare` do `lucide-react` se não estiver.

- [ ] **Step 2: Commit**

```bash
cd ~/.worktrees/tasks-kanban && git add mission-control/src/components/TenacitOS/Dock.tsx && git commit -m "feat(nav): add Tasks link to Dock"
```

---

## Task 9: Instalar dependência `@hello-pangea/dnd`

**Files:**
- Modify: `mission-control/package.json`

- [ ] **Step 1: Instalar biblioteca**

```bash
cd ~/.worktrees/tasks-kanban/mission-control && npm install @hello-pangea/dnd 2>&1 | tail -5
```

- [ ] **Step 2: Commit**

```bash
cd ~/.worktrees/tasks-kanban && git add mission-control/package.json mission-control/package-lock.json && git commit -m "feat(tasks): add @hello-pangea/dnd dependency"
```

---

## Task 10: Build, restart PM2 e testar

- [ ] **Step 1: Build**

```bash
cd ~/.worktrees/tasks-kanban/mission-control && npm run build 2>&1 | tail -15
```

Esperado: `Compiled successfully`, sem errors

- [ ] **Step 2: Copy build to host**

```bash
# O worktree já está no host. Só restartar PM2 pointing pro worktree.
# Por ora, copiamos os arquivos modificados pro workspace original.
cd ~/.worktrees/tasks-kanban && rsync -a mission-control/src/lib/tasks-db.ts \
  mission-control/src/app/api/tasks/ \
  mission-control/src/app/\(dashboard\)/tasks/ \
  mission-control/src/components/Tasks/ \
  mission-control/src/components/TenacitOS/Dock.tsx \
  /root/.openclaw/workspace/mission-control/
```

- [ ] **Step 3: Rebuild no workspace original**

```bash
cd /root/.openclaw/workspace/mission-control && npm install @hello-pangea/dnd && npm run build 2>&1 | tail -10
```

- [ ] **Step 4: Restart PM2**

```bash
pm2 restart mission-control && sleep 4 && pm2 status mission-control
```

Esperado: `online`

- [ ] **Step 5: Testar manual**

1. Abrir `http://100.64.39.113:3000/tasks`
2. Verificar 4 colunas (Backlog, In Progress, Review, Done)
3. Criar task via "Add Task" button
4. Arrastar task entre colunas
5. Verificar spinner de confirmação aparece durante drag
6. Verificar task persiste após reload
7. Testar filtros
8. Testar edit via click no card

---

## Checklist de Self-Review

- [ ] Spec coverage: todas as 4 features do spec implementadas
- [ ] Placeholder scan: nenhum TBD/TODO no código
- [ ] Type consistency: interfaces Task, TaskStatus, etc. consistentes em todos os arquivos
- [ ] Commits granulares: 10 commits, um por task

---

## Notas de Deploy

- Dependência nova: `@hello-pangea/dnd`
- Database: `mission-control/data/tasks.db` (criado automaticamente no primeiro acesso)
- PM2 restart: `pm2 restart mission-control`
- Logs: `pm2 logs mission-control --lines 30`
