const express  = require("express");
const router   = express.Router();
const Event    = require("../models/Event");
const User     = require("../models/User");
const DonorProfile = require("../models/DonorProfile");
const jwt      = require("jsonwebtoken");

// -- Auth middleware --
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token invalid" });
  }
};

// -- Generate unique event code --
function generateEventCode() {
  const year = new Date().getFullYear();
  const num  = Math.floor(1000 + Math.random() * 9000);
  return `EV-${year}-${num}`;
}

// -----------------------------------------------------------------------------
// POST /api/events — Create new event (hospital/ngo only)
// -----------------------------------------------------------------------------
router.post("/", protect, async (req, res) => {
  try {
    const organizer = await User.findById(req.user.userId).select("fullName email phone role isVerified");
    if (!organizer) return res.status(404).json({ message: "User not found" });

    if (organizer.role !== "hospital" && organizer.role !== "ngo") {
      return res.status(403).json({ message: "Only hospitals and NGOs can create events" });
    }

    if (!organizer.isVerified) {
      return res.status(403).json({ message: "Your organization must be verified to create events" });
    }

    const {
      title, description, eventDate, startTime, endTime,
      venueName, address, city, locationLat, locationLng,
      bloodTypesNeeded, targetDonors,
      whatToBring, contactPerson, contactPhone,
    } = req.body;

    if (!title || !eventDate || !startTime || !endTime || !venueName || !address || !city) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Generate unique event code
    let eventCode;
    let isUnique = false;
    while (!isUnique) {
      eventCode = generateEventCode();
      const existing = await Event.findOne({ eventCode });
      if (!existing) isUnique = true;
    }

    const event = await Event.create({
      eventCode,
      organizerId:    organizer._id,
      organizerName:  organizer.fullName,
      organizerType:  organizer.role,
      organizerEmail: organizer.email,
      organizerPhone: organizer.phone || "",
      title,
      description:      description || "",
      eventDate,
      startTime,
      endTime,
      venueName,
      address,
      city,
      locationLat,
      locationLng,
      bloodTypesNeeded: bloodTypesNeeded || [],
      targetDonors:     targetDonors || 50,
      whatToBring:      whatToBring || "Valid ID, eat well before donating",
      contactPerson:    contactPerson || organizer.fullName,
      contactPhone:     contactPhone  || organizer.phone || "",
    });

    return res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/events/upcoming - Public, all upcoming events
// -----------------------------------------------------------------------------
router.get("/upcoming", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await Event.find({
      eventDate: { $gte: today },
      status:    { $in: ["upcoming", "ongoing"] },
    })
      .sort({ eventDate: 1 })
      .limit(50);

    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/events/my-events - Organizer's own events
// -----------------------------------------------------------------------------
router.get("/my-events", protect, async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user.userId }).sort({ eventDate: -1 });
    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/events/my-rsvps - Donor's RSVP'd events
// -----------------------------------------------------------------------------
router.get("/my-rsvps", protect, async (req, res) => {
  try {
    const donorUser = await User.findById(req.user.userId).select("email");
    if (!donorUser) return res.status(404).json({ message: "User not found" });

    const events = await Event.find({
      "registeredDonors.donorEmail": donorUser.email,
    }).sort({ eventDate: 1 });

    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/events/all - All events including past and cancelled - Admin
// -----------------------------------------------------------------------------
router.get("/all", protect, async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ createdAt: -1 });
    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------------------------------------------------------
// GET /api/events/:id - Single event detail
// -----------------------------------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.status(200).json({ event });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// -----------------------------------------------------------------------------
// POST /api/events/:id/rsvp - Donor RSVP to event
// -----------------------------------------------------------------------------
router.post("/:id/rsvp", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.status !== "upcoming" && event.status !== "ongoing") {
      return res.status(400).json({ message: "This event is not accepting registrations" });
    }

    const donorUser    = await User.findById(req.user.userId).select("fullName email phone role");
    const donorProfile = await DonorProfile.findOne({ userId: req.user.userId });

    if (donorUser.role !== "donor") {
      return res.status(403).json({ message: "Only donors can RSVP to events" });
    }

    // Check if already registered
    const alreadyRegistered = event.registeredDonors.find(
      d => d.donorEmail === donorUser.email
    );
    if (alreadyRegistered) {
      return res.status(400).json({ message: "You are already registered for this event" });
    }

    event.registeredDonors.push({
      donorUserId:     req.user.userId,
      donorName:       donorUser.fullName,
      donorEmail:      donorUser.email,
      donorPhone:      donorUser.phone || donorProfile?.phone || "",
      donorBloodGroup: donorProfile ? `${donorProfile.bloodGroup}${donorProfile.rh}` : "",
      registeredAt:    new Date(),
    });

    await event.save();

    // Send confirmation email
    try {
      const { sendEventRSVPConfirmation } = require("../utils/emailService");
      sendEventRSVPConfirmation({
        donorEmail:    donorUser.email,
        donorName:     donorUser.fullName,
        eventTitle:    event.title,
        eventDate:     event.eventDate,
        startTime:     event.startTime,
        endTime:       event.endTime,
        venueName:     event.venueName,
        address:       event.address,
        city:          event.city,
        organizerName: event.organizerName,
        eventCode:     event.eventCode,
        contactPhone:  event.contactPhone,
      });
    } catch (emailErr) {
      console.error("RSVP email error:", emailErr.message);
    }

    return res.status(200).json({
      message: "You are registered for this event! Check your email for confirmation.",
      event,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// -----------------------------------------------------------------------------
// DELETE /api/events/:id/rsvp - Donor cancels RSVP
// -----------------------------------------------------------------------------
router.delete("/:id/rsvp", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const donorUser = await User.findById(req.user.userId).select("email fullName");

    const donorEntry = event.registeredDonors.find(d => d.donorEmail === donorUser.email);

    event.registeredDonors = event.registeredDonors.filter(
      d => d.donorEmail !== donorUser.email
    );

    await event.save();

    // Send RSVP cancellation confirmation to donor
    if (donorEntry) {
      try {
        const { sendRSVPCancelledEmail } = require("../utils/emailService");
        sendRSVPCancelledEmail({
          donorEmail:    donorUser.email,
          donorName:     donorUser.fullName,
          eventTitle:    event.title,
          eventDate:     event.eventDate,
          organizerName: event.organizerName,
          eventCode:     event.eventCode,
        });
      } catch (emailErr) {
        console.error("RSVP cancel email error:", emailErr.message);
      }
    }

    return res.status(200).json({ message: "Your RSVP has been cancelled. A confirmation email has been sent." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// -----------------------------------------------------------------------------
// PATCH /api/events/:id - Update event (organizer only)
// -----------------------------------------------------------------------------
router.patch("/:id", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.organizerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only update your own events" });
    }

    // Track what changed for the email
    const changes = [];
    if (req.body.eventDate && req.body.eventDate !== event.eventDate?.toISOString()?.split("T")[0]) changes.push("Date updated");
    if (req.body.startTime && req.body.startTime !== event.startTime) changes.push("Start time updated");
    if (req.body.endTime   && req.body.endTime   !== event.endTime)   changes.push("End time updated");
    if (req.body.venueName && req.body.venueName !== event.venueName) changes.push("Venue updated");
    if (req.body.address   && req.body.address   !== event.address)   changes.push("Address updated");
    if (req.body.city      && req.body.city      !== event.city)      changes.push("City updated");

    Object.assign(event, req.body);
    await event.save();

    // Send update email to all registered donors
    if (event.registeredDonors?.length > 0 && changes.length > 0) {
      const { sendEventUpdateEmail } = require("../utils/emailService");
      for (const donor of event.registeredDonors) {
        if (donor.donorEmail) {
          try {
            sendEventUpdateEmail({
              donorEmail:    donor.donorEmail,
              donorName:     donor.donorName,
              eventTitle:    event.title,
              eventDate:     event.eventDate,
              startTime:     event.startTime,
              endTime:       event.endTime,
              venueName:     event.venueName,
              address:       event.address,
              city:          event.city,
              organizerName: event.organizerName,
              eventCode:     event.eventCode,
              changes:       changes.join(", "),
            });
          } catch (emailErr) {
            console.error("Update email error:", emailErr.message);
          }
        }
      }
    }

    return res.status(200).json({
      message: `Event updated successfully${changes.length > 0 ? `. ${event.registeredDonors?.length || 0} donor(s) notified.` : ""}`,
      event,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// -----------------------------------------------------------------------------
// PATCH /api/events/:id/cancel - Cancel event (organizer only)
// -----------------------------------------------------------------------------
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.organizerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only cancel your own events" });
    }

    event.status = "cancelled";
    await event.save();

    // Send cancellation email to all registered donors
    if (event.registeredDonors?.length > 0) {
      const { sendEventCancelledEmail } = require("../utils/emailService");
      for (const donor of event.registeredDonors) {
        if (donor.donorEmail) {
          try {
            sendEventCancelledEmail({
              donorEmail:    donor.donorEmail,
              donorName:     donor.donorName,
              eventTitle:    event.title,
              eventDate:     event.eventDate,
              organizerName: event.organizerName,
              eventCode:     event.eventCode,
            });
          } catch (emailErr) {
            console.error("Cancel email error:", emailErr.message);
          }
        }
      }
    }

    return res.status(200).json({
      message: `Event cancelled. ${event.registeredDonors?.length || 0} registered donor(s) have been notified.`,
      event,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});


module.exports = router;