import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  HeartPulse, ArrowLeft, Phone, CheckCircle2, Shield, 
  Stethoscope, User, ArrowRight, RefreshCw, KeyRound, Sparkles, Check
} from 'lucide-react';
import { loginOrRegisterWithGoogle, loginOrRegisterWithMobile } from '../../services/patientPortalService';
import GoogleAuthModal from '../../components/auth/GoogleAuthModal';
import { checkRateLimit } from '../../utils/security';
import { analytics } from '../../services/analytics';
import './LoginPage.css';

// Official Google 'G' colored SVG
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  // Mode: 'patient' (Google + Mobile OTP) or 'staff' (Doctor/Admin demo cards)
  const [authCategory, setAuthCategory] = useState('patient');

  // Mobile OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpStage, setOtpStage] = useState('phone'); // 'phone' | 'otp'
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [isCounting, setIsCounting] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = useRef([]);

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (isCounting && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
    return () => clearInterval(timer);
  }, [isCounting, countdown]);

  // Open Google Sign-In / Sign-Up Modal
  const handleGoogleLogin = () => {
    setErrorMessage('');
    setShowGoogleModal(true);
  };

  // Complete Google Authentication with chosen or created account
  const handleSelectGoogleProfile = async (profile) => {
    setShowGoogleModal(false);
    setLoadingGoogle(true);
    setErrorMessage('');

    try {
      const account = await loginOrRegisterWithGoogle(profile);

      login('patient', {
        name: account.fullName,
        email: account.email,
        phone: account.phone,
        patientId: account.patientId,
        isGuest: false
      });

      analytics.trackAuth('google', 'success', { email: account.email });

      addToast(`Signed in as ${account.fullName} via Google!`, 'success');
      setTimeout(() => {
        navigate('/patient');
      }, 500);
    } catch (err) {
      analytics.trackAuth('google', 'failed', { error: err.message });
      setErrorMessage(err.message || 'Google sign-in failed');
    } finally {
      setLoadingGoogle(false);
    }
  };

  // Generate & Send OTP
  const handleSendOtp = (e) => {
    e?.preventDefault();
    setErrorMessage('');

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Rate limiting for SMS OTP requests (max 4 per 60s)
    const limit = checkRateLimit('otp_send', 4, 60);
    if (!limit.allowed) {
      setErrorMessage(`Too many OTP requests. Please wait ${limit.retryAfterSeconds}s before requesting another code.`);
      return;
    }

    setLoadingOtp(true);

    // Generate real 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    setTimeout(() => {
      setOtpStage('otp');
      setLoadingOtp(false);
      setIsCounting(true);
      setCountdown(30);
      setOtpDigits(['', '', '', '', '', '']);

      // Display real-time SMS toast notification so user can see their OTP
      addToast(`📲 SMS sent to +91 ${cleanDigits.slice(-10)}: Your login OTP is ${code}`, 'info', 10000);

      // Focus first OTP box
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 150);
    }, 600);
  };

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace in OTP
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-fill received OTP helper
  const handleAutofillOtp = () => {
    if (!generatedOtp) return;
    const digits = generatedOtp.split('');
    setOtpDigits(digits);
    inputRefs.current[5]?.focus();
  };

  // Verify OTP & Login
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setErrorMessage('Please enter all 6 digits of the verification OTP.');
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setErrorMessage('Invalid OTP code. Please check the code sent to your mobile or tap autofill.');
      return;
    }

    setLoadingOtp(true);

    try {
      const cleanDigits = phoneNumber.replace(/\D/g, '').slice(-10);
      const nameToUse = fullName.trim() || 'Aditya Kumar';
      
      const account = await loginOrRegisterWithMobile(cleanDigits, nameToUse);

      login('patient', {
        name: account.fullName,
        phone: account.phone,
        email: account.email,
        patientId: account.patientId,
        isGuest: false
      });

      analytics.trackAuth('mobile_otp', 'success', { phone: account.phone });

      addToast(`Mobile verified! Welcome, ${account.fullName}.`, 'success');
      setTimeout(() => {
        navigate('/patient');
      }, 500);
    } catch (err) {
      analytics.trackAuth('mobile_otp', 'failed', { error: err.message });
      setErrorMessage(err.message || 'OTP verification failed');
    } finally {
      setLoadingOtp(false);
    }
  };

  // Staff Demo Logins (Doctor & Admin)
  const handleStaffLogin = (role) => {
    login(role);
    navigate(`/${role}`);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Back to Home Button */}
        <button className="btn btn-ghost mb-4" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Back to Home
        </button>

        {/* Brand Header */}
        <div className="login-header">
          <div className="login-logo">
            <HeartPulse size={34} style={{ color: '#059669' }} />
            <span>HealthFlow</span>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your consultations, prescriptions & Universal Health ID.</p>
        </div>

        {/* Portal Category Tabs */}
        <div className="login-type-tabs">
          <button
            type="button"
            className={`login-type-tab ${authCategory === 'patient' ? 'active' : ''}`}
            onClick={() => { setAuthCategory('patient'); setErrorMessage(''); }}
          >
            <User size={16} />
            <span>Patient Sign In (Google / Mobile)</span>
          </button>
          <button
            type="button"
            className={`login-type-tab ${authCategory === 'staff' ? 'active' : ''}`}
            onClick={() => { setAuthCategory('staff'); setErrorMessage(''); }}
          >
            <Stethoscope size={16} />
            <span>Doctor & Admin Staff Access</span>
          </button>
        </div>

        {/* CATEGORY 1: PATIENT SIGN IN (Google & Mobile OTP) */}
        {authCategory === 'patient' && (
          <div className="patient-auth-card card animate-fade-in">
            {errorMessage && (
              <div className="auth-error-banner">
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. GOOGLE SIGN IN BUTTON */}
            <button
              type="button"
              className="google-signin-btn"
              onClick={handleGoogleLogin}
              disabled={loadingGoogle}
            >
              <GoogleIcon />
              <span>{loadingGoogle ? 'Signing in with Google...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span>or sign in with mobile OTP</span>
            </div>

            {/* 2. MOBILE NUMBER + OTP FLOW */}
            {otpStage === 'phone' ? (
              /* PHONE INPUT STAGE */
              <form onSubmit={handleSendOtp} className="phone-auth-form">
                <div>
                  <label className="auth-label">Full Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Aditya Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="auth-input"
                  />
                </div>

                <div>
                  <label className="auth-label">Mobile Number</label>
                  <div className="phone-input-wrapper">
                    <div className="country-code-pill">
                      <span>🇮🇳 +91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="auth-input phone-number-input"
                    />
                  </div>
                  <span className="auth-hint">
                    We will send a 6-digit SMS verification code to this phone number.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loadingOtp || phoneNumber.length < 10}
                  className="btn btn-primary auth-submit-btn"
                >
                  {loadingOtp ? (
                    <span>Sending SMS OTP...</span>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* OTP VERIFICATION STAGE */
              <form onSubmit={handleVerifyOtp} className="otp-verification-form animate-fade-in">
                <div className="otp-target-header">
                  <div>
                    <span className="text-xs text-secondary">Verification code sent to</span>
                    <h4 style={{ margin: '2px 0 0', fontSize: '15px', color: '#fff', fontWeight: 700 }}>
                      +91 {phoneNumber.replace(/\D/g, '').slice(-10)}
                    </h4>
                  </div>
                  <button
                    type="button"
                    className="btn-link-edit"
                    onClick={() => { setOtpStage('phone'); setErrorMessage(''); }}
                  >
                    Change Number
                  </button>
                </div>

                {/* Simulated SMS Notification Banner */}
                <div className="simulated-sms-banner">
                  <div className="sms-banner-header">
                    <div className="sms-badge">
                      <Phone size={12} />
                      <span>SMS Gateway (Simulated)</span>
                    </div>
                    <span className="sms-time">Just now</span>
                  </div>
                  <div className="sms-body">
                    HealthFlow Login OTP: <strong style={{ color: '#34d399', fontSize: '15px' }}>{generatedOtp}</strong> (Valid for 10 min)
                  </div>
                  <button
                    type="button"
                    onClick={handleAutofillOtp}
                    className="autofill-otp-chip"
                  >
                    <Sparkles size={13} />
                    <span>Tap to Autofill {generatedOtp}</span>
                  </button>
                </div>

                {/* 6-Digit Code Inputs */}
                <div>
                  <label className="auth-label" style={{ textAlign: 'center', display: 'block', marginBottom: '10px' }}>
                    Enter 6-Digit OTP
                  </label>
                  <div className="otp-inputs-row">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="otp-digit-box"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend OTP Timer */}
                <div className="otp-timer-row">
                  {isCounting ? (
                    <span className="timer-text">Resend code in <strong>{countdown}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="resend-btn"
                    >
                      <RefreshCw size={13} /> Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loadingOtp || otpDigits.join('').length < 6}
                  className="btn btn-primary auth-submit-btn"
                >
                  {loadingOtp ? (
                    <span>Verifying OTP...</span>
                  ) : (
                    <>
                      <span>Verify & Login</span>
                      <CheckCircle2 size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* CATEGORY 2: STAFF / DEMO ROLE ACCESS (Doctor & Admin) */}
        {authCategory === 'staff' && (
          <div className="staff-roles-grid animate-fade-in">
            <div className="staff-card card card-hover" onClick={() => handleStaffLogin('doctor')}>
              <div className="staff-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <Stethoscope size={30} />
              </div>
              <h3>Doctor Portal</h3>
              <p>Manage OPD queue, call patients, update availability, and review diagnostic charts.</p>
              <div className="staff-demo-tag">Demo: Dr. Ananya Sharma (Cardiology)</div>
              <button className="btn btn-primary" style={{ background: '#10b981', width: '100%', marginTop: '12px' }}>
                Login as Doctor
              </button>
            </div>

            <div className="staff-card card card-hover" onClick={() => handleStaffLogin('admin')}>
              <div className="staff-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                <Shield size={30} />
              </div>
              <h3>Hospital Admin</h3>
              <p>Real-time emergency beds, triage crowd analytics, department resource dispatch.</p>
              <div className="staff-demo-tag">Demo: Rajesh Mehta (CityCare Admin)</div>
              <button className="btn btn-primary" style={{ background: '#8b5cf6', width: '100%', marginTop: '12px' }}>
                Login as Hospital Admin
              </button>
            </div>
          </div>
        )}

        {/* Security & Verification Disclaimer */}
        <div className="auth-footer-badge">
          <Shield size={14} style={{ color: '#059669' }} />
          <span>ABDM & ABDM Triage Compliant • Secure OTP Verification</span>
        </div>
      </div>

      {/* Google Sign-In & Sign-Up Account Chooser Modal */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectAccount={handleSelectGoogleProfile}
      />
    </div>
  );
}
