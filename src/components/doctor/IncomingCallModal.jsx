import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneOff, Video, User, Clock, AlertCircle } from 'lucide-react';
import consultationSocketService from '../../services/consultationSocketService';
import { playIncomingRingtone, stopAllSounds } from '../../utils/soundEffects';

export default function IncomingCallModal({ doctorId }) {
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  useEffect(() => {
    // Listen for incoming calls for this doctor
    const unsubscribeIncoming = consultationSocketService.onIncomingCall((callData) => {
      console.log('[IncomingCallModal] Incoming call received:', callData);
      setIncomingCall(callData);
      setSecondsRemaining(30);
      playIncomingRingtone();
    });

    // Listen for patient cancellation
    const unsubscribeCancelled = consultationSocketService.onCallCancelled((data) => {
      console.log('[IncomingCallModal] Call was cancelled by patient:', data);
      stopAllSounds();
      setIncomingCall(null);
    });

    return () => {
      unsubscribeIncoming();
      unsubscribeCancelled();
      stopAllSounds();
    };
  }, []);

  // 30-second countdown timer
  useEffect(() => {
    if (!incomingCall) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          stopAllSounds();
          setIncomingCall(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingCall]);

  if (!incomingCall) return null;

  const handleAccept = async () => {
    stopAllSounds();
    const { callId, patientName, patientId } = incomingCall;

    try {
      await consultationSocketService.acceptCall(callId);
      setIncomingCall(null);
      navigate(
        `/doctor/consultation?callId=${encodeURIComponent(callId)}&patientName=${encodeURIComponent(
          patientName || 'Patient'
        )}&patientId=${encodeURIComponent(patientId || '')}`
      );
    } catch (err) {
      console.error('Error accepting call:', err);
      setIncomingCall(null);
    }
  };

  const handleReject = async () => {
    stopAllSounds();
    const { callId } = incomingCall;
    try {
      await consultationSocketService.rejectCall(callId, 'Doctor is currently engaged');
    } catch (err) {
      console.error('Error rejecting call:', err);
    }
    setIncomingCall(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          border: '2px solid #34d399',
          overflow: 'hidden',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Top Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            padding: '24px 20px 20px',
            color: '#ffffff',
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 0 20px rgba(52, 211, 153, 0.6)',
              animation: 'pulse 1.5s infinite',
            }}
          >
            <Video size={32} color="#ffffff" />
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#a7f3d0',
              marginBottom: '4px',
            }}
          >
            Incoming Video Consultation
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>
            {incomingCall.patientName || 'New Patient'}
          </h2>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', marginTop: '4px' }}>
            Patiala Telemedicine Network
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 20px' }}>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '14px 16px',
              marginBottom: '20px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <User size={14} style={{ color: '#059669' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Chief Complaint / Reason:</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
              {incomingCall.reason || 'General Online Teleconsultation'}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px dashed #cbd5e1',
                fontSize: '11px',
                color: '#64748b',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Auto-declines in:
              </span>
              <span style={{ fontWeight: 700, color: '#e11d48' }}>{secondsRemaining}s</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={handleReject}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <PhoneOff size={16} />
              <span>Decline</span>
            </button>

            <button
              onClick={handleAccept}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
                transition: 'all 0.15s ease',
              }}
            >
              <Phone size={16} />
              <span>Accept</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
