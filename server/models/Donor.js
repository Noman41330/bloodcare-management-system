import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
  {
    // Auto generated donor ID: DNR10001, DNR10002...
    donorId: {
      type: String,
      unique: true,
      trim: true,
    },

    // If donor is connected with a user account
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Basic donor information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    // Extra donor details
    religion: {
      type: String,
      required: true,
      enum: ["Islam", "Hindu", "Christian", "Buddhist", "Others"],
    },

    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },

    // Donation status
    isNewDonor: {
      type: String,
      required: true,
      enum: ["Yes", "No"],
      default: "Yes",
    },

    // Required only if isNewDonor = No
    lastDonationDate: {
      type: Date,
      default: null,
    },

    // Donor profile photo
    photo: {
      type: String,
      required: true,
    },

    // NID photo attachment
    nidPhoto: {
      type: String,
      required: true,
    },

    // Consent checkbox
    isAgreed: {
      type: Boolean,
      required: true,
      default: false,
    },

    // Current availability
    availability: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available",
    },
  },
  { timestamps: true }
);

const Donor = mongoose.model("Donor", donorSchema);

export default Donor;