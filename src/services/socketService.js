import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.activeTripId = null;
    this.subscribers = new Map();
  }

  /**
   * Initialize or retrieve active socket connection
   */
  connect() {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (!this.socket) {
      // Use explicit environment variable if set, otherwise relative to current host
      // which Vite reverse-proxies to http://localhost:5001 in dev
      const socketUrl = import.meta.env.VITE_WS_URL || 
        (typeof window !== 'undefined' && window.location.port === '5173' ? 'http://localhost:5001' : '/');

      this.socket = io(socketUrl, {
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log(`[SocketService] Connected to telematics server (ID: ${this.socket.id})`);
        if (this.activeTripId) {
          this.socket.emit('joinTrip', { tripId: this.activeTripId });
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.warn(`[SocketService] Disconnected from server: ${reason}`);
      });

      this.socket.on('connect_error', (err) => {
        console.warn('[SocketService] Connection error:', err.message);
      });
    }

    return this.socket;
  }

  /**
   * Subscribe to a trip's live telemetry channel
   * @param {string} tripId 
   * @param {object} callbacks { onInitialState, onLocationUpdate, onStatusChange, onError, onConnectionChange }
   * @returns {function} Cleanup/unsubscribe function
   */
  joinTrip(tripId, callbacks = {}) {
    const socket = this.connect();
    this.activeTripId = tripId;

    const {
      onInitialState,
      onLocationUpdate,
      onStatusChange,
      onError,
      onConnectionChange,
    } = callbacks;

    // Handlers
    const handleInitial = (data) => onInitialState && onInitialState(data);
    const handleUpdate = (data) => onLocationUpdate && onLocationUpdate(data);
    const handleStatus = (data) => onStatusChange && onStatusChange(data);
    const handleError = (data) => onError && onError(data);
    const handleConnect = () => onConnectionChange && onConnectionChange(true);
    const handleDisconnect = () => onConnectionChange && onConnectionChange(false);

    socket.on('tripInitialState', handleInitial);
    socket.on('locationUpdate', handleUpdate);
    socket.on('tripStatusChanged', handleStatus);
    socket.on('tripError', handleError);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // If already connected, join immediately
    if (socket.connected) {
      socket.emit('joinTrip', { tripId });
      if (onConnectionChange) onConnectionChange(true);
    } else {
      socket.once('connect', () => {
        socket.emit('joinTrip', { tripId });
      });
    }

    // Return cleanup unsubscriber
    return () => {
      socket.emit('leaveTrip', { tripId });
      socket.off('tripInitialState', handleInitial);
      socket.off('locationUpdate', handleUpdate);
      socket.off('tripStatusChanged', handleStatus);
      socket.off('tripError', handleError);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      if (this.activeTripId === tripId) {
        this.activeTripId = null;
      }
    };
  }

  /**
   * Send live GPS telemetry ping from driver device or simulator
   */
  sendLocation(payload) {
    const socket = this.connect();
    socket.emit('sendLocation', payload);
  }

  /**
   * Change trip status (e.g., in_transit, arrived, completed)
   */
  updateTripStatus(tripId, status) {
    const socket = this.connect();
    socket.emit('updateTripStatus', { tripId, status });
  }

  /**
   * Disconnect socket cleanly
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.activeTripId = null;
    }
  }
}

export const socketService = new SocketService();
export default socketService;
