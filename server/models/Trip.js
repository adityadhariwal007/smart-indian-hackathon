import mongoose from 'mongoose';

const PointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: '' },
  },
  { _id: false }
);

const CurrentLocationSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number, default: 0 }, // km/h
    heading: { type: Number, default: 0 }, // 0 - 360 degrees
    accuracy: { type: Number, default: 10 }, // meters
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TripSchema = new mongoose.Schema(
  {
    tripId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ambulanceId: {
      type: String,
      required: true,
      index: true,
    },
    vehicleNumber: {
      type: String,
      default: 'DL-01-EMS-108',
    },
    ambulanceType: {
      type: String,
      enum: ['Basic Life Support', 'Advanced Life Support', 'Patient Transport', 'Neonatal Ambulance', 'Cardiac Ambulance'],
      default: 'Advanced Life Support',
    },
    driverName: {
      type: String,
      default: 'Emergency Response Driver',
    },
    driverPhone: {
      type: String,
      default: '+91-98765-43210',
    },
    patientName: {
      type: String,
      default: 'Emergency Patient',
    },
    patientContact: {
      type: String,
      default: '+91-98765-00000',
    },
    status: {
      type: String,
      enum: ['dispatched', 'in_transit', 'arrived', 'completed', 'cancelled'],
      default: 'dispatched',
      index: true,
    },
    startLocation: {
      type: PointSchema,
      required: true,
    },
    destination: {
      type: PointSchema,
      required: true,
    },
    currentLocation: {
      type: CurrentLocationSchema,
      required: true,
    },
    // Array of [lat, lng] coordinates representing the full road path
    route: {
      type: [[Number]],
      default: [],
    },
    distanceKm: {
      type: Number,
      default: 0,
    },
    etaMinutes: {
      type: Number,
      default: 0,
    },
    equipment: {
      type: [String],
      default: ['Oxygen Cylinder', 'Defibrillator', 'Cardiac Monitor', 'IV Kit'],
    },
  },
  {
    timestamps: true,
  }
);

export const TripModel = mongoose.models.Trip || mongoose.model('Trip', TripSchema);
export default TripModel;
