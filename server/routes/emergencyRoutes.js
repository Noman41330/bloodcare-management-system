import express from "express";

import {
  createEmergencyRequest,
  getEmergencyRequests,
  getMatchingDonors,
  updateEmergencyStatus,
} from "../controllers/emergencyController.js";

const router = express.Router();

// POST = create emergency request
router.post("/", createEmergencyRequest);

// GET = get all emergency requests
router.get("/", getEmergencyRequests);

// GET = find matching donors
router.get("/match/:bloodGroup", getMatchingDonors);

// PATCH = update status
router.patch("/:id/status", updateEmergencyStatus);

export default router;