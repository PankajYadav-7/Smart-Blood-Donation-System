const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true,
    },
    donorProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonorProfile",
      required: true,
    },
    donorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Notified",   // Hospital found donor — donor not yet responded
        "Accepted",   // Donor accepted — has NOT donated yet
        "Declined",   // Donor declined
        "Donated",    // Patient confirmed donation was received ✅
        "NoShow",     // Donor accepted but did not come
      ],
      default: "Notified",
    },
    contactRevealed: {
      type: Boolean,
      default: false,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    donationConfirmedAt: {
      type: Date,
      default: null,
    },
    donationConfirmedBy: {
      type: String,
      default: null, // "patient" or "hospital"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);