const express = require("express");
const router = express.Router();
const Match = require("../models/Match");
const BloodRequest = require("../models/BloodRequest");
const DonorProfile = require("../models/DonorProfile");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Middleware
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

// Blood compatibility rules
const isCompatible = (donorGroup, donorRh, requestGroup, requestRh) => {
  if (donorRh === "+" && requestRh === "-") return false;
  if (requestGroup === "AB") return true;
  if (donorGroup === "O") return true;
  return donorGroup === requestGroup;
};

// Find matching donors for a request
router.post("/find/:requestId", protect, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Find available donors
    const donors = await DonorProfile.find({
      availability: true,
    });

    // Filter compatible donors
    const compatibleDonors = donors.filter((donor) =>
      isCompatible(
        donor.bloodGroup,
        donor.rh,
        request.bloodGroup,
        request.rh
      )
    );

    if (compatibleDonors.length === 0) {
      return res.status(200).json({
        message: "No compatible donors found",
        matches: [],
      });
    }

    // Create match records
    const matches = [];
    for (const donor of compatibleDonors) {
      // Check if match already exists
      const existingMatch = await Match.findOne({
        requestId: request._id,
        donorProfileId: donor._id,
      });

      if (!existingMatch) {
        const match = await Match.create({
          requestId: request._id,
          donorProfileId: donor._id,
          donorUserId: donor.userId,
          status: "Notified",
        });
        matches.push(match);
      }
    }

    return res.status(200).json({
      message: `Found ${compatibleDonors.length} compatible donors`,
      totalMatches: compatibleDonors.length,
      newMatches: matches.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Donor accepts or declines match
router.patch("/:matchId/respond", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    match.status = status;
    match.respondedAt = new Date();

    if (status === "Accepted") {
      match.contactRevealed = true;
    }

    await match.save();

    return res.status(200).json({
      message: `Match ${status}`,
      match,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Get matches for a donor
router.get("/my-matches", protect, async (req, res) => {
  try {
    const donorProfile = await DonorProfile.findOne({
      userId: req.user.userId,
    });

    if (!donorProfile) {
      return res.status(404).json({ message: "Donor profile not found" });
    }

    const matches = await Match.find({
      donorProfileId: donorProfile._id,
      status: "Notified",
    }).populate("requestId");

    return res.status(200).json({ matches });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Get matches for a request
router.get("/request/:requestId", protect, async (req, res) => {
  try {
    const matches = await Match.find({
      requestId: req.params.requestId,
    }).populate("donorUserId", "fullName email");

    return res.status(200).json({ matches });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;