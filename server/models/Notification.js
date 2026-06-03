import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      required: true,
    },

    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyRequest",
      required: true,
    },

    title: {
      type: String,
      default: "Emergency Blood Request",
    },

    message: {
      type: String,
      required: true,
    },

    bloodGroup: {
      type: String,
      required: true,
    },

    hospital: {
      type: String,
      required: true,
    },

    area: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined", "Completed"],
      default: "Pending",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema,
  "notifications"
);

export default Notification;