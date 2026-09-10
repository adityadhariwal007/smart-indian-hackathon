import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, AlertTriangle, Search, HeartPulse, Sparkles } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import './Header.css';

export default function Header() {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const roleLabels = {
    patient: 'Patient Portal',
    doctor: 'Doctor Portal',
    admin: 'Admin Portal',
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-brand-mobile" onClick={() => navigate('/')}>
          <HeartPulse size={22} style={{ color: '#059669' }} />
          <span>HealthFlow</span>
        </div>
        <span className="header-portal-label">{roleLabels[user.role]}</span>
      </div>

      <div className="header-right">
        {/* Emergency - Solid Red Pill / Highest Contrast / Rightmost */}
        {user.role === 'patient' && (
          <button
            className="header-emergency-pill"
            onClick={() => navigate('/patient/emergency')}
            title="Immediate emergency ambulance & triage"
          >
            <span className="emergency-live-pulse" />
            <AlertTriangle size={15} />
            <span>Emergency SOS</span>
          </button>
        )}

        <button
          className="header-icon-btn"
          onClick={() => navigate(`/${user.role}${user.role === 'patient' ? '/notifications' : ''}`)}
          title="Notifications"
        >
          <Bell size={19} />
          <span className="notification-dot"></span>
        </button>

        {user.isGuest ? (
          <div className="header-user" onClick={() => navigate('/login')} style={{ cursor: 'pointer' }} title="Click to Sign In">
            <div className="header-avatar" style={{ background: '#64748b' }}>
              ?
            </div>
            <div className="header-user-info">
              <span className="header-user-name">Guest</span>
              <span className="header-user-role" style={{ color: '#c084fc', fontWeight: 600 }}>Sign In</span>
            </div>
          </div>
        ) : (
          <div className="header-user" onClick={() => navigate(`/${user.role}/profile`)}>
            <div className="header-avatar">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="header-user-info">
              <span className="header-user-name">{user.name}</span>
              <span className="header-user-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
