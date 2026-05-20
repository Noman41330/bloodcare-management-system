// mongoose = MongoDB schema/model package
import mongoose from "mongoose";

// Schema = database structure blueprint
const emergencyRequestSchema = new mongoose.Schema(
  {
    // Patient name
    patientName: {
      type: String,
      required: true,
      trim: true,
    },

    // Required blood group
    bloodGroup: {
      type: String,
      required: true,
    },

    // Hospital name/location
    hospital: {
      type: String,
      required: true,
      trim: true,
    },

    // Contact number
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // Urgency level
    urgency: {
      type: String,
      enum: ["Normal", "Urgent", "Critical"],
      default: "Urgent",
    },

    // Extra details
    note: {
      type: String,
      trim: true,
    },

    // Request status
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Model = MongoDB collection creator
const EmergencyRequest = mongoose.model(
  "EmergencyRequest",
  emergencyRequestSchema
);

export default EmergencyRequest;