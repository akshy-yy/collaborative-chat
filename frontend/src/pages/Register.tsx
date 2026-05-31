import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      await register(email, password, displayName);
      navigate(redirect, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, var(--bg-primary) 60%)',
      padding: '24px',
    }}>
      <div className="animate-slide-up" style={{
        width: '100%', maxWidth: 420, background: 'var(--bg-secondary)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
        padding: '40px', boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent-secondary), #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', fontWeight: 800, color: 'white',
          }}>SF</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>Create account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join SciFig Collaborate</p>
        </div>

        {error && (
          <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Display Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required placeholder="Dr. Jane Smith" style={{ paddingLeft: 38 }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@university.edu" style={{ paddingLeft: 38 }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="min. 6 characters" style={{ paddingLeft: 38 }} />
            </div>
          </div>

          <button type="submit" disabled={isLoading} style={{
            padding: '12px', borderRadius: 'var(--radius-md)', border: 'none',
            background: 'linear-gradient(135deg, var(--accent-secondary), #ec4899)',
            color: 'white', fontWeight: 600, fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer',
          }}>
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={16} /> Create Account</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
