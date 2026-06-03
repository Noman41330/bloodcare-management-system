// Import packages
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";



// Import routes
import donorRoutes from "./routes/donorRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


// dotenv.config()
// loads .env variables
dotenv.config();


// express() = create backend app
const app = express();


// Middleware
app.use(cors());

// express.json()
// reads JSON data
app.use(express.json());


// Static folder
//
// Makes uploads public
//
// Example:
// http://localhost:5000/uploads/image.jpg
app.use(

  "/uploads",

  express.static("uploads")
);


// Test API
app.get("/", (req, res) => {

  res.send("MERN Backend Running");
});


// Base donor API
//
// Final route:
// /api/donors/register
app.use(

  "/api/donors",

  donorRoutes
);

app.use("/api/auth", authRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/notifications", notificationRoutes);


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {

    console.log("MongoDB Connected");
  })

  .catch((err) => {

    console.log(err);
  });


// PORT = server running port
const PORT = process.env.PORT || 5000;


// Start backend server
app.listen(PORT, () => {

  console.log(

    `Server running on port ${PORT}`
  );
});