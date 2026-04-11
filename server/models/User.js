const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["donor", "requester", "hospital", "ngo", "admin"],
      default: "donor",
    },

    // ── Email verification via OTP ──────────────────────────────────────────
    emailVerified: {
      type: Boolean,
      default: false,        // ← changed from true to false
    },
    otp: {
      type: String,
      default: null,         // stores the 6-digit OTP
    },
    otpExpiry: {
      type: Date,
      default: null,         // OTP expires after 10 minutes
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    phone: {
      type: String,
      default: "",
    },
    licenseNumber: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    orgDescription: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);