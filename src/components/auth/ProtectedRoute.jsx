import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute Component
 * Prevents logged-out users or unauthorized roles from accessing restricted dashboards.
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If unauthenticated, guest, or no user session
  if (!user || user.isGuest || !isAuthenticated) {
    const defaultRole = allowedRoles[0] || 'doctor';
    return (
      <Navigate 
        to={`/login?role=${defaultRole}&redirect=${encodeURIComponent(location.pathname)}`} 
        replace 
      />
    );
  }

  // If role is restricted and does not match
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const requiredRole = allowedRoles[0];
    return (
      <Navigate 
        to={`/login?role=${requiredRole}&redirect=${encodeURIComponent(location.pathname)}`} 
        replace 
      />
    );
  }

  return children;
}
