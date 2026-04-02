const express = require("express");
const router = express.Router();
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

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

// Get all users
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Update user status
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

// Verify hospital or NGO
router.patch("/users/:userId/verify", protect, adminOnly, async (req, res) => {
  try {
    const { verified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isVerified: verified },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({
      message: verified ? "User verified" : "Verification removed",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;