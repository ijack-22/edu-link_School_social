import { Users, BookOpen, BarChart2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard = () => {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700 }}>
          Admin Panel — {user?.name} 🛡️
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>School-wide overview and management.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { icon: Users, label: 'Total Users', value: '452', color: '#f472b6' },
          { icon: BookOpen, label: 'Active Classes', value: '32', color: '#818cf8' },
          { icon: BarChart2, label: 'Avg Attendance', value: '91%', color: '#34d399' },
          { icon: AlertCircle, label: 'Pending Issues', value: '5', color: '#f59e0b' },
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
