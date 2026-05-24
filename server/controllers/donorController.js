// Model = database structure file
import Donor from "../models/Donor.js";

// =============================
// GENERATE DONOR ID
// =============================
// First donor: DNR10001
// Next donor: DNR10002, DNR10003...
const generateDonorId = async () => {
  const lastDonor = await Donor.findOne({
    donorId: { $exists: true },
  }).sort({ createdAt: -1 });

  if (!lastDonor || !lastDonor.donorId) {
    return "DNR10001";
  }

  const lastNumber = Number(lastDonor.donorId.replace("DNR", ""));
  return `DNR${lastNumber + 1}`;
};

// =============================
// REGISTER DONOR
// =============================
export const registerDonor = async (req, res) => {
  try {
    const {
      name,
      phone,
      bloodGroup,
      district,
      address,
      religion,
      gender,
      isNewDonor,
      lastDonationDate,
      isAgreed,
    } = req.body;

    // Donor photo validation
    if (!req.files?.photo?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Donor photo is required",
      });
    }

    // NID photo validation
    if (!req.files?.nidPhoto?.[0]) {
      return res.status(400).json({
        success: false,
        message: "NID photo is required",
      });
    }

    // Required field validation
    if (
      !name ||
      !phone ||
      !bloodGroup ||
      !district ||
      !address ||
      !religion ||
      !gender ||
      !isNewDonor
    ) {
      return res.status(400).json({
        success: false,
        message: "All donor fields are required",
      });
    }

    // Consent validation
    if (isAgreed !== "true") {
      return res.status(400).json({
        success: false,
        message: "Donor consent is required",
      });
    }

    // Last donation date required if donor is not new
    if (isNewDonor === "No" && !lastDonationDate) {
      return res.status(400).json({
        success: false,
        message: "Last donation date is required for old donors",
      });
    }

    // Generate donor ID
    const donorId = await generateDonorId();

    // Save donor into MongoDB
    const donor = await Donor.create({
      donorId,
      name,
      phone,
      bloodGroup,
      district,
      address,
      religion,
      gender,
      isNewDonor,
      lastDonationDate: isNewDonor === "No" ? lastDonationDate : null,
      photo: `/uploads/${req.files.photo[0].filename}`,
      nidPhoto: `/uploads/${req.files.nidPhoto[0].filename}`,
      isAgreed: isAgreed === "true",
      availability: "Available",
    });

    res.status(201).json({
      success: true,
      message: `Donor registered successfully. Donor ID: ${donorId}`,
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

// =============================
// GET ALL DONORS
// =============================
export const getAllDonors = async (req, res) => {
  try {
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

// =============================
// DELETE DONOR
// =============================
export const deleteDonor = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

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
export const getDonorStats = async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();

    const recentDonors = await Donor.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const bloodGroupStats = await Donor.aggregate([
      {
        $group: {
          _id: "$bloodGroup",
          count: { $sum: 1 },
        },
      },
    ]);

    const districtStats = await Donor.aggregate([
      {
        $group: {
          _id: "$district",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      totalDonors,
      recentDonors,
      bloodGroupStats,
      districtCount: districtStats.length,
      districtStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load donor stats",
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
    donor.religion = req.body.religion || donor.religion;
    donor.gender = req.body.gender || donor.gender;
    donor.isNewDonor = req.body.isNewDonor || donor.isNewDonor;

    donor.lastDonationDate =
      req.body.isNewDonor === "No"
        ? req.body.lastDonationDate || donor.lastDonationDate
        : donor.lastDonationDate;

    donor.availability = req.body.availability || donor.availability;

    if (req.body.isAgreed !== undefined) {
      donor.isAgreed = req.body.isAgreed === "true";
    }

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

// =============================
// GET SINGLE DONOR PROFILE
// =============================
export const getSingleDonor = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found",
      });
    }

    res.status(200).json({
      success: true,
      donor,
      donationHistory: [],
      requestHistory: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load donor profile",
      error: error.message,
    });
  }
};