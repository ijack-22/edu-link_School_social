import { Users, BookOpen, FileText, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8' }}>
          <BookOpen size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, margin: 0 }}>
            Good morning, {user?.name?.split(' ')[0]}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>Your classes and tasks for today.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { icon: BookOpen, label: 'Classes Teaching', value: '4', color: '#818cf8' },
          { icon: Users, label: 'Total Students', value: '120', color: '#38bdf8' },
          { icon: FileText, label: 'Pending Submissions', value: '14', color: '#f59e0b' },
          { icon: Clock, label: 'Upcoming Lessons', value: '2', color: '#34d399' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
              <Icon size={22} />
            </div>
            <div>
              <p style={{ fontSize: '1.8rem', fontWeight: 700 }}>{value}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
