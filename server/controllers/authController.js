import User from "../models/User.js";
import Donor from "../models/Donor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

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
      religion,
      gender,
      isNewDonor,
      lastDonationDate,
      isAgreed,
    } = req.body;

    if (!name || !email || !password || !phone || !district) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, phone and district are required",
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
      if (
        !bloodGroup ||
        !address ||
        !religion ||
        !gender ||
        !isNewDonor ||
        !req.files?.photo?.[0] ||
        !req.files?.nidPhoto?.[0]
      ) {
        return res.status(400).json({
          success: false,
          message: "All donor fields, donor photo and NID photo are required",
        });
      }

      if (isAgreed !== "true") {
        return res.status(400).json({
          success: false,
          message: "Donor consent is required",
        });
      }

      if (isNewDonor === "No" && !lastDonationDate) {
        return res.status(400).json({
          success: false,
          message: "Last donation date is required",
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
      photo: req.files?.profilePhoto?.[0]
        ? `/uploads/${req.files.profilePhoto[0].filename}`
        : "",
    });

    let donor = null;

    if (selectedRole === "donor") {
      const donorId = await generateDonorId();

      donor = await Donor.create({
        donorId,
        userId: user._id,
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
        photo: user.photo,
        role: user.role,
      },
      donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

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
        photo: user.photo,
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

export const getProfile = async (req, res) => {
  const donor = await Donor.findOne({ userId: req.user._id });

  res.status(200).json({
    success: true,
    user: req.user,
    donor,
  });
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.district = req.body.district || user.district;

    if (req.file) {
      user.photo = `/uploads/${req.file.filename}`;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Password change failed",
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset token generated",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Forgot password failed",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: error.message,
    });
  }
};

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
      religion,
      gender,
      isNewDonor,
      lastDonationDate,
      isAgreed,
    } = req.body;

    if (
      !bloodGroup ||
      !address ||
      !religion ||
      !gender ||
      !isNewDonor ||
      !req.files?.photo?.[0] ||
      !req.files?.nidPhoto?.[0]
    ) {
      return res.status(400).json({
        success: false,
        message: "All donor fields, donor photo and NID photo are required",
      });
    }

    if (isAgreed !== "true") {
      return res.status(400).json({
        success: false,
        message: "Donor consent is required",
      });
    }

    if (isNewDonor === "No" && !lastDonationDate) {
      return res.status(400).json({
        success: false,
        message: "Last donation date is required",
      });
    }

    const donorId = await generateDonorId();

    const donor = await Donor.create({
      donorId,
      userId: user._id,
      name: req.body.name || user.name,
      phone: req.body.phone || user.phone,
      bloodGroup,
      district: req.body.district || user.district,
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

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        role: "donor",
        name: req.body.name || user.name,
        phone: req.body.phone || user.phone,
        district: req.body.district || user.district,
      },
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