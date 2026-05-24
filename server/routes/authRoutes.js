import express from "express";
import multer from "multer";

import {
  registerUser,
  loginUser,
  getProfile,
  becomeDonor,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// multer storage = photo upload setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Register member/donor
router.post("/register", upload.single("photo"), registerUser);

// Login member/donor/admin
router.post("/login", loginUser);

// Logged-in user profile
router.get("/profile", protect, getProfile);

// Member becomes donor
router.post("/become-donor", protect, upload.single("photo"), becomeDonor);

export default router;