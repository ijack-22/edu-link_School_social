import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './pages/Login';
import { Feeds } from './pages/Feeds';
import { Classes } from './pages/Classes';
import { Messages } from './pages/Messages';
import { StudentDashboard } from './pages/dashboards/StudentDashboard';
import { TeacherDashboard } from './pages/dashboards/TeacherDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { ParentDashboard } from './pages/dashboards/ParentDashboard';
import { SchoolWorkflow } from './pages/SchoolWorkflow';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import './index.css';

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    style={{ width: '100%', height: '100%' }}
  >
    {children}
  </motion.div>
);

/**
 * AppLayout — shows sidebar + main only when logged in.
 * On /login the sidebar is hidden so the login screen fills the whole viewport.
 */
const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const isLoginPage = location.pathname === '/login';
  const homePath = user?.role === 'registrar' ? '/workflow' : user ? `/dashboard/${user.role}` : '/login';

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      {user && (
        <>
          <div className={`sidebar-overlay ${isMobileMenuOpen ? 'mobile-open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="mobile-header">
            <img src="/logo.png" alt="duLink Logo" style={{ height: '32px' }} />
            <button className="btn" style={{ padding: '8px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }} onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
          <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </>
      )}
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public: redirect root to login if not authenticated */}
            <Route path="/" element={<Navigate to={homePath} replace />} />

            {/* Student routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/dashboard/student" element={<PageTransition><StudentDashboard /></PageTransition>} />
            </Route>

            {/* Teacher routes */}
            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route path="/dashboard/teacher" element={<PageTransition><TeacherDashboard /></PageTransition>} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/dashboard/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
              <Route path="/users" element={<PageTransition><Users /></PageTransition>} />
            </Route>

            {/* Parent routes */}
            <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
              <Route path="/dashboard/parent" element={<PageTransition><ParentDashboard /></PageTransition>} />
            </Route>

            {/* Shared protected routes (all roles) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/feeds" element={<PageTransition><Feeds /></PageTransition>} />
              <Route path="/classes" element={<PageTransition><Classes /></PageTransition>} />
              <Route element={<ProtectedRoute allowedRoles={['student', 'parent', 'admin', 'registrar']} />}>
                <Route path="/messages" element={<PageTransition><Messages /></PageTransition>} />
              </Route>
              <Route path="/workflow" element={<PageTransition><SchoolWorkflow /></PageTransition>} />
              <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to={homePath} replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;




