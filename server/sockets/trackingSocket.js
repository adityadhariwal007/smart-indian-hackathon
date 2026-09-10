import {
  findTripById,
  updateTripPosition,
  setTripStatus,
  recordLocationAudit,
} from '../services/dbService.js';
import { calculateRemainingEtaAndDistance } from '../services/routingService.js';

/**
 * Validate and sanitize GPS coordinates and payload
 */
function sanitizeLocationPayload(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Payload must be an object' };
  }

  const { tripId, lat, lng, speed, heading, accuracy, source } = data;

  if (!tripId || typeof tripId !== 'string' || tripId.trim().length === 0) {
    return { valid: false, error: 'Invalid or missing tripId' };
  }

  const numLat = Number(lat);
  const numLng = Number(lng);

  if (isNaN(numLat) || numLat < -90 || numLat > 90) {
    return { valid: false, error: 'Latitude must be a valid number between -90 and 90' };
  }

  if (isNaN(numLng) || numLng < -180 || numLng > 180) {
    return { valid: false, error: 'Longitude must be a valid number between -180 and 180' };
  }

  const cleanSpeed = Math.max(0, Math.min(Number(speed) || 0, 180)); // 0 - 180 km/h cap
  const cleanHeading = ((Number(heading) || 0) % 360 + 360) % 360; // normalized 0 - 360 deg
  const cleanAccuracy = Math.max(1, Number(accuracy) || 10);

  return {
    valid: true,
    data: {
      tripId: tripId.trim(),
      lat: Number(numLat.toFixed(6)),
      lng: Number(numLng.toFixed(6)),
      speed: Math.round(cleanSpeed * 10) / 10,
      heading: Math.round(cleanHeading),
      accuracy: Math.round(cleanAccuracy),
      source: String(source || 'device_gps').slice(0, 30),
      timestamp: new Date(),
    },
  };
}

export function registerTrackingSockets(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);

    /**
     * User / Hospital joins a trip's private tracking channel
     */
    socket.on('joinTrip', async ({ tripId }) => {
      if (!tripId) {
        return socket.emit('tripError', { message: 'Missing tripId parameter' });
      }

      const cleanTripId = String(tripId).trim();
      const trip = await findTripById(cleanTripId);

      if (!trip) {
        return socket.emit('tripError', {
          message: `Trip ${cleanTripId} was not found. Please verify your tracking ID.`,
        });
      }

      const roomName = `trip:${cleanTripId}`;
      socket.join(roomName);
      console.log(`👥 [Socket.IO] Client ${socket.id} joined channel ${roomName}`);

      // Emit initial trip state to newly joined client
      socket.emit('tripInitialState', {
        trip,
        timestamp: new Date(),
      });
    });

    /**
     * Client leaves a trip tracking room
     */
    socket.on('leaveTrip', ({ tripId }) => {
      if (!tripId) return;
      const roomName = `trip:${String(tripId).trim()}`;
      socket.leave(roomName);
      console.log(`👋 [Socket.IO] Client ${socket.id} left channel ${roomName}`);
    });

    /**
     * Ambulance Driver or GPS Simulator sends telematics ping
     */
    socket.on('sendLocation', async (payload) => {
      const validation = sanitizeLocationPayload(payload);
      if (!validation.valid) {
        return socket.emit('telemetryError', { message: validation.error });
      }

      const { tripId, lat, lng, speed, heading, accuracy, source, timestamp } = validation.data;
      const trip = await findTripById(tripId);

      if (!trip) {
        return socket.emit('telemetryError', { message: `Trip ${tripId} not found` });
      }

      // Calculate dynamic remaining distance and updated ETA
      const destination = trip.destination || { lat, lng };
      const { distanceRemainingKm, etaMinutes } = calculateRemainingEtaAndDistance(
        { lat, lng },
        destination,
        speed
      );

      // Auto-update status to arrived if within 50 meters of destination
      let newStatus = trip.status;
      if (distanceRemainingKm <= 0.05 && trip.status === 'in_transit') {
        newStatus = 'arrived';
        await setTripStatus(tripId, 'arrived');
        io.to(`trip:${tripId}`).emit('tripStatusChanged', {
          tripId,
          status: 'arrived',
          timestamp: new Date(),
        });
      }

      // Update in database / store
      await updateTripPosition(tripId, {
        lat,
        lng,
        speed,
        heading,
        accuracy,
        distanceRemainingKm,
        etaMinutes,
      });

      // Asynchronously record audit ping
      recordLocationAudit({
        tripId,
        ambulanceId: trip.ambulanceId,
        lat,
        lng,
        speed,
        heading,
        accuracy,
        source,
        timestamp,
      }).catch((err) => console.error('[Audit] Error logging ping:', err.message));

      // Broadcast location update to all watchers of this trip
      const updatePacket = {
        tripId,
        lat,
        lng,
        speed,
        heading,
        accuracy,
        distanceRemainingKm,
        etaMinutes,
        status: newStatus,
        timestamp,
      };

      io.to(`trip:${tripId}`).emit('locationUpdate', updatePacket);
    });

    /**
     * Driver or Admin changes trip status (e.g. dispatched -> in_transit -> arrived -> completed)
     */
    socket.on('updateTripStatus', async ({ tripId, status }) => {
      const allowedStatuses = ['dispatched', 'in_transit', 'arrived', 'completed', 'cancelled'];
      if (!tripId || !allowedStatuses.includes(status)) {
        return socket.emit('statusError', { message: 'Invalid status or tripId' });
      }

      const cleanTripId = String(tripId).trim();
      const updatedTrip = await setTripStatus(cleanTripId, status);

      if (!updatedTrip) {
        return socket.emit('statusError', { message: `Trip ${cleanTripId} not found` });
      }

      io.to(`trip:${cleanTripId}`).emit('tripStatusChanged', {
        tripId: cleanTripId,
        status,
        timestamp: new Date(),
      });
      console.log(`🚑 [Status] Trip ${cleanTripId} status updated to: ${status}`);
    });

    socket.on('disconnect', () => {
      // Clean up connection
    });
  });
}
