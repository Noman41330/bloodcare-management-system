import User from "../models/User.js";
import Donor from "../models/Donor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// generateToken = create JWT login token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// donor fitness checker
const checkDonorFitness = ({ age, weight, lastDonationMonths, hasMajorIllness }) => {
  if (Number(age) < 18 || Number(age) > 60) {
    return "Donor age must be between 18 and 60";
  }

  if (Number(weight) < 50) {
    return "Donor weight must be at least 50 kg";
  }

  if (Number(lastDonationMonths) < 3) {
    return "Last donation must be at least 3 months ago";
  }

  if (hasMajorIllness === "yes") {
    return "Major illness donor is not eligible";
  }

  return null;
};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      district,
      role,
      bloodGroup,
      address,
      age,
      weight,
      lastDonationMonths,
      hasMajorIllness,
    } = req.body;

    if (!name || !email || !password || !phone || !district) {
      return res.status(400).json({
        success: false,
        message: "Basic fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const selectedRole = role === "donor" ? "donor" : "member";

    if (selectedRole === "donor") {
      if (!bloodGroup || !address || !req.file) {
        return res.status(400).json({
          success: false,
          message: "Donor fields and photo are required",
        });
      }

      const fitnessError = checkDonorFitness({
        age,
        weight,
        lastDonationMonths,
        hasMajorIllness,
      });

      if (fitnessError) {
        return res.status(400).json({
          success: false,
          message: fitnessError,
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      district,
      role: selectedRole,
    });

    if (selectedRole === "donor") {
      await Donor.create({
        userId: user._id,
        name,
        phone,
        bloodGroup,
        district,
        address,
        photo: `/uploads/${req.file.filename}`,
        availability: "Available",
      });
    }

    res.status(201).json({
      success: true,
      message:
        selectedRole === "donor"
          ? "Donor account registered successfully"
          : "Member account registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        district: user.district,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        district: user.district,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// GET PROFILE
export const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// BECOME DONOR
export const becomeDonor = async (req, res) => {
  try {
    const user = req.user;

    if (user.role === "donor") {
      return res.status(400).json({
        success: false,
        message: "You are already a donor",
      });
    }

    const {
      bloodGroup,
      address,
      age,
      weight,
      lastDonationMonths,
      hasMajorIllness,
    } = req.body;

    if (!bloodGroup || !address || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Blood group, address and photo are required",
      });
    }

    const fitnessError = checkDonorFitness({
      age,
      weight,
      lastDonationMonths,
      hasMajorIllness,
    });

    if (fitnessError) {
      return res.status(400).json({
        success: false,
        message: fitnessError,
      });
    }

    const donor = await Donor.create({
      userId: user._id,
      name: user.name,
      phone: user.phone,
      bloodGroup,
      district: user.district,
      address,
      photo: `/uploads/${req.file.filename}`,
      availability: "Available",
    });

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { role: "donor" },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "You are now registered as a donor",
      user: updatedUser,
      donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to become donor",
      error: error.message,
    });
  }
};