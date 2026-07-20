import { useState } from 'react';
import { MessageSquare, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../hooks/usePosts';
import '../index.css';

const fieldStyle = { padding: '11px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-main)' };

export const Feeds = () => {
  const { user } = useAuth();
  const { posts, loading, error, reload } = usePosts();
  const [notice, setNotice] = useState('');
  const canPost = user?.role === 'admin';

  const createPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await apiClient.post('social/posts/', Object.fromEntries(form.entries()));
    setNotice('Announcement posted.');
    event.currentTarget.reset();
    reload();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>School Feed</h1>
          <p style={{ color: 'var(--text-muted)' }}>Announcements and upcoming events from administration.</p>
        </div>
      </header>

      {canPost && (
        <form onSubmit={createPost} className="glass-panel" style={{ padding: '20px', display: 'grid', gap: '12px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Post announcement</h2>
          <input name="title" placeholder="Announcement or event title" required style={fieldStyle} />
          <textarea name="content" placeholder="Details everyone should see" required rows={4} style={fieldStyle} />
          <select name="privacy" defaultValue="school" style={fieldStyle}>
            <option value="school">School-wide</option>
            <option value="global">Global</option>
          </select>
          <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <MessageSquare size={18} /> Publish
          </button>
        </form>
      )}
      {notice && <p style={{ color: '#34d399', marginBottom: '16px' }}>{notice}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading posts...</p>
        ) : error ? (
          <p style={{ color: 'var(--error)', textAlign: 'center', padding: '40px' }}>{error}</p>
        ) : posts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No announcements yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="glass-panel" style={{ padding: '24px', transition: 'transform 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img src={post.avatar} alt={post.user} style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--primary)' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {post.user}
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', textTransform: 'uppercase', fontWeight: 700 }}>
                        Administration
                      </span>
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{post.createdAt} - {post.privacy}</p>
                  </div>
                </div>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {post.title && <h4 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--text-main)' }}>{post.title}</h4>}
              <p style={{ color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '20px', opacity: 0.9 }}>{post.content}</p>

              <div style={{ display: 'flex', gap: '24px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}><Heart size={18} /> {post.likes}</button>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}><MessageSquare size={18} /> {post.comments}</button>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500, marginLeft: 'auto' }}><Share2 size={18} /> Share</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
