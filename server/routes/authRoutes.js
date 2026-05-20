import express from "express";

import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// Public API = create admin
router.post("/register", registerAdmin);


// Public API = login admin
router.post("/login", loginAdmin);


// Private API = only logged-in admin can access
router.get("/profile", protect, getAdminProfile);


export default router;