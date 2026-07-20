import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import Login from './pages/Login';
import { Feeds } from './pages/Feeds';
import { Classes } from './pages/Classes';
import { Messages } from './pages/Messages';
import { StudentDashboard } from './pages/dashboards/StudentDashboard';
import { TeacherDashboard } from './pages/dashboards/TeacherDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { ParentDashboard } from './pages/dashboards/ParentDashboard';
import { SchoolWorkflow } from './pages/SchoolWorkflow';
import './index.css';

/**
 * AppLayout — shows sidebar + main only when logged in.
 * On /login the sidebar is hidden so the login screen fills the whole viewport.
 */
const AppLayout = () => {
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
      {user && <Sidebar />}
      <main className="main-content">
        <Routes>
          {/* Public: redirect root to login if not authenticated */}
          <Route path="/" element={<Navigate to={homePath} replace />} />

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/dashboard/student" element={<StudentDashboard />} />
          </Route>

          {/* Teacher routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
          </Route>

          {/* Parent routes */}
          <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
            <Route path="/dashboard/parent" element={<ParentDashboard />} />
          </Route>

          {/* Shared protected routes (all roles) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/feeds" element={<Feeds />} />
            <Route path="/classes" element={<Classes />} />
            <Route element={<ProtectedRoute allowedRoles={['student', 'parent', 'admin', 'registrar']} />}>
              <Route path="/messages" element={<Messages />} />
            </Route>
            <Route path="/workflow" element={<SchoolWorkflow />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={homePath} replace />} />
        </Routes>
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




