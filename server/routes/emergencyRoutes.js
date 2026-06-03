import express from "express";

import {
  createEmergencyRequest,
  getEmergencyRequests,
  getMatchingDonors,
  updateEmergencyStatus,
  getEmergencyStats,
} from "../controllers/emergencyController.js";

const router = express.Router();

router.post("/", createEmergencyRequest);

router.get("/", getEmergencyRequests);

router.get("/stats", getEmergencyStats);

router.get("/match/:bloodGroup", getMatchingDonors);

router.patch("/:id/status", updateEmergencyStatus);

export default router;