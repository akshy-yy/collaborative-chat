import React from 'react';

interface TypingIndicatorProps {
  users: Record<string, string>;
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  const names = Object.values(users);
  if (names.length === 0) return null;

  const text = names.length === 1
    ? `${names[0]} is typing`
    : names.length === 2
    ? `${names[0]} and ${names[1]} are typing`
    : `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <div style={{ padding: '4px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '3px' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)',
            animation: `blink 1.4s ${i * 0.2}s ease-in-out infinite`,
          }} />
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{text}</span>
    </div>
  );
}
