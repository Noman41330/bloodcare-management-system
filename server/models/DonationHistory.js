import mongoose from "mongoose";

// DonationHistory = stores every successful blood donation record
const donationHistorySchema = new mongoose.Schema(
  {
    // donorId = which donor donated blood
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      required: true,
    },

    // requestId = if donation came from emergency request
    // null means manual donation update
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyRequest",
      default: null,
    },

    // donationDate = actual blood donation date
    donationDate: {
      type: Date,
      required: true,
    },

    // hospitalName = where donation happened
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },

    // area = hospital/location area
    area: {
      type: String,
      required: true,
      trim: true,
    },

    // note = optional comment
    note: {
      type: String,
      default: "",
      trim: true,
    },

    // source = manual entry or from blood request
    source: {
      type: String,
      enum: ["Manual", "Blood Request"],
      default: "Manual",
    },
  },
  { timestamps: true }
);

// Third parameter forces exact collection name: donationHistories
const DonationHistory = mongoose.model(
  "DonationHistory",
  donationHistorySchema,
  "donationHistories"
);

export default DonationHistory;