import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "noman41330@gmail.com";
    const password = "12345678";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      existingAdmin.role = "admin";
      existingAdmin.password = await bcrypt.hash(password, 10);
      await existingAdmin.save();

      console.log("Existing user updated as admin");
      process.exit();
    }

    await User.create({
      name: "Noman",
      email,
      password: await bcrypt.hash(password, 10),
      phone: "01703778412",
      district: "Sirajganj",
      role: "admin",
    });

    console.log("Admin created successfully");
    process.exit();
  } catch (error) {
    console.log("Seed admin error:", error.message);
    process.exit(1);
  }
};

seedAdmin();