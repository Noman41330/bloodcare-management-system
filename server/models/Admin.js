// mongoose = MongoDB schema/model package
import mongoose from "mongoose";

// Schema = database structure blueprint
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

// Model = MongoDB collection creator
const Admin = mongoose.model("Admin", adminSchema);

export default Admin;