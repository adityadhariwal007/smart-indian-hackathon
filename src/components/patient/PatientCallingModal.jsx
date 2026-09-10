import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneOff, Video, Stethoscope, AlertCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';
import consultationSocketService from '../../services/consultationSocketService';
import { playOutgoingDialTone, stopAllSounds } from '../../utils/soundEffects';

export default function PatientCallingModal({
  isOpen,
  onClose,
  doctorId = 'aditya',
  doctorName = 'Dr. Aditya Dhariwal',
  doctorSpecialty = 'Emergency Medicine & Trauma Surgery',
  patientName = 'Karan Mehra',
  patientId = 'guest-patient',
  reason = 'General OPD Teleconsultation',
}) {
  const navigate = useNavigate();
  const [callState, setCallState] = useState('calling'); // 'calling' | 'ringing' | 'rejected' | 'failed' | 'timeout'
  const [statusMessage, setStatusMessage] = useState('Connecting to hospital signaling network...');
  const activeCallIdRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopAllSounds();
      setCallState('calling');
      return;
    }

    const callId = `CALL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    activeCallIdRef.current = callId;
    setCallState('calling');
    setStatusMessage(`Requesting connection with ${doctorName}...`);

    playOutgoingDialTone();

    const cancelFn = consultationSocketService.initiateCall(
      {
        callId,
        doctorId,
        patientId,
        patientName,
        reason,
      },
      {
        onRinging: () => {
          setCallState('ringing');
          setStatusMessage(`Ringing ${doctorName}'s workstation...`);
        },
        onAccepted: (data) => {
          console.log('[PatientCallingModal] Call accepted by doctor:', data);
          stopAllSounds();
          onClose();
          navigate(
            `/patient/consultation?callId=${encodeURIComponent(callId)}&doctorId=${encodeURIComponent(
              doctorId
            )}&doctorName=${encodeURIComponent(doctorName)}`
          );
        },
        onRejected: (data) => {
          stopAllSounds();
          setCallState('rejected');
          setStatusMessage(data?.reason || `${doctorName} is currently unavailable to accept teleconsultations.`);
        },
        onTimeout: (data) => {
          stopAllSounds();
          setCallState('timeout');
          setStatusMessage(data?.reason || `${doctorName} did not answer. The doctor may be attending to an inpatient emergency.`);
        },
        onFailed: (data) => {
          stopAllSounds();
          setCallState('failed');
          setStatusMessage(data?.reason || 'Unable to connect with the requested doctor at this time.');
        },
      }
    );

    return () => {
      stopAllSounds();
      if (activeCallIdRef.current) {
        consultationSocketService.cancelCall(activeCallIdRef.current);
      }
    };
  }, [isOpen, doctorId, doctorName, patientName, patientId, reason, navigate, onClose]);

  if (!isOpen) return null;

  const handleCancelCall = () => {
    stopAllSounds();
    if (activeCallIdRef.current) {
      consultationSocketService.cancelCall(activeCallIdRef.current);
    }
    onClose();
  };

  const isErrorState = ['rejected', 'failed', 'timeout'].includes(callState);

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
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          border: isErrorState ? '2px solid #f87171' : '2px solid #34d399',
          overflow: 'hidden',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            background: isErrorState
              ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
              : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            padding: '26px 20px 22px',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          <button
            onClick={handleCancelCall}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              boxShadow: isErrorState ? 'none' : '0 0 25px rgba(52, 211, 153, 0.6)',
              animation: isErrorState ? 'none' : 'pulse 1.8s infinite',
            }}
          >
            {isErrorState ? <AlertCircle size={36} color="#ffffff" /> : <Stethoscope size={36} color="#ffffff" />}
          </div>

          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: isErrorState ? '#fee2e2' : '#a7f3d0',
              marginBottom: '4px',
            }}
          >
            {isErrorState ? 'Consultation Notice' : 'Outpatient Video Consultation'}
          </div>

          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>{doctorName}</h2>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', marginTop: '3px' }}>
            {doctorSpecialty}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 20px' }}>
          <div
            style={{
              background: isErrorState ? '#fff1f2' : '#f8fafc',
              border: isErrorState ? '1px solid #fecdd3' : '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 700,
                color: isErrorState ? '#991b1b' : '#059669',
                marginBottom: '6px',
              }}
            >
              {!isErrorState && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />}
              <span>{isErrorState ? 'Doctor Unavailable' : statusMessage}</span>
            </div>

            {isErrorState && (
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                {statusMessage}
              </p>
            )}

            {!isErrorState && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: '#64748b',
                  marginTop: '8px',
                }}
              >
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>ABHA Verified Direct Doctor Route ({doctorId})</span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div>
            {isErrorState ? (
              <button
                onClick={handleCancelCall}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '13px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <span>Close & Try Later</span>
              </button>
            ) : (
              <button
                onClick={handleCancelCall}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '13px',
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
                <span>Cancel Call</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
