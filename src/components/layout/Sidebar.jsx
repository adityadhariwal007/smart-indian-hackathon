import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Search, UserSearch, ListOrdered, Ambulance, Calculator,
  Calendar, Bell, User, Users, Clock, Activity, Building2, Stethoscope,
  BarChart3, Settings, TrendingUp, Truck, HeartPulse, LogOut, ChevronLeft, Sparkles, Video,
  ShieldAlert, ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import './Sidebar.css';

const navGroups = {
  patient: [
    {
      group: 'PATIENT CARE',
      items: [
        { path: '/patient', icon: LayoutDashboard, label: 'Overview', end: true },
        { path: '/patient/portal', icon: ShieldCheck, label: 'Health ID Portal' },
        { path: '/patient/hospitals', icon: Building2, label: 'Find Hospital' },
        { path: '/patient/appointments', icon: Calendar, label: 'Appointments' },
        { path: '/patient/complaints', icon: ShieldAlert, label: 'Grievances' },
        { path: '/patient/emergency', icon: Ambulance, label: 'Emergency SOS' },
      ],
    },
  ],
  doctor: [
    {
      group: 'CLINICAL',
      items: [
        { path: '/doctor', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/doctor/patients', icon: Users, label: 'Patients' },
        { path: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
        { path: '/doctor/consultation', icon: Video, label: 'Tele-Consult' },
      ],
    },
  ],
  admin: [
    {
      group: 'OPERATIONS',
      items: [
        { path: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
        { path: '/admin/departments', icon: Building2, label: 'Departments' },
        { path: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/admin/complaints', icon: ShieldAlert, label: 'Grievances' },
      ],
    },
  ],
};

export default function Sidebar() {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const groups = navGroups[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand" onClick={() => navigate('/')}>
            <HeartPulse size={24} className="brand-icon" />
            <span>HealthFlow</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} title="Toggle sidebar">
          <ChevronLeft size={18} style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {groups.map((grp, idx) => (
          <div key={idx} className="sidebar-group">
            {!collapsed && grp.group && (
              <div className="sidebar-group-title">{grp.group}</div>
            )}
            <div className="sidebar-group-items">
              {grp.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  title={item.label}
                >
                  <item.icon size={19} className="sidebar-link-icon" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && user.role !== 'patient' && (
          <div className="role-switcher">
            <span className="role-label">Switch Role</span>
            <div className="role-buttons">
              {['patient', 'doctor', 'admin'].map(role => (
                <button
                  key={role}
                  className={`role-btn ${user.role === role ? 'active' : ''}`}
                  onClick={() => {
                    switchRole(role);
                    navigate(`/${role}`);
                  }}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
        <button className="sidebar-link logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
