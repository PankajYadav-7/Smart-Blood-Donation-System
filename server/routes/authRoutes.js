const express  = require("express");
const bcrypt    = require("bcryptjs");
const jwt       = require("jsonwebtoken");
const User      = require("../models/User");

const router = express.Router();

// ── REGISTER ──
router.post("/register", async (req, res) => {
  try {
    const {
      fullName, email, password, role,
      phone, licenseNumber, address, orgDescription,
    } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // hospitals and NGOs start as unverified — need admin approval
    const needsVerification = role === "hospital" || role === "ngo";

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role,
      emailVerified:  true,
      isVerified:     needsVerification ? false : true,
      phone:          phone          || "",
      licenseNumber:  licenseNumber  || "",
      address:        address        || "",
      orgDescription: orgDescription || "",
    });

    // Do NOT return token for hospital/NGO — they must wait for approval
    if (needsVerification) {
      return res.status(201).json({
        message: "Application submitted successfully. Please wait for admin approval.",
        requiresApproval: true,
        user: {
          id:       user._id,
          fullName: user.fullName,
          email:    user.email,
          role:     user.role,
        },
      });
    }

    // For donors, patients, admins — login immediately
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message:          "Registration successful",
      requiresApproval: false,
      token,
      user: {
        id:       user._id,
        fullName: user.fullName,
        email:    user.email,
        role:     user.role,
      },
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ── LOGIN ──
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Block suspended accounts
    if (user.status === "suspended") {
      return res.status(403).json({
        message: "Your account has been suspended. Please contact admin.",
      });
    }

    // Block hospital/NGO that are not yet verified
    if ((user.role === "hospital" || user.role === "ngo") && !user.isVerified) {
      return res.status(403).json({
        message: "Your account is pending admin approval. You will receive an email once approved.",
        pendingApproval: true,
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id:         user._id,
        fullName:   user.fullName,
        email:      user.email,
        role:       user.role,
        isVerified: user.isVerified,
      },
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;