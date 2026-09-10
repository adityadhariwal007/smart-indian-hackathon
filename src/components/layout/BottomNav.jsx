import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Search, UserSearch, ListOrdered, Ambulance,
  Calendar, Bell, Activity, Users, Clock, TrendingUp, Building2, BarChart3
} from 'lucide-react';
import './BottomNav.css';

const navItems = {
  patient: [
    { path: '/patient', icon: LayoutDashboard, label: 'Overview', end: true },
    { path: '/patient/hospitals', icon: Search, label: 'Hospitals' },
    { path: '/patient/appointments', icon: Calendar, label: 'Bookings' },
    { path: '/patient/emergency', icon: Ambulance, label: 'Emergency' },
  ],
  doctor: [
    { path: '/doctor', icon: LayoutDashboard, label: 'Home', end: true },
    { path: '/doctor/patients', icon: Users, label: 'Patients' },
    { path: '/doctor/appointments', icon: Calendar, label: 'Schedule' },
  ],
  admin: [
    { path: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
    { path: '/admin/departments', icon: Building2, label: 'Depts' },
    { path: '/admin/doctors', icon: Users, label: 'Doctors' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ],
};

export default function BottomNav() {
  const { user } = useAuth();
  if (!user) return null;

  const items = navItems[user.role] || [];

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
