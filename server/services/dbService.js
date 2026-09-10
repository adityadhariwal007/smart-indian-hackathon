import mongoose from 'mongoose';
import TripModel from '../models/Trip.js';
import LocationAuditModel from '../models/LocationAudit.js';

let isMongoConnected = false;

// In-Memory fallback store for zero-friction local development without requiring local mongod
const memoryStore = {
  trips: new Map(),
  audits: [],
};

export async function initDatabase(uri = process.env.MONGODB_URI) {
  if (!uri) {
    console.log('ℹ️  No MONGODB_URI specified. Operating in high-performance memory store mode.');
    return false;
  }

  try {
    // Attempt connection with a short 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB database successfully.');
    return true;
  } catch (err) {
    console.warn(`⚠️  MongoDB connection failed (${err.message}). Using resilient in-memory database store.`);
    isMongoConnected = false;
    return false;
  }
}

export function getIsMongoConnected() {
  return isMongoConnected;
}

/**
 * Trip CRUD Operations
 */
export async function saveTrip(tripData) {
  if (isMongoConnected) {
    try {
      const trip = await TripModel.findOneAndUpdate(
        { tripId: tripData.tripId },
        tripData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return trip.toObject();
    } catch (err) {
      console.error('[DB] Error saving trip to Mongo:', err.message);
    }
  }

  // Fallback to memory store
  const existing = memoryStore.trips.get(tripData.tripId) || {};
  const updated = {
    ...existing,
    ...tripData,
    updatedAt: new Date(),
    createdAt: existing.createdAt || new Date(),
  };
  memoryStore.trips.set(tripData.tripId, updated);
  return updated;
}

export async function findTripById(tripId) {
  if (isMongoConnected) {
    try {
      const trip = await TripModel.findOne({ tripId }).lean();
      if (trip) return trip;
    } catch (err) {
      console.error('[DB] Error fetching trip from Mongo:', err.message);
    }
  }

  return memoryStore.trips.get(tripId) || null;
}

export async function listAllTrips() {
  if (isMongoConnected) {
    try {
      return await TripModel.find().sort({ updatedAt: -1 }).limit(50).lean();
    } catch (err) {
      console.error('[DB] Error listing trips from Mongo:', err.message);
    }
  }

  return Array.from(memoryStore.trips.values()).sort(
    (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
  );
}

export async function updateTripPosition(tripId, locationUpdate) {
  const { lat, lng, speed, heading, accuracy, distanceRemainingKm, etaMinutes } = locationUpdate;
  const now = new Date();

  if (isMongoConnected) {
    try {
      const updated = await TripModel.findOneAndUpdate(
        { tripId },
        {
          $set: {
            'currentLocation.lat': lat,
            'currentLocation.lng': lng,
            'currentLocation.speed': speed ?? 0,
            'currentLocation.heading': heading ?? 0,
            'currentLocation.accuracy': accuracy ?? 10,
            'currentLocation.timestamp': now,
            distanceKm: distanceRemainingKm,
            etaMinutes: etaMinutes,
          },
        },
        { new: true }
      ).lean();
      if (updated) return updated;
    } catch (err) {
      console.error('[DB] Error updating position in Mongo:', err.message);
    }
  }

  // Fallback memory store
  const trip = memoryStore.trips.get(tripId);
  if (trip) {
    trip.currentLocation = {
      lat,
      lng,
      speed: speed ?? trip.currentLocation?.speed ?? 0,
      heading: heading ?? trip.currentLocation?.heading ?? 0,
      accuracy: accuracy ?? 10,
      timestamp: now,
    };
    if (distanceRemainingKm !== undefined) trip.distanceKm = distanceRemainingKm;
    if (etaMinutes !== undefined) trip.etaMinutes = etaMinutes;
    trip.updatedAt = now;
    memoryStore.trips.set(tripId, trip);
    return trip;
  }
  return null;
}

export async function setTripStatus(tripId, status) {
  if (isMongoConnected) {
    try {
      return await TripModel.findOneAndUpdate(
        { tripId },
        { $set: { status, updatedAt: new Date() } },
        { new: true }
      ).lean();
    } catch (err) {
      console.error('[DB] Error setting trip status in Mongo:', err.message);
    }
  }

  const trip = memoryStore.trips.get(tripId);
  if (trip) {
    trip.status = status;
    trip.updatedAt = new Date();
    memoryStore.trips.set(tripId, trip);
    return trip;
  }
  return null;
}

/**
 * Location Audit Trail Logging
 */
export async function recordLocationAudit(auditData) {
  const auditRecord = {
    ...auditData,
    timestamp: auditData.timestamp || new Date(),
  };

  if (isMongoConnected) {
    try {
      await LocationAuditModel.create(auditRecord);
      return;
    } catch (err) {
      console.error('[DB] Error writing location audit to Mongo:', err.message);
    }
  }

  // Keep last 1000 pings per trip in memory
  memoryStore.audits.push(auditRecord);
  if (memoryStore.audits.length > 5000) {
    memoryStore.audits.splice(0, 1000);
  }
}

export async function getTripAuditHistory(tripId) {
  if (isMongoConnected) {
    try {
      return await LocationAuditModel.find({ tripId }).sort({ timestamp: 1 }).lean();
    } catch (err) {
      console.error('[DB] Error fetching audit from Mongo:', err.message);
    }
  }

  return memoryStore.audits
    .filter((a) => a.tripId === tripId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}
