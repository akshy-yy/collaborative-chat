import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, FolderOpen, Users, Clock, ArrowRight, Copy, Check, Loader2 } from 'lucide-react';
import { TopNav } from '../components/layout/TopNav';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import { projectsApi } from '../api/projects';
import { formatDistanceToNow } from 'date-fns';
import { Shield } from 'lucide-react';
import type { Role } from '../types';
import { ROLE_CONFIG } from '../types';

export default function Dashboard() {
  const { projects, fetchProjects, createProject, isLoading } = useProjectStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const roles = Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][];

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomPassword.trim()) { setError('Name and room password are required'); return; }
    if (!selectedRole) { setError('Please select your role'); return; }
    setCreating(true);
    try {
      const project = await createProject(name, description, roomPassword, selectedRole);
      setShowCreate(false);
      setName(''); setDescription(''); setRoomPassword(''); setError(''); setSelectedRole(null);
      navigate(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create project');
    } finally { setCreating(false); }
  };

  const copyInviteLink = async (projectId: string) => {
    try {
      const data = await projectsApi.getInviteLink(projectId);
      await navigator.clipboard.writeText(data.invite_url);
      setCopiedId(projectId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <TopNav />
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '300px', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 30% -20%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% -10%, rgba(139,92,246,0.08) 0%, transparent 50%)',
      }} />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>
              Good {(() => {
                const h = new Date().getHours();
                if (h >= 5 && h < 12) return 'morning';
                if (h >= 12 && h < 18) return 'afternoon';
                return 'evening';
              })()},{' '}
              <span className="gradient-text">{user?.display_name?.split(' ')[0]}</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} · Collaborate with your research team
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px',
              borderRadius: 'var(--radius-md)', border: 'none',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: 'white', fontWeight: 600, fontSize: '0.9rem',
              boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            }}
          >
            <Plus size={16} /> New Project
          </button>
        </div>

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader2 size={32} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔬</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No projects yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Create your first project to start collaborating on scientific figures</p>
            <button onClick={() => setShowCreate(true)} style={{
              padding: '10px 24px', borderRadius: 'var(--radius-md)', border: 'none',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: 'white', fontWeight: 600, cursor: 'pointer',
            }}>
              Create Project
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {projects.map(project => (
            <div key={project.id} className="glass glass-hover animate-fade-in" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'all 0.2s' }}>
              <div style={{ height: 4, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }} />
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{project.name}</h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {project.description || 'No description'}
                    </p>
                  </Link>
                  <span style={{
                    padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
                    background: project.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
                    color: project.status === 'active' ? '#10b981' : '#6b7280',
                    border: `1px solid ${project.status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.3)'}`,
                    flexShrink: 0, marginLeft: '12px',
                  }}>
                    {project.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} /> {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                  </span>
                  <button
                    onClick={() => copyInviteLink(project.id)}
                    style={{
                      marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                      background: 'transparent', color: 'var(--text-muted)', fontSize: '0.78rem',
                    }}
                  >
                    {copiedId === project.id ? <><Check size={12} style={{ color: '#10b981' }} /> Copied!</> : <><Copy size={12} /> Invite Link</>}
                  </button>
                  <Link to={`/projects/${project.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px',
                    borderRadius: 'var(--radius-sm)', background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.3)', color: 'var(--accent-primary)',
                    fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none',
                  }}>
                    Open <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }} onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="animate-slide-up" style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '32px', width: '100%', maxWidth: 480,
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px' }}>New Project</h2>
            {error && <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Project Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. NeurIPS 2025 Figure Design" required />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of this project..." rows={3} style={{ resize: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Room Password *</label>
                <input type="password" value={roomPassword} onChange={e => setRoomPassword(e.target.value)} placeholder="Team members will need this to join" required />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Share this with your team alongside the invite link</p>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Your Role *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {roles.map(([roleKey, config]) => (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => setSelectedRole(roleKey)}
                      style={{
                        padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                        border: `2px solid ${selectedRole === roleKey ? config.color : 'var(--border)'}`,
                        background: selectedRole === roleKey ? `${config.color}15` : 'var(--bg-card)',
                        transition: 'all 0.15s', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px'
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: selectedRole === roleKey ? config.color : 'var(--text-primary)' }}>
                        {config.label}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{config.description.split('.')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '11px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit" disabled={creating || !selectedRole} style={{ flex: 2, padding: '11px', borderRadius: 'var(--radius-md)', border: 'none', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: (!selectedRole || creating) ? 0.7 : 1, cursor: (!selectedRole || creating) ? 'not-allowed' : 'pointer' }}>
                  {creating ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null} Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
