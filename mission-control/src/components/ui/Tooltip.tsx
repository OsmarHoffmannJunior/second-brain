'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLSpanElement>(null);

  const updatePos = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 8;
    let top = 0, left = 0;
    if (side === 'top')    { top = r.top + gap; left = r.left + r.width / 2; }
    if (side === 'bottom') { top = r.bottom + gap; left = r.left + r.width / 2; }
    if (side === 'left')   { top = r.top + r.height / 2; left = r.left - gap; }
    if (side === 'right')  { top = r.top + r.height / 2; left = r.right + gap; }
    setPos({ top, left });
  };

  const show = () => { setVisible(true); updatePos(); };
  const hide = () => setVisible(false);

  const translate =
    side === 'top'    ? '-50%, -100%' :
    side === 'bottom' ? '-50%, 0' :
    side === 'left'   ? '-100%, -50%' :
    '-0%, -50%';

  const textAnchor = side === 'left' ? 'end' : side === 'right' ? 'start' : 'middle';

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && createPortal(
        <div
          onMouseEnter={show}
          onMouseLeave={hide}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            transform: `translate(${translate})`,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <div
            className="px-3 py-2 rounded-lg text-xs leading-relaxed text-[var(--text-primary)] bg-[var(--surface-elevated)] border border-[var(--border)] shadow-2xl"
            style={{
              maxWidth: '260px',
              minWidth: '160px',
              background: '#242424',
            }}
          >
            {content}
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}
