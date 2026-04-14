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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export default function TaskCard({ task, index, onClick, isPending }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          onClick={onClick}
          className={`
            mb-2 p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] cursor-pointer
            hover:border-[var(--accent)] transition-colors duration-150
            ${snapshot.isDragging ? 'opacity-50' : ''}
            ${isPending ? 'pointer-events-none' : ''}
          `}
        >
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--card)]/80 rounded-lg z-10">
              <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <PriorityBadge priority={task.priority} />

            <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">
              {task.title}
            </p>

            <div className="flex items-center gap-2">
              <AssigneeAvatar assigned_to={task.assigned_to} />
              <TrackStatusDot status={task.track_status} />
            </div>

            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                <Calendar size={12} />
                <span>{formatDate(task.due_date)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}