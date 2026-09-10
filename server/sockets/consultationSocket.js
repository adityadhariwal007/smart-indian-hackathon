import {
  createCallLog,
  updateCallLog,
  getCallLogById,
} from '../services/dbService.js';

// Pre-configured doctors in the system
const DEFAULT_DOCTORS = {
  aditya: {
    doctorId: 'aditya',
    name: 'Dr. Aditya Dhariwal',
    specialization: 'Emergency Medicine & Trauma Surgery',
    department: 'Emergency & Trauma Services',
    hospital: 'Government Medical College & Rajindra Hospital, Patiala',
    status: 'available', // 'available' | 'busy' | 'offline'
    socketId: null,
    lastSeen: new Date(),
  },
  palakshi: {
    doctorId: 'palakshi',
    name: 'Dr. Palakshi Sharma',
    specialization: 'Cardiology & Critical Care',
    department: 'Cardiology',
    hospital: 'Government Medical College & Rajindra Hospital, Patiala',
    status: 'available',
    socketId: null,
    lastSeen: new Date(),
  },
  arnav: {
    doctorId: 'arnav',
    name: 'Dr. Arnav Gupta',
    specialization: 'Internal Medicine & Critical Triage',
    department: 'Internal Medicine',
    hospital: 'Government Medical College & Rajindra Hospital, Patiala',
    status: 'available',
    socketId: null,
    lastSeen: new Date(),
  },
};

// In-Memory state for real-time presence and ongoing calls
export const doctorPresence = new Map();
Object.entries(DEFAULT_DOCTORS).forEach(([id, doc]) => {
  doctorPresence.set(id, { ...doc });
});

// Map of active calls: callId -> callState
export const activeCalls = new Map();

// Map of socketId -> { role: 'doctor'|'patient', id: string, callId?: string }
const socketRegistry = new Map();

/**
 * Register Video Consultation Socket Handlers
 * @param {import('socket.io').Server} io
 */
