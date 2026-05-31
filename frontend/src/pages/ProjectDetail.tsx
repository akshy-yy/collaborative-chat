import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Hash, Users, ExternalLink, Loader2 } from 'lucide-react';
import { TopNav } from '../components/layout/TopNav';
import { useProjectStore } from '../store/projectStore';
import { roomsApi } from '../api/rooms';
import type { Room } from '../types';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, fetchProject, isLoading } = useProjectStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      roomsApi.list(projectId).then(setRooms).catch(console.error);
    }
  }, [projectId]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !projectId) return;
    setCreating(true);
    try {
      const room = await roomsApi.create(projectId, roomName, roomDesc);
      setRooms(prev => [room, ...prev]);
      setShowCreateRoom(false);
      setRoomName(''); setRoomDesc('');
    } finally { setCreating(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <TopNav />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Dashboard
          </Link>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader2 size={28} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>{currentProject?.name}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{currentProject?.description || 'No description'}</p>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Discussion Rooms</h2>
          <button onClick={() => setShowCreateRoom(true)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
            borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.3)',
            background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.85rem',
          }}>
            <Plus size={14} /> New Room
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rooms.map(room => (
            <Link key={room.id} to={`/projects/${projectId}/rooms/${room.id}`} style={{ textDecoration: 'none' }}>
              <div className="glass glass-hover" style={{ borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Hash size={18} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{room.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{room.description || 'No description'} · Created {formatDistanceToNow(new Date(room.created_at), { addSuffix: true })}</p>
                </div>
                <ExternalLink size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
            </Link>
          ))}
          {rooms.length === 0 && !isLoading && (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <Hash size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p>No rooms yet. Create one to start discussing.</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: '32px' }}>
          <Link to={`/projects/${projectId}/export`} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
            background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
          }}>
            Export Project Data
          </Link>
        </div>

        {showCreateRoom && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={e => e.target === e.currentTarget && setShowCreateRoom(false)}>
            <div className="animate-slide-up" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '32px', width: '100%', maxWidth: 440 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>New Discussion Room</h2>
              <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Room Name *</label>
                  <input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="e.g. Architecture Discussion" required />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Description</label>
                  <input value={roomDesc} onChange={e => setRoomDesc(e.target.value)} placeholder="What's this room for?" />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowCreateRoom(false)} style={{ flex: 1, padding: '11px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 500 }}>Cancel</button>
                  <button type="submit" disabled={creating} style={{ flex: 2, padding: '11px', borderRadius: 'var(--radius-md)', border: 'none', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', fontWeight: 600 }}>
                    {creating ? 'Creating...' : 'Create Room'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
