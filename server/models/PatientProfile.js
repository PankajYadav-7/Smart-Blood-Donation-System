const mongoose = require("mongoose");

const patientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── Personal details ──────────────────────────────────────────────────
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    dateOfBirth: {
      type: Date,
    },
    phone: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },

    // ── Blood need details ────────────────────────────────────────────────
    bloodGroupNeeded: {
      type: String,
      enum: ["A", "B", "AB", "O", ""],
      default: "",
    },
    rhNeeded: {
      type: String,
      enum: ["+", "-", ""],
      default: "",
    },

    // ── Request context ───────────────────────────────────────────────────
    requestingFor: {
      type: String,
      enum: ["myself", "family", "friend", "other"],
      default: "myself",
    },
    patientName: {
      type: String,
      default: "",  // name of actual patient if requesting for someone else
    },
    medicalCondition: {
      type: String,
      default: "",  // reason blood is needed
    },
    hospitalName: {
      type: String,
      default: "",  // hospital where patient is admitted
    },

    // ── Emergency contact ─────────────────────────────────────────────────
    emergencyContactName: {
      type: String,
      default: "",
    },
    emergencyContactPhone: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PatientProfile", patientProfileSchema);