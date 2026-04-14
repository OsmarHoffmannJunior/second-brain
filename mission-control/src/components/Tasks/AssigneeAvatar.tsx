import { User, Bot } from 'lucide-react';
import { AssigneeAvatarProps } from './types';

export default function AssigneeAvatar({ assigned_to }: AssigneeAvatarProps) {
  if (!assigned_to) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
        <User size={12} />
        Unassigned
      </span>
    );
  }

  const isOsmar = assigned_to.startsWith('@osmar');
  const displayName = assigned_to.replace(/^@/, '');

  return (
    <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
      {isOsmar ? <User size={12} /> : <Bot size={12} />}
      {displayName}
    </span>
  );
}
