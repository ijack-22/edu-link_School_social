import { useState } from 'react';
import { apiClient } from '../api/client';
import { Key, ShieldAlert } from 'lucide-react';
import '../index.css';

export const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      await apiClient.post('users/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to change password. Make sure your current password is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Update account preferences and security credentials.</p>
      </header>

      {message && (
        <div style={{ color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ color: '#f87171', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={18} color="var(--accent)" /> Change Password
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', color: 'var(--text-muted)' }}>
            <ShieldAlert size={16} />
            <span style={{ fontSize: '0.8rem' }}>Passwords must be at least 8 characters long.</span>
          </div>

          <button type="submit" className="btn" disabled={loading} style={{ alignSelf: 'flex-start', marginTop: '10px', padding: '12px 30px' }}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
