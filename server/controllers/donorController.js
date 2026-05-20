// Model = database structure file
import Donor from "../models/Donor.js";


// REGISTER DONOR
export const registerDonor = async (req, res) => {
  try {
    // req.body = text data from frontend
    const { name, phone, bloodGroup, district, address } = req.body;

    // req.file = uploaded photo from frontend
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Donor photo is required",
      });
    }

    // Donor.create() = save new donor into MongoDB
    const donor = await Donor.create({
      name,
      phone,
      bloodGroup,
      district,
      address,
      photo: `/uploads/${req.file.filename}`,
    });

    res.status(201).json({
      success: true,
      message: "Donor registered successfully",
      donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Donor registration failed",
      error: error.message,
    });
  }
};


// GET ALL DONORS
export const getAllDonors = async (req, res) => {
  try {
    // find() = get data from MongoDB
    // sort({ createdAt: -1 }) = newest donor first
    const donors = await Donor.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donors.length,
      donors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch donors",
      error: error.message,
    });
  }
};


// DELETE DONOR
export const deleteDonor = async (req, res) => {
  try {
    // req.params.id = id from API URL
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    // deleteOne() = remove donor from MongoDB
    await donor.deleteOne();

    res.status(200).json({
      success: true,
      message: "Donor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete donor",
      error: error.message,
    });
  }
};

// =============================
// DONOR DASHBOARD STATS
// =============================

// getDonorStats = dashboard analytics data
export const getDonorStats = async (req, res) => {
  try {
    // Total donors count
    const totalDonors = await Donor.countDocuments();

    // Recent donors = latest 5 donors
    const recentDonors = await Donor.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Blood group statistics
    // aggregate = MongoDB advanced grouping
    const bloodGroupStats = await Donor.aggregate([
      {
        // $group = group donors by bloodGroup
        $group: {
          _id: "$bloodGroup",
          count: { $sum: 1 },
        },
      },
      {
        // $sort = highest count first
        $sort: { count: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      totalDonors,
      recentDonors,
      bloodGroupStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard stats",
      error: error.message,
    });
  }
};


// =============================
// UPDATE DONOR
// =============================
export const updateDonor = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    donor.name = req.body.name || donor.name;
    donor.phone = req.body.phone || donor.phone;
    donor.bloodGroup = req.body.bloodGroup || donor.bloodGroup;
    donor.district = req.body.district || donor.district;
    donor.address = req.body.address || donor.address;
    donor.availability = req.body.availability || donor.availability;

    await donor.save();

    res.status(200).json({
      success: true,
      message: "Donor updated successfully",
      donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update donor",
      error: error.message,
    });
  }
};


// =============================
// TOGGLE DONOR AVAILABILITY
// =============================
export const toggleDonorAvailability = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    donor.availability =
      donor.availability === "Available" ? "Unavailable" : "Available";

    await donor.save();

    res.status(200).json({
      success: true,
      message: "Donor availability updated",
      donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update availability",
      error: error.message,
    });
  }
};