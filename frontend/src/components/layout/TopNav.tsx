import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Bell, Settings, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function TopNav() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{
      height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8rem', fontWeight: 800, color: 'white',
        }}>SF</div>
        <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>
          <span className="gradient-text">SciFig</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}> Collaborate</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--text-muted)' }}>
          <Bell size={18} />
        </button>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px',
              borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, color: 'white',
            }}>
              {user?.display_name?.slice(0, 2).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{user?.display_name}</span>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '110%', zIndex: 100,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '6px', minWidth: '160px',
              boxShadow: 'var(--shadow-lg)', animation: 'slideDown 0.15s ease',
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.display_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                  border: 'none', background: 'transparent', color: '#ef4444',
                  display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem',
                }}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
