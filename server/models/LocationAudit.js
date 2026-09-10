import mongoose from 'mongoose';

const LocationAuditSchema = new mongoose.Schema(
  {
    tripId: {
      type: String,
      required: true,
      index: true,
    },
    ambulanceId: {
      type: String,
      index: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    speed: {
      type: Number,
      default: 0,
    },
    heading: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 10,
    },
    source: {
      type: String,
      enum: ['device_gps', 'driver_browser', 'simulator', 'iot_webhook', 'unknown'],
      default: 'simulator',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for querying a trip's path history in order
LocationAuditSchema.index({ tripId: 1, timestamp: 1 });

export const LocationAuditModel =
  mongoose.models.LocationAudit || mongoose.model('LocationAudit', LocationAuditSchema);

export default LocationAuditModel;
