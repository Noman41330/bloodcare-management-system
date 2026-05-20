// Admin model = admin database structure
import Admin from "../models/Admin.js";

// bcryptjs = password encryption/checking package
import bcrypt from "bcryptjs";

// jsonwebtoken = creates login token
import jwt from "jsonwebtoken";


// =============================
// TOKEN GENERATOR
// =============================

// JWT token = secure login key
const generateToken = (adminId) => {
  return jwt.sign(
    // payload = data stored inside token
    { id: adminId },

    // secret key from .env
    process.env.JWT_SECRET,

    // token expiry time
    { expiresIn: "7d" }
  );
};


// =============================
// REGISTER ADMIN
// =============================
export const registerAdmin = async (req, res) => {
  try {
    // req.body = frontend form data
    const { name, email, password } = req.body;

    // Validation = check empty fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check duplicate admin by email
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    // bcrypt.hash = encrypt password before database save
    const hashedPassword = await bcrypt.hash(password, 10);

    // Admin.create = save admin into MongoDB
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    // Success response
    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.log("REGISTER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


// =============================
// LOGIN ADMIN
// =============================
export const loginAdmin = async (req, res) => {
  try {
    // Get login data
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // bcrypt.compare = compare typed password with encrypted password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create JWT token after successful login
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};


// =============================
// GET ADMIN PROFILE
// =============================

// Protected API controller
// req.admin comes from authMiddleware.js
export const getAdminProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    admin: req.admin,
  });
};