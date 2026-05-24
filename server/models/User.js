import mongoose from "mongoose";

// User = login account for admin/member/donor
const userSchema = new mongoose.Schema(
  {
    // name = user's full name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // email = login email
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // password = encrypted password
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // phone = user contact number
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // district = user location
    district: {
      type: String,
      required: true,
      trim: true,
    },

    // role:
    // admin = full control
    // member = can request blood only
    // donor = member + donor profile
    role: {
      type: String,
      enum: ["admin", "member", "donor"],
      default: "member",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;