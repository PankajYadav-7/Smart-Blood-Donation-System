const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const donorRoutes = require("./routes/donorRoutes");
app.use("/api/donor", donorRoutes);

const requestRoutes = require("./routes/requestRoutes");
app.use("/api/requests", requestRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const matchRoutes = require("./routes/matchRoutes");
app.use("/api/matches", matchRoutes);

const patientRoutes = require("./routes/patientRoutes");
app.use("/api/patient", patientRoutes);

app.get("/", (req, res) => {
  res.send("Smart Blood Donation API is running");
});

const PORT = process.env.PORT || 5000;

app.get('/api/stats', async (req, res) => {
  try {
    const User         = require('./models/User');
    const BloodRequest = require('./models/BloodRequest');
    const Match        = require('./models/Match');
    const DonorProfile = require('./models/DonorProfile');

    const [donors, organisations, openRequests] = await Promise.all([
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: { $in: ['hospital', 'ngo'] }, isVerified: true }),
      BloodRequest.countDocuments({ status: 'Open' }),
    ]);

    res.json({ donors, organisations, openRequests });
  } catch (err) {
    res.status(500).json({ donors: 0, organisations: 0, openRequests: 0 });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});