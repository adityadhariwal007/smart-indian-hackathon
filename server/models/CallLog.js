import mongoose from 'mongoose';

const CallLogSchema = new mongoose.Schema(
  {
    callId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientId: {
      type: String,
      default: 'guest-patient',
    },
    patientName: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
      index: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['initiated', 'ringing', 'accepted', 'completed', 'rejected', 'missed', 'cancelled'],
      default: 'initiated',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    connectedTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    endReason: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const CallLogModel = mongoose.models.CallLog || mongoose.model('CallLog', CallLogSchema);

export default CallLogModel;
