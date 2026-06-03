import Notification from "../models/Notification.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import DonationHistory from "../models/DonationHistory.js";
import Donor from "../models/Donor.js";

// GET DONOR NOTIFICATIONS
// Rule:
// - Pending request shows to matched donors.
// - Accepted request shows only to accepted donor.
// - Completed request stays in history but not as active request.
export const getDonorNotifications = async (req, res) => {
  try {
    const donorId = req.params.donorId;

    const allNotifications = await Notification.find({ donorId })
      .populate("requestId")
      .sort({ createdAt: -1 });

    const notifications = allNotifications.filter((item) => {
      const request = item.requestId;

      if (!request) return false;

      if (request.status === "Pending") {
        return item.status === "Pending" || item.status === "Declined";
      }

      if (request.status === "Accepted") {
        return String(request.acceptedDonor) === String(donorId);
      }

      if (request.status === "Completed") {
        return String(request.acceptedDonor) === String(donorId);
      }

      return true;
    });

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

    if (request.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "This request is already completed",
      });
    }

    // Set request accepted by this donor
    request.status = "Accepted";
    request.acceptedDonor = notification.donorId;
    await request.save();

    // Accepted donor notification
    notification.status = "Accepted";
    notification.isRead = true;
    await notification.save();

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

    const request = await EmergencyRequest.findById(notification.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Blood request not found",
      });
    }

    // If accepted donor declines, reopen request for all matched donors
    if (
      request.status === "Accepted" &&
      String(request.acceptedDonor) === String(notification.donorId)
    ) {
      request.status = "Pending";
      request.acceptedDonor = null;
      await request.save();

      await Notification.updateMany(
        { requestId: request._id },
        { status: "Pending", isRead: false }
      );
    }

    // Current donor declined
    notification.status = "Declined";
    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Request declined",
      notification,
      request,
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
      area: request.area,
      note: note || request.note || request.patientProblem || "",
      source: "Blood Request",
    });

    request.status = "Completed";
    request.acceptedDonor = notification.donorId;
    await request.save();

    notification.status = "Completed";
    notification.isRead = true;
    await notification.save();

    // Hide/remove other donors' notifications for this completed request
    await Notification.deleteMany({
      requestId: request._id,
      donorId: { $ne: notification.donorId },
    });

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