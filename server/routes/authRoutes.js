const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const crypto   = require("crypto");
const User     = require("../models/User");
const { sendOTPEmail } = require("../utils/emailService");

const router = express.Router();

// ── Helper: generate 6-digit OTP ────────────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────────────────────
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
    const needsVerification = role === "hospital" || role === "ngo";

    // Generate OTP for donor/patient only
    const otp       = needsVerification ? null : generateOTP();
    const otpExpiry = needsVerification ? null : new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role,
      emailVerified:  needsVerification ? true : false, // orgs skip OTP
      isVerified:     needsVerification ? false : true,
      otp,
      otpExpiry,
      phone:          phone          || "",
      licenseNumber:  licenseNumber  || "",
      address:        address        || "",
      orgDescription: orgDescription || "",
    });

    // ── Hospital / NGO — no OTP needed, pending admin approval ──
    if (needsVerification) {
      return res.status(201).json({
        message: "Application submitted successfully. Your details are under review.",
        requiresApproval: true,
        user: {
          id:       user._id,
          fullName: user.fullName,
          email:    user.email,
          role:     user.role,
        },
      });
    }

    // ── Donor / Patient — send OTP email ──
    sendOTPEmail({
      email:    user.email,
      fullName: user.fullName,
      otp,
    });
    // fire-and-forget — no await so API responds instantly

    return res.status(201).json({
      message:        "Registration successful. Please check your email for the verification code.",
      requiresOTP:    true,
      email:          user.email,   // frontend needs this to show on OTP screen
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY OTP
// ─────────────────────────────────────────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified. Please login." });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "No verification code found. Please register again." });
    }

    // Check if OTP is expired
    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: "Verification code has expired. Please register again." });
    }

    // Check if OTP matches
    if (user.otp !== otp.toString()) {
      return res.status(400).json({ message: "Incorrect verification code. Please try again." });
    }

    // ✅ OTP is correct — mark email as verified and clear OTP
    user.emailVerified = true;
    user.otp           = null;
    user.otpExpiry     = null;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully! You can now log in.",
      verified: true,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RESEND OTP
// ─────────────────────────────────────────────────────────────────────────────
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified. Please login." });
    }

    const otp       = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp       = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    sendOTPEmail({ email: user.email, fullName: user.fullName, otp });

    return res.status(200).json({ message: "New verification code sent to your email." });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────
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
        message: "Your account has been suspended. Please contact our support team.",
      });
    }

    // Block donor/patient who have not verified their email yet
    if (!user.emailVerified && (user.role === "donor" || user.role === "requester")) {
      return res.status(403).json({
        message: "Please verify your email first. Check your inbox for the verification code.",
        requiresOTP: true,
        email: user.email,
      });
    }

    // Block hospital/NGO not yet approved by admin
    if ((user.role === "hospital" || user.role === "ngo") && !user.isVerified) {
      return res.status(403).json({
        message: "Your account is under review. You will receive an email once approved.",
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