import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  HeartPulse, 
  ArrowLeft, 
  Shield, 
  Stethoscope, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff
} from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const { loginStaff } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Selected role: 'doctor' or 'admin' (defaults to query param or 'doctor')
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'doctor';
  const [selectedRole, setSelectedRole] = useState(initialRole);

  // Credentials input state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Destination redirect query parameter if user was redirected from a protected route
  const redirectUrl = searchParams.get('redirect');

  // Submit Handler
  const handleSubmit = (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Please enter your staff username.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    // Call centralized authentication service
    const result = loginStaff(username, password, selectedRole);

    if (!result.success) {
      setLoading(false);
      setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
      return;
    }

    // Successful login
    const user = result.user;
    addToast(`Welcome back, ${user.name}! Access granted to ${selectedRole === 'doctor' ? 'Doctor' : 'Admin'} Portal.`, 'success');

    // Route to the selected dashboard
    setTimeout(() => {
      setLoading(false);
      if (redirectUrl && redirectUrl.startsWith(`/${selectedRole}`)) {
        navigate(redirectUrl, { replace: true });
      } else {
        navigate(`/${selectedRole}`, { replace: true });
      }
    }, 400);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Back to Home Button */}
        <button 
          type="button"
          className="btn btn-ghost mb-3 back-home-btn" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        {/* Brand Header */}
        <div className="login-header">
          <div className="login-logo">
            <HeartPulse size={34} style={{ color: '#059669' }} />
            <span>HealthFlow</span>
          </div>
          <h2>Staff Portal Sign In</h2>
          <p>Secure clinical & administrative access for verified Punjab healthcare coordinators.</p>
        </div>

        {/* Authentication Card */}
        <div className="staff-login-card card">
          {/* STEP 1: Select Role (Doctor or Admin) */}
          <div className="role-selection-wrapper">
            <label className="auth-field-label">Select Your Role</label>
            <div className="role-selector-grid">
              <button
                type="button"
                className={`role-choice-btn ${selectedRole === 'doctor' ? 'active-doctor' : ''}`}
                onClick={() => {
                  setSelectedRole('doctor');
                  setErrorMessage('');
                }}
              >
                <div className="role-choice-icon doctor-icon">
                  <Stethoscope size={20} />
                </div>
                <div className="role-choice-text">
                  <span className="role-name">Doctor</span>
                  <span className="role-desc">OPD Queue & Consultations</span>
                </div>
                {selectedRole === 'doctor' && (
                  <div className="role-check-indicator">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </button>

              <button
                type="button"
                className={`role-choice-btn ${selectedRole === 'admin' ? 'active-admin' : ''}`}
                onClick={() => {
                  setSelectedRole('admin');
                  setErrorMessage('');
                }}
              >
                <div className="role-choice-icon admin-icon">
                  <Shield size={20} />
                </div>
                <div className="role-choice-text">
                  <span className="role-name">Hospital Admin</span>
                  <span className="role-desc">Bed Dispatch & Operations</span>
                </div>
                {selectedRole === 'admin' && (
                  <div className="role-check-indicator">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="auth-error-banner animate-fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="auth-form-body">
            {/* Username Input */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="staff-username">
                Username
              </label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input
                  id="staff-username"
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. aditya, palakshi, or arnav"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="auth-text-input"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="staff-password">
                Password
              </label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  id="staff-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-text-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className={`auth-submit-btn ${selectedRole === 'doctor' ? 'btn-doctor' : 'btn-admin'}`}
            >
              {loading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In as {selectedRole === 'doctor' ? 'Doctor' : 'Hospital Admin'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Patient Portal Guest Link */}
        <div className="patient-shortcut-footer">
          <span>Looking for patient appointments or OPD tracking?</span>
          <button 
            type="button"
            className="patient-link-btn"
            onClick={() => navigate('/patient/portal')}
          >
            Continue to Patient Portal →
          </button>
        </div>

        {/* Security & Verification Disclaimer */}
        <div className="auth-footer-badge">
          <Shield size={14} style={{ color: '#059669' }} />
          <span>Role-Based Access Control • Centralized Punjab HealthFlow Auth</span>
        </div>
      </div>
    </div>
  );
}
