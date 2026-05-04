const mongoose = require("mongoose");

const donorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A", "B", "AB", "O"],
      required: true,
    },
    rh: {
      type: String,
      enum: ["+", "-"],
      required: true,
    },
    locationLat:  { type: Number },
    locationLng:  { type: Number },
    locationName: { type: String },
    radiusKm:     { type: Number, default: 10 },
    availability: { type: Boolean, default: true },
    snoozeUntil:  { type: Date },
    lastDonationDate: { type: Date },

    // ── New fields added during registration ──────────────────────────────
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    dateOfBirth: {
      type: Date,
    },
    weight: {
      type: Number,
    },
    hasIllness: {
      type: Boolean,
      default: false,
    },
    illnessDetails: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },

    // ── Certificate milestones — stored permanently when earned ───────────
    // Each entry records the exact moment a milestone was achieved
    // This ensures certificates always show correct historical data
    certificatesEarned: [
      {
        level:               { type: String, enum: ["bronze", "silver", "gold"] },
        title:               { type: String },
        earnedAt:            { type: Date },
        donationCountAtTime: { type: Number },
        certificateNumber:   { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("DonorProfile", donorProfileSchema);