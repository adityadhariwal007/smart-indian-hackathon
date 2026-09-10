import { createContext, useContext, useState, useCallback } from 'react';
import { AUTH_ACCOUNTS, authenticateStaff } from '../config/authCredentials';

const AuthContext = createContext(null);

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
    // 1. Check persisted session in localStorage
    if (typeof localStorage !== 'undefined') {
      const savedUser = localStorage.getItem('healthflow_auth_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.role) return parsed;
        } catch (e) {
          console.warn('Failed to parse saved user session:', e);
        }
      }
    }

    // 2. Default to guest for patient portal routes
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    if (path.startsWith('/patient')) {
      return guestPatient;
    }

    // 3. Logged out by default
    return null;
  });

  /**
   * Authenticate staff (Doctor / Admin) with the 3 predefined credentials
   * @param {string} username 
   * @param {string} password 
   * @param {'doctor'|'admin'} role 
   */
  const loginStaff = useCallback((username, password, role) => {
    const result = authenticateStaff(username, password, role);
    if (result.success && result.user) {
      setUser(result.user);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('healthflow_auth_user', JSON.stringify(result.user));
        localStorage.setItem('healthflow_role', result.user.role);
      }
    }
    return result;
  }, []);

  /**
   * Generic login for patient portal backward compatibility
   */
  const login = useCallback((role, customData = null) => {
    if (role === 'patient') {
      const u = customData && customData.name 
        ? { ...guestPatient, ...customData, role: 'patient', isGuest: false }
        : guestPatient;
      setUser(u);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('healthflow_auth_user', JSON.stringify(u));
        localStorage.setItem('healthflow_role', 'patient');
      }
      return;
    }

    // For doctor or admin, if customData provides username & password, authenticate
    if (customData?.username && customData?.password) {
      return loginStaff(customData.username, customData.password, role);
    }
  }, [loginStaff]);

  /**
   * Switch active role for logged-in staff user
   */
  const switchRole = useCallback((newRole) => {
    if (newRole === 'patient') {
      setUser(guestPatient);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('healthflow_auth_user', JSON.stringify(guestPatient));
        localStorage.setItem('healthflow_role', 'patient');
      }
      return;
    }

    // If currently logged in as a staff member (aditya, palakshi, arnav)
    if (user && user.username) {
      const account = AUTH_ACCOUNTS.find(a => a.username === user.username);
      if (account) {
        const result = authenticateStaff(account.username, account.password, newRole);
        if (result.success) {
          setUser(result.user);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('healthflow_auth_user', JSON.stringify(result.user));
            localStorage.setItem('healthflow_role', newRole);
          }
        }
      }
    }
  }, [user]);

  /**
   * Logout current session
   */
  const logout = useCallback(() => {
    setUser(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('healthflow_auth_user');
      localStorage.removeItem('healthflow_role');
      localStorage.removeItem('healthflow_user');
    }
  }, []);

  const isAuthenticated = Boolean(user && !user.isGuest);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginStaff, 
      logout, 
      switchRole, 
      isAuthenticated 
    }}>
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
