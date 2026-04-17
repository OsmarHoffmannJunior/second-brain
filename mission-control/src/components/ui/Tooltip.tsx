'use client';

import { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positionClass = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  }[side];

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          className={`absolute ${positionClass} z-50 px-3 py-2 rounded-lg text-xs leading-relaxed text-[var(--text-primary)] bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xl max-w-xs pointer-events-none whitespace-normal`}
          style={{ minWidth: '180px', maxWidth: '280px' }}
        >
          {content}
        </span>
      )}
    </span>
  );
}
