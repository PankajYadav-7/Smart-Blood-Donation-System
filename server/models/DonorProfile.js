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
    locationLat: {
      type: Number,
    },
    locationLng: {
      type: Number,
    },
    locationName: {
      type: String,
    },
    radiusKm: {
      type: Number,
      default: 10,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    snoozeUntil: {
      type: Date,
    },
    lastDonationDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DonorProfile", donorProfileSchema);