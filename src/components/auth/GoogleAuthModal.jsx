import React, { useState } from 'react';
import { X, UserPlus, ArrowLeft, Check, Lock, Shield } from 'lucide-react';

// Official Google 'G' colored SVG
const GoogleLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
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

const DEFAULT_ACCOUNTS = [
  {
    name: 'Aditya Dhariwal',
    email: 'aditya.dhariwal@gmail.com',
    initials: 'AD',
    bgColor: '#1a73e8',
  },
  {
    name: 'Aditya Kumar (Personal)',
    email: 'aditya.kumar.health@gmail.com',
    initials: 'AK',
    bgColor: '#0f9d58',
  }
];

export default function GoogleAuthModal({ isOpen, onClose, onSelectAccount }) {
  const [view, setView] = useState('list'); // 'list' | 'custom'
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [loadingEmail, setLoadingEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectAccount = (account) => {
    setLoadingEmail(account.email);
    setTimeout(() => {
      onSelectAccount({
        fullName: account.name,
        email: account.email,
        avatar: account.initials
      });
      setLoadingEmail('');
    }, 600);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }

    const name = customName.trim() || customEmail.split('@')[0];
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    setLoadingEmail(customEmail);
    setTimeout(() => {
      onSelectAccount({
        fullName: name,
        email: customEmail.trim(),
        avatar: initials
      });
      setLoadingEmail('');
    }, 600);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          color: '#1f1f1f',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          overflow: 'hidden',
          position: 'relative',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Loading progress bar */}
        {loadingEmail && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: '#e8f0fe',
            overflow: 'hidden',
            zIndex: 10
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: '#1a73e8',
              animation: 'progressAnim 1s infinite linear',
              transformOrigin: '0% 50%'
            }} />
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5f6368',
            cursor: 'pointer',
            transition: 'background 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f3f4'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ padding: '28px 28px 16px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <GoogleLogo size={32} />
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 600, color: '#202124' }}>
            {view === 'list' ? 'Sign in with Google' : 'Create / Connect Account'}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#5f6368' }}>
            to continue to <strong style={{ color: '#059669' }}>HealthFlow</strong>
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#e0e0e0', margin: '0 24px' }} />

        {/* VIEW 1: ACCOUNT LIST */}
        {view === 'list' ? (
          <div style={{ padding: '16px 20px 24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#5f6368', padding: '0 8px 10px' }}>
              Choose an account
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {DEFAULT_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleSelectAccount(acc)}
                  disabled={!!loadingEmail}
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    background: 'transparent',
                    cursor: loadingEmail ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingEmail) {
                      e.currentTarget.style.background = '#f8fafd';
                      e.currentTarget.style.borderColor = '#dadce0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: acc.bgColor,
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {acc.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {acc.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#5f6368', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {acc.email}
                    </div>
                  </div>
                  {loadingEmail === acc.email && (
                    <span style={{ fontSize: '11px', color: '#1a73e8', fontWeight: 600 }}>Signing in...</span>
                  )}
                </button>
              ))}

              {/* Use Another Account Button */}
              <button
                onClick={() => { setView('custom'); setError(''); }}
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  marginTop: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafd';
                  e.currentTarget.style.borderColor = '#dadce0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1.5px dashed #5f6368',
                  color: '#5f6368',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <UserPlus size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a73e8' }}>
                    Use another account / Sign up
                  </div>
                  <div style={{ fontSize: '11px', color: '#5f6368' }}>
                    Enter any Google or Gmail address
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: CUSTOM GOOGLE SIGN UP FORM */
          <form onSubmit={handleCustomSubmit} style={{ padding: '20px 24px 28px' }}>
            <button
              type="button"
              onClick={() => { setView('list'); setError(''); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                color: '#1a73e8',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '16px',
                padding: 0
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to account list</span>
            </button>

            {error && (
              <div style={{
                background: '#fce8e6',
                color: '#c5221f',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                marginBottom: '14px'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                Full Name (for HealthFlow Profile)
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                  fontSize: '14px',
                  outline: 'none',
                  color: '#202124',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#3c4043', marginBottom: '6px' }}>
                Google Email / Gmail Address *
              </label>
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                  fontSize: '14px',
                  outline: 'none',
                  color: '#202124',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!customEmail.trim() || !!loadingEmail}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '9999px',
                background: '#1a73e8',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '14px',
                border: 'none',
                cursor: customEmail.trim() && !loadingEmail ? 'pointer' : 'not-allowed',
                opacity: customEmail.trim() && !loadingEmail ? 1 : 0.6,
                boxShadow: '0 2px 6px rgba(26, 115, 232, 0.3)'
              }}
            >
              {loadingEmail ? 'Connecting to HealthFlow...' : 'Sign in with this Google Account'}
            </button>
          </form>
        )}

        {/* Google OAuth Legal Notice Footer */}
        <div style={{
          background: '#f8f9fa',
          padding: '14px 24px',
          borderTop: '1px solid #e0e0e0',
          fontSize: '11px',
          color: '#5f6368',
          lineHeight: 1.45,
          textAlign: 'center'
        }}>
          To continue, Google will share your name, email address, and profile picture with HealthFlow.
          Before using HealthFlow, review its{' '}
          <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: '#1a73e8', textDecoration: 'underline' }}>Privacy Policy</a> and{' '}
          <a href="/terms" target="_blank" rel="noreferrer" style={{ color: '#1a73e8', textDecoration: 'underline' }}>Terms of Service</a>.
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes progressAnim {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
