import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp,
  Clock, ShieldCheck, User, RefreshCw, Volume2, AlertCircle
} from 'lucide-react';
import consultationSocketService from '../../services/consultationSocketService';

/**
 * WebRTC Configuration
 * Uses Google's free STUN server for NAT discovery.
 * 
 * TODO: For production deployment across restrictive corporate firewalls,
 * carrier-grade NATs, or 4G/5G symmetric NATs, a TURN server (Traversal Using Relays around NAT)
 * is required. Recommended providers: Twilio Network Traversal, Xirsys, or Metered.ca.
 * 
 * Example TURN configuration:
 * iceServers: [
 *   { urls: 'stun:stun.l.google.com:19302' },
 *   {
 *     urls: 'turn:turn.example.com:3478',
 *     username: 'turn-user',
 *     credential: 'turn-password'
 *   }
 * ]
 * 
 * TODO: For production authentication, exchange signed JWT session tokens on call initiation
 * to verify patient and physician identity before opening peer channels.
 */
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
};

export default function LiveWebRtcVideoRoom({
  callId,
  role = 'patient', // 'patient' | 'doctor'
  peerName = 'Consultant Doctor',
  peerRoleTitle = 'Physician',
  onEndCall,
  sidePanel,
}) {
  const [localStream, setLocalStream] = useState(null);
  const [hasRemoteTrack, setHasRemoteTrack] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [hardwareError, setHardwareError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting peer media...');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Safe track stop helper
  const stopAllLocalTracks = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping local track:', e);
        }
      });
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {
        console.warn('Error closing peer connection:', e);
      }
      peerConnectionRef.current = null;
    }
  }, []);

  // Initialize WebRTC and acquire local media
  useEffect(() => {
    let isCancelled = false;

    async function initWebRTC() {
      try {
        setConnectionStatus('Accessing camera & microphone...');
        setHardwareError(null);

        // 1. Acquire Local Camera and Microphone
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('WebRTC media devices API is not supported in this browser environment.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setConnectionStatus('Initializing P2P WebRTC connection...');

        // 2. Create RTCPeerConnection
        const pc = new RTCPeerConnection(RTC_CONFIG);
        peerConnectionRef.current = pc;

        // Create remote MediaStream container
        const remoteStream = new MediaStream();
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle remote tracks from peer
        pc.ontrack = (event) => {
          console.log('[WebRTC] Received remote track:', event.track.kind);
          remoteStream.addTrack(event.track);
          setHasRemoteTrack(true);
          setConnectionStatus('Connected • Live Audio & Video Active');
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        };

        // Send local ICE candidates to peer through signaling server
        pc.onicecandidate = (event) => {
          if (event.candidate && callId) {
            consultationSocketService.sendIceCandidate(callId, event.candidate);
          }
        };

        pc.oniceconnectionstatechange = () => {
          console.log('[WebRTC] ICE Connection State:', pc.iceConnectionState);
          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            setConnectionStatus('Encrypted P2P Media Stream Connected');
          } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
            setConnectionStatus('Re-establishing connection...');
          }
        };

        // 3. Setup Socket Signaling Handlers
        const unsubOffer = consultationSocketService.onPeerOffer(async ({ sdp }) => {
          console.log('[WebRTC] Received peer SDP Offer');
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));

            // Drain any pending ICE candidates that arrived before remoteDescription
            while (pendingIceCandidatesRef.current.length > 0) {
              const cand = pendingIceCandidatesRef.current.shift();
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            consultationSocketService.sendAnswer(callId, answer);
            console.log('[WebRTC] Sent SDP Answer to peer');
          } catch (err) {
            console.error('[WebRTC] Error handling offer:', err);
          }
        });

        const unsubAnswer = consultationSocketService.onPeerAnswer(async ({ sdp }) => {
          console.log('[WebRTC] Received peer SDP Answer');
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));

            while (pendingIceCandidatesRef.current.length > 0) {
              const cand = pendingIceCandidatesRef.current.shift();
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            }
          } catch (err) {
            console.error('[WebRTC] Error setting remote description from answer:', err);
          }
        });

        const unsubIce = consultationSocketService.onPeerIceCandidate(async ({ candidate }) => {
          if (!candidate) return;
          try {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              pendingIceCandidatesRef.current.push(candidate);
            }
          } catch (err) {
            console.error('[WebRTC] Error adding ICE candidate:', err);
          }
        });

        const unsubEnd = consultationSocketService.onCallEnded(({ endReason }) => {
          console.log('[WebRTC] Peer ended call:', endReason);
          stopAllLocalTracks();
          alert(`Consultation concluded: ${endReason || 'Call terminated by other participant'}`);
          if (onEndCall) onEndCall();
        });

        // 4. Offer Initiation (Deterministic: Doctor initiates offer, Patient answers)
        // If doctor joins, give 600ms for both sides to attach sockets and send offer
        if (role === 'doctor') {
          setTimeout(async () => {
            if (pc.signalingState !== 'closed') {
              try {
                console.log('[WebRTC] Doctor generating SDP Offer...');
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                consultationSocketService.sendOffer(callId, offer);
                console.log('[WebRTC] Doctor sent SDP Offer');
              } catch (err) {
                console.error('[WebRTC] Error creating offer:', err);
              }
            }
          }, 600);
        }

        // Return cleanup
        return () => {
          unsubOffer();
          unsubAnswer();
          unsubIce();
          unsubEnd();
        };
      } catch (err) {
        console.error('[WebRTC] Camera/Microphone or WebRTC Error:', err);
        setHardwareError(err.message || 'Unable to access device camera and microphone.');
        setConnectionStatus('Hardware or Permission Error');
      }
    }

    const cleanupSignalHandlers = initWebRTC();

    return () => {
      isCancelled = true;
      if (typeof cleanupSignalHandlers === 'function') cleanupSignalHandlers();
      stopAllLocalTracks();
    };
  }, [callId, role, onEndCall, stopAllLocalTracks]);

  // Audio Toggle
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks[0].enabled = nextState;
        setIsAudioMuted(!nextState);
      }
    }
  };

  // Video Toggle
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !videoTracks[0].enabled;
        videoTracks[0].enabled = nextState;
        setIsVideoOff(!nextState);
      }
    }
  };

  // Screen Share Toggle
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Revert to camera
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = camStream.getVideoTracks()[0];
        const pc = peerConnectionRef.current;
        if (pc) {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(newVideoTrack);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = camStream;
        }
        setIsScreenSharing(false);
      } catch (e) {
        console.error('Error reverting screen share:', e);
      }
      return;
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      alert('Screen sharing is not supported by your browser.');
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      const pc = peerConnectionRef.current;

      if (pc) {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }
      setIsScreenSharing(true);

      screenTrack.onended = async () => {
        setIsScreenSharing(false);
        // Switch back to camera track
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newTrack = camStream.getVideoTracks()[0];
        if (pc) {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(newTrack);
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = camStream;
        }
      };
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        console.error('Screen sharing error:', err);
      }
    }
  };

  // Hangup Handler
  const handleHangup = async () => {
    stopAllLocalTracks();
    await consultationSocketService.endCall(callId, 'Consultation concluded by user');
    if (onEndCall) onEndCall();
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Clinical Header Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '14px 20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
            }}
          >
            <Video size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                {peerName}
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#ecfdf5',
                  color: '#047857',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 10px',
                  borderRadius: '9999px',
                  border: '1px solid #a7f3d0',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                WebRTC P2P
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              {peerRoleTitle} • Call ID: <code style={{ fontSize: '11px', background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>{callId || 'LIVE'}</code>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            <Clock size={15} style={{ color: '#059669' }} />
            <span>{formatTimer(callDuration)}</span>
          </div>

          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '6px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
            }}
            className="sm:flex"
          >
            <ShieldCheck size={15} />
            <span>End-to-End P2P</span>
          </div>

          <button
            onClick={handleHangup}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#e11d48',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(225, 29, 72, 0.35)',
            }}
          >
            <PhoneOff size={15} />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Hardware / Permission Notice */}
      {hardwareError && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '14px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#991b1b',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={18} style={{ color: '#e11d48', flexShrink: 0 }} />
          <div>
            <strong>Camera/Microphone Permission:</strong> {hardwareError}
          </div>
        </div>
      )}

      {/* Video & Panel Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: sidePanel ? '1fr 380px' : '1fr', gap: '16px' }}>
        {/* Left Column: Video Stage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '480px',
              height: '62vh',
              background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Live Remote Peer Video Stream */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: hasRemoteTrack ? 'block' : 'none',
              }}
            />

            {/* Waiting/Connecting Placeholder if remote track not received yet */}
            {!hasRemoteTrack && (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(52, 211, 153, 0.1)',
                    border: '2px solid rgba(52, 211, 153, 0.4)',
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 1.8s infinite',
                  }}
                >
                  <User size={38} color="#34d399" />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                  {peerName}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#34d399', fontWeight: 600 }}>
                  {connectionStatus}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#64748b' }}>
                  Awaiting remote video & audio stream packets over WebRTC...
                </p>
              </div>
            )}

            {/* Top Overlay Badge */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                padding: '6px 14px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Volume2 size={14} className="text-emerald-400 animate-pulse" />
              <span>{peerName}</span>
            </div>

            {/* Local Video Picture-in-Picture (PIP) Window */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                width: '160px',
                height: '110px',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.45)',
                background: '#1e293b',
                zIndex: 10,
              }}
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirrored view for user comfort
                  display: isVideoOff || !localStream ? 'none' : 'block',
                }}
              />

              {(isVideoOff || !localStream) && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: '11px',
                  }}
                >
                  <User size={20} style={{ marginBottom: '4px', opacity: 0.6 }} />
                  <span>Camera Paused</span>
                </div>
              )}

              <div
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  left: '4px',
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: '#ffffff',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                You ({isAudioMuted ? 'Muted' : 'Live'})
              </div>
            </div>
          </div>

          {/* Bottom Call Control Bar */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              padding: '12px 20px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
            }}
          >
            {/* Mic Toggle */}
            <button
              onClick={toggleAudio}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isAudioMuted ? '#fee2e2' : '#f1f5f9',
                color: isAudioMuted ? '#b91c1c' : '#0f172a',
                border: isAudioMuted ? '1.5px solid #fca5a5' : '1px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Video Camera Toggle */}
            <button
              onClick={toggleVideo}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isVideoOff ? '#fee2e2' : '#f1f5f9',
                color: isVideoOff ? '#b91c1c' : '#0f172a',
                border: isVideoOff ? '1.5px solid #fca5a5' : '1px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            {/* Screen Share Toggle */}
            <button
              onClick={toggleScreenShare}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isScreenSharing ? '#ecfdf5' : '#f1f5f9',
                color: isScreenSharing ? '#059669' : '#0f172a',
                border: isScreenSharing ? '1.5px solid #a7f3d0' : '1px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
            >
              <MonitorUp size={20} />
            </button>

            {/* End Call Button */}
            <button
              onClick={handleHangup}
              style={{
                height: '46px',
                padding: '0 24px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#e11d48',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.4)',
                transition: 'all 0.15s ease',
              }}
            >
              <PhoneOff size={18} />
              <span>Leave Room</span>
            </button>
          </div>
        </div>

        {/* Right Column: Optional Side Panel (Prescription / Clinical Notes) */}
        {sidePanel && <div>{sidePanel}</div>}
      </div>
    </div>
  );
}
