import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAccessToken, apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';
import '../index.css';

// Role → dashboard route mapping
const ROLE_HOME: Record<UserRole, string> = {
  admin: '/dashboard/admin',
  administration: '/dashboard/admin',
  teacher: '/dashboard/teacher',
  student: '/dashboard/student',
  parent: '/dashboard/parent',
  registrar: '/workflow',
};

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 1. Obtain JWT tokens
      const tokenRes = await apiClient.post('users/auth/login/', { email, password });
      setAccessToken(tokenRes.data.access);

      // 2. Fetch the user's profile to get their role
      const profileRes = await apiClient.get('users/me/');
      const profile = profileRes.data;
      const normalizedRole: UserRole = profile.role === 'administration' ? 'admin' : profile.role;

      // 3. Save user to global context
      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.full_name || profile.username || email,
        role: normalizedRole,
        avatar: profile.avatar,
      });

      // 4. Navigate to the role-specific dashboard
      navigate(ROLE_HOME[normalizedRole] || '/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-dark)',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '48px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <img src="/logo.png" alt="EduLink Logo" style={{ height: '64px', margin: '0 auto', display: 'block' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
            Sign in to your school portal
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            marginBottom: '4px',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Email address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                padding: '13px 16px',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text-main)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                padding: '13px 16px',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text-main)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn"
            style={{
              marginTop: '8px',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              background: 'linear-gradient(135deg, #38bdf8, #ec4899)',
              border: 'none',
              color: '#fff',
              transition: 'opacity 0.2s, transform 0.1s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '16px' }}>
          Your role is automatically detected from your account.
        </p>
      </div>
    </div>
  );
}

