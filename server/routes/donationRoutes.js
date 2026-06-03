import express from "express";

import {
  addManualDonation,
  getDonorDonationHistory,
  donationSuccessful,
} from "../controllers/donationController.js";

const router = express.Router();

// POST = manually add donation history
router.post("/manual", addManualDonation);

// GET = get all donation history of one donor
router.get("/donor/:donorId", getDonorDonationHistory);

// POST = mark donation successful from blood request
router.post("/successful", donationSuccessful);

export default router;