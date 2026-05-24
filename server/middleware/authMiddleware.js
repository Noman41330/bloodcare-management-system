import jwt from "jsonwebtoken";
import User from "../models/User.js";

// protect = checks logged-in user token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Authorization header example:
    // Bearer token_here
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    // decoded = token data
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // req.user = logged-in user data
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

// allowRoles = role permission checker
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission",
      });
    }

    next();
  };
};