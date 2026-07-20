import { GraduationCap, BookOpen, Trophy, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboard = () => {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700 }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>Here's your learning overview for today.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { icon: BookOpen, label: 'Classes Enrolled', value: '5', color: '#38bdf8' },
          { icon: Trophy, label: 'Study Points', value: '240', color: '#f59e0b' },
          { icon: Clock, label: 'Hours Studied', value: '18h', color: '#34d399' },
          { icon: GraduationCap, label: 'Assignments Due', value: '3', color: '#f472b6' },
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
