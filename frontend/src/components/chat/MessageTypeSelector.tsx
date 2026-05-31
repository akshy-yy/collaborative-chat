import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { MessageType } from '../../types';
import { MESSAGE_TYPE_CONFIG } from '../../types';

interface MessageTypeSelectorProps {
  value: MessageType;
  onChange: (type: MessageType) => void;
}

const types: MessageType[] = ['chat', 'suggestion'];

export function MessageTypeSelector({ value, onChange }: MessageTypeSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const config = MESSAGE_TYPE_CONFIG[value];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 12px',
          borderRadius: 'var(--radius-md)', border: `1px solid ${config.color}50`,
          background: config.bg, color: config.color, fontSize: '0.8rem', fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {config.label} <ChevronDown size={12} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', bottom: '110%', left: 0, zIndex: 100,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: '6px', minWidth: '140px',
          boxShadow: 'var(--shadow-lg)', animation: 'slideDown 0.15s ease',
        }}>
          {types.map(t => {
            const c = MESSAGE_TYPE_CONFIG[t];
            return (
              <button
                key={t}
                onClick={() => { onChange(t); setOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)', border: 'none',
                  background: value === t ? c.bg : 'transparent',
                  color: value === t ? c.color : 'var(--text-secondary)',
                  fontSize: '0.82rem', fontWeight: value === t ? 600 : 400,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                {c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
