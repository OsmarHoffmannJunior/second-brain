import { PriorityBadgeProps } from './types';

const labels: Record<PriorityBadgeProps['priority'], string> = {
  urgent: 'Urgent',
  normal: 'Normal',
  someday: 'Someday',
};

const styles: Record<PriorityBadgeProps['priority'], string> = {
  urgent: 'bg-red-500/20 text-red-400 border border-red-500/30',
  normal: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  someday: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${styles[priority]}`}
    >
      {labels[priority]}
    </span>
  );
}
