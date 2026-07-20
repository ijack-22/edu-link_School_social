import { Book, FileText, Download } from 'lucide-react';

import { useClasses } from '../hooks/useClasses';

export const Classes = () => {
  const { classes, loading, error } = useClasses();
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>My Classes</h1>
        <p style={{ color: 'var(--text-muted)' }}>Access your class rosters and materials.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {loading ? (
          <p>Loading classes...</p>
        ) : error ? (
          <p className="text-error">{error}</p>
        ) : (
          classes.map((cls) => (
            <div key={cls.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ padding: '12px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                  <Book size={24} />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '12px' }}>
                  {cls.students} Students
                </span>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '4px' }}>{cls.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{cls.teacher} • {cls.room}</p>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px' }}>
                <button className="btn" style={{ flex: 1, padding: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> Materials
                </button>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', flex: 1, padding: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                  <Download size={16} /> R2 Sync
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
