import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';
import type { MessageType } from '../../types';
import { MessageTypeSelector } from './MessageTypeSelector';

interface MessageInputProps {
  onSend: (content: string, type: MessageType) => void;
  onTyping: (is_typing: boolean) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, onTyping, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [msgType, setMsgType] = useState<MessageType>('chat');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping(false), 1500);
  };

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, msgType);
    setContent('');
    onTyping(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSend(); }
  };

  const isSuggestion = msgType === 'suggestion';

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
      {isSuggestion && (
        <div style={{
          marginBottom: '8px', padding: '6px 12px', borderRadius: 'var(--radius-sm)',
          background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
          fontSize: '0.75rem', color: '#a5b4fc',
        }}>
          💡 Suggestions are automatically classified. Potentially degrading changes will require team approval.
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
        <MessageTypeSelector value={msgType} onChange={setMsgType} />
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`${msgType === 'chat' ? 'Type a message' : `Add ${msgType}`}... (Ctrl+Enter to send)`}
            disabled={disabled}
            rows={1}
            style={{
              resize: 'none', minHeight: '42px', maxHeight: '160px',
              paddingRight: '48px', lineHeight: 1.5,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
              width: '100%', padding: '10px 14px',
            }}
          />
          <span style={{ position: 'absolute', bottom: '8px', right: '10px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {content.length}
          </span>
        </div>
        <button
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          style={{
            width: 42, height: 42, borderRadius: 'var(--radius-md)', flexShrink: 0,
            background: content.trim() ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'var(--bg-card)',
            color: content.trim() ? 'white' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border)', transition: 'all 0.2s',
            cursor: content.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
