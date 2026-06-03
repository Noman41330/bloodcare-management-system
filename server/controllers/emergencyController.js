import EmergencyRequest from "../models/EmergencyRequest.js";
import Donor from "../models/Donor.js";
import Notification from "../models/Notification.js";

// CREATE EMERGENCY REQUEST
export const createEmergencyRequest = async (req, res) => {
  try {
    const {
      patientName,
      patientProblem,
      bloodGroup,
      hospital,
      area,
      phone,
      urgency,
      note,
    } = req.body;

    if (!patientName || !patientProblem || !bloodGroup || !hospital || !area || !phone) {
      return res.status(400).json({
        success: false,
        message: "Patient name, problem, blood group, hospital, area and phone are required",
      });
    }

    const request = await EmergencyRequest.create({
      patientName,
      patientProblem,
      bloodGroup,
      hospital,
      area,
      phone,
      urgency,
      note,
    });

    const matchedDonors = await Donor.find({
      bloodGroup,
      availability: "Available",
    });

    const notifications = await Promise.all(
      matchedDonors.map((donor) =>
        Notification.create({
          donorId: donor._id,
          requestId: request._id,
          title: "Emergency Blood Request",
          message: `${patientName} needs ${bloodGroup} blood at ${hospital}, ${area}. Problem: ${patientProblem}`,
          bloodGroup,
          hospital,
          area,
          status: "Pending",
        })
      )
    );

    res.status(201).json({
      success: true,
      message: "Emergency request created and donors notified",
      request,
      matchedDonors: matchedDonors.length,
      notifications,
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
    const requests = await EmergencyRequest.find()
      .populate("acceptedDonor")
      .sort({ createdAt: -1 });

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

// GET MATCHING DONORS
export const getMatchingDonors = async (req, res) => {
  try {
    const { bloodGroup } = req.params;

    const donors = await Donor.find({
      bloodGroup,
      availability: "Available",
    }).sort({ createdAt: -1 });

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

// EMERGENCY STATS
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