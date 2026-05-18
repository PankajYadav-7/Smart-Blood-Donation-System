const express = require("express");
const router  = express.Router();
const User    = require("../models/User");
const jwt     = require("jsonwebtoken");

// ── Middleware ────────────────────────────────────────────────────────────────
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

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access only" });
  next();
};

// ── GET all users ─────────────────────────────────────────────────────────────
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ── PATCH suspend / activate user ────────────────────────────────────────────
router.patch("/users/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-passwordHash");
    return res.status(200).json({ message: "User status updated", user });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ── PATCH approve organisation ────────────────────────────────────────────────
router.patch("/users/:userId/verify", protect, adminOnly, async (req, res) => {
  try {
    const { verified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isVerified: verified },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    // Send approval email when verified = true
    if (verified && (user.role === "hospital" || user.role === "ngo")) {
      try {
        const { sendOrgApprovedEmail } = require("../utils/emailService");
        sendOrgApprovedEmail({
          orgEmail: user.email,
          orgName:  user.fullName,
          orgRole:  user.role,
        });
      } catch (emailErr) {
        console.error("Approval email error:", emailErr.message);
      }
    }

    return res.status(200).json({
      message: verified ? "Organisation approved — email sent" : "Verification removed",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ── PATCH reject organisation ─────────────────────────────────────────────────
router.patch("/users/:userId/reject", protect, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status: "suspended", isVerified: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    // Send rejection email with reason
    if (user.role === "hospital" || user.role === "ngo") {
      try {
        const { sendOrgRejectedEmail } = require("../utils/emailService");
        sendOrgRejectedEmail({
          orgEmail: user.email,
          orgName:  user.fullName,
          orgRole:  user.role,
          reason:   reason || "Your application did not meet our verification requirements.",
        });
      } catch (emailErr) {
        console.error("Rejection email error:", emailErr.message);
      }
    }

    return res.status(200).json({
      message: "Organisation rejected — email sent with reason",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;