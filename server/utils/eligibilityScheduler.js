// ─────────────────────────────────────────────────────────────────────────────
// Eligibility Scheduler
// Runs daily at 8:00 AM Nepal time (UTC+5:45)
// Sends EMAIL 19 (3 days before eligible) and EMAIL 20 (eligible today)
// ─────────────────────────────────────────────────────────────────────────────

const cron = require("node-cron");
const DonorProfile = require("../models/DonorProfile");
const User         = require("../models/User");
const {
  sendEligibilityReminderEmail,
  sendEligibleNowEmail,
} = require("./emailService");

function startEligibilityScheduler() {

  // Run every day at 8:00 AM Nepal time
  // Nepal is UTC+5:45, so 8:00 AM Nepal = 2:15 AM UTC
  // Cron: minute hour day month weekday
  cron.schedule("15 2 * * *", async () => {
    console.log("⏰ Running daily eligibility check...");

    try {
      const today     = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow  = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const in3Days   = new Date(today);
      in3Days.setDate(in3Days.getDate() + 3);

      const in4Days   = new Date(today);
      in4Days.setDate(in4Days.getDate() + 4);

      // ── Find donors who become eligible TODAY ──────────────────────────
      // lastDonationDate + 56 = today
      const eligibleTodayFrom = new Date(today);
      eligibleTodayFrom.setDate(eligibleTodayFrom.getDate() - 56);

      const eligibleTomorrowFrom = new Date(tomorrow);
      eligibleTomorrowFrom.setDate(eligibleTomorrowFrom.getDate() - 56);

      const eligibleTodayDonors = await DonorProfile.find({
        lastDonationDate: {
          $gte: eligibleTodayFrom,
          $lt:  eligibleTomorrowFrom,
        },
      });

      console.log(`📅 Eligible today: ${eligibleTodayDonors.length} donors`);

      for (const profile of eligibleTodayDonors) {
        try {
          const user = await User.findById(profile.userId).select("fullName email");
          if (user?.email) {
            await sendEligibleNowEmail({
              donorEmail: user.email,
              donorName:  user.fullName,
              bloodGroup: profile.bloodGroup,
              rh:         profile.rh,
            });
            console.log(`✅ Eligible now email sent → ${user.email}`);
          }
        } catch (err) {
          console.error(`Email error for donor ${profile.userId}:`, err.message);
        }
      }

      // ── Find donors who become eligible in exactly 3 days ─────────────
      // lastDonationDate + 56 = today + 3
      const reminderFrom = new Date(in3Days);
      reminderFrom.setDate(reminderFrom.getDate() - 56);

      const reminderTo = new Date(in4Days);
      reminderTo.setDate(reminderTo.getDate() - 56);

      const reminderDonors = await DonorProfile.find({
        lastDonationDate: {
          $gte: reminderFrom,
          $lt:  reminderTo,
        },
      });

      console.log(`⏰ Reminder (3 days before): ${reminderDonors.length} donors`);

      for (const profile of reminderDonors) {
        try {
          const user = await User.findById(profile.userId).select("fullName email");
          if (user?.email) {
            const nextEligibleDate = new Date(profile.lastDonationDate);
            nextEligibleDate.setDate(nextEligibleDate.getDate() + 56);

            await sendEligibilityReminderEmail({
              donorEmail:      user.email,
              donorName:       user.fullName,
              bloodGroup:      profile.bloodGroup,
              rh:              profile.rh,
              nextEligibleDate,
            });
            console.log(`⏰ Reminder email sent → ${user.email}`);
          }
        } catch (err) {
          console.error(`Reminder email error for donor ${profile.userId}:`, err.message);
        }
      }

      console.log("✅ Daily eligibility check complete");

    } catch (err) {
      console.error("Eligibility scheduler error:", err.message);
    }
  });

  console.log("⏰ Eligibility scheduler started — runs daily at 8:00 AM Nepal time");
}

module.exports = { startEligibilityScheduler };