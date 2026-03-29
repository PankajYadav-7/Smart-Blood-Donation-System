const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema(
  {
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    unitsRequired: {
      type: Number,
      required: true,
    },
    urgency: {
      type: String,
      enum: ["Normal", "Emergency"],
      default: "Normal",
    },
    hospitalName: {
      type: String,
      required: true,
    },
    hospitalLat: {
      type: Number,
    },
    hospitalLng: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Fulfilled", "Closed"],
      default: "Open",
    },
    notes: {
      type: String,
    },
    closedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);