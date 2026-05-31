import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import type { Message, VoteType } from '../../types';
import { ROLE_CONFIG, MESSAGE_TYPE_CONFIG, CONSENSUS_CONFIG } from '../../types';

interface MessageBubbleProps {
  message: Message;
  onVote: (messageId: string, vote: VoteType) => void;
  currentUserId?: string;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function MessageBubble({ message, onVote, currentUserId }: MessageBubbleProps) {
  const role = message.role;
  const roleConfig = role ? ROLE_CONFIG[role] : null;
  const msgConfig = MESSAGE_TYPE_CONFIG[message.message_type];
  const consensusConfig = message.consensus_status ? CONSENSUS_CONFIG[message.consensus_status] : null;
  const isHighPriority = role && (role === 'principal_investigator' || role === 'supervisor');
  const isSystem = message.message_type === 'system';
  const isSuggestion = message.message_type === 'suggestion';
  const isPendingVote = message.consensus_status === 'pending_vote';
  const isAutoApproved = message.consensus_status === 'auto_approved';
  const isAccepted = message.consensus_status === 'accepted';
  const isRejected = message.consensus_status === 'rejected';
  const isCurrentUser = currentUserId && message.user?.id === currentUserId;

  if (isSystem) {
    return (
      <div style={{ textAlign: 'center', padding: '6px 0' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '3px 12px', borderRadius: '20px', border: '1px solid var(--border)' }}>
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        gap: '12px',
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        background: isHighPriority ? `rgba(${role === 'principal_investigator' ? '245,158,11' : '99,102,241'},0.05)` : 'transparent',
        borderLeft: isHighPriority ? `3px solid ${roleConfig?.color}` : '3px solid transparent',
        marginBottom: '4px',
        transition: 'background 0.2s',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: `${roleConfig?.color || '#6b7280'}22`,
        border: `2px solid ${roleConfig?.color || '#6b7280'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 700, color: roleConfig?.color || '#6b7280',
      }}>
        {getInitials(message.user?.display_name || 'U')}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            {message.user?.display_name || 'Unknown'}
          </span>
          {roleConfig && (
            <span style={{
              fontSize: '0.68rem', fontWeight: 600, padding: '1px 7px', borderRadius: '20px',
              color: roleConfig.color, background: `${roleConfig.color}20`, border: `1px solid ${roleConfig.color}40`,
            }}>
              {roleConfig.label}
            </span>
          )}
          {message.message_type !== 'chat' && (
            <span style={{
              fontSize: '0.68rem', fontWeight: 600, padding: '1px 7px', borderRadius: '20px',
              color: msgConfig.color, background: msgConfig.bg, border: `1px solid ${msgConfig.color}40`,
            }}>
              {msgConfig.label}
            </span>
          )}
          {consensusConfig && isSuggestion && (
            <span style={{
              fontSize: '0.68rem', fontWeight: 600, padding: '1px 7px', borderRadius: '20px',
              color: consensusConfig.color, background: `${consensusConfig.color}15`,
              display: 'flex', alignItems: 'center', gap: '3px',
              ...(isPendingVote ? { animation: 'pulse 2s infinite' } : {}),
            }}>
              {isAutoApproved && <CheckCircle size={10} />}
              {isPendingVote && <AlertTriangle size={10} />}
              {consensusConfig.label}
            </span>
          )}
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, wordBreak: 'break-word' }}>
          {message.content}
        </p>

        {isSuggestion && isPendingVote && (
          <div style={{
            marginTop: '10px', padding: '10px 14px', borderRadius: 'var(--radius-md)',
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
          }}>
            <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={12} /> Team vote required — this change may affect figure quality
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => onVote(message.id, 'upvote')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)', border: `1px solid ${message.user_vote === 'upvote' ? '#10b981' : 'var(--border)'}`,
                  background: message.user_vote === 'upvote' ? 'rgba(16,185,129,0.15)' : 'var(--bg-card)',
                  color: message.user_vote === 'upvote' ? '#10b981' : 'var(--text-secondary)',
                  fontSize: '0.8rem', fontWeight: 500,
                }}
              >
                <ThumbsUp size={13} /> Approve {message.upvotes > 0 && `(${message.upvotes})`}
              </button>
              <button
                onClick={() => onVote(message.id, 'downvote')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)', border: `1px solid ${message.user_vote === 'downvote' ? '#ef4444' : 'var(--border)'}`,
                  background: message.user_vote === 'downvote' ? 'rgba(239,68,68,0.15)' : 'var(--bg-card)',
                  color: message.user_vote === 'downvote' ? '#ef4444' : 'var(--text-secondary)',
                  fontSize: '0.8rem', fontWeight: 500,
                }}
              >
                <ThumbsDown size={13} /> Reject {message.downvotes > 0 && `(${message.downvotes})`}
              </button>
              {message.vote_deadline && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                  <Clock size={11} /> Deadline: {new Date(message.vote_deadline).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        )}

        {isSuggestion && (isAutoApproved || isAccepted) && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10b981' }}>
            <CheckCircle size={13} />
            {isAutoApproved ? 'Auto-approved — change forwarded to agent pipeline' : `Approved by team — ${message.upvotes} votes`}
          </div>
        )}

        {isSuggestion && isRejected && (
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#ef4444' }}>
            ✗ Rejected by team vote
          </div>
        )}
      </div>
    </div>
  );
}
