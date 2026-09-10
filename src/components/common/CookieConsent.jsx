import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X, Check, Settings, ArrowRight } from 'lucide-react';

const CONSENT_KEY = 'healthflow_cookie_consent_v1';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always required for health sessions & queue tokens
    analytics: true,
    functional: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (!saved) {
        // Show after a subtle delay for smooth entry
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  const saveConsent = (prefs) => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({
        ...prefs,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {}
    setVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ essential: true, analytics: true, functional: true });
  };

  const handleEssentialOnly = () => {
    saveConsent({ essential: true, analytics: false, functional: false });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Health Data Consent"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        maxWidth: '520px',
        margin: '0 auto',
        zIndex: 99999,
        animation: 'slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(16, 185, 129, 0.15)',
        color: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                Health Data & Cookie Consent
              </h4>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>DPDP Act 2023 & ABDM Protocols</span>
            </div>
          </div>
          <button
            onClick={handleEssentialOnly}
            aria-label="Dismiss banner"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <p style={{ fontSize: '12px', lineHeight: 1.55, color: '#cbd5e1', margin: '0 0 14px' }}>
          We use secure local storage to manage your outpatient queue tokens, appointment slots, and language settings. We never sell or monetize patient data. Review our{' '}
          <a href="/privacy" style={{ color: '#34d399', textDecoration: 'underline' }}>Privacy Policy</a>.
        </p>

        {/* Custom details accordion */}
        {showDetails && (
          <div style={{
            background: 'rgba(2, 6, 23, 0.6)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '14px',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                <strong style={{ color: '#fff' }}>Essential Clinical Storage</strong> (Required for queue tokens & health ID)
              </span>
              <input type="checkbox" checked disabled style={{ accentColor: '#10b981' }} />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span>
                <strong style={{ color: '#fff' }}>Functional Preferences</strong> (Saved hospital filters & language)
              </span>
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={e => setPreferences({ ...preferences, functional: e.target.checked })}
                style={{ accentColor: '#10b981' }}
              />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <span>
                <strong style={{ color: '#fff' }}>Anonymous Performance Telemetry</strong> (Helps optimize queue algorithms)
              </span>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={e => setPreferences({ ...preferences, analytics: e.target.checked })}
                style={{ accentColor: '#10b981' }}
              />
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {showDetails ? (
            <button
              onClick={handleSaveCustom}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '9999px',
                background: '#059669',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Save Preferences
            </button>
          ) : (
            <>
              <button
                onClick={handleAcceptAll}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: '9999px',
                  background: '#059669',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                }}
              >
                Accept All
              </button>
              <button
                onClick={handleEssentialOnly}
                style={{
                  padding: '9px 14px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#e2e8f0',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Essential Only
              </button>
            </>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '6px 8px',
              textDecoration: 'underline'
            }}
          >
            {showDetails ? 'Hide Options' : 'Customize'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
