import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, ArrowLeft, Home, Building2, AlertTriangle, ShieldAlert, Search } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 25%, rgba(5, 150, 105, 0.12) 0%, #0a0f1d 100%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '540px',
        width: '100%',
        textAlign: 'center',
        background: 'rgba(17, 24, 39, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        padding: '40px 28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(12px)'
      }}>
        {/* Brand */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <HeartPulse size={30} style={{ color: '#34d399' }} />
          <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>HealthFlow</span>
        </div>

        {/* 404 Visual Tag */}
        <div style={{
          fontSize: '76px',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #34d399 0%, #059669 50%, #0284c7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 12px'
        }}>
          404
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 10px', color: '#f8fafc' }}>
          Clinical Resource Not Found
        </h1>

        <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 28px', lineHeight: 1.6 }}>
          The page, hospital ward record, or appointment route you requested doesn't exist or has been relocated within the network.
        </p>

        {/* Quick Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#059669',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Home size={15} />
            <span>Return Home</span>
          </button>

          <button
            onClick={() => navigate('/patient/hospitals')}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Building2 size={15} />
            <span>Find Hospitals</span>
          </button>

          <button
            onClick={() => navigate('/patient/complaints')}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              fontWeight: 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <ShieldAlert size={15} />
            <span>Grievances</span>
          </button>

          <button
            onClick={() => navigate('/patient/emergency')}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <AlertTriangle size={15} />
            <span>Emergency SOS</span>
          </button>
        </div>

        {/* Emergency helpline note */}
        <div style={{
          padding: '10px 14px',
          background: 'rgba(239, 68, 68, 0.08)',
          borderRadius: '10px',
          fontSize: '11px',
          color: '#fca5a5'
        }}>
          Medical Emergency? Call National Ambulance <strong>108</strong> or Universal Emergency <strong>112</strong>.
        </div>
      </div>
    </div>
  );
}
