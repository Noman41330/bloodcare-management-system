import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// protect = middleware for private/protected APIs
export const protect = async (req, res, next) => {
  try {
    let token;

    // Authorization header example:
    // Bearer eyJhbGciOiJIUzI1...
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // split(" ")[1] = take only token after Bearer
      token = req.headers.authorization.split(" ")[1];
    }

    // If token missing, block request
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    // verify = check token is valid or not
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach logged-in admin data to req
    req.admin = await Admin.findById(decoded.id).select("-password");

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};