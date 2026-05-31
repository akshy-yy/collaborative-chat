import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate(redirect, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid credentials');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, var(--bg-primary) 60%)',
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
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', fontWeight: 800, color: 'white',
          }}>SF</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to SciFig Collaborate</p>
        </div>

        {error && (
          <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ paddingLeft: 38, paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} style={{
            padding: '12px', borderRadius: 'var(--radius-md)', border: 'none',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: 'white', fontWeight: 600, fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer',
          }}>
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={16} /> Sign In</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to={`/register${redirect !== '/dashboard' ? `?redirect=${redirect}` : ''}`} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
