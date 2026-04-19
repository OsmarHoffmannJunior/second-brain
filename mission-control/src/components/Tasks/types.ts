export interface PriorityBadgeProps {
  priority: 'urgent' | 'normal' | 'someday';
}

export interface AssigneeAvatarProps {
  assigned_to: string | null;
}

export interface TrackStatusDotProps {
  status: 'on_track' | 'at_risk' | 'off_track';
}
