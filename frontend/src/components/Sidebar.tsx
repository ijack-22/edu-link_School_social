import { Home, Users, BookOpen, FileText, BellRing, LogOut, Settings, BarChart2, MessageSquare, AlertCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { to: '/dashboard/student', label: 'Home', icon: Home },
  { to: '/feeds', label: 'School Feed', icon: FileText },
  { to: '/classes', label: 'My Classes', icon: BookOpen },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/complaints', label: 'Complaints', icon: AlertCircle },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const teacherLinks = [
  { to: '/dashboard/teacher', label: 'Home', icon: Home },
  { to: '/feeds', label: 'School Feed', icon: FileText },
  { to: '/classes', label: 'My Classes', icon: BookOpen },
  { to: '/workflow', label: 'Workflow', icon: BarChart2 },
  { to: '/complaints', label: 'Complaints', icon: AlertCircle },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const adminLinks = [
  { to: '/dashboard/admin', label: 'Dashboard', icon: BarChart2 },
  { to: '/feeds', label: 'School Feed', icon: FileText },
  { to: '/classes', label: 'Classes', icon: BookOpen },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/workflow', label: 'Workflow', icon: BarChart2 },
  { to: '/complaints', label: 'Complaints', icon: AlertCircle },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const parentLinks = [
  { to: '/dashboard/parent', label: 'Home', icon: Home },
  { to: '/feeds', label: 'School Feed', icon: FileText },
  { to: '/complaints', label: 'Complaints', icon: AlertCircle },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const registrarLinks = [
  { to: '/workflow', label: 'Registrar', icon: BarChart2 },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const LINKS_BY_ROLE = {
  student: studentLinks,
  teacher: teacherLinks,
  admin: adminLinks,
  administration: adminLinks,
  parent: parentLinks,
  registrar: registrarLinks,
};

const ROLE_COLOR: Record<string, string> = {
  admin: '#f472b6',
  teacher: '#818cf8',
  student: '#38bdf8',
  parent: '#34d399',
  registrar: '#f59e0b',
};

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const links = user ? LINKS_BY_ROLE[user.role] : [];
  const roleColor = user ? ROLE_COLOR[user.role] : '#38bdf8';

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div style={{ marginBottom: '32px', padding: '0 8px' }}>
        <img src="https://placehold.co/400x100/38bdf8/white?text=EduLink" alt="EduLink Logo" style={{ height: '40px', display: 'block', borderRadius: '4px' }} />
        {user && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: `${roleColor}30`,
              border: `2px solid ${roleColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 700, color: roleColor,
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>{user.name}</p>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: roleColor }}>{user.role}</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav links */}
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Icon size={20} /> {label}
        </NavLink>
      ))}

      {/* Bottom actions */}
      <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button
          onClick={() => {
            if ('Notification' in window) {
              Notification.requestPermission().then(p =>
                alert(p === 'granted' ? '✅ Push notifications enabled!' : '❌ Permission denied.')
              );
            }
          }}
          className="nav-link"
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--accent)' }}
        >
          <BellRing size={20} /> Notifications
        </button>
        <button
          onClick={logout}
          className="nav-link"
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#f87171' }}
        >
          <LogOut size={20} /> Sign Out
        </button>
      </div>
    </nav>
  );
};





