const express = require("express");
const router = express.Router();
const Match = require("../models/Match");
const BloodRequest = require("../models/BloodRequest");
const DonorProfile = require("../models/DonorProfile");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ── Middleware ──
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

// ── Blood compatibility rules ──
const isCompatible = (donorGroup, donorRh, requestGroup, requestRh) => {
  if (donorRh === "+" && requestRh === "-") return false;
  if (requestGroup === "AB") return true;
  if (donorGroup === "O") return true;
  return donorGroup === requestGroup;
};

// ─────────────────────────────────────────────────────
// HOSPITAL — Find matching donors for a request
// ─────────────────────────────────────────────────────
router.post("/find/:requestId", protect, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const donors = await DonorProfile.find({ availability: true });

    const compatibleDonors = donors.filter((donor) =>
      isCompatible(donor.bloodGroup, donor.rh, request.bloodGroup, request.rh)
    );

    if (compatibleDonors.length === 0) {
      return res.status(200).json({ message: "No compatible donors found", matches: [] });
    }

    const matches = [];
    for (const donor of compatibleDonors) {
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
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────
// DONOR — Accept or decline a notified match
// ─────────────────────────────────────────────────────
router.patch("/:matchId/respond", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    match.status = status;
    match.respondedAt = new Date();
    if (status === "Accepted") match.contactRevealed = true;
    await match.save();

    return res.status(200).json({ message: `Match ${status}`, match });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────
// DONOR — Accept or decline a request directly
// ─────────────────────────────────────────────────────
router.post("/respond-direct", protect, async (req, res) => {
  try {
    const { requestId, status } = req.body;

    const donorProfile = await DonorProfile.findOne({ userId: req.user.userId });
    if (!donorProfile) return res.status(404).json({ message: "Donor profile not found" });

    let match = await Match.findOne({
      requestId,
      donorProfileId: donorProfile._id,
    });

    if (match) {
      match.status = status;
      match.respondedAt = new Date();
      if (status === "Accepted") match.contactRevealed = true;
      await match.save();
    } else {
      match = await Match.create({
        requestId,
        donorProfileId: donorProfile._id,
        donorUserId: req.user.userId,
        status,
        respondedAt: new Date(),
        contactRevealed: status === "Accepted",
      });
    }

    return res.status(200).json({ message: `Request ${status}`, match });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────
// DONOR — Get all compatible OPEN requests
// FIX 1: Returns eligibilityStatus so frontend shows
//         correct message (cooldown / unavailable / eligible)
// FIX 2: Checks 56-day cooldown before showing requests
// ─────────────────────────────────────────────────────
router.get("/compatible-requests", protect, async (req, res) => {
  try {
    const donorProfile = await DonorProfile.findOne({ userId: req.user.userId });

    // No profile set up yet
    if (!donorProfile) {
      return res.status(200).json({
        requests: [],
        eligibilityStatus: "no_profile",
      });
    }

    // Availability is turned off
    if (!donorProfile.availability) {
      return res.status(200).json({
        requests: [],
        eligibilityStatus: "unavailable",
      });
    }

    // ── FIX: Check 56-day cooldown ──
    if (donorProfile.lastDonationDate) {
      const nextEligible = new Date(donorProfile.lastDonationDate);
      nextEligible.setDate(nextEligible.getDate() + 56);
      if (new Date() < nextEligible) {
        const daysLeft = Math.ceil(
          (nextEligible - new Date()) / (1000 * 60 * 60 * 24)
        );
        return res.status(200).json({
          requests: [],
          eligibilityStatus: "cooldown",
          daysLeft,
          nextEligibleDate: nextEligible,
        });
      }
    }

    // Get all open requests and filter compatible
    const openRequests = await BloodRequest.find({ status: "Open" });

    const compatibleRequests = openRequests.filter((request) =>
      isCompatible(
        donorProfile.bloodGroup,
        donorProfile.rh,
        request.bloodGroup,
        request.rh
      )
    );

    const requestsWithStatus = await Promise.all(
      compatibleRequests.map(async (request) => {
        const existingMatch = await Match.findOne({
          requestId: request._id,
          donorProfileId: donorProfile._id,
        });
        return {
          _id:             existingMatch?._id || null,
          requestId:       request,
          status:          existingMatch?.status || "New",
          matchExists:     !!existingMatch,
          contactRevealed: existingMatch?.contactRevealed || false,
        };
      })
    );

    // Only show requests donor has not yet responded to
    const pendingRequests = requestsWithStatus.filter(
      (r) => r.status === "New" || r.status === "Notified"
    );

    return res.status(200).json({
      requests: pendingRequests,
      eligibilityStatus: "eligible",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────
// DONOR — Get donation count (stats card)
// Only counts "Donated" — confirmed by patient
// ─────────────────────────────────────────────────────
router.get("/my-history", protect, async (req, res) => {
  try {
    const donorProfile = await DonorProfile.findOne({ userId: req.user.userId });
    if (!donorProfile) return res.status(200).json({ count: 0 });

    const count = await Match.countDocuments({
      donorProfileId: donorProfile._id,
      status: "Donated",
    });

    return res.status(200).json({ count });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────
// DONOR — Get confirmed donation history tab
// Only shows "Donated" — confirmed by patient
// ─────────────────────────────────────────────────────
router.get("/my-accepted", protect, async (req, res) => {
  try {
    const donorProfile = await DonorProfile.findOne({ userId: req.user.userId });
    if (!donorProfile) return res.status(200).json({ matches: [] });

    const matches = await Match.find({
      donorProfileId: donorProfile._id,
      status: "Donated",
    })
      .populate("requestId")
      .sort({ donationConfirmedAt: -1 });

    return res.status(200).json({ matches });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────
// DONOR — Get pending confirmations for history tab
// FIX: Only shows "Accepted" matches where the parent
//      blood request is still OPEN — not closed ones
// This fixes the bug where closed requests still showed
// in the pending section after hospital marks fulfilled
// ─────────────────────────────────────────────────────
router.get("/pending-confirmation", protect, async (req, res) => {
  try {
    const donorProfile = await DonorProfile.findOne({ userId: req.user.userId });
    if (!donorProfile) return res.status(200).json({ matches: [] });

    const matches = await Match.find({
      donorProfileId: donorProfile._id,
      status: "Accepted",
    })
      .populate("requestId")
      .sort({ respondedAt: -1 });

    // ── FIX: Filter out matches where the blood request is closed ──
    // If the request is closed, remove it from pending list
    const activeMatches = matches.filter(
      (m) => m.requestId && m.requestId.status === "Open"
    );

    return res.status(200).json({ matches: activeMatches });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────
// HOSPITAL/PATIENT — Get accepted donors for a request
// ─────────────────────────────────────────────────────
router.get("/accepted-donors/:requestId", protect, async (req, res) => {
  try {
    const matches = await Match.find({
      requestId: req.params.requestId,
      status: { $in: ["Accepted", "Donated", "NoShow"] },
    })
      .populate("donorUserId", "fullName email phone")
      .populate("donorProfileId", "bloodGroup rh locationName");

    return res.status(200).json({ matches });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────
// HOSPITAL/PATIENT — Get all matches for a request
// ─────────────────────────────────────────────────────
router.get("/request/:requestId", protect, async (req, res) => {
  try {
    const matches = await Match.find({
      requestId: req.params.requestId,
    }).populate("donorUserId", "fullName email");

    return res.status(200).json({ matches });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────
// PATIENT — Confirm donation was received
// FIX: Now auto-updates donor profile:
//      - Sets lastDonationDate = today
//      - Sets availability = false (56-day cooldown starts)
// ─────────────────────────────────────────────────────
router.patch("/:matchId/confirm-donation", protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    // Mark donation as confirmed
    match.status = "Donated";
    match.donationConfirmedAt = new Date();
    match.donationConfirmedBy = "patient";
    await match.save();

    // ── FIX: Auto-update donor profile ──
    // Set lastDonationDate to today → triggers 56-day cooldown
    // Set availability to false → donor removed from matching pool
    await DonorProfile.findByIdAndUpdate(
      match.donorProfileId,
      {
        lastDonationDate: new Date(),
        availability: false,
      }
    );

    return res.status(200).json({
      message: "Donation confirmed! Donor profile has been updated automatically.",
      match,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────
// PATIENT — Report donor did not come
// ─────────────────────────────────────────────────────
router.patch("/:matchId/no-show", protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    match.status = "NoShow";
    match.respondedAt = new Date();
    await match.save();

    return res.status(200).json({
      message: "Marked as did not come. We will help find another donor.",
      match,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;