/**
 * ==============================================================================
 * 🚑 HealthFlow Live Ambulance Telematics Simulator & Hardware Integration Guide
 * ==============================================================================
 * 
 * This simulation script connects to the HealthFlow WebSocket server as a virtual
 * ambulance telemetry unit and transmits live GPS coordinates (lat, lng, speed,
 * heading, accuracy) at regular intervals (every 2–3 seconds) along a real road route.
 * 
 * ------------------------------------------------------------------------------
 * 🔌 HOW TO SWAP THIS SIMULATOR WITH REAL HARDWARE GPS FEEDS:
 * ------------------------------------------------------------------------------
 * When deploying in production with real physical GPS trackers or onboard vehicle units:
 * 
 * 1. HARDWARE TRACKERS (e.g., Teltonika FMB920, Concox, Quectel LTE Cat-M1):
 *    - Most commercial automotive GPS trackers communicate via TCP/UDP raw telemetry
 *      protocols (e.g., Codec 8 / Codec 8 Extended / GT06 protocol).
 *    - Deploy a lightweight TCP/UDP listener (or use Traccar / flespi gateway) to decode
 *      the binary NMEA/AVL packets into JSON.
 *    - Once decoded, simply emit the parsed coordinates to this same Socket.IO endpoint
 *      or invoke the REST endpoint `POST /api/trips/:tripId/location`.
 * 
 * 2. MQTT BROKER (e.g., AWS IoT Core, EMQX, HiveMQ):
 *    - For IoT devices publishing to an MQTT topic (e.g., `ambulances/DL-01-EMS/telemetry`):
 *    - Subscribe to the MQTT broker in your Node backend:
 *      ```javascript
 *      const mqtt = require('mqtt');
 *      const client = mqtt.connect('mqtt://broker.healthflow.org:1883');
 *      client.on('message', (topic, message) => {
 *        const { tripId, lat, lng, speed, heading } = JSON.parse(message.toString());
 *        io.to(`trip:${tripId}`).emit('locationUpdate', { tripId, lat, lng, speed, heading, timestamp: new Date() });
 *      });
 *      ```
 * 
 * 3. SMARTPHONE / TABLET DRIVER COCKPIT (Browser Geolocation API):
 *    - We have already implemented this in the frontend driver cockpit (`/driver/trip/:tripId`)!
 *    - It uses `navigator.geolocation.watchPosition({ enableHighAccuracy: true })`
 *      and sends live coordinates directly via Socket.IO `sendLocation`.
 * 
 * 4. WEBHOOK / HTTP REST PUSH (e.g., Samsara, Verizon Connect, Geotab):
 *    - If your fleet telematics vendor sends webhooks:
 *    - Forward their payload to `POST /api/trips/:tripId/location` and broadcast to Socket.IO.
 * 
 * ==============================================================================
 */

import { io } from 'socket.io-client';
import { calculateBearing } from './services/routingService.js';

// Configuration
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5001';
const TRIP_ID = process.argv[2] || 'EMS-DEMO-108';
const PING_INTERVAL_MS = 2500; // Emit GPS ping every 2.5 seconds

console.log(`\n======================================================`);
console.log(`🚑 Starting Ambulance GPS Simulator`);
console.log(`📡 Connecting to server: ${SERVER_URL}`);
console.log(`🎯 Target Trip ID: ${TRIP_ID}`);
console.log(`⏱️  Telemetry ping interval: ${PING_INTERVAL_MS}ms`);
console.log(`======================================================\n`);

const socket = io(SERVER_URL, {
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1500,
});

let routeWaypoints = [];
let currentIndex = 0;
let simulationInterval = null;

socket.on('connect', () => {
  console.log(`✅ [Simulator] Connected to telematics server with socket ID: ${socket.id}`);
  
  // Join the trip channel to fetch route waypoints
  socket.emit('joinTrip', { tripId: TRIP_ID });
});

socket.on('tripError', (err) => {
  console.error(`❌ [Simulator] Trip error:`, err.message);
  console.log(`💡 Make sure the backend server is running and the trip exists (e.g. EMS-DEMO-108).`);
});

