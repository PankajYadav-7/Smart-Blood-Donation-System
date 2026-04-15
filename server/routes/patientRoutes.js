const express      = require("express");
const router       = express.Router();
const PatientProfile = require("../models/PatientProfile");
const jwt          = require("jsonwebtoken");

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

// ── GET patient profile ──────────────────────────────────────────────────────
router.get("/profile", protect, async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.user.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    return res.status(200).json({ profile });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ── POST / UPDATE patient profile ────────────────────────────────────────────
router.post("/profile", protect, async (req, res) => {
  try {
    const {
      gender, dateOfBirth, phone, location,
      bloodGroupNeeded, rhNeeded,
      requestingFor, patientName, medicalCondition, hospitalName,
      emergencyContactName, emergencyContactPhone,
    } = req.body;

    let profile = await PatientProfile.findOne({ userId: req.user.userId });

    if (profile) {
      profile.gender               = gender               || profile.gender;
      profile.dateOfBirth          = dateOfBirth          || profile.dateOfBirth;
      profile.phone                = phone                || profile.phone;
      profile.location             = location             || profile.location;
      profile.bloodGroupNeeded     = bloodGroupNeeded     || profile.bloodGroupNeeded;
      profile.rhNeeded             = rhNeeded             || profile.rhNeeded;
      profile.requestingFor        = requestingFor        || profile.requestingFor;
      profile.patientName          = patientName          !== undefined ? patientName : profile.patientName;
      profile.medicalCondition     = medicalCondition     !== undefined ? medicalCondition : profile.medicalCondition;
      profile.hospitalName         = hospitalName         !== undefined ? hospitalName : profile.hospitalName;
      profile.emergencyContactName  = emergencyContactName  !== undefined ? emergencyContactName  : profile.emergencyContactName;
      profile.emergencyContactPhone = emergencyContactPhone !== undefined ? emergencyContactPhone : profile.emergencyContactPhone;
      await profile.save();
    } else {
      profile = await PatientProfile.create({
        userId: req.user.userId,
        gender, dateOfBirth, phone, location,
        bloodGroupNeeded, rhNeeded,
        requestingFor, patientName, medicalCondition, hospitalName,
        emergencyContactName, emergencyContactPhone,
      });
    }

    return res.status(200).json({ message: "Profile saved successfully", profile });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;