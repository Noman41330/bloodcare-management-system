// express = backend routing framework
import express from "express";

// multer = file upload middleware
import multer from "multer";

import {
  registerDonor,
  getAllDonors,
  deleteDonor,
  getDonorStats,
  updateDonor,
  toggleDonorAvailability,
  getSingleDonor,
} from "../controllers/donorController.js";

const router = express.Router();

// diskStorage = save uploaded files inside local uploads folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// upload = middleware for image/file upload
const upload = multer({ storage });

// =============================
// ROUTES
// =============================

// POST = create donor
// photo = donor profile photo
// nidPhoto = donor NID photo
router.post(
  "/register",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "nidPhoto", maxCount: 1 },
  ]),
  registerDonor
);

// GET = get dashboard stats
// IMPORTANT: keep this before "/:id"
router.get("/stats", getDonorStats);

// GET = get all donors
router.get("/", getAllDonors);

// GET = get single donor profile
router.get("/:id", getSingleDonor);

// PUT = update donor
router.put("/:id", updateDonor);

// PATCH = toggle donor availability
router.patch("/:id/availability", toggleDonorAvailability);

// DELETE = delete donor by id
router.delete("/:id", deleteDonor);

export default router;