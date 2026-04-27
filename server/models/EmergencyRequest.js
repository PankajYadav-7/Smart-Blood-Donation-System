const mongoose = require("mongoose");

const emergencyRequestSchema = new mongoose.Schema(
  {
    // Tracking
    trackingCode: {
      type: String,
      unique: true,
      required: true,
    },

    // Person who submitted
    requesterName:  { type: String, required: true },
    requesterPhone: { type: String, required: true },
    requesterEmail: { type: String, default: "" },

    // Blood details
    bloodGroup:    { type: String, enum: ["A","B","AB","O"], required: true },
    rh:            { type: String, enum: ["+","-"], required: true },
    unitsRequired: { type: Number, default: 1 },

    // Location
    hospitalName: { type: String, required: true },
    location:     { type: String, default: "" },

    // Urgency
    urgencyLevel: {
      type: String,
      enum: ["Critical", "Urgent", "Normal"],
      default: "Critical",
    },

    // Medical
    patientName:      { type: String, default: "" },
    medicalCondition: { type: String, default: "" },

    // Status
    status: {
      type: String,
      enum: ["Active", "Fulfilled", "Cancelled"],
      default: "Active",
    },

    // Donors who accepted
    acceptedDonors: [
      {
        donorUserId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        donorName:     { type: String },
        donorEmail:    { type: String },
        donorPhone:    { type: String },
        donorBloodGroup: { type: String },
        acceptedAt:    { type: Date, default: Date.now },
      }
    ],

    // Tracking
    donorsNotified:   { type: Number, default: 0 },
    hospitalsNotified: { type: Number, default: 0 },
    ngosNotified:     { type: Number, default: 0 },

    // Escalation
    escalationSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmergencyRequest", emergencyRequestSchema);