import express from "express";
import multer from "multer";

import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  becomeDonor,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

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

router.post(
  "/register",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "nidPhoto", maxCount: 1 },
  ]),
  registerUser
);

router.post("/login", loginUser);

router.get("/profile", protect, getProfile);

router.put("/profile", protect, upload.single("profilePhoto"), updateProfile);

router.put("/change-password", protect, changePassword);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.post(
  "/become-donor",
  protect,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "nidPhoto", maxCount: 1 },
  ]),
  becomeDonor
);

export default router;