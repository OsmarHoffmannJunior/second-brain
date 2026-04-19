/**
 * SQLite-backed Tasks Database
 * Kanban-style task management with Mission Control
 */
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

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  assigned_to?: string;
}

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  // Ensure data dir
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  _db = new Database(DB_PATH);

  // WAL mode for better concurrency
  _db.pragma('journal_mode = WAL');
  _db.pragma('synchronous = NORMAL');

  // Create table
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
    CREATE INDEX IF NOT EXISTS idx_tasks_priority  ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_tasks_category  ON tasks(category);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned  ON tasks(assigned_to);
  `);

  return _db;
}

export function getAllTasks(filters?: TaskFilters): Task[] {
  const db = getDb();

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters?.priority) {
    conditions.push('priority = ?');
    params.push(filters.priority);
  }

  if (filters?.category) {
    conditions.push('category = ?');
    params.push(filters.category);
  }

  if (filters?.assigned_to) {
    conditions.push('assigned_to = ?');
    params.push(filters.assigned_to);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = db.prepare(`SELECT * FROM tasks ${where} ORDER BY created_at DESC`).all(...params) as Record<string, unknown>[];

  return rows.map(parseRow);
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  assigned_to?: string | null;
  track_status?: TrackStatus;
  due_date?: string | null;
}

export function createTask(data: CreateTaskInput): Task {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, category, assigned_to, track_status, due_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.title,
    data.description ?? null,
    data.status ?? 'backlog',
    data.priority ?? 'normal',
    data.category ?? 'work',
    data.assigned_to ?? null,
    data.track_status ?? 'on_track',
    data.due_date ?? null,
    now,
    now,
  );

  return {
    id,
    title: data.title,
    description: data.description ?? null,
    status: data.status ?? 'backlog',
    priority: data.priority ?? 'normal',
    category: data.category ?? 'work',
    assigned_to: data.assigned_to ?? null,
    track_status: data.track_status ?? 'on_track',
    due_date: data.due_date ?? null,
    created_at: now,
    updated_at: now,
  };
}

export function getTaskById(id: string): Task | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? parseRow(row) : null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  assigned_to?: string | null;
  track_status?: TrackStatus;
  due_date?: string | null;
}

export function updateTask(id: string, data: UpdateTaskInput): Task | null {
  const db = getDb();

  const current = getTaskById(id);
  if (!current) return null;

  const updated: Task = {
    ...current,
    title: data.title ?? current.title,
    description: data.description !== undefined ? data.description : current.description,
    status: data.status ?? current.status,
    priority: data.priority ?? current.priority,
    category: data.category ?? current.category,
    assigned_to: data.assigned_to !== undefined ? data.assigned_to : current.assigned_to,
    track_status: data.track_status ?? current.track_status,
    due_date: data.due_date !== undefined ? data.due_date : current.due_date,
    updated_at: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, category = ?, assigned_to = ?, track_status = ?, due_date = ?, updated_at = ?
    WHERE id = ?
  `).run(
    updated.title,
    updated.description,
    updated.status,
    updated.priority,
    updated.category,
    updated.assigned_to,
    updated.track_status,
    updated.due_date,
    updated.updated_at,
    id,
  );

  return updated;
}

export function deleteTask(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}

function parseRow(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | null,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    category: row.category as TaskCategory,
    assigned_to: row.assigned_to as string | null,
    track_status: row.track_status as TrackStatus,
    due_date: row.due_date as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
