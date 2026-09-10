import express from 'express';
import { listCallLogs, getCallLogById } from '../services/dbService.js';
import { doctorPresence } from '../sockets/consultationSocket.js';

const router = express.Router();

/**
 * GET /api/consultation/doctors
 * Returns real-time presence and availability of all doctors in the network
 */
router.get('/doctors', (req, res) => {
  const doctors = Array.from(doctorPresence.values()).map((d) => ({
    doctorId: d.doctorId,
    name: d.name,
    specialization: d.specialization,
    department: d.department,
    hospital: d.hospital,
    status: d.status,
    isOnline: Boolean(d.socketId && d.status !== 'offline'),
    lastSeen: d.lastSeen,
  }));

  res.json({
    success: true,
    count: doctors.length,
    doctors,
  });
});

/**
 * GET /api/consultation/logs
 * Retrieves call audit trail (filtered by doctorId if provided)
 */
router.get('/logs', async (req, res) => {
  try {
    const { doctorId } = req.query;
    const logs = await listCallLogs(doctorId || null);
    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/consultation/logs/:callId
 * Retrieves detailed log for a specific call session
 */
router.get('/logs/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    const log = await getCallLogById(callId);
    if (!log) {
      return res.status(404).json({ success: false, error: 'Call log not found' });
    }
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
