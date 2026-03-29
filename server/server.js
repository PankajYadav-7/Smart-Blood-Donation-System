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

app.get("/", (req, res) => {
  res.send("Smart Blood Donation API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});