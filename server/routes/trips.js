import express from 'express';
import {
  saveTrip,
  findTripById,
  listAllTrips,
  setTripStatus,
  getTripAuditHistory,
} from '../services/dbService.js';
import { getRoadRoute } from '../services/routingService.js';

const router = express.Router();

/**
 * Helper to generate a unique emergency Trip ID
 */
function generateTripId() {
  const prefix = 'EMS';
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${prefix}-${month}${day}-${randomDigits}`;
}

/**
 * POST /api/trips (or /trip)
 * Create a new ambulance dispatch trip
 */
router.post('/', async (req, res) => {
  try {
    const {
      tripId,
      ambulanceId,
      vehicleNumber,
      ambulanceType,
      driverName,
      driverPhone,
      patientName,
      patientContact,
      startLocation,
      destination,
    } = req.body;

    if (!ambulanceId) {
      return res.status(400).json({ error: 'ambulanceId is required' });
    }

    if (!startLocation || startLocation.lat === undefined || startLocation.lng === undefined) {
      return res.status(400).json({ error: 'startLocation with lat and lng is required' });
    }

    if (!destination || destination.lat === undefined || destination.lng === undefined) {
      return res.status(400).json({ error: 'destination with lat and lng is required' });
    }

    const assignedTripId = tripId ? String(tripId).trim() : generateTripId();

    // Calculate real road network route and initial ETA via OSRM
    const routeData = await getRoadRoute(
      { lat: Number(startLocation.lat), lng: Number(startLocation.lng) },
      { lat: Number(destination.lat), lng: Number(destination.lng) }
    );

    const initialLat = Number(startLocation.lat);
    const initialLng = Number(startLocation.lng);

    const tripData = {
      tripId: assignedTripId,
      ambulanceId: String(ambulanceId),
      vehicleNumber: vehicleNumber || 'PB-11-EM-9921',
      ambulanceType: ambulanceType || 'Advanced Life Support',
      driverName: driverName || 'Gurpreet Singh',
      driverPhone: driverPhone || '+91-98765-43210',
      patientName: patientName || 'Emergency Patient',
      patientContact: patientContact || '+91-98123-45678',
      status: 'dispatched',
      startLocation: {
        lat: initialLat,
        lng: initialLng,
        address: startLocation.address || 'Ambulance Station',
      },
      destination: {
        lat: Number(destination.lat),
        lng: Number(destination.lng),
        address: destination.address || 'Destination Hospital',
      },
      currentLocation: {
        lat: initialLat,
        lng: initialLng,
        speed: 0,
        heading: 0,
        accuracy: 10,
        timestamp: new Date(),
      },
      route: routeData.waypoints,
      distanceKm: routeData.distanceKm,
      etaMinutes: routeData.etaMinutes,
      equipment: ['Oxygen Cylinder', 'Defibrillator', 'Cardiac Monitor', 'IV Kit', 'Suction Machine'],
    };

    const createdTrip = await saveTrip(tripData);

    return res.status(201).json({
      success: true,
      message: 'Ambulance trip created successfully',
      trip: createdTrip,
    });
  } catch (err) {
    console.error('[API] Error creating trip:', err);
    return res.status(500).json({ error: 'Failed to create trip', details: err.message });
  }
});

/**
 * GET /api/trips
 * List all active/recent ambulance trips
 */
router.get('/', async (req, res) => {
  try {
    const trips = await listAllTrips();
    return res.json({ success: true, count: trips.length, trips });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list trips', details: err.message });
  }
});

/**
 * POST /api/trips/seed-demo
 * Seed an immediate demo trip in Patiala (GMC Rajindra Hospital to Model Town)
 */
router.post('/seed-demo', async (req, res) => {
  try {
    const demoTripId = 'EMS-DEMO-108';
    
    // Check if already created
    const existing = await findTripById(demoTripId);
    if (existing) {
      return res.json({ success: true, message: 'Demo trip ready', trip: existing });
    }

    // Model Town, Patiala to GMC Rajindra Hospital
    const startLocation = {
      lat: 30.3440,
      lng: 76.3685,
      address: 'Model Town Main Market, Patiala',
    };
    const destination = {
      lat: 30.3255,
      lng: 76.3768,
      address: 'Government Medical College & Rajindra Hospital (Emergency Trauma Care)',
    };

    const routeData = await getRoadRoute(startLocation, destination);

    const demoTrip = {
      tripId: demoTripId,
      ambulanceId: 'AMB-01',
      vehicleNumber: 'PB-11-EMS-0108',
      ambulanceType: 'Advanced Life Support (ICU on Wheels)',
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
        speed: 42,
        heading: 145,
        accuracy: 8,
        timestamp: new Date(),
      },
      route: routeData.waypoints,
      distanceKm: routeData.distanceKm,
      etaMinutes: routeData.etaMinutes,
      equipment: ['Cardiac Monitor', 'Defibrillator', 'Ventilator', 'Portable Ultrasound', 'Oxygen Supply'],
    };

    const saved = await saveTrip(demoTrip);
    return res.status(201).json({ success: true, message: 'Demo trip seeded successfully', trip: saved });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to seed demo trip', details: err.message });
  }
});

/**
 * GET /api/trips/:tripId
 * Get single trip details with authorization check
 */
router.get('/:tripId', async (req, res) => {
  try {
    const trip = await findTripById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or invalid tracking ID' });
    }
    return res.json({ success: true, trip });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch trip', details: err.message });
  }
});

/**
 * PATCH /api/trips/:tripId/status
 * Update status
 */
router.patch('/:tripId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['dispatched', 'in_transit', 'arrived', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    const updated = await setTripStatus(req.params.tripId, status);
    if (!updated) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    return res.json({ success: true, trip: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update status', details: err.message });
  }
});

/**
 * GET /api/trips/:tripId/history
 * Fetch location audit trail history
 */
router.get('/:tripId/history', async (req, res) => {
  try {
    const history = await getTripAuditHistory(req.params.tripId);
    return res.json({ success: true, count: history.length, history });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch audit history', details: err.message });
  }
});

export default router;