export function registerConsultationSockets(io) {
  io.on('connection', (socket) => {
    // ----------------------------------------------------
    // 1. Doctor Presence & Status Management
    // ----------------------------------------------------

    socket.on('doctor:register', (payload, callback) => {
      const { doctorId, status = 'available' } = payload || {};
      if (!doctorId) {
        if (callback) callback({ success: false, error: 'Missing doctorId' });
        return;
      }

      const existingDoc = doctorPresence.get(doctorId) || {
        doctorId,
        name: `Dr. ${doctorId.charAt(0).toUpperCase() + doctorId.slice(1)}`,
        specialization: 'General Medicine',
        hospital: 'GMC Rajindra Hospital',
      };

      const updated = {
        ...existingDoc,
        socketId: socket.id,
        status: status,
        lastSeen: new Date(),
      };

      doctorPresence.set(doctorId, updated);
      socketRegistry.set(socket.id, { role: 'doctor', id: doctorId });

      console.log(`[VideoConsultation] Doctor registered: ${doctorId} (${updated.name}) -> Status: ${status} [Socket: ${socket.id}]`);

      // Broadcast presence update to all connected patients/doctors
      io.emit('doctor:presence_updated', {
        doctorId,
        status,
        name: updated.name,
      });

      if (callback) {
        callback({ success: true, doctor: updated });
      }
    });

    socket.on('doctor:status_change', ({ doctorId, status }, callback) => {
      const doc = doctorPresence.get(doctorId);
      if (doc) {
        doc.status = status;
        doc.lastSeen = new Date();
        doctorPresence.set(doctorId, doc);

        console.log(`[VideoConsultation] Doctor status changed: ${doctorId} -> ${status}`);
        io.emit('doctor:presence_updated', { doctorId, status, name: doc.name });

        if (callback) callback({ success: true, status });
      } else if (callback) {
        callback({ success: false, error: 'Doctor not registered' });
      }
    });

    socket.on('doctor:get_all_presence', (callback) => {
      const list = Array.from(doctorPresence.values()).map((d) => ({
        doctorId: d.doctorId,
        name: d.name,
        specialization: d.specialization,
        department: d.department,
        hospital: d.hospital,
        status: d.status,
        isOnline: Boolean(d.socketId && d.status !== 'offline'),
      }));

      if (callback) callback({ success: true, doctors: list });
      else socket.emit('doctor:presence_list', { doctors: list });
    });

    // ----------------------------------------------------
    // 2. Call Routing (Patient -> Targeted Doctor)
    // ----------------------------------------------------

    socket.on('call:initiate', async (payload, callback) => {
      const {
        callId = `CALL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        doctorId = 'aditya',
        patientId = 'guest-patient',
        patientName = 'Karan Mehra',
        reason = 'General OPD Teleconsultation',
      } = payload || {};

      console.log(`[VideoConsultation] Call initiation request: ${patientName} (${patientId}) -> Dr. ${doctorId}`);

      socketRegistry.set(socket.id, { role: 'patient', id: patientId, callId });

      const targetDoctor = doctorPresence.get(doctorId);

      // Check if doctor exists and has an active socket
      if (!targetDoctor || !targetDoctor.socketId || targetDoctor.status === 'offline') {
        const errorMsg = `Dr. ${targetDoctor?.name || doctorId} is currently offline. Please try another available doctor or check back shortly.`;
        console.warn(`[VideoConsultation] Call rejected: Doctor ${doctorId} is offline`);

        socket.emit('call:failed', {
          callId,
          reason: errorMsg,
          code: 'DOCTOR_OFFLINE',
        });

        if (callback) callback({ success: false, error: errorMsg, code: 'DOCTOR_OFFLINE' });
        return;
      }

      // Check if doctor is already busy on a call
      if (targetDoctor.status === 'busy' || targetDoctor.status === 'in_call') {
        const errorMsg = `Dr. ${targetDoctor.name} is currently engaged in another patient consultation. Please hold or select another doctor.`;
        console.warn(`[VideoConsultation] Call rejected: Doctor ${doctorId} is busy`);

        socket.emit('call:failed', {
          callId,
          reason: errorMsg,
          code: 'DOCTOR_BUSY',
        });

        if (callback) callback({ success: false, error: errorMsg, code: 'DOCTOR_BUSY' });
        return;
      }

      // Create database call record
      await createCallLog({
        callId,
        patientId,
        patientName,
        doctorId,
        doctorName: targetDoctor.name,
        status: 'ringing',
        startTime: new Date(),
        notes: reason,
      });

      // Update doctor state to 'ringing'
      targetDoctor.status = 'ringing';
      doctorPresence.set(doctorId, targetDoctor);
      io.emit('doctor:presence_updated', { doctorId, status: 'ringing', name: targetDoctor.name });

      // Store in activeCalls with a 35-second auto-timeout
      const callTimer = setTimeout(async () => {
        console.log(`[VideoConsultation] Call ${callId} timed out after 35s (no answer)`);
        const call = activeCalls.get(callId);
        if (call && call.status === 'ringing') {
          // Reset doctor status
          const doc = doctorPresence.get(doctorId);
          if (doc && doc.status === 'ringing') {
            doc.status = 'available';
            doctorPresence.set(doctorId, doc);
            io.emit('doctor:presence_updated', { doctorId, status: 'available', name: doc.name });
          }

          // Notify both sides
          io.to(call.patientSocketId).emit('call:timeout', {
            callId,
            reason: `Dr. ${targetDoctor.name} did not respond. The doctor may be away from their desk.`,
          });
          io.to(call.doctorSocketId).emit('call:missed', {
            callId,
            patientName,
          });

          // Update DB
          await updateCallLog(callId, {
            status: 'missed',
            endTime: new Date(),
            endReason: 'Timeout - No answer within 35 seconds',
          });

          activeCalls.delete(callId);
        }
      }, 35000);

      const callState = {
        callId,
        patientSocketId: socket.id,
        doctorSocketId: targetDoctor.socketId,
        doctorId,
        doctorName: targetDoctor.name,
        patientId,
        patientName,
        reason,
        status: 'ringing',
        startTime: new Date(),
        timer: callTimer,
      };

      activeCalls.set(callId, callState);

      // Tell patient that call is ringing
      socket.emit('call:ringing', {
        callId,
        doctorId,
        doctorName: targetDoctor.name,
      });

      // Route incoming call popup directly to doctor's specific socket
      io.to(targetDoctor.socketId).emit('call:incoming', {
        callId,
        patientId,
        patientName,
        reason,
        timestamp: new Date().toISOString(),
      });

      console.log(`[VideoConsultation] Sent call:incoming for ${callId} to Dr. ${doctorId} [Socket: ${targetDoctor.socketId}]`);

      if (callback) callback({ success: true, callId, doctorName: targetDoctor.name });
    });

    // ----------------------------------------------------
    // 3. Doctor Response (Accept / Reject)
    // ----------------------------------------------------

    socket.on('call:accept', async ({ callId }, callback) => {
      const call = activeCalls.get(callId);
      if (!call) {
        console.warn(`[VideoConsultation] call:accept failed: Call ${callId} not found`);
        if (callback) callback({ success: false, error: 'Call expired or not found' });
        return;
      }

      clearTimeout(call.timer);
      call.status = 'accepted';
      call.connectedTime = new Date();

      const doc = doctorPresence.get(call.doctorId);
      if (doc) {
        doc.status = 'busy';
        doctorPresence.set(call.doctorId, doc);
        io.emit('doctor:presence_updated', { doctorId: call.doctorId, status: 'busy', name: doc.name });
      }

      // Create a unique socket room for WebRTC signaling
      const roomName = `call_${callId}`;
      socket.join(roomName); // Doctor joins

      const patientSocket = io.sockets.sockets.get(call.patientSocketId);
      if (patientSocket) {
        patientSocket.join(roomName); // Patient joins
      }

      // Update call log in database
      await updateCallLog(callId, {
        status: 'accepted',
        connectedTime: call.connectedTime,
      });

      console.log(`[VideoConsultation] Call ${callId} ACCEPTED by Dr. ${call.doctorId}. Room: ${roomName}`);

      // Notify patient that doctor accepted
      io.to(call.patientSocketId).emit('call:accepted', {
        callId,
        doctorId: call.doctorId,
        doctorName: call.doctorName,
        room: roomName,
      });

      // Notify doctor that session is established
      socket.emit('call:connected', {
        callId,
        patientId: call.patientId,
        patientName: call.patientName,
        room: roomName,
      });

      if (callback) callback({ success: true, room: roomName });
    });

    socket.on('call:reject', async ({ callId, reason = 'Doctor is unavailable at this moment' }, callback) => {
      const call = activeCalls.get(callId);
      if (call) {
        clearTimeout(call.timer);

        const doc = doctorPresence.get(call.doctorId);
        if (doc) {
          doc.status = 'available';
          doctorPresence.set(call.doctorId, doc);
          io.emit('doctor:presence_updated', { doctorId: call.doctorId, status: 'available', name: doc.name });
        }

        // Notify patient
        io.to(call.patientSocketId).emit('call:rejected', {
          callId,
          reason,
        });

        // Update database
        await updateCallLog(callId, {
          status: 'rejected',
          endTime: new Date(),
          endReason: reason,
        });

        activeCalls.delete(callId);
        console.log(`[VideoConsultation] Call ${callId} REJECTED by Dr. ${call.doctorId}`);
      }

      if (callback) callback({ success: true });
    });

    // ----------------------------------------------------
    // 4. Patient Cancellation Before Answer
    // ----------------------------------------------------

    socket.on('call:cancel', async ({ callId }, callback) => {
      const call = activeCalls.get(callId);
      if (call) {
        clearTimeout(call.timer);

        const doc = doctorPresence.get(call.doctorId);
        if (doc && doc.status === 'ringing') {
          doc.status = 'available';
          doctorPresence.set(call.doctorId, doc);
          io.emit('doctor:presence_updated', { doctorId: call.doctorId, status: 'available', name: doc.name });
        }

        // Notify doctor that patient hung up
        io.to(call.doctorSocketId).emit('call:cancelled', {
          callId,
          reason: 'Patient cancelled the consultation request',
        });

        await updateCallLog(callId, {
          status: 'cancelled',
          endTime: new Date(),
          endReason: 'Cancelled by patient before answer',
        });

        activeCalls.delete(callId);
        console.log(`[VideoConsultation] Call ${callId} CANCELLED by patient`);
      }

      if (callback) callback({ success: true });
    });

    // ----------------------------------------------------
    // 5. WebRTC Peer-to-Peer Signaling Relay
    // ----------------------------------------------------

    socket.on('webrtc:offer', ({ callId, sdp }) => {
      const roomName = `call_${callId}`;
      socket.to(roomName).emit('webrtc:offer', { callId, sdp });
      console.log(`[WebRTC Relay] Forwarded offer for call ${callId}`);
    });

    socket.on('webrtc:answer', ({ callId, sdp }) => {
      const roomName = `call_${callId}`;
      socket.to(roomName).emit('webrtc:answer', { callId, sdp });
      console.log(`[WebRTC Relay] Forwarded answer for call ${callId}`);
    });

    socket.on('webrtc:ice_candidate', ({ callId, candidate }) => {
      const roomName = `call_${callId}`;
      socket.to(roomName).emit('webrtc:ice_candidate', { callId, candidate });
    });

    // ----------------------------------------------------
    // 6. Call Termination & Audit Logging
    // ----------------------------------------------------

    socket.on('call:end', async ({ callId, endReason = 'Consultation concluded normally' }, callback) => {
      const roomName = `call_${callId}`;
      const call = activeCalls.get(callId);

      const endTime = new Date();
      let durationSeconds = 0;

      if (call) {
        clearTimeout(call.timer);
        if (call.connectedTime) {
          durationSeconds = Math.round((endTime.getTime() - new Date(call.connectedTime).getTime()) / 1000);
        }

        // Reset doctor status
        const doc = doctorPresence.get(call.doctorId);
        if (doc) {
          doc.status = 'available';
          doctorPresence.set(call.doctorId, doc);
          io.emit('doctor:presence_updated', { doctorId: call.doctorId, status: 'available', name: doc.name });
        }

        await updateCallLog(callId, {
          status: 'completed',
          endTime,
          durationSeconds,
          endReason,
        });

        activeCalls.delete(callId);
      }

      // Notify peer in room
      socket.to(roomName).emit('call:ended', {
        callId,
        durationSeconds,
        endReason,
      });

      socket.leave(roomName);
      console.log(`[VideoConsultation] Call ${callId} ENDED. Duration: ${durationSeconds}s`);

      if (callback) callback({ success: true, durationSeconds });
    });

    // ----------------------------------------------------
    // 7. Disconnection Cleanup
    // ----------------------------------------------------

    socket.on('disconnect', async () => {
      const info = socketRegistry.get(socket.id);
      if (!info) return;

      socketRegistry.delete(socket.id);

      // If doctor disconnected
      if (info.role === 'doctor') {
        const doc = doctorPresence.get(info.id);
        if (doc && doc.socketId === socket.id) {
          doc.status = 'offline';
          doc.socketId = null;
          doctorPresence.set(info.id, doc);

          console.log(`[VideoConsultation] Doctor disconnected: ${info.id} -> offline`);
          io.emit('doctor:presence_updated', { doctorId: info.id, status: 'offline', name: doc.name });
        }
      }

      // If socket had an active or ringing call
      for (const [callId, call] of activeCalls.entries()) {
        if (call.patientSocketId === socket.id || call.doctorSocketId === socket.id) {
          clearTimeout(call.timer);

          const roomName = `call_${callId}`;
          socket.to(roomName).emit('call:ended', {
            callId,
            endReason: 'Peer disconnected unexpectedly from network',
          });

          // Reset doctor status
          const doc = doctorPresence.get(call.doctorId);
          if (doc && doc.socketId !== socket.id) {
            doc.status = 'available';
            doctorPresence.set(call.doctorId, doc);
            io.emit('doctor:presence_updated', { doctorId: call.doctorId, status: 'available', name: doc.name });
          }

          await updateCallLog(callId, {
            status: call.status === 'ringing' ? 'missed' : 'completed',
            endTime: new Date(),
            endReason: 'Socket disconnection',
          });

          activeCalls.delete(callId);
        }
      }
    });
  });
}
