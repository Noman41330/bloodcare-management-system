import DonationHistory from "../models/DonationHistory.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import Donor from "../models/Donor.js";

// =============================
// ADD MANUAL DONATION HISTORY
// =============================
export const addManualDonation = async (req, res) => {
  try {
    const { donorId, donationDate, hospitalName, area, note } = req.body;

    // required validation
    if (!donorId || !donationDate || !hospitalName || !area) {
      return res.status(400).json({
        success: false,
        message: "Donation date, hospital name and area are required",
      });
    }

    // save manual donation history
    const donation = await DonationHistory.create({
      donorId,
      donationDate,
      hospitalName,
      area,
      note,
      source: "Manual",
    });

          await Donor.findByIdAndUpdate(donorId, {
        lastDonationDate: donationDate,
        availability: "Unavailable",
      });

    res.status(201).json({
      success: true,
      message: "Donation history added successfully",
      donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add donation history",
      error: error.message,
    });
  }
};

// =============================
// GET DONATION HISTORY BY DONOR
// =============================
export const getDonorDonationHistory = async (req, res) => {
  try {
    const { donorId } = req.params;

    // newest donation first
    const histories = await DonationHistory.find({ donorId })
      .sort({ donationDate: -1 });

    res.status(200).json({
      success: true,
      count: histories.length,
      histories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load donation history",
      error: error.message,
    });
  }
};

// =============================
// DONATION SUCCESSFUL FROM REQUEST
// =============================
export const donationSuccessful = async (req, res) => {
  try {
    const { requestId, donorId, note } = req.body;

    if (!requestId || !donorId) {
      return res.status(400).json({
        success: false,
        message: "Request ID and Donor ID are required",
      });
    }

    // find blood request
    const request = await EmergencyRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    // create donation history from request information
    const donation = await DonationHistory.create({
      donorId,
      requestId,
      donationDate: new Date(),
      hospitalName: request.hospital,
      area: request.area,
      note: note || request.note || "",
      source: "Blood Request",
    });

    // mark request completed
    request.status = "Completed";
    request.acceptedDonor = donorId;
    await request.save();

    res.status(201).json({
      success: true,
      message: "Donation marked successful and added to history",
      donation,
      request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to complete donation",
      error: error.message,
    });
  }
};