const express          = require("express");
const router           = express.Router();
const EmergencyRequest = require("../models/EmergencyRequest");
const DonorProfile     = require("../models/DonorProfile");
const User             = require("../models/User");
const jwt              = require("jsonwebtoken");
const {
  sendEmergencyDonorAlert,
  sendEmergencyAcceptedNotification,
  sendEmergencyHospitalAlert,
} = require("../utils/emailService");

// ── Helper: generate tracking code ──────────────────────────────────────────
function generateTrackingCode() {
  const year = new Date().getFullYear();
  const num  = Math.floor(1000 + Math.random() * 9000);
  return `EM-${year}-${num}`;
}

// ── Blood compatibility ──────────────────────────────────────────────────────
const isCompatible = (donorGroup, donorRh, requestGroup, requestRh) => {
  if (donorRh === "+" && requestRh === "-") return false;
  if (requestGroup === "AB") return true;
  if (donorGroup === "O")    return true;
  return donorGroup === requestGroup;
};

// ── Optional auth middleware ─────────────────────────────────────────────────
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch { req.user = null; }
  }
  next();
};

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

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/emergency — Submit emergency request (no login required)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", optionalAuth, async (req, res) => {
  try {
    const {
      requesterName, requesterPhone, requesterEmail,
      bloodGroup, rh, unitsRequired,
      hospitalName, location,
      urgencyLevel, patientName, medicalCondition,
    } = req.body;

    if (!requesterName || !requesterPhone || !bloodGroup || !rh || !hospitalName) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Generate unique tracking code
    let trackingCode;
    let isUnique = false;
    while (!isUnique) {
      trackingCode = generateTrackingCode();
      const existing = await EmergencyRequest.findOne({ trackingCode });
      if (!existing) isUnique = true;
    }

    const emergency = await EmergencyRequest.create({
      trackingCode,
      requesterName,
      requesterPhone,
      requesterEmail: requesterEmail || "",
      bloodGroup,
      rh,
      unitsRequired:    Number(unitsRequired) || 1,
      hospitalName,
      location:         location || hospitalName,
      urgencyLevel:     urgencyLevel || "Critical",
      patientName:      patientName || "",
      medicalCondition: medicalCondition || "",
    });

    // ── Notify compatible donors ─────────────────────────────────────────
    const allDonors = await DonorProfile.find({ availability: true });
    const compatible = allDonors.filter(d =>
      isCompatible(d.bloodGroup, d.rh, bloodGroup, rh)
    );

    let donorsNotified = 0;
    for (const donor of compatible) {
      try {
        const donorUser = await User.findById(donor.userId).select("fullName email");
        if (donorUser?.email) {
          sendEmergencyDonorAlert({
            donorEmail:    donorUser.email,
            donorName:     donorUser.fullName,
            bloodGroup,
            rh,
            urgencyLevel:  urgencyLevel || "Critical",
            hospitalName,
            location:      location || hospitalName,
            unitsRequired: Number(unitsRequired) || 1,
            requesterName,
            requesterPhone,
            medicalCondition: medicalCondition || "",
            trackingCode,
            emergencyId:   emergency._id,
          });
          donorsNotified++;
        }
      } catch (err) {
        console.error("Donor notification error:", err.message);
      }
    }

    // ── Notify hospitals ─────────────────────────────────────────────────
    const hospitals = await User.find({ role: "hospital", isVerified: true })
      .select("fullName email");
    let hospitalsNotified = 0;
    for (const hospital of hospitals) {
      if (hospital.email) {
        sendEmergencyHospitalAlert({
          recipientEmail: hospital.email,
          recipientName:  hospital.fullName,
          recipientType:  "Hospital",
          bloodGroup, rh, urgencyLevel: urgencyLevel || "Critical",
          hospitalName, location: location || hospitalName,
          unitsRequired:  Number(unitsRequired) || 1,
          requesterName,  requesterPhone,
          trackingCode,
        });
        hospitalsNotified++;
      }
    }

    // ── Notify NGOs ──────────────────────────────────────────────────────
    const ngos = await User.find({ role: "ngo", isVerified: true })
      .select("fullName email");
    let ngosNotified = 0;
    for (const ngo of ngos) {
      if (ngo.email) {
        sendEmergencyHospitalAlert({
          recipientEmail: ngo.email,
          recipientName:  ngo.fullName,
          recipientType:  "NGO",
          bloodGroup, rh, urgencyLevel: urgencyLevel || "Critical",
          hospitalName, location: location || hospitalName,
          unitsRequired:  Number(unitsRequired) || 1,
          requesterName,  requesterPhone,
          trackingCode,
        });
        ngosNotified++;
      }
    }

    // Update counts
    emergency.donorsNotified    = donorsNotified;
    emergency.hospitalsNotified = hospitalsNotified;
    emergency.ngosNotified      = ngosNotified;
    await emergency.save();

    console.log(`🚨 Emergency ${trackingCode} — Notified: ${donorsNotified} donors, ${hospitalsNotified} hospitals, ${ngosNotified} NGOs`);

    return res.status(201).json({
      message:      "Emergency request submitted successfully",
      trackingCode,
      emergencyId:  emergency._id,
      donorsNotified,
      hospitalsNotified,
      ngosNotified,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/emergency/track/:trackingCode — Track by code (public)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/track/:trackingCode", async (req, res) => {
  try {
    const emergency = await EmergencyRequest.findOne({
      trackingCode: req.params.trackingCode.toUpperCase(),
    });
    if (!emergency) {
      return res.status(404).json({ message: "Emergency request not found" });
    }
    return res.status(200).json({ emergency });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/emergency/active — All active emergencies (for hospital/ngo/donor)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/active", protect, async (req, res) => {
  try {
    const emergencies = await EmergencyRequest.find({ status: "Active" })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.status(200).json({ emergencies });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/emergency/my-accepted — donor's emergency history
// ── MUST be before /:id to avoid route conflict ──────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
router.get("/my-accepted", protect, async (req, res) => {
  try {
    const donorUser = await User.findById(req.user.userId).select("email");
    if (!donorUser) return res.status(404).json({ message: "User not found" });

    const emergencies = await EmergencyRequest.find({
      "acceptedDonors.donorEmail": donorUser.email,
    }).sort({ createdAt: -1 });

    const result = emergencies.map((em) => {
      const myEntry = em.acceptedDonors.find(
        (d) => d.donorEmail === donorUser.email
      );
      return {
        emergencyId:      em._id,
        trackingCode:     em.trackingCode,
        bloodGroup:       em.bloodGroup,
        rh:               em.rh,
        hospitalName:     em.hospitalName,
        urgencyLevel:     em.urgencyLevel,
        requesterName:    em.requesterName,
        medicalCondition: em.medicalCondition,
        status:           em.status,
        createdAt:        em.createdAt,
        donationStatus:   myEntry?.donationStatus  || "Accepted",
        donatedAt:        myEntry?.donatedAt        || null,
        thankYouReceived: myEntry?.thankYouReceived || false,
        thankYouMessage:  myEntry?.thankYouMessage  || "",
        complaintStatus:  myEntry?.complaintStatus  || "none",
        myDonorEntryId:   myEntry?._id,
      };
    });

    return res.status(200).json({ emergencies: result });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/emergency/:id — Get single emergency by ID (for detail page)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const emergency = await EmergencyRequest.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: "Emergency request not found" });
    return res.status(200).json({ emergency });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/emergency/:id/accept — Donor accepts emergency
// ─────────────────────────────────────────────────────────────────────────────
router.post("/:id/accept", protect, async (req, res) => {
  try {
    const emergency = await EmergencyRequest.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ message: "Emergency request not found" });
    }
    if (emergency.status !== "Active") {
      return res.status(400).json({ message: "This emergency request is no longer active" });
    }

    const donorUser    = await User.findById(req.user.userId).select("fullName email phone gender");
    const donorProfile = await DonorProfile.findOne({ userId: req.user.userId });

    const alreadyAccepted = emergency.acceptedDonors.find(
      d => d.donorUserId?.toString() === req.user.userId
    );
    if (alreadyAccepted) {
      return res.status(400).json({ message: "You have already accepted this request" });
    }

    emergency.acceptedDonors.push({
      donorUserId:     req.user.userId,
      donorName:       donorUser.fullName,
      donorEmail:      donorUser.email,
      donorPhone:      donorProfile?.phone || donorUser.phone || "",
      donorBloodGroup: donorProfile ? `${donorProfile.bloodGroup}${donorProfile.rh}` : "",
      acceptedAt:      new Date(),
    });
    await emergency.save();

    if (emergency.requesterEmail) {
      sendEmergencyAcceptedNotification({
        requesterEmail:  emergency.requesterEmail,
        requesterName:   emergency.requesterName,
        donorName:       donorUser.fullName,
        donorPhone:      donorProfile?.phone || donorUser.phone || "",
        donorEmail:      donorUser.email,
        donorBloodGroup: donorProfile ? `${donorProfile.bloodGroup}${donorProfile.rh}` : "",
        donorGender:     donorProfile?.gender || donorUser.gender || "",
        bloodGroup:      emergency.bloodGroup,
        rh:              emergency.rh,
        hospitalName:    emergency.hospitalName,
        trackingCode:    emergency.trackingCode,
      });
    }

    return res.status(200).json({
      message:  "You have accepted this emergency request. The requester has been notified.",
      emergency,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/emergency/:id/fulfill — Mark as fulfilled
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id/fulfill", protect, async (req, res) => {
  try {
    const emergency = await EmergencyRequest.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: "Not found" });
    emergency.status = "Fulfilled";
    await emergency.save();
    return res.status(200).json({ message: "Emergency marked as fulfilled", emergency });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/emergency/:id/mark-donated — donor self-confirms donation
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id/mark-donated", protect, async (req, res) => {
  try {
    const emergency = await EmergencyRequest.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: "Emergency not found" });

    const donorUser = await User.findById(req.user.userId).select("email fullName");

    const donorEntry = emergency.acceptedDonors.find(
      (d) => d.donorEmail === donorUser.email
    );

    if (!donorEntry) {
      return res.status(400).json({ message: "You have not accepted this emergency" });
    }

    if (donorEntry.donationStatus === "Donated") {
      return res.status(400).json({ message: "You have already marked this as donated" });
    }

    donorEntry.donationStatus = "Donated";
    donorEntry.donatedAt      = new Date();
    await emergency.save();

    if (emergency.requesterEmail) {
      const { sendLifeSavedEmail } = require("../utils/emailService");
      sendLifeSavedEmail({
        requesterEmail: emergency.requesterEmail,
        requesterName:  emergency.requesterName,
        donorName:      donorUser.fullName,
        donorEmail:     donorUser.email,
        bloodGroup:     emergency.bloodGroup,
        rh:             emergency.rh,
        hospitalName:   emergency.hospitalName,
        trackingCode:   emergency.trackingCode,
        emergencyId:    emergency._id.toString(),
        donorEntryId:   donorEntry._id.toString(),
      });
    }

    return res.status(200).json({
      message:   "Donation confirmed! Thank you for saving a life.",
      emailSent: !!emergency.requesterEmail,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/emergency/:id/thank-donor/:donorEntryId — requester sends thanks (no login)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/:id/thank-donor/:donorEntryId", async (req, res) => {
  try {
    const { message } = req.body;
    const emergency = await EmergencyRequest.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: "Emergency not found" });

    const donorEntry = emergency.acceptedDonors.id(req.params.donorEntryId);
    if (!donorEntry) return res.status(404).json({ message: "Donor entry not found" });

    donorEntry.thankYouReceived = true;
    donorEntry.thankYouMessage  = message || "Thank you for saving my life!";
    await emergency.save();

    return res.status(200).json({ message: "Thank you sent successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/emergency/:id/report-issue/:donorEntryId — requester reports issue (no login)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/:id/report-issue/:donorEntryId", async (req, res) => {
  try {
    const { complaintText } = req.body;
    if (!complaintText?.trim()) {
      return res.status(400).json({ message: "Please describe the issue" });
    }

    const emergency = await EmergencyRequest.findById(req.params.id);
    if (!emergency) return res.status(404).json({ message: "Emergency not found" });

    const donorEntry = emergency.acceptedDonors.id(req.params.donorEntryId);
    if (!donorEntry) return res.status(404).json({ message: "Donor entry not found" });

    donorEntry.complaintText   = complaintText;
    donorEntry.complaintStatus = "pending";
    await emergency.save();

    return res.status(200).json({ message: "Issue reported. Our team will review it." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;