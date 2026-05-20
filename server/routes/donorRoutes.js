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

    // ── Auto-award any missing certificates based on current donation count ──
    // This handles donors who had donations before the certificate system was added
    try {
      const Match            = require("../models/Match");
      const EmergencyRequest = require("../models/EmergencyRequest");
      const donorUser        = await User.findById(req.user.userId).select("email");

      const regularCount = await Match.countDocuments({
        donorUserId: req.user.userId,
        status:      "Donated",
      });
      const emergencyCount = await EmergencyRequest.countDocuments({
        "acceptedDonors": {
          $elemMatch: {
            donorEmail:     donorUser?.email,
            donationStatus: "Donated",
          },
        },
      });
      const totalCount = regularCount + emergencyCount;

      if (totalCount > 0) {
        const { checkAndAwardCertificates } = require("../utils/certificateService");
        await checkAndAwardCertificates(req.user.userId, totalCount);
      }
    } catch (certErr) {
      console.error("Auto-award certificate error:", certErr.message);
    }

    // Re-fetch profile to include any newly awarded certificates
    const updatedProfile = await DonorProfile.findOne({ userId: req.user.userId });
    return res.status(200).json({ profile: updatedProfile });
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

// ── Public donor search — safe fields only, consent-first privacy ──────────
router.get("/search", async (req, res) => {
  try {
    const { bloodGroup, rh, location, availability } = req.query;

    // Build filter using correct boolean type
    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (rh)         filter.rh         = rh;
    if (availability === "available") filter.availability = true;

    const profiles = await DonorProfile.find(filter)
      .select("userId bloodGroup rh locationName availability lastDonationDate certificatesEarned")
      .sort({ createdAt: -1 })
      .limit(50);

    // Enrich with name (first name + last initial only) and donation count
    const Match = require("../models/Match");

    const enriched = await Promise.all(profiles.map(async (p) => {
      const user = await User.findById(p.userId).select("fullName");

      // Privacy — show first name + last initial only e.g. "Pankaj Y."
      const fullName  = user?.fullName || "Anonymous";
      const parts     = fullName.trim().split(" ");
      const safeName  = parts.length > 1
        ? `${parts[0]} ${parts[parts.length - 1][0]}.`
        : parts[0];

      // Count confirmed donations
      const donationCount = await Match.countDocuments({
        donorUserId: p.userId,
        status:      "Donated",
      });

      // Get highest certificate level
      const certLevel = p.certificatesEarned?.length > 0
        ? p.certificatesEarned[p.certificatesEarned.length - 1].level
        : null;

      return {
        _id:              p._id,
        name:             safeName,
        bloodGroup:       p.bloodGroup,
        rh:               p.rh,
        locationName:     p.locationName || "Nepal",
        availability:     p.availability,
        donationCount,
        lastDonationDate: p.lastDonationDate,
        certLevel,
      };
    }));

    // Filter by location name if provided
    const result = location
      ? enriched.filter(d =>
          d.locationName?.toLowerCase().includes(location.toLowerCase())
        )
      : enriched;

    return res.status(200).json({ donors: result, total: result.length });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;