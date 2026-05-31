import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Shield, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { projectsApi } from '../api/projects';
import type { Role } from '../types';
import { ROLE_CONFIG } from '../types';

type Step = 'auth_check' | 'password' | 'role_select' | 'joining';

export default function JoinRoom() {
  const { inviteToken } = useParams<{ inviteToken: string }>();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('auth_check');
  const [roomPassword, setRoomPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectInfo, setProjectInfo] = useState<{ id: string; name: string; description: string | null } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setStep('auth_check');
    } else {
      setStep('password');
      if (inviteToken) {
        projectsApi.list().then(projects => {
          const existing = projects.find(p => p.invite_token === inviteToken);
          if (existing) {
            setProjectInfo({ id: existing.id, name: existing.name, description: existing.description });
          }
        }).catch(() => {});
      }
    }
  }, [isAuthenticated, inviteToken]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomPassword.trim()) { setError('Please enter the room password'); return; }
    setError('');
    setStep('role_select');
  };

  const handleJoin = async () => {
    if (!selectedRole || !inviteToken) return;
    setLoading(true);
    setStep('joining');
    try {
      const project = await projectsApi.join(inviteToken, roomPassword, selectedRole);
      navigate(`/projects/${project.id}`, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to join. Check your password.');
      setStep('password');
    } finally { setLoading(false); }
  };

  const roles = Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, var(--bg-primary) 60%)',
      padding: '24px',
    }}>
      <div className="animate-slide-up" style={{ width: '100%', maxWidth: step === 'role_select' ? 720 : 460 }}>
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }} />
          <div style={{ padding: '36px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', fontWeight: 800, color: 'white',
              }}>SF</div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>Join SciFig Project</h1>
              {projectInfo && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{projectInfo.name}</p>}
            </div>

            {error && (
              <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            {step === 'auth_check' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
                  You need an account to join this project.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link to={`/login?redirect=/join/${inviteToken}`} style={{
                    flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                    background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none',
                    textAlign: 'center', fontSize: '0.9rem',
                  }}>
                    Sign In
                  </Link>
                  <Link to={`/register?redirect=/join/${inviteToken}`} style={{
                    flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: 'none',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    color: 'white', fontWeight: 600, textDecoration: 'none', textAlign: 'center', fontSize: '0.9rem',
                  }}>
                    Create Account
                  </Link>
                </div>
              </div>
            )}

            {step === 'password' && (
              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                  <div style={{ padding: '12px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <Lock size={24} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  This project is password-protected. Enter the room password to continue.
                </p>
                <input type="password" value={roomPassword} onChange={e => setRoomPassword(e.target.value)} placeholder="Room password" required autoFocus />
                <button type="submit" style={{
                  padding: '12px', borderRadius: 'var(--radius-md)', border: 'none',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  Continue <ChevronRight size={16} />
                </button>
              </form>
            )}

            {step === 'role_select' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '12px' }}>
                    <Shield size={22} style={{ color: '#10b981' }} />
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Select your role in this project. This determines your priority weight in decisions.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
                  {roles.map(([roleKey, config]) => (
                    <button
                      key={roleKey}
                      onClick={() => setSelectedRole(roleKey)}
                      style={{
                        padding: '14px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                        border: `2px solid ${selectedRole === roleKey ? config.color : 'var(--border)'}`,
                        background: selectedRole === roleKey ? `${config.color}15` : 'var(--bg-card)',
                        transition: 'all 0.15s', cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: selectedRole === roleKey ? config.color : 'var(--text-primary)' }}>
                          {config.label}
                        </span>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '20px',
                          background: `${config.color}20`, color: config.color, border: `1px solid ${config.color}40`,
                        }}>
                          W:{config.weight}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{config.description}</p>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setStep('password')} style={{
                    padding: '11px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500,
                  }}>
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button onClick={handleJoin} disabled={!selectedRole || loading} style={{
                    flex: 1, padding: '11px', borderRadius: 'var(--radius-md)', border: 'none',
                    background: selectedRole ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'var(--bg-card)',
                    color: selectedRole ? 'white' : 'var(--text-muted)', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    cursor: selectedRole ? 'pointer' : 'not-allowed',
                  }}>
                    {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                    Join as {selectedRole ? ROLE_CONFIG[selectedRole].label : '...'}
                  </button>
                </div>
              </div>
            )}

            {step === 'joining' && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Loader2 size={32} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Joining project...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
