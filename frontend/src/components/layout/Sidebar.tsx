import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageSquare, Plus, Hash } from 'lucide-react';
import type { Room } from '../../types';

interface SidebarProps {
  rooms: Room[];
  currentRoomId?: string;
  projectId: string;
  onCreateRoom?: () => void;
  onlineMembers?: { user_id: string; display_name: string; role: string }[];
}

export function Sidebar({ rooms, currentRoomId, projectId, onCreateRoom, onlineMembers = [] }: SidebarProps) {
  return (
    <div style={{
      width: 240, flexShrink: 0, background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      height: '100%', overflowY: 'auto',
    }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Rooms
          </span>
          {onCreateRoom && (
            <button onClick={onCreateRoom} style={{ padding: '3px', borderRadius: '4px', background: 'transparent', color: 'var(--text-muted)' }}>
              <Plus size={14} />
            </button>
          )}
        </div>
        {rooms.map(room => (
          <Link
            key={room.id}
            to={`/projects/${projectId}/rooms/${room.id}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px',
              borderRadius: 'var(--radius-sm)', marginBottom: '2px',
              background: room.id === currentRoomId ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: room.id === currentRoomId ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: room.id === currentRoomId ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              textDecoration: 'none', fontSize: '0.875rem', fontWeight: room.id === currentRoomId ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            <Hash size={14} />
            {room.name}
          </Link>
        ))}
      </div>

      {onlineMembers.length > 0 && (
        <div style={{ padding: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Online — {Array.from(new Map(onlineMembers.map(m => [m.user_id, m])).values()).length}
          </span>
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Array.from(new Map(onlineMembers.map(m => [m.user_id, m])).values()).map(m => (
              <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0,
                  boxShadow: '0 0 6px rgba(16,185,129,0.6)',
                }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.display_name}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {m.role.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
