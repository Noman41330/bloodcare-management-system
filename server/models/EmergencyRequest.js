import mongoose from "mongoose";

const emergencyRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true,
    },

    patientProblem: {
      type: String,
      required: true,
      trim: true,
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },

    hospital: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    urgency: {
      type: String,
      enum: ["Normal", "Urgent", "Critical"],
      default: "Urgent",
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Completed", "Declined"],
      default: "Pending",
    },

    acceptedDonor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      default: null,
    },
  },
  { timestamps: true }
);

const EmergencyRequest = mongoose.model(
  "EmergencyRequest",
  emergencyRequestSchema,
  "bloodRequests"
);

export default EmergencyRequest;