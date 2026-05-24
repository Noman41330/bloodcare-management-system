import EmergencyRequest from "../models/EmergencyRequest.js";
import Donor from "../models/Donor.js";

// CREATE EMERGENCY REQUEST
export const createEmergencyRequest = async (req, res) => {
  try {
    // req.body = frontend form data
    const { patientName, bloodGroup, hospital, phone, urgency, note } = req.body;

    if (!patientName || !bloodGroup || !hospital || !phone) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Save emergency request
    const request = await EmergencyRequest.create({
      patientName,
      bloodGroup,
      hospital,
      phone,
      urgency,
      note,
    });

    res.status(201).json({
      success: true,
      message: "Emergency request created successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create emergency request",
      error: error.message,
    });
  }
};

// GET ALL EMERGENCY REQUESTS
export const getEmergencyRequests = async (req, res) => {
  try {
    const requests = await EmergencyRequest.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch emergency requests",
      error: error.message,
    });
  }
};

// GET MATCHING DONORS BY BLOOD GROUP
export const getMatchingDonors = async (req, res) => {
  try {
    // req.params.bloodGroup = blood group from URL
    const { bloodGroup } = req.params;

    const donors = await Donor.find({ bloodGroup }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donors.length,
      donors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to find matching donors",
      error: error.message,
    });
  }
};

// UPDATE REQUEST STATUS
export const updateEmergencyStatus = async (req, res) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Emergency request not found",
      });
    }

    request.status = req.body.status || request.status;

    await request.save();

    res.status(200).json({
      success: true,
      message: "Request status updated",
      request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update request status",
      error: error.message,
    });
  }
};

export const getEmergencyStats = async (req, res) => {
  try {
    const pendingRequests = await EmergencyRequest.countDocuments({
      status: "Pending",
    });

    res.status(200).json({
      success: true,
      pendingRequests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load emergency stats",
      error: error.message,
    });
  }
};