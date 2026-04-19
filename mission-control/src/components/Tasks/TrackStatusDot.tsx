import { TrackStatusDotProps } from './types';

const config: Record<TrackStatusDotProps['status'], { dot: string; label: string }> = {
  on_track: { dot: 'bg-green-500', label: 'On Track' },
  at_risk: { dot: 'bg-orange-500', label: 'At Risk' },
  off_track: { dot: 'bg-red-500', label: 'Off Track' },
};

export default function TrackStatusDot({ status }: TrackStatusDotProps) {
  const { dot, label } = config[status];

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
      <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
