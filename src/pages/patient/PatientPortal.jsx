import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, HeartPulse, User, Calendar, FileText, 
  Plus, Check, Copy, AlertCircle, LogOut, ArrowRight, 
  Lock, CheckCircle2, Clock, Phone, Mail, Sparkles 
} from 'lucide-react';
import { 
  getActiveSession, 
  registerPatient, 
  loginPatient, 
  logoutPatient, 
  addAppointment, 
  addHealthRecord,
  loginOrRegisterWithGoogle,
  loginOrRegisterWithMobile
} from '../../services/patientPortalService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import './PatientPortal.css';

// Official Google 'G' SVG
const GoogleIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
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

export default function PatientPortal() {
  const { login } = useAuth();
  const { addToast } = useNotifications();
  const [patient, setPatient] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'password'
  const [portalPhone, setPortalPhone] = useState('');
  const [portalOtpStage, setPortalOtpStage] = useState('phone'); // 'phone' | 'otp'
  const [portalGeneratedOtp, setPortalGeneratedOtp] = useState('');
  const [portalEnteredOtp, setPortalEnteredOtp] = useState('');
  const [activeTab, setActiveTab] = useState('appointments'); // 'profile' | 'appointments' | 'records'
  const [copiedId, setCopiedId] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // Registration form state
  const [regData, setRegData] = useState({
    fullName: '',
    dob: '',
    gender: 'Male',
    phone: '',
    email: '',
    username: '',
    password: '',
  });

  // Inline Appointment Form state
  const [showAptForm, setShowAptForm] = useState(false);
  const [aptData, setAptData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    doctor: 'Dr. Ananya Sharma',
    department: 'Cardiology',
    notes: ''
  });

  // Inline Health Record Form state
  const [showRecForm, setShowRecForm] = useState(false);
  const [recData, setRecData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'prescription',
    doctor: 'Dr. Rajesh Verma',
    notes: ''
  });

  // Load active session from localStorage on mount
  useEffect(() => {
    const session = getActiveSession();
    if (session) {
      setPatient(session);
    }
  }, []);

  const handleCopyId = () => {
    if (!patient?.patientId) return;
    navigator.clipboard.writeText(patient.patientId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (!loginData.username.trim() || !loginData.password) {
        throw new Error('Please enter both username and password.');
      }
      const account = await loginPatient(loginData.username, loginData.password);
      setPatient(account);
      setSuccessMsg(`Welcome back, ${account.fullName}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed.');
    }
  };

  // 1-Click Demo Login
  const handleDemoLogin = async () => {
    setErrorMsg('');
    try {
      const account = await loginPatient('aditya2026', 'Password123!');
      setPatient(account);
      login('patient', {
        name: account.fullName,
        phone: account.phone,
        email: account.email,
        patientId: account.patientId,
        isGuest: false
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Google Login for Portal
  const handleGooglePortalLogin = async () => {
    setErrorMsg('');
    try {
      const account = await loginOrRegisterWithGoogle({
        fullName: 'Aditya Dhariwal',
        email: 'aditya.dhariwal@gmail.com'
      });
      setPatient(account);
      login('patient', {
        name: account.fullName,
        email: account.email,
        phone: account.phone,
        patientId: account.patientId,
        isGuest: false
      });
      addToast(`Logged in via Google as ${account.fullName}`, 'success');
      setSuccessMsg(`Welcome, ${account.fullName}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Google sign-in failed');
    }
  };

  // Mobile OTP: Send Code
  const handleSendPortalOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanDigits = portalPhone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPortalGeneratedOtp(code);
    setPortalOtpStage('otp');
    addToast(`📲 SMS sent to +91 ${cleanDigits.slice(-10)}: Your HealthFlow OTP is ${code}`, 'info', 10000);
  };

  // Mobile OTP: Verify Code
  const handleVerifyPortalOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (portalEnteredOtp !== portalGeneratedOtp) {
      setErrorMsg('Invalid OTP code. Please enter the 6-digit code received or tap autofill.');
      return;
    }
    try {
      const cleanDigits = portalPhone.replace(/\D/g, '').slice(-10);
      const account = await loginOrRegisterWithMobile(cleanDigits, 'Aditya Kumar');
      setPatient(account);
      login('patient', {
        name: account.fullName,
        phone: account.phone,
        email: account.email,
        patientId: account.patientId,
        isGuest: false
      });
      addToast(`Mobile verified! Welcome, ${account.fullName}.`, 'success');
      setSuccessMsg(`Welcome, ${account.fullName}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'OTP verification failed');
    }
  };

  // Registration handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (!regData.fullName.trim()) throw new Error('Full Name is required.');
      if (!regData.dob) throw new Error('Date of Birth is required.');
      if (!regData.phone.trim()) throw new Error('Phone number is required.');
      if (!regData.email.trim()) throw new Error('Email is required.');
      if (!regData.username.trim()) throw new Error('Username is required.');
      if (regData.password.length < 6) throw new Error('Password must be at least 6 characters.');

      const newAccount = await registerPatient(regData);
      setPatient(newAccount);
      setSuccessMsg(`Account created! Your Universal Patient ID is ${newAccount.patientId}`);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    logoutPatient();
    setPatient(null);
    setLoginData({ username: '', password: '' });
  };

  // Add Appointment handler
  const handleAddAppointment = (e) => {
    e.preventDefault();
    if (!aptData.date || !aptData.doctor || !aptData.department) {
      setErrorMsg('Please fill all required appointment fields.');
      return;
    }
    const updated = addAppointment(patient.patientId, aptData);
    setPatient({ ...updated });
    setShowAptForm(false);
    setAptData({
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      doctor: 'Dr. Ananya Sharma',
      department: 'Cardiology',
      notes: ''
    });
  };

  // Add Health Record handler
  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!recData.date || !recData.doctor || !recData.notes.trim()) {
      setErrorMsg('Please fill date, doctor, and clinical notes.');
      return;
    }
    const updated = addHealthRecord(patient.patientId, recData);
    setPatient({ ...updated });
    setShowRecForm(false);
    setRecData({
      date: new Date().toISOString().split('T')[0],
      type: 'prescription',
      doctor: 'Dr. Rajesh Verma',
      notes: ''
    });
  };

  return (
    <div className="portal-wrapper">
      {/* 1. HONESTY CLAUSE BANNER */}
      <div className="portal-honesty-banner">
        <AlertCircle size={20} className="shrink-0 text-amber-600 mt-0.5" />
        <div>
          <span className="portal-honesty-tag">Important Prototype Notice</span>
          <span>
            This Healthcare Patient Portal is a <strong>functional demonstration prototype</strong> using client-side cryptographic hashing (SHA-256) and browser storage persistence. 
            It is <strong>not HIPAA or ABDM production-certified</strong> unless deployed with an enterprise database, encryption-at-rest, and a certified regulatory compliance layer.
          </span>
        </div>
      </div>

      {/* 2. AUTHENTICATION VIEW (IF NOT LOGGED IN) */}
      {!patient ? (
        <div className="max-w-md mx-auto portal-box">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <HeartPulse size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Universal Patient Portal</h2>
            <p className="text-xs text-slate-500 mt-1">
              Secure patient access with permanent Universal Health ID linkage
            </p>
          </div>

          {/* Login / Register Toggle */}
          <div className="flex border-b border-slate-200 mb-5">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${authMode === 'login' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${authMode === 'register' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400'}`}
            >
              Register New Patient
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SIGN IN VIEW */}
          {authMode === 'login' ? (
            <div className="space-y-4">
              {/* Google 1-Click Login */}
              <button
                type="button"
                onClick={handleGooglePortalLogin}
                className="w-full py-2.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition shadow-xs flex items-center justify-center gap-2"
              >
                <GoogleIconSmall />
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center text-center my-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <div className="flex-1 border-b border-slate-200" />
                <span className="px-2">or sign in with</span>
                <div className="flex-1 border-b border-slate-200" />
              </div>

              {/* Method Switch: Mobile OTP vs Username/Password */}
              <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${loginMethod === 'phone' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Mobile Number (OTP)
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('password')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${loginMethod === 'password' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Username & Password
                </button>
              </div>

              {loginMethod === 'phone' ? (
                portalOtpStage === 'phone' ? (
                  <form onSubmit={handleSendPortalOtp} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Number</label>
                      <div className="flex gap-2">
                        <span className="py-2 px-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="98765 43210"
                          value={portalPhone}
                          onChange={e => setPortalPhone(e.target.value.replace(/\D/g, ''))}
                          className="portal-input flex-1"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        We will send a 6-digit SMS verification code.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={portalPhone.length < 10}
                      className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Send OTP via SMS</span>
                      <ArrowRight size={13} />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPortalOtp} className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-[11px]">📲 SMS Code Sent:</span>
                        <button
                          type="button"
                          onClick={() => setPortalOtpStage('phone')}
                          className="text-[10px] text-emerald-700 font-bold underline"
                        >
                          Change Number
                        </button>
                      </div>
                      <div className="font-mono text-sm font-bold text-emerald-900">
                        {portalGeneratedOtp}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPortalEnteredOtp(portalGeneratedOtp)}
                        className="mt-1.5 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold"
                      >
                        Tap to Autofill {portalGeneratedOtp}
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Enter 6-Digit OTP</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="e.g. 482910"
                        value={portalEnteredOtp}
                        onChange={e => setPortalEnteredOtp(e.target.value.replace(/\D/g, ''))}
                        className="portal-input text-center font-mono font-bold tracking-widest text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={portalEnteredOtp.length < 6}
                      className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Verify OTP & Sign In</span>
                      <Check size={14} />
                    </button>
                  </form>
                )
              ) : (
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Username</label>
                    <input
                      type="text"
                      placeholder="e.g. aditya2026"
                      value={loginData.username}
                      onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                      className="portal-input"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                      className="portal-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
                  >
                    Sign In to Patient Portal
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleDemoLogin}
                      className="text-xs text-emerald-700 font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
                    >
                      <Sparkles size={13} />
                      <span>1-Click Demo Login (Aditya Kumar)</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Simran Kaur"
                  value={regData.fullName}
                  onChange={e => setRegData({ ...regData, fullName: e.target.value })}
                  className="portal-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={regData.dob}
                    onChange={e => setRegData({ ...regData, dob: e.target.value })}
                    className="portal-input"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={regData.gender}
                    onChange={e => setRegData({ ...regData, gender: e.target.value })}
                    className="portal-select"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={regData.phone}
                    onChange={e => setRegData({ ...regData, phone: e.target.value })}
                    className="portal-input"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email *</label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={regData.email}
                    onChange={e => setRegData({ ...regData, email: e.target.value })}
                    className="portal-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Username *</label>
                <input
                  type="text"
                  placeholder="Choose unique username"
                  value={regData.username}
                  onChange={e => setRegData({ ...regData, username: e.target.value })}
                  className="portal-input"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password (hashed with SHA-256) *</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={regData.password}
                  onChange={e => setRegData({ ...regData, password: e.target.value })}
                  className="portal-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm mt-2"
              >
                Register & Generate Universal Health ID
              </button>
            </form>
          )}
        </div>
      ) : (
        /* 3. AUTHENTICATED PATIENT PORTAL DASHBOARD */
        <div>
          {successMsg && (
            <div className="p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* UNIVERSAL PATIENT ID CARD */}
          <div className="universal-id-card">
            <div className="universal-id-header">
              <div className="flex items-center gap-2">
                <ShieldCheck size={24} className="text-emerald-300" />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 block">
                    HealthFlow Universal Patient Record
                  </span>
                  <h2 className="text-lg font-bold text-white">{patient.fullName}</h2>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 border border-white/20"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>

            <div>
              <span className="text-xs text-emerald-100/80 block mb-1">Universal Patient ID (Permanent Key):</span>
              <div className="universal-id-number">
                <span>{patient.patientId}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 hover:text-white transition"
                  title="Copy ID"
                >
                  {copiedId ? <Check size={16} className="text-white" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="universal-id-grid">
              <div>
                <span className="text-[10px] text-emerald-200/70 block uppercase">DOB / Gender</span>
                <span className="text-xs font-bold text-white">{patient.dob} ({patient.gender})</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-200/70 block uppercase">Phone</span>
                <span className="text-xs font-bold text-white">{patient.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-200/70 block uppercase">Username</span>
                <span className="text-xs font-bold text-white">@{patient.username}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-200/70 block uppercase">Registered</span>
                <span className="text-xs font-bold text-white">
                  {new Date(patient.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* PORTAL TABS */}
          <div className="portal-tabs">
            <button
              type="button"
              onClick={() => setActiveTab('appointments')}
              className={`portal-tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            >
              <Calendar size={16} />
              <span>Appointments ({patient.appointments?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('records')}
              className={`portal-tab-btn ${activeTab === 'records' ? 'active' : ''}`}
            >
              <FileText size={16} />
              <span>Health Records ({patient.healthRecords?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`portal-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User size={16} />
              <span>Patient Profile</span>
            </button>
          </div>

          {/* TAB 1: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">Appointment History</h3>
                <button
                  type="button"
                  onClick={() => setShowAptForm(!showAptForm)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>{showAptForm ? 'Cancel' : 'Book Appointment'}</span>
                </button>
              </div>

              {/* Inline Booking Form */}
              {showAptForm && (
                <form onSubmit={handleAddAppointment} className="portal-box mb-5 border-emerald-200 bg-emerald-50/30">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3">
                    New Clinical Appointment
                  </h4>
                  <div className="portal-form-grid">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Date</label>
                      <input
                        type="date"
                        value={aptData.date}
                        onChange={e => setAptData({ ...aptData, date: e.target.value })}
                        className="portal-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 11:30 AM"
                        value={aptData.time}
                        onChange={e => setAptData({ ...aptData, time: e.target.value })}
                        className="portal-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Doctor</label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Ananya Sharma"
                        value={aptData.doctor}
                        onChange={e => setAptData({ ...aptData, doctor: e.target.value })}
                        className="portal-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Department</label>
                      <input
                        type="text"
                        placeholder="e.g. Cardiology"
                        value={aptData.department}
                        onChange={e => setAptData({ ...aptData, department: e.target.value })}
                        className="portal-input"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Notes / Reason</label>
                    <input
                      type="text"
                      placeholder="Symptoms, follow-up, or general consultation..."
                      value={aptData.notes}
                      onChange={e => setAptData({ ...aptData, notes: e.target.value })}
                      className="portal-input"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-3 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                  >
                    Confirm & Save Appointment
                  </button>
                </form>
              )}

              {/* Appointments List */}
              {(!patient.appointments || patient.appointments.length === 0) ? (
                <div className="portal-box text-center py-8 text-xs text-slate-400">
                  No appointments scheduled. Click "Book Appointment" to add one.
                </div>
              ) : (
                <div className="space-y-3">
                  {patient.appointments.map(a => (
                    <div key={a.id} className="record-item-card flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900">{a.doctor}</span>
                          <span className="text-[11px] text-slate-500 font-medium">({a.department})</span>
                          <span className={`badge-type ${a.status === 'completed' ? 'badge-vaccination' : 'badge-prescription'}`}>
                            {a.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          <strong>{a.date}</strong> at <strong>{a.time}</strong>
                        </div>
                        {a.notes && <div className="text-xs text-slate-500 mt-1 italic">"{a.notes}"</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HEALTH RECORDS */}
          {activeTab === 'records' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">Medical Health Records</h3>
                <button
                  type="button"
                  onClick={() => setShowRecForm(!showRecForm)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>{showRecForm ? 'Cancel' : 'Add Health Record'}</span>
                </button>
              </div>

              {/* Inline Record Form */}
              {showRecForm && (
                <form onSubmit={handleAddRecord} className="portal-box mb-5 border-blue-200 bg-blue-50/30">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-3">
                    Add Clinical Record
                  </h4>
                  <div className="portal-form-grid">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Date</label>
                      <input
                        type="date"
                        value={recData.date}
                        onChange={e => setRecData({ ...recData, date: e.target.value })}
                        className="portal-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Record Type</label>
                      <select
                        value={recData.type}
                        onChange={e => setRecData({ ...recData, type: e.target.value })}
                        className="portal-select"
                      >
                        <option value="diagnosis">Diagnosis</option>
                        <option value="prescription">Prescription</option>
                        <option value="lab result">Lab Result</option>
                        <option value="vaccination">Vaccination</option>
                        <option value="visit note">Visit Note</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Doctor / Facility</label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Rajesh Verma"
                        value={recData.doctor}
                        onChange={e => setRecData({ ...recData, doctor: e.target.value })}
                        className="portal-input"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Clinical Notes & Findings</label>
                    <textarea
                      placeholder="Medication details, lab figures, diagnosis, or clinical observations..."
                      value={recData.notes}
                      onChange={e => setRecData({ ...recData, notes: e.target.value })}
                      className="portal-textarea"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-3 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                  >
                    Save Health Record
                  </button>
                </form>
              )}

              {/* Records List */}
              {(!patient.healthRecords || patient.healthRecords.length === 0) ? (
                <div className="portal-box text-center py-8 text-xs text-slate-400">
                  No health records found. Click "Add Health Record" to record clinical history.
                </div>
              ) : (
                <div className="space-y-3">
                  {patient.healthRecords.map(r => (
                    <div key={r.id} className="record-item-card">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`badge-type badge-${r.type.replace(/\s+/g, '-')}`}>
                          {r.type}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{r.date}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mb-1">
                        Attending: {r.doctor}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {r.notes}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === 'profile' && (
            <div className="portal-box">
              <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                Permanent Patient Profile Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Universal Patient ID</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{patient.patientId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Full Legal Name</span>
                  <span className="font-bold text-slate-800">{patient.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Date of Birth & Gender</span>
                  <span className="font-bold text-slate-800">{patient.dob} ({patient.gender})</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Username</span>
                  <span className="font-bold text-slate-800">@{patient.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Contact Phone</span>
                  <span className="font-bold text-slate-800">{patient.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Email Address</span>
                  <span className="font-bold text-slate-800">{patient.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Password Security</span>
                  <span className="font-bold text-slate-800">Cryptographically Hashed (SHA-256 + Salt)</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Account Created</span>
                  <span className="font-bold text-slate-800">
                    {new Date(patient.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
