const express      = require("express");
const router       = express.Router();
const DonorProfile = require("../models/DonorProfile");
const User         = require("../models/User");
const jwt          = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token invalid" });
  }
};

// Save or update donor profile
router.post("/profile", protect, async (req, res) => {
  try {
    const {
      bloodGroup, rh,
      locationLat, locationLng, locationName, radiusKm,
      availability, lastDonationDate,
      phone, gender, dateOfBirth, weight, hasIllness, illnessDetails,
    } = req.body;

    let profile = await DonorProfile.findOne({ userId: req.user.userId });

    if (profile) {
      profile.bloodGroup       = bloodGroup;
      profile.rh               = rh;
      profile.locationLat      = locationLat;
      profile.locationLng      = locationLng;
      profile.locationName     = locationName;
      profile.radiusKm         = radiusKm;
      profile.availability     = availability;
      profile.lastDonationDate = lastDonationDate;
      if (phone          !== undefined) profile.phone          = phone;
      if (gender         !== undefined) profile.gender         = gender;
      if (dateOfBirth    !== undefined) profile.dateOfBirth    = dateOfBirth;
      if (weight         !== undefined) profile.weight         = weight;
      if (hasIllness     !== undefined) profile.hasIllness     = hasIllness;
      if (illnessDetails !== undefined) profile.illnessDetails = illnessDetails;
      await profile.save();
    } else {
      profile = await DonorProfile.create({
        userId:         req.user.userId,
        bloodGroup,     rh,
        locationLat,    locationLng,    locationName,   radiusKm,
        availability,   lastDonationDate,
        phone:          phone          || "",
        gender:         gender         || "male",
        dateOfBirth:    dateOfBirth    || null,
        weight:         weight         || null,
        hasIllness:     hasIllness     || false,
        illnessDetails: illnessDetails || "",
      });
    }

    // Sync phone to User model so emergency emails show correct number
    if (phone !== undefined && phone !== "") {
      await User.findByIdAndUpdate(req.user.userId, { phone });
    }

    return res.status(200).json({ message: "Profile saved successfully", profile });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get donor profile
router.get("/profile", protect, async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({ userId: req.user.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
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
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    profile.availability = availability;
    await profile.save();
    return res.status(200).json({ message: "Availability updated", availability: profile.availability });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;