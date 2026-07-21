import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Users as UsersIcon, Plus, Key, Mail } from 'lucide-react';
import '../index.css';

interface UserListItem {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
}

interface CreationResult {
  username: string;
  email: string;
  role: string;
  temporary_password?: string;
  parent_temporary_password?: string;
  parent_email?: string;
}

export const Users = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher' | 'registrar' | 'administration'>('student');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Student specific fields
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  // Teacher specific fields
  const [classNamesStr, setClassNamesStr] = useState('');

  // Result modal state
  const [createdResult, setCreatedResult] = useState<CreationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('users/');
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load user directories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: any = {
      username: username.trim(),
      email: email.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role,
    };

    if (role === 'student') {
      payload.class_name = className.trim();
      payload.section = section.trim();
      payload.parent_email = parentEmail.trim();
      payload.parent_name = parentName.trim();
    } else if (role === 'teacher') {
      payload.class_names = classNamesStr.split(',').map(s => s.trim()).filter(Boolean);
      payload.section = section.trim();
    }

    try {
      const res = await apiClient.post('users/create/', payload);
      setCreatedResult({
        username: res.data.username,
        email: res.data.email,
        role: res.data.role,
        temporary_password: res.data.temporary_password,
        parent_temporary_password: res.data.parent_temporary_password,
        parent_email: parentEmail.trim() ? parentEmail.trim() : undefined,
      });

      // Reset form
      setUsername('');
      setEmail('');
      setFirstName('');
      setLastName('');
      setClassName('');
      setSection('');
      setParentName('');
      setParentEmail('');
      setClassNamesStr('');
      setShowCreateForm(false);
      
      // Reload directory
      fetchUsers();
    } catch (err: any) {
      const messages = Object.entries(err.response?.data || {})
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : JSON.stringify(v)}`)
        .join('; ');
      setError(messages || 'Failed to create user account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>User Accounts</h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Manage school directories, students, parents, and teachers.</p>
        </div>
        <button className="btn" onClick={() => setShowCreateForm(prev => !prev)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Account
        </button>
      </header>

      {error && (
        <div style={{ color: '#f87171', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Creation Modal / Result */}
      {createdResult && (
        <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '1px solid var(--accent)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} /> Account Created Successfully
          </h2>
          <p style={{ fontSize: '0.95rem', marginBottom: '20px', color: 'var(--text-main)' }}>
            Please write down these temporary credentials. They will not be shown again.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '20px' }}>
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 4px 0', fontWeight: 700 }}>
                {createdResult.role} Account
              </p>
              <p style={{ margin: '0 0 6px 0' }}><strong>Username:</strong> {createdResult.username}</p>
              <p style={{ margin: '0 0 6px 0' }}><strong>Email:</strong> {createdResult.email}</p>
              <p style={{ margin: 0 }}>
                <strong>Temporary Password:</strong>{' '}
                <code style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '4px', color: 'var(--accent)', fontWeight: 'bold' }}>
                  {createdResult.temporary_password || 'N/A'}
                </code>
              </p>
            </div>

            {createdResult.parent_email && (
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '4px' }}>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 4px 0', fontWeight: 700 }}>
                  Linked Parent Account
                </p>
                <p style={{ margin: '0 0 6px 0' }}><strong>Email:</strong> {createdResult.parent_email}</p>
                <p style={{ margin: 0 }}>
                  <strong>Temporary Password:</strong>{' '}
                  <code style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '4px', color: '#34d399', fontWeight: 'bold' }}>
                    {createdResult.parent_temporary_password || 'N/A'}
                  </code>
                </p>
              </div>
            )}
          </div>

          <button className="btn" onClick={() => setCreatedResult(null)} style={{ marginTop: '20px', padding: '10px 24px' }}>
            Done
          </button>
        </div>
      )}

      {/* Account Creation Form */}
      {showCreateForm && (
        <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Create New Account</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="registrar">Registrar</option>
                  <option value="administration">Admin</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. jdoe"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. student@school.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>First Name</label>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Last Name</label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                />
              </div>
            </div>

            {/* Student spec fields */}
            {role === 'student' && (
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Student Enrollment & Parent Account</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Class Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mathematics 10"
                      value={className}
                      onChange={e => setClassName(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Section</label>
                    <input
                      type="text"
                      placeholder="e.g. A"
                      value={section}
                      onChange={e => setSection(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Parent Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe Sr."
                      value={parentName}
                      onChange={e => setParentName(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Parent Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. parent@example.com"
                      value={parentEmail}
                      onChange={e => setParentEmail(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Teacher spec fields */}
            {role === 'teacher' && (
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Class Assignment</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Assigned Classes (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Mathematics 10, Physics 11"
                      value={classNamesStr}
                      onChange={e => setClassNamesStr(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Section</label>
                    <input
                      type="text"
                      placeholder="e.g. A"
                      value={section}
                      onChange={e => setSection(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button type="button" onClick={() => setShowCreateForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '12px' }}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <UsersIcon size={20} color="var(--accent)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>School User Directory</h2>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading directory...</p>
        ) : users.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No users found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.map(u => {
              const roleTag = u.role === 'administration' ? 'admin' : u.role;
              const color = roleTag === 'admin' ? '#f472b6' : roleTag === 'teacher' ? '#818cf8' : roleTag === 'registrar' ? '#f59e0b' : roleTag === 'parent' ? '#34d399' : '#38bdf8';
              return (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontWeight: 700 }}>
                      {u.full_name?.charAt(0).toUpperCase() || u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{u.full_name || u.username}</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} /> {u.email}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', padding: '4px 12px', borderRadius: '20px', background: `${color}15`, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {roleTag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
