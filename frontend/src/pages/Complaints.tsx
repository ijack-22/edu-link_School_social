import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Plus, CheckCircle, Clock } from 'lucide-react';
import '../index.css';

interface ComplaintItem {
  id: string;
  title: string;
  description: string;
  status: string;
  submitted_by_name: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, { color: string; Icon: React.ComponentType<{ size?: number }> }> = {
  open: { color: '#f87171', Icon: AlertCircle },
  in_progress: { color: '#fbbf24', Icon: Clock },
  resolved: { color: '#34d399', Icon: CheckCircle },
};

export const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Submit form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'administration';

  const fetchComplaints = async () => {
    if (!isAdmin) return; // Only admin can see complaints
    try {
      setLoading(true);
      const res = await apiClient.get('social/complaints/');
      setUsersName(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch complaints list.');
    } finally {
      setLoading(false);
    }
  };

  const setUsersName = (data: any[]) => {
    setComplaints(data);
  };

  useEffect(() => {
    fetchComplaints();
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    setError(null);
    setSubmittedMessage(null);

    try {
      await apiClient.post('social/complaints/', {
        title: title.trim(),
        description: description.trim(),
      });
      setSubmittedMessage('Your complaint has been submitted successfully to the school administration.');
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit complaint ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    try {
      await apiClient.patch(`social/complaints/${id}/`, { status: nextStatus });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update complaint status.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>Support & Complaints</h1>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          {isAdmin ? 'Manage student and parent complaints.' : 'Submit complaints directly to school administration.'}
        </p>
      </header>

      {error && (
        <div style={{ color: '#f87171', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {submittedMessage && (
        <div style={{ color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' }}>
          {submittedMessage}
        </div>
      )}

      {!isAdmin ? (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>File a New Complaint</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Issue with classroom facilities"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Description</label>
              <textarea
                required
                rows={6}
                placeholder="Describe the complaint in detail..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
            <button type="submit" className="btn" disabled={submitting} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px' }}>
              <Plus size={18} /> {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} color="var(--accent)" /> School Complaints Directory
          </h2>

          {loading ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading complaints...</p>
          ) : complaints.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No active complaints filed.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {complaints.map(c => {
                const style = STATUS_STYLES[c.status] || STATUS_STYLES.open;
                return (
                  <div key={c.id} style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 600 }}>{c.title}</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Submitted by: <strong>{c.submitted_by_name || 'Anonymous'}</strong> &middot; {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span style={{ fontSize: '0.72rem', padding: '4px 12px', borderRadius: '20px', background: `${style.color}15`, color: style.color, border: `1px solid ${style.color}30`, display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', fontWeight: 700 }}>
                        <style.Icon size={12} />
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p style={{ margin: '14px 0 0 0', padding: '12px 16px', borderRadius: '10px', background: 'rgba(0,0,0,0.15)', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                      {c.description}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                      <button onClick={() => handleUpdateStatus(c.id, 'open')} style={{ background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>Mark Open</button>
                      <button onClick={() => handleUpdateStatus(c.id, 'in_progress')} style={{ background: 'transparent', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>In Progress</button>
                      <button onClick={() => handleUpdateStatus(c.id, 'resolved')} style={{ background: 'transparent', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer' }}>Mark Resolved</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
