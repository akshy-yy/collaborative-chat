import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, X, LayoutPanelLeft } from 'lucide-react';
import { TopNav } from '../components/layout/TopNav';
import { Sidebar } from '../components/layout/Sidebar';
import { MessageBubble } from '../components/chat/MessageBubble';
import { MessageInput } from '../components/chat/MessageInput';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';
import { roomsApi } from '../api/rooms';
import { messagesApi } from '../api/messages';
import type { Room, VoteType } from '../types';

export default function RoomPage() {
  const { projectId, roomId } = useParams<{ projectId: string; roomId: string }>();
  const { user } = useAuthStore();
  const { messages, fetchMessages, clearMessages } = useMessageStore();
  const { isConnected, onlineMembers, typingUsers, voteRequired, sendMessage, sendTyping, sendVote, dismissVoteRequired } = useWebSocket(roomId);
  const [room, setRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showPanel, setShowPanel] = useState(true);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!projectId || !roomId) return;
    clearMessages();
    fetchMessages(roomId);
    roomsApi.get(projectId, roomId).then(setRoom).catch(console.error);
    roomsApi.list(projectId).then(setRooms).catch(console.error);
  }, [roomId, projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleVote = (messageId: string, vote: VoteType) => {
    sendVote(messageId, vote);
  };

  const handleClearChat = async () => {
    if (!roomId || isClearingChat) return;
    const confirmed = window.confirm('Clear all messages in this room chat? This cannot be undone.');
    if (!confirmed) return;

    setIsClearingChat(true);
    try {
      await messagesApi.clearRoom(roomId);
      await fetchMessages(roomId);
    } catch (error) {
      console.error(error);
      window.alert('Failed to clear chat. Please try again.');
    } finally {
      setIsClearingChat(false);
    }
  };

  const pendingSuggestions = messages.filter(m => m.message_type === 'suggestion' && m.consensus_status === 'pending_vote');
  const approvedCount = messages.filter(m => m.message_type === 'suggestion' && (m.consensus_status === 'accepted' || m.consensus_status === 'auto_approved')).length;
  const rejectedCount = messages.filter(m => m.message_type === 'suggestion' && m.consensus_status === 'rejected').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <TopNav />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: 'calc(100vh - 56px)' }}>
        <Sidebar rooms={rooms} currentRoomId={roomId} projectId={projectId!} onlineMembers={onlineMembers} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            padding: '12px 20px', borderBottom: '1px solid var(--border)',
            background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>#{room?.name || 'Loading...'}</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{room?.description || ''}</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleClearChat}
                disabled={isClearingChat}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(239,68,68,0.35)',
                  background: 'rgba(239,68,68,0.12)',
                  color: '#f87171',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: isClearingChat ? 'not-allowed' : 'pointer',
                  opacity: isClearingChat ? 0.7 : 1,
                }}
              >
                {isClearingChat ? 'Clearing...' : 'Clear Chat'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: isConnected ? '#10b981' : '#ef4444' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: isConnected ? '#10b981' : '#ef4444', boxShadow: isConnected ? '0 0 6px rgba(16,185,129,0.6)' : 'none' }} />
                {isConnected ? 'Connected' : 'Reconnecting...'}
              </div>
              <button onClick={() => setShowPanel(!showPanel)} style={{ padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: showPanel ? 'rgba(99,102,241,0.1)' : 'transparent', color: showPanel ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                <LayoutPanelLeft size={16} />
              </button>
            </div>
          </div>

          {voteRequired && (
            <div className="animate-slide-up" style={{
              margin: '12px 16px', padding: '14px 16px', borderRadius: 'var(--radius-md)',
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.35)',
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              animation: 'glow 2s ease-in-out infinite',
            }}>
              <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', marginBottom: '4px' }}>Team Vote Required</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  "{voteRequired.content.slice(0, 120)}{voteRequired.content.length > 120 ? '...' : ''}"
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  This change may affect figure quality. Vote below on the message. Deadline: {new Date(voteRequired.deadline).toLocaleString()}
                </p>
              </div>
              <button onClick={dismissVoteRequired} style={{ padding: '4px', borderRadius: '4px', background: 'transparent', color: 'var(--text-muted)', flexShrink: 0 }}>
                <X size={14} />
              </button>
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} onVote={handleVote} currentUserId={user?.id} />
            ))}
            <TypingIndicator users={typingUsers} />
            <div ref={messagesEndRef} />
          </div>

          <MessageInput onSend={sendMessage} onTyping={sendTyping} disabled={!isConnected} />
        </div>

        {showPanel && (
          <div style={{ width: 280, flexShrink: 0, background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)', overflowY: 'auto', padding: '16px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              Figure Plan
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {[
                { label: 'Pending Vote', value: pendingSuggestions.length, color: '#f59e0b' },
                { label: 'Approved', value: approvedCount, color: '#10b981' },
                { label: 'Rejected', value: rejectedCount, color: '#ef4444' },
              ].map(stat => (
                <div key={stat.label} style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {pendingSuggestions.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={12} /> Pending Votes
                </h4>
                {pendingSuggestions.slice(0, 5).map(m => (
                  <div key={m.id} style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {m.content.slice(0, 80)}{m.content.length > 80 ? '...' : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
