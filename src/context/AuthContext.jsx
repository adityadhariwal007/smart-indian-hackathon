import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

export const demoUsers = {
  patient: {
    id: 1,
    name: 'Aditya Kumar',
    email: 'aditya.demo@healthflow.in',
    phone: '+91-98765-43210',
    role: 'patient',
    avatar: null,
    location: { lat: 28.6139, lng: 77.2090 }, // Central Delhi
    bloodGroup: 'O+',
    age: 32,
  },
  doctor: {
    id: 1,
    name: 'Dr. Ananya Sharma',
    email: 'dr.ananya@healthflow.in',
    phone: '+91-98765-43211',
    role: 'doctor',
    avatar: null,
    specialization: 'Cardiology',
    department_id: 2,
    hospital_id: 1,
    hospital_name: 'CityCare Government Hospital',
    experience: 14,
    qualifications: ['MBBS', 'MD', 'DM'],
  },
  admin: {
    id: 1,
    name: 'Rajesh Mehta',
    email: 'admin@citycare.healthflow.in',
    phone: '+91-98765-43212',
    role: 'admin',
    avatar: null,
    hospital_id: 1,
    hospital_name: 'CityCare Government Hospital',
    designation: 'Hospital Administrator',
  },
};

export const guestPatient = {
  id: null,
  name: 'Guest Patient',
  email: '',
  phone: '',
  role: 'patient',
  isGuest: true,
  bookedSlot: null,
  token: null,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    if (path.startsWith('/doctor')) return demoUsers.doctor;
    if (path.startsWith('/admin')) return demoUsers.admin;
    const savedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('healthflow_user') : null;
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch (e) {}
    }
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('healthflow_role') : null;
    if (saved && saved !== 'patient' && demoUsers[saved]) return demoUsers[saved];
    if (path.startsWith('/patient')) return guestPatient;
    return guestPatient;
  });

  const login = useCallback((role, customData = null) => {
    if (role === 'patient') {
      if (customData && customData.name) {
        const u = { ...guestPatient, ...customData, role: 'patient', isGuest: false };
        setUser(u);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('healthflow_user', JSON.stringify(u));
          localStorage.setItem('healthflow_role', 'patient');
        }
        return;
      }
      setUser(guestPatient);
      return;
    }
    const base = demoUsers[role] || null;
    const u = customData ? { ...base, ...customData, role } : base;
    setUser(u);
    if (role && typeof localStorage !== 'undefined') {
      localStorage.setItem('healthflow_role', role);
    }
  }, []);

  const register = useCallback((role, customData = null) => {
    login(role, customData);
  }, [login]);

  const logout = useCallback(() => {
    setUser(guestPatient);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('healthflow_role');
      localStorage.removeItem('healthflow_user');
    }
  }, []);

  const switchRole = useCallback((role) => {
    if (role === 'patient') {
      setUser(guestPatient);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('healthflow_role');
        localStorage.removeItem('healthflow_user');
      }
      return;
    }
    const u = demoUsers[role] || null;
    setUser(u);
    if (role && typeof localStorage !== 'undefined') {
      localStorage.setItem('healthflow_role', role);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, switchRole, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
