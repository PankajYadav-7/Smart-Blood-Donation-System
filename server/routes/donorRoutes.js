const express = require("express");
const router = express.Router();
const DonorProfile = require("../models/DonorProfile");
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

// Save or update donor profile
router.post("/profile", protect, async (req, res) => {
  try {
    const {
      bloodGroup,
      rh,
      locationLat,
      locationLng,
      locationName,
      radiusKm,
      availability,
      lastDonationDate,
    } = req.body;

    let profile = await DonorProfile.findOne({ userId: req.user.userId });

    if (profile) {
      // Update existing profile
      profile.bloodGroup = bloodGroup;
      profile.rh = rh;
      profile.locationLat = locationLat;
      profile.locationLng = locationLng;
      profile.locationName = locationName;
      profile.radiusKm = radiusKm;
      profile.availability = availability;
      profile.lastDonationDate = lastDonationDate;
      await profile.save();
    } else {
      // Create new profile
      profile = await DonorProfile.create({
        userId: req.user.userId,
        bloodGroup,
        rh,
        locationLat,
        locationLng,
        locationName,
        radiusKm,
        availability,
        lastDonationDate,
      });
    }

    return res.status(200).json({
      message: "Profile saved successfully",
      profile,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get donor profile
router.get("/profile", protect, async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    return res.status(200).json({ profile });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Toggle availability
router.patch("/availability", protect, async (req, res) => {
  try {
    const { availability } = req.body;
    const profile = await DonorProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    profile.availability = availability;
    await profile.save();
    return res.status(200).json({
      message: "Availability updated",
      availability: profile.availability,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;