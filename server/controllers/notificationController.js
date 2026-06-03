import Notification from "../models/Notification.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import DonationHistory from "../models/DonationHistory.js";
import Donor from "../models/Donor.js";

// GET DONOR NOTIFICATIONS
export const getDonorNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      donorId: req.params.donorId,
    })
      .populate("requestId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load notifications",
      error: error.message,
    });
  }
};

// ACCEPT REQUEST
export const acceptRequest = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const request = await EmergencyRequest.findById(notification.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    notification.status = "Accepted";
    notification.isRead = true;
    await notification.save();

    request.status = "Accepted";
    request.acceptedDonor = notification.donorId;
    await request.save();

    res.status(200).json({
      success: true,
      message: "Request accepted successfully",
      notification,
      request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to accept request",
      error: error.message,
    });
  }
};

// DECLINE REQUEST
export const declineRequest = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.status = "Declined";
    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Request declined",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to decline request",
      error: error.message,
    });
  }
};

// DONATION SUCCESSFUL
export const donationSuccessfulFromNotification = async (req, res) => {
  try {
    const { note } = req.body;

    const notification = await Notification.findById(
      req.params.notificationId
    ).populate("requestId");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.status !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Only accepted request can be marked successful",
      });
    }

    const request = notification.requestId;

    const donation = await DonationHistory.create({
      donorId: notification.donorId,
      requestId: request._id,
      donationDate: new Date(),
      hospitalName: request.hospital,
      area: request.area || request.hospital,
      note: note || request.note || request.patientProblem || "",
      source: "Blood Request",
    });

    notification.status = "Completed";
    notification.isRead = true;
    await notification.save();

    request.status = "Completed";
    request.acceptedDonor = notification.donorId;
    await request.save();

    await Donor.findByIdAndUpdate(notification.donorId, {
      availability: "Unavailable",
      lastDonationDate: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Donation successful and history updated",
      donation,
      notification,
      request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark donation successful",
      error: error.message,
    });
  }
};