'use client';

import { useState, useCallback, useMemo } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';
import type { Task, TaskStatus } from '@/lib/tasks-db';

interface KanbanBoardProps {
  initialTasks: Task[];
}

const COLUMNS: TaskStatus[] = ['backlog', 'in_progress', 'review', 'done'];

export default function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [pending, setPending] = useState<{ cardId: string; fromStatus: TaskStatus; toStatus: TaskStatus } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);

  const tasksByColumn = useMemo<Record<TaskStatus, Task[]>>(
    () =>
      COLUMNS.reduce<Record<TaskStatus, Task[]>>((acc, col) => {
        acc[col] = tasks.filter((t) => t.status === col);
        return acc;
      }, {} as Record<TaskStatus, Task[]>),
    [tasks]
  );

  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === result.source.droppableId && destination.index === result.source.index) return;

    const toStatus = destination.droppableId as TaskStatus;
    const fromStatus = result.source.droppableId as TaskStatus;

    setPending({ cardId: draggableId, fromStatus, toStatus });

    fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: draggableId, status: toStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update task');
        setTasks((prev) =>
          prev.map((t) => (t.id === draggableId ? { ...t, status: toStatus } : t))
        );
      })
      .catch((err) => {
        console.error(err);
        setTasks((prev) => prev);
      })
      .finally(() => {
        setPending(null);
      });
  }, []);

  const handleCardClick = useCallback((task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  }, []);

  const handleQuickAdd = useCallback((title: string, status: TaskStatus) => {
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, status }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create task');
        return res.json();
      })
      .then((newTask: Task) => {
        setTasks((prev) => [newTask, ...prev]);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleSave = useCallback((data: Partial<Task>) => {
    const isEdit = !!data.id;
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? '/api/tasks' : '/api/tasks';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save task');
        return res.json();
      })
      .then((savedTask: Task) => {
        setTasks((prev) => {
          if (isEdit) {
            return prev.map((t) => (t.id === savedTask.id ? savedTask : t));
          }
          return [savedTask, ...prev];
        });
        setModalOpen(false);
        setEditingTask(null);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleDelete = useCallback((id: string) => {
    fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete task');
        setTasks((prev) => prev.filter((t) => t.id !== id));
        setModalOpen(false);
        setEditingTask(null);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
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
      <TaskModal
        task={editingTask}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </DragDropContext>
  );
}