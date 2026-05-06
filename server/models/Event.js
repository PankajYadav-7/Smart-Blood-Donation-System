const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    // Auto-generated unique event code
    eventCode: { type: String, unique: true, required: true },

    // ── Organizer ──
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizerName:    { type: String, required: true },
    organizerType:    { type: String, enum: ["hospital", "ngo"], required: true },
    organizerEmail:   { type: String },
    organizerPhone:   { type: String },

    // ── Event details ──
    title:            { type: String, required: true },
    description:      { type: String, default: "" },
    eventDate:        { type: Date, required: true },
    startTime:        { type: String, required: true }, // "09:00"
    endTime:          { type: String, required: true }, // "17:00"

    // ── Location ──
    venueName:        { type: String, required: true },
    address:          { type: String, required: true },
    city:             { type: String, required: true },
    locationLat:      { type: Number },
    locationLng:      { type: Number },

    // ── Blood needs ──
    bloodTypesNeeded: [{ type: String }], // ["A+", "B+", "O+", "AB-"]
    targetDonors:     { type: Number, default: 50 },

    // ── Additional info ──
    whatToBring:      { type: String, default: "Valid ID, eat well before donating" },
    contactPerson:    { type: String, default: "" },
    contactPhone:     { type: String, default: "" },

    // ── Registered donors (RSVP list) ──
    registeredDonors: [
      {
        donorUserId:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        donorName:    String,
        donorEmail:   String,
        donorPhone:   String,
        donorBloodGroup: String,
        registeredAt: { type: Date, default: Date.now },
        attended:     { type: Boolean, default: false },
        donated:      { type: Boolean, default: false },
      },
    ],

    // ── Status ──
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

// Indexes for fast queries
eventSchema.index({ eventDate: 1, status: 1 });
eventSchema.index({ city: 1 });

module.exports = mongoose.model("Event", eventSchema);