socket.on('tripInitialState', ({ trip }) => {
  console.log(`📋 [Simulator] Received trip state for: ${trip.tripId}`);
  console.log(`   Ambulance: ${trip.vehicleNumber} (${trip.ambulanceType})`);
  console.log(`   Driver: ${trip.driverName} (${trip.driverPhone})`);
  console.log(`   Status: ${trip.status}`);

  if (trip.route && trip.route.length > 1) {
    routeWaypoints = trip.route;
    console.log(`🗺️  Route loaded: ${routeWaypoints.length} road waypoints.`);
  } else {
    // Generate emergency road waypoints from Model Town to GMC Rajindra Hospital, Patiala
    console.log(`⚠️  No pre-saved route. Generating smooth road corridor waypoints...`);
    routeWaypoints = [
      [30.3440, 76.3685],
      [30.3425, 76.3695],
      [30.3412, 76.3710],
      [30.3395, 76.3728],
      [30.3380, 76.3745],
      [30.3365, 76.3758],
      [30.3345, 76.3762],
      [30.3325, 76.3765],
      [30.3300, 76.3767],
      [30.3275, 76.3768],
      [30.3255, 76.3768],
    ];
  }

  // Update status to in_transit
  socket.emit('updateTripStatus', { tripId: TRIP_ID, status: 'in_transit' });

  // Start driving simulation
  startDriving();
});

function startDriving() {
  if (simulationInterval) clearInterval(simulationInterval);
  currentIndex = 0;

  console.log(`\n🚨 Ambulance siren active! Commencing emergency navigation...\n`);

  simulationInterval = setInterval(() => {
    if (currentIndex >= routeWaypoints.length) {
      console.log(`\n🏥 Ambulance has reached the destination hospital!`);
      socket.emit('updateTripStatus', { tripId: TRIP_ID, status: 'arrived' });
      
      console.log(`🔄 Restarting simulated route in 5 seconds to keep demo active...\n`);
      clearInterval(simulationInterval);
      setTimeout(() => {
        currentIndex = 0;
        socket.emit('updateTripStatus', { tripId: TRIP_ID, status: 'in_transit' });
        startDriving();
      }, 5000);
      return;
    }

    const currentCoord = routeWaypoints[currentIndex];
    const nextCoord = routeWaypoints[Math.min(currentIndex + 1, routeWaypoints.length - 1)];

    // Calculate realistic heading angle
    const heading = calculateBearing(
      currentCoord[0],
      currentCoord[1],
      nextCoord[0],
      nextCoord[1]
    );

    // Realistic urban emergency speed with slight variation (40 - 65 km/h)
    const speed = Math.round(40 + Math.sin(currentIndex) * 15 + Math.random() * 5);
    const accuracy = 5 + Math.floor(Math.random() * 4); // 5-8 meters accuracy

    const payload = {
      tripId: TRIP_ID,
      lat: currentCoord[0],
      lng: currentCoord[1],
      speed,
      heading,
      accuracy,
      source: 'simulator',
    };

    // Emit live GPS coordinates to Socket.IO server
    socket.emit('sendLocation', payload);

    const progressPct = Math.round(((currentIndex + 1) / routeWaypoints.length) * 100);
    process.stdout.write(
      `📡 [GPS Ping #${currentIndex + 1}/${routeWaypoints.length} (${progressPct}%)] ` +
      `Lat: ${payload.lat.toFixed(5)}, Lng: ${payload.lng.toFixed(5)} | ` +
      `Speed: ${speed} km/h | Bearing: ${heading}°\r`
    );

    currentIndex++;
  }, PING_INTERVAL_MS);
}

socket.on('disconnect', () => {
  console.log(`⚠️  [Simulator] Disconnected from server. Will attempt auto-reconnection...`);
  if (simulationInterval) clearInterval(simulationInterval);
});

// Graceful exit handler
process.on('SIGINT', () => {
  console.log(`\n🛑 Stopping ambulance simulation...`);
  if (simulationInterval) clearInterval(simulationInterval);
  socket.disconnect();
  process.exit(0);
});
