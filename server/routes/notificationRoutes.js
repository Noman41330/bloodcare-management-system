import express from "express";

import {
  getDonorNotifications,
  acceptRequest,
  declineRequest,
  donationSuccessfulFromNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/donor/:donorId", getDonorNotifications);

router.patch("/:notificationId/accept", acceptRequest);

router.patch("/:notificationId/decline", declineRequest);

router.post("/:notificationId/successful", donationSuccessfulFromNotification);

export default router;