import { BookOpen, MessageCircle } from 'lucide-react';

export const Study = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>Academic Workspace</h1>
        <p style={{ color: 'var(--text-muted)' }}>The web experience is focused on messaging, classes, and school updates.</p>
      </header>

      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ padding: '8px', background: 'rgba(56, 189, 248, 0.2)', borderRadius: '50%', color: 'var(--accent)' }}>
            <MessageCircle size={20} />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: '20px', lineHeight: 1.5 }}>
            This workspace is centered on school communication and academic management only.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '16px', color: 'var(--text-muted)' }}>
          <BookOpen size={20} />
          <span>Use Messages for direct communication and Classes for school materials.</span>
        </div>
      </div>
    </div>
  );
};
