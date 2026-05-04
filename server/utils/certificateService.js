const DonorProfile = require("../models/DonorProfile");
const User         = require("../models/User");

// Certificate milestone definitions
const MILESTONES = [
  { level: "bronze", title: "First Time Donor",   target: 1  },
  { level: "silver", title: "Regular Contributor", target: 5  },
  { level: "gold",   title: "Life Saver Champion", target: 10 },
];

// Generate unique certificate number
function generateCertNumber(level) {
  const year   = new Date().getFullYear();
  const num    = Math.floor(10000 + Math.random() * 90000);
  const prefix = level === "bronze" ? "BR" : level === "silver" ? "SL" : "GD";
  return `JS-${prefix}-${year}-${num}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Called every time a donor's donation count increases
// Checks if any new milestone was just crossed and records it permanently
// ─────────────────────────────────────────────────────────────────────────────
async function checkAndAwardCertificates(userId, newDonationCount) {
  try {
    console.log(`🏆 Certificate check — userId: ${userId}, count: ${newDonationCount}`);
    const profile  = await DonorProfile.findOne({ userId });
    const donorUser = await User.findById(userId).select("fullName email");

    console.log(`🏆 Profile found: ${!!profile}, User found: ${!!donorUser}`);
    console.log(`🏆 Existing certificates: ${JSON.stringify(profile?.certificatesEarned)}`);

    if (!profile || !donorUser) return;

    const newlyEarned = [];

    for (const milestone of MILESTONES) {
      // Check if this milestone was just crossed
      if (newDonationCount >= milestone.target) {
        // Check if already recorded
        const alreadyEarned = profile.certificatesEarned?.some(
          c => c.level === milestone.level
        );
        if (!alreadyEarned) {
          const certEntry = {
            level:               milestone.level,
            title:               milestone.title,
            earnedAt:            new Date(),
            donationCountAtTime: milestone.target, // always the milestone target
            certificateNumber:   generateCertNumber(milestone.level),
          };
          profile.certificatesEarned.push(certEntry);
          newlyEarned.push({ ...certEntry, donorName: donorUser.fullName, donorEmail: donorUser.email });
        }
      }
    }

    if (newlyEarned.length > 0) {
      await profile.save();

      // Send congratulations email for each newly earned certificate
      const { sendCertificateEarnedEmail } = require("./emailService");
      for (const cert of newlyEarned) {
        try {
          sendCertificateEarnedEmail({
            donorEmail:        cert.donorEmail,
            donorName:         cert.donorName,
            certTitle:         cert.title,
            certLevel:         cert.level,
            earnedAt:          cert.earnedAt,
            donationCount:     cert.donationCountAtTime,
            certificateNumber: cert.certificateNumber,
          });
        } catch (err) {
          console.error("Certificate email error:", err.message);
        }
      }
    }

    return newlyEarned;
  } catch (err) {
    console.error("Certificate check error:", err.message);
  }
}

module.exports = { checkAndAwardCertificates };