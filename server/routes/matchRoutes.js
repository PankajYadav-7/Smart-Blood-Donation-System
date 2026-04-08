const express = require("express");
const router  = express.Router();
const Match         = require("../models/Match");
const BloodRequest  = require("../models/BloodRequest");
const DonorProfile  = require("../models/DonorProfile");
const User          = require("../models/User");
const jwt           = require("jsonwebtoken");
const {
  notifyDonorOfRequest,
  notifyRequesterOfAcceptance,
  notifyDonorOfConfirmation,
  notifyRequesterOfNoShow,
} = require("../utils/emailService");

// ── Auth middleware ──────────────────────────────────────────────────────────
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

// ── Blood compatibility ──────────────────────────────────────────────────────
const isCompatible = (donorGroup, donorRh, requestGroup, requestRh) => {
  if (donorRh === "+" && requestRh === "-") return false;
  if (requestGroup === "AB") return true;
  if (donorGroup === "O")    return true;
  return donorGroup === requestGroup;
};

// ─────────────────────────────────────────────────────────────────────────────
// HOSPITAL — Find matching donors for a request
// 📧 EMAIL 1: Each matched donor gets "Someone needs your blood type" email
// ─────────────────────────────────────────────────────────────────────────────
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
        requestId:     request._id,
        donorProfileId: donor._id,
      });

      if (!existingMatch) {
        const match = await Match.create({
          requestId:      request._id,
          donorProfileId: donor._id,
          donorUserId:    donor.userId,
          status:         "Notified",
        });
        matches.push(match);

        // 📧 EMAIL 1 — Notify this donor of the matching request
        const donorUser = await User.findById(donor.userId).select("fullName email");
        if (donorUser) {
          notifyDonorOfRequest({
            donorEmail:   donorUser.email,
            donorName:    donorUser.fullName,
            bloodGroup:   request.bloodGroup,
            rh:           request.rh,
            urgency:      request.urgency      || "Normal",
            hospitalName: request.hospitalName || "the hospital",
            requestId:    request._id,
          });
          // fire-and-forget — no await so API responds instantly
        }
      }
    }

    return res.status(200).json({
      message:     `Found ${compatibleDonors.length} compatible donors`,
      totalMatches: compatibleDonors.length,
      newMatches:   matches.length,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DONOR — Accept or decline a notified match
// 📧 EMAIL 2: If Accepted → patient/requester gets "a donor is ready" email
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:matchId/respond", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    match.status      = status;
    match.respondedAt = new Date();
    if (status === "Accepted") match.contactRevealed = true;
    await match.save();

    // 📧 EMAIL 2 — Tell the requester a donor has accepted
    if (status === "Accepted") {
      const request   = await BloodRequest.findById(match.requestId);
      const donor     = await User.findById(match.donorUserId).select("fullName email");
      const requester = request ? await User.findById(request.userId).select("fullName email") : null;

      if (request && donor && requester) {
        notifyRequesterOfAcceptance({
          requesterEmail: requester.email,
          requesterName:  requester.fullName,
          donorName:      donor.fullName,
          donorEmail:     donor.email,
          bloodGroup:     request.bloodGroup,
          rh:             request.rh,
          hospitalName:   request.hospitalName || "the hospital",
        });
      }
    }

    return res.status(200).json({ message: `Match ${status}`, match });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DONOR — Accept or decline directly from dashboard
// 📧 EMAIL 2: If Accepted → patient/requester gets "a donor is ready" email
// ─────────────────────────────────────────────────────────────────────────────
router.post("/respond-direct", protect, async (req, res) => {
  try {
    const { requestId, status } = req.body;

    const donorProfile = await DonorProfile.findOne({ userId: req.user.userId });
    if (!donorProfile) return res.status(404).json({ message: "Donor profile not found" });

    let match = await Match.findOne({ requestId, donorProfileId: donorProfile._id });

    if (match) {
      match.status      = status;
      match.respondedAt = new Date();
      if (status === "Accepted") match.contactRevealed = true;
      await match.save();
    } else {
      match = await Match.create({
        requestId,
        donorProfileId:  donorProfile._id,
        donorUserId:     req.user.userId,
        status,
        respondedAt:     new Date(),
        contactRevealed: status === "Accepted",
      });
    }

    // 📧 EMAIL 2 — Tell the requester a donor has accepted
    if (status === "Accepted") {
      const request   = await BloodRequest.findById(requestId);
      const donor     = await User.findById(req.user.userId).select("fullName email");
      const requester = request ? await User.findById(request.userId).select("fullName email") : null;

      if (request && donor && requester) {
        notifyRequesterOfAcceptance({
          requesterEmail: requester.email,
          requesterName:  requester.fullName,
          donorName:      donor.fullName,
          donorEmail:     donor.email,
          bloodGroup:     request.bloodGroup,
          rh:             request.rh,
          hospitalName:   request.hospitalName || "the hospital",
        });
      }
    }

    return res.status(200).json({ message: `Request ${status}`, match });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DONOR — Get all compatible OPEN requests with eligibility check
// ─────────────────────────────────────────────────────────────────────────────
router.get("/compatible-requests", protect, async (req, res) => {
  try {
    const donorProfile = await DonorProfile.findOne({ userId: req.user.userId });

    if (!donorProfile) {
      return res.status(200).json({ requests: [], eligibilityStatus: "no_profile" });
    }
    if (!donorProfile.availability) {
      return res.status(200).json({ requests: [], eligibilityStatus: "unavailable" });
    }

    if (donorProfile.lastDonationDate) {
      const nextEligible = new Date(donorProfile.lastDonationDate);
      nextEligible.setDate(nextEligible.getDate() + 56);
      if (new Date() < nextEligible) {
        const daysLeft = Math.ceil((nextEligible - new Date()) / (1000 * 60 * 60 * 24));
        return res.status(200).json({
          requests:        [],
          eligibilityStatus: "cooldown",
          daysLeft,
          nextEligibleDate: nextEligible,
        });
      }
    }

    const openRequests = await BloodRequest.find({ status: "Open" });
    const compatible   = openRequests.filter((r) =>
      isCompatible(donorProfile.bloodGroup, donorProfile.rh, r.bloodGroup, r.rh)
    );

    const withStatus = await Promise.all(
      compatible.map(async (request) => {
        const existing = await Match.findOne({
          requestId:      request._id,
          donorProfileId: donorProfile._id,
        });
        return {
          _id:             existing?._id || null,
          requestId:       request,
          status:          existing?.status || "New",
          matchExists:     !!existing,
          contactRevealed: existing?.contactRevealed || false,
        };
      })
    );

    const pending = withStatus.filter((r) => r.status === "New" || r.status === "Notified");

    return res.status(200).json({ requests: pending, eligibilityStatus: "eligible" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DONOR — Donation count for stats card
// ─────────────────────────────────────────────────────────────────────────────
router.get("/my-history", protect, async (req, res) => {
  try {
    const donorProfile = await DonorProfile.findOne({ userId: req.user.userId });
    if (!donorProfile) return res.status(200).json({ count: 0 });

    const count = await Match.countDocuments({
      donorProfileId: donorProfile._id,
      status:         "Donated",
    });
    return res.status(200).json({ count });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DONOR — Confirmed donation history tab
// ─────────────────────────────────────────────────────────────────────────────
router.get("/my-accepted", protect, async (req, res) => {
  try {
    const donorProfile = await DonorProfile.findOne({ userId: req.user.userId });
    if (!donorProfile) return res.status(200).json({ matches: [] });

    const matches = await Match.find({
      donorProfileId: donorProfile._id,
      status:         "Donated",
    }).populate("requestId").sort({ donationConfirmedAt: -1 });

    return res.status(200).json({ matches });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DONOR — Pending confirmations (only Open requests)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/pending-confirmation", protect, async (req, res) => {
  try {
    const donorProfile = await DonorProfile.findOne({ userId: req.user.userId });
    if (!donorProfile) return res.status(200).json({ matches: [] });

    const matches = await Match.find({
      donorProfileId: donorProfile._id,
      status:         "Accepted",
    }).populate("requestId").sort({ respondedAt: -1 });

    const active = matches.filter((m) => m.requestId && m.requestId.status === "Open");
    return res.status(200).json({ matches: active });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// HOSPITAL/PATIENT — Accepted donors for a request
// ─────────────────────────────────────────────────────────────────────────────
router.get("/accepted-donors/:requestId", protect, async (req, res) => {
  try {
    const matches = await Match.find({
      requestId: req.params.requestId,
      status:    { $in: ["Accepted", "Donated", "NoShow"] },
    })
      .populate("donorUserId",    "fullName email phone")
      .populate("donorProfileId", "bloodGroup rh locationName");

    return res.status(200).json({ matches });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// HOSPITAL/PATIENT — All matches for a request
// ─────────────────────────────────────────────────────────────────────────────
router.get("/request/:requestId", protect, async (req, res) => {
  try {
    const matches = await Match.find({ requestId: req.params.requestId })
      .populate("donorUserId", "fullName email");
    return res.status(200).json({ matches });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATIENT — Confirm donation was received
// 📧 EMAIL 3: Donor gets "your donation was confirmed — you saved a life" email
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:matchId/confirm-donation", protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    match.status              = "Donated";
    match.donationConfirmedAt = new Date();
    match.donationConfirmedBy = "patient";
    await match.save();

    await DonorProfile.findByIdAndUpdate(match.donorProfileId, {
      lastDonationDate: new Date(),
      availability:     false,
    });

    // 📧 EMAIL 3 — Thank the donor and tell them their donation is confirmed
    const request   = await BloodRequest.findById(match.requestId);
    const donorUser = await User.findById(match.donorUserId).select("fullName email");

    if (donorUser && request) {
      notifyDonorOfConfirmation({
        donorEmail:   donorUser.email,
        donorName:    donorUser.fullName,
        bloodGroup:   request.bloodGroup,
        rh:           request.rh,
        hospitalName: request.hospitalName || "the hospital",
        confirmedAt:  match.donationConfirmedAt,
      });
    }

    return res.status(200).json({
      message: "Donation confirmed! Donor profile has been updated automatically.",
      match,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATIENT — Donor did not come
// 📧 EMAIL 4: Patient gets "donor didn't arrive — finding another" email
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:matchId/no-show", protect, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    match.status      = "NoShow";
    match.respondedAt = new Date();
    await match.save();

    // 📧 EMAIL 4 — Tell the requester what happened and what to do next
    const request   = await BloodRequest.findById(match.requestId);
    const requester = request ? await User.findById(request.userId).select("fullName email") : null;

    if (request && requester) {
      notifyRequesterOfNoShow({
        requesterEmail: requester.email,
        requesterName:  requester.fullName,
        bloodGroup:     request.bloodGroup,
        rh:             request.rh,
        hospitalName:   request.hospitalName || "the hospital",
      });
    }

    return res.status(200).json({
      message: "Marked as did not come. We will help find another donor.",
      match,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;