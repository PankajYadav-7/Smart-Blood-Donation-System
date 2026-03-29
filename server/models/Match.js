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
      enum: ["Notified", "Accepted", "Declined", "Expired"],
      default: "Notified",
    },
    contactRevealed: {
      type: Boolean,
      default: false,
    },
    respondedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);