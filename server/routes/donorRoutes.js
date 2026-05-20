// express = backend routing framework
import express from "express";

// multer = file upload middleware
import multer from "multer";

import {
  registerDonor,
  getAllDonors,
  deleteDonor,
  getDonorStats,
} from "../controllers/donorController.js";


const router = express.Router();


// diskStorage = save uploaded photo inside local folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});


// upload = middleware for image upload
const upload = multer({ storage });


// POST API = create donor
router.post("/register", upload.single("photo"), registerDonor);


// GET API = get all donors
router.get("/", getAllDonors);

// GET dashboard stats
router.get("/stats", getDonorStats);

// DELETE API = delete donor by id
router.delete("/:id", deleteDonor);


export default router;