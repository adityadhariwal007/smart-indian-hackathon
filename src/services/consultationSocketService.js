import { io } from 'socket.io-client';

class ConsultationSocketService {
  constructor() {
    this.socket = null;
    this.registeredDoctorId = null;
    this.presenceListeners = new Set();
    this.incomingCallListeners = new Set();
    this.callCancelledListeners = new Set();
  }

  /**
   * Connect to backend socket server
   * Dynamically resolves to window.location.hostname:5001 so it works across LAN (two laptops)
   */
  connect() {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (!this.socket) {
      const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
      const serverUrl = import.meta.env.VITE_WS_URL || `http://${host}:5001`;

      this.socket = io(serverUrl, {
        reconnection: true,
        reconnectionAttempts: 30,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log(`[ConsultationSocket] Connected to server (ID: ${this.socket.id})`);
        // If we were previously registered as a doctor, re-register on reconnect
        if (this.registeredDoctorId) {
          this.registerDoctor(this.registeredDoctorId, 'available');
        }
      });

      this.socket.on('doctor:presence_updated', (data) => {
        this.presenceListeners.forEach((listener) => {
          try {
            listener(data);
          } catch (e) {
            console.error('Error in presence listener', e);
          }
        });
      });

      this.socket.on('call:incoming', (callData) => {
        this.incomingCallListeners.forEach((listener) => {
          try {
            listener(callData);
          } catch (e) {
            console.error('Error in incoming call listener', e);
          }
        });
      });

      this.socket.on('call:cancelled', (data) => {
        this.callCancelledListeners.forEach((listener) => {
          try {
            listener(data);
          } catch (e) {
            console.error('Error in call cancelled listener', e);
          }
        });
      });

      this.socket.on('disconnect', (reason) => {
        console.warn(`[ConsultationSocket] Disconnected: ${reason}`);
      });
    }

    return this.socket;
  }

  /**
   * Register doctor presence on the server
   */
  registerDoctor(doctorId, status = 'available') {
    const socket = this.connect();
    this.registeredDoctorId = doctorId;

    return new Promise((resolve) => {
      socket.emit('doctor:register', { doctorId, status }, (res) => {
        resolve(res);
      });
    });
  }

  /**
   * Update doctor status ('available' | 'busy' | 'offline')
   */
  updateDoctorStatus(doctorId, status) {
    const socket = this.connect();
    return new Promise((resolve) => {
      socket.emit('doctor:status_change', { doctorId, status }, (res) => {
        resolve(res);
      });
    });
  }

  /**
   * Fetch live presence list of all doctors
   */
  getDoctorsPresence() {
    const socket = this.connect();
    return new Promise((resolve) => {
      socket.emit('doctor:get_all_presence', (res) => {
        resolve(res?.doctors || []);
      });
    });
  }

  /**
   * Subscribe to doctor presence updates
   */
  onPresenceUpdate(callback) {
    this.presenceListeners.add(callback);
    return () => this.presenceListeners.delete(callback);
  }

  /**
   * Subscribe to incoming calls (Doctor side)
   */
  onIncomingCall(callback) {
    this.incomingCallListeners.add(callback);
    return () => this.incomingCallListeners.delete(callback);
  }

  /**
   * Subscribe to call cancellations (Doctor side)
   */
  onCallCancelled(callback) {
    this.callCancelledListeners.add(callback);
    return () => this.callCancelledListeners.delete(callback);
  }

  /**
   * Accept an incoming call (Doctor)
   */
  acceptCall(callId) {
    const socket = this.connect();
    return new Promise((resolve) => {
      socket.emit('call:accept', { callId }, (res) => {
        resolve(res);
      });
    });
  }

  /**
   * Reject an incoming call (Doctor)
   */
  rejectCall(callId, reason) {
    const socket = this.connect();
    return new Promise((resolve) => {
      socket.emit('call:reject', { callId, reason }, (res) => {
        resolve(res);
      });
    });
  }

  /**
   * Initiate a call (Patient side)
   */
  initiateCall(callPayload, callbacks = {}) {
    const socket = this.connect();
    const { onRinging, onAccepted, onRejected, onTimeout, onFailed } = callbacks;

    const cleanup = () => {
      socket.off('call:ringing', handleRinging);
      socket.off('call:accepted', handleAccepted);
      socket.off('call:rejected', handleRejected);
      socket.off('call:timeout', handleTimeout);
      socket.off('call:failed', handleFailed);
    };

    const handleRinging = (data) => onRinging && onRinging(data);
    const handleAccepted = (data) => {
      cleanup();
      if (onAccepted) onAccepted(data);
    };
    const handleRejected = (data) => {
      cleanup();
      if (onRejected) onRejected(data);
    };
    const handleTimeout = (data) => {
      cleanup();
      if (onTimeout) onTimeout(data);
    };
    const handleFailed = (data) => {
      cleanup();
      if (onFailed) onFailed(data);
    };

    socket.on('call:ringing', handleRinging);
    socket.on('call:accepted', handleAccepted);
    socket.on('call:rejected', handleRejected);
    socket.on('call:timeout', handleTimeout);
    socket.on('call:failed', handleFailed);

    socket.emit('call:initiate', callPayload);

    return () => {
      cleanup();
      socket.emit('call:cancel', { callId: callPayload.callId });
    };
  }

  /**
   * Cancel an outgoing call before doctor answers
   */
  cancelCall(callId) {
    const socket = this.connect();
    socket.emit('call:cancel', { callId });
  }

  /**
   * End an active call
   */
  endCall(callId, endReason) {
    const socket = this.connect();
    return new Promise((resolve) => {
      socket.emit('call:end', { callId, endReason }, (res) => {
        resolve(res);
      });
    });
  }

  /**
   * WebRTC Signaling: Send SDP Offer
   */
  sendOffer(callId, sdp) {
    const socket = this.connect();
    socket.emit('webrtc:offer', { callId, sdp });
  }

  /**
   * WebRTC Signaling: Send SDP Answer
   */
  sendAnswer(callId, sdp) {
    const socket = this.connect();
    socket.emit('webrtc:answer', { callId, sdp });
  }

  /**
   * WebRTC Signaling: Send ICE Candidate
   */
  sendIceCandidate(callId, candidate) {
    const socket = this.connect();
    socket.emit('webrtc:ice_candidate', { callId, candidate });
  }

  /**
   * Listen for peer SDP Offer
   */
  onPeerOffer(callback) {
    const socket = this.connect();
    socket.on('webrtc:offer', callback);
    return () => socket.off('webrtc:offer', callback);
  }

  /**
   * Listen for peer SDP Answer
   */
  onPeerAnswer(callback) {
    const socket = this.connect();
    socket.on('webrtc:answer', callback);
    return () => socket.off('webrtc:answer', callback);
  }

  /**
   * Listen for peer ICE Candidate
   */
  onPeerIceCandidate(callback) {
    const socket = this.connect();
    socket.on('webrtc:ice_candidate', callback);
    return () => socket.off('webrtc:ice_candidate', callback);
  }

  /**
   * Listen for call ended event
   */
  onCallEnded(callback) {
    const socket = this.connect();
    socket.on('call:ended', callback);
    return () => socket.off('call:ended', callback);
  }
}

export const consultationSocketService = new ConsultationSocketService();
export default consultationSocketService;
