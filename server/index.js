import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { initDatabase, saveTrip, findTripById } from './services/dbService.js';
import { registerTrackingSockets } from './sockets/trackingSocket.js';
import { registerConsultationSockets } from './sockets/consultationSocket.js';
import tripsRouter from './routes/trips.js';
import callsRouter from './routes/calls.js';
import { getRoadRoute } from './services/routingService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/api/trips', tripsRouter);
app.use('/trip', tripsRouter); // Prompt specified REST endpoint POST /trip
app.use('/api/consultation', callsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'HealthFlow Live Telematics & WebRTC Consultation Service',
    time: new Date(),
  });
});

// Create HTTP Server & Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 20000,
  pingInterval: 10000,
});

// Register WebSocket Telematics Handlers
registerTrackingSockets(io);

// Register Video Consultation & WebRTC Signaling Handlers
registerConsultationSockets(io);

/**
 * Seed initial demo trip if not present so developer can test immediately
 */
async function seedDefaultDemoTrip() {
  const demoTripId = 'EMS-DEMO-108';
  const existing = await findTripById(demoTripId);
  if (!existing) {
    console.log(`🚑 Initializing default demo trip: ${demoTripId}...`);
    // Model Town, Patiala -> GMC Rajindra Hospital
    const startLocation = {
      lat: 30.3440,
      lng: 76.3685,
      address: 'Model Town Market, Patiala',
    };
    const destination = {
      lat: 30.3255,
      lng: 76.3768,
      address: 'GMC Rajindra Hospital - Emergency Trauma Wing, Patiala',
    };

    const routeData = await getRoadRoute(startLocation, destination);

    await saveTrip({
      tripId: demoTripId,
      ambulanceId: 'AMB-01',
      vehicleNumber: 'PB-11-EMS-0108',
      ambulanceType: 'Advanced Life Support (ICU Mobile)',
      driverName: 'Sanjay Sharma',
      driverPhone: '+91-98765-11108',
      patientName: 'Karan Mehra',
      patientContact: '+91-98123-99887',
      status: 'in_transit',
      startLocation,
      destination,
      currentLocation: {
        lat: startLocation.lat,
        lng: startLocation.lng,
        speed: 48,
        heading: 145,
        accuracy: 6,
        timestamp: new Date(),
      },
      route: routeData.waypoints,
      distanceKm: routeData.distanceKm,
      etaMinutes: routeData.etaMinutes,
      equipment: ['Cardiac Monitor', 'Defibrillator', 'Ventilator', 'Portable Ultrasound', 'Oxygen Supply'],
    });
    console.log(`✅ Default demo trip ${demoTripId} seeded successfully.`);
  }
}

// Start Server
async function start() {
  await initDatabase(process.env.MONGODB_URI);
  await seedDefaultDemoTrip();

  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚑 HealthFlow Live Ambulance Server running on port ${PORT}`);
    console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
    console.log(`🏥 REST API endpoint: http://localhost:${PORT}/api/trips`);
    console.log(`======================================================\n`);
  });
}

start();

export { app, server, io };
