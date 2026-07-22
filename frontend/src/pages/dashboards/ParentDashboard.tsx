import { BookOpen, FileText, Bell, MessageCircle, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ParentDashboard = () => {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
          <Users size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, margin: 0 }}>
            Hello, {user?.name?.split(' ')[0]}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>Stay connected with your child's school progress.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { icon: BookOpen, label: "Child's Classes", value: '5', color: '#34d399' },
          { icon: FileText, label: 'Recent Reports', value: '2', color: '#38bdf8' },
          { icon: Bell, label: 'School Alerts', value: '1', color: '#f59e0b' },
          { icon: MessageCircle, label: 'Unread Messages', value: '3', color: '#f472b6' },
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
