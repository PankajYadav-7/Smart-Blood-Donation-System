const express = require("express");
const router = express.Router();
const BloodRequest = require("../models/BloodRequest");
const jwt = require("jsonwebtoken");

// Middleware to check login
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

// Create blood request
router.post("/", protect, async (req, res) => {
  try {
    const {
      bloodGroup,
      rh,
      unitsRequired,
      urgency,
      hospitalName,
      hospitalLat,
      hospitalLng,
      notes,
    } = req.body;

    if (!bloodGroup || !rh || !unitsRequired || !hospitalName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const request = await BloodRequest.create({
      createdByUserId: req.user.userId,
      bloodGroup,
      rh,
      unitsRequired,
      urgency,
      hospitalName,
      hospitalLat,
      hospitalLng,
      notes,
      status: "Open",
    });

    return res.status(201).json({
      message: "Blood request created successfully",
      request,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all open requests
router.get("/", protect, async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: "Open" })
      .sort({ createdAt: -1 });
    return res.status(200).json({ requests });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get my requests
router.get("/my", protect, async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      createdByUserId: req.user.userId,
    }).sort({ createdAt: -1 });
    return res.status(200).json({ requests });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Close a request
router.patch("/:id/close", protect, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    request.status = "Closed";
    request.closedAt = new Date();
    await request.save();
    return res.status(200).json({ message: "Request closed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;