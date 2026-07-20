import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';

interface Props {
  allowedRoles?: UserRole[];
}

/**
 * ProtectedRoute — redirects to /login if not authenticated.
 * Optionally restricts to specific roles; redirects to their own dashboard if wrong role.
 */
export const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Wrong role — send them to their correct home
    const ROLE_HOME: Record<UserRole, string> = {
      admin: '/dashboard/admin',
      teacher: '/dashboard/teacher',
      student: '/dashboard/student',
      parent: '/dashboard/parent',
      registrar: '/workflow',
    };
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }

  return <Outlet />;
};

