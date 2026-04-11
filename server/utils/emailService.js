const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM = process.env.SENDGRID_FROM_EMAIL;
const BASE_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ── Shared HTML wrapper ──────────────────────────────────────────────────────
function wrap(bodyHtml) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Jeevan Saarthi</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#991b1b;padding:28px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:0.5px;">
                🩸 Jeevan Saarthi
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
                Smart Blood Donation &amp; Emergency Finder — Nepal
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #eeeeee;">
              <p style="margin:0;color:#999999;font-size:12px;text-align:center;">
                Jeevan Saarthi — Connecting donors, patients and hospitals across Nepal<br/>
                This is an automated notification. Please do not reply to this email.<br/>
                Nepal Red Cross Emergency: 01-4270650
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Helper: send safely (never crash the main route) ────────────────────────
async function send(to, subject, html) {
  try {
    if (!FROM || !process.env.SENDGRID_API_KEY) return;
    await sgMail.send({ to, from: FROM, subject, html });
    console.log(`✅ Email sent → ${to} | ${subject}`);
  } catch (err) {
    // Log but never throw — email failure must not break the API response
    console.error(`⚠️  Email failed → ${to} | ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 1 — To DONOR when a matching blood request is found
// Triggered: POST /api/matches/find/:requestId
// ─────────────────────────────────────────────────────────────────────────────
async function notifyDonorOfRequest({ donorEmail, donorName, bloodGroup, rh, urgency, hospitalName, requestId }) {
  const urgencyColor = urgency === "Emergency" ? "#dc2626" : urgency === "Urgent" ? "#d97706" : "#16a34a";
  const html = wrap(`
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px;">Someone Needs Your Blood Right Now</h2>
    <p style="margin:0 0 24px;color:#555555;font-size:15px;line-height:1.6;">
      Hi <strong>${donorName}</strong>, a blood request matching your blood type
      <strong style="color:#991b1b;">${bloodGroup}${rh}</strong> has just been posted on Jeevan Saarthi.
    </p>

    <!-- Request details card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;margin-bottom:28px;">
      <tr>
        <td style="padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;">
                <span style="color:#991b1b;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">Blood Type Needed</span><br/>
                <span style="color:#1a1a1a;font-size:22px;font-weight:bold;">${bloodGroup}${rh}</span>
              </td>
              <td align="right" style="padding:6px 0;">
                <span style="background:${urgencyColor};color:#ffffff;font-size:12px;font-weight:bold;padding:4px 14px;border-radius:20px;text-transform:uppercase;">
                  ${urgency}
                </span>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:16px;border-top:1px solid #fecaca;">
                <span style="color:#555555;font-size:13px;">Hospital / Location</span><br/>
                <span style="color:#1a1a1a;font-size:15px;font-weight:bold;">${hospitalName}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;color:#555555;font-size:14px;line-height:1.6;">
      A patient is waiting. If you are available and willing to donate, please log in to your
      Jeevan Saarthi dashboard and click <strong>Accept</strong> on this request.
      Your contact details will only be shared with the patient after you accept.
    </p>

    <!-- CTA Button -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#991b1b;border-radius:8px;">
          <a href="${BASE_URL}/donor/dashboard"
             style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
            View Request &amp; Respond →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#999999;font-size:13px;">
      If you are not available right now, you can toggle your availability off from your dashboard
      so you do not receive further notifications until you are ready.
    </p>
  `);

  await send(donorEmail, `🩸 Urgent: ${bloodGroup}${rh} blood needed at ${hospitalName}`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 2 — To PATIENT/REQUESTER when a donor accepts
// Triggered: PATCH /api/matches/:matchId/respond  OR  POST /respond-direct
// ─────────────────────────────────────────────────────────────────────────────
async function notifyRequesterOfAcceptance({ requesterEmail, requesterName, donorName, donorEmail, bloodGroup, rh, hospitalName }) {
  const html = wrap(`
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px;">A Donor Has Agreed to Help You</h2>
    <p style="margin:0 0 24px;color:#555555;font-size:15px;line-height:1.6;">
      Good news, <strong>${requesterName}</strong>. A compatible donor has accepted your blood request
      for <strong style="color:#991b1b;">${bloodGroup}${rh}</strong> at <strong>${hospitalName}</strong>.
    </p>

    <!-- Donor details card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:28px;">
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 6px;color:#166534;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">
            ✅ Donor Details
          </p>
          <p style="margin:0 0 4px;color:#1a1a1a;font-size:17px;font-weight:bold;">${donorName}</p>
          <p style="margin:0;color:#555555;font-size:14px;">
            📧 <a href="mailto:${donorEmail}" style="color:#991b1b;">${donorEmail}</a>
          </p>
          <p style="margin:8px 0 0;color:#555555;font-size:13px;">
            Blood Type: <strong style="color:#991b1b;">${bloodGroup}${rh}</strong>
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;color:#555555;font-size:14px;line-height:1.6;">
      Please contact the donor directly to arrange the donation at <strong>${hospitalName}</strong>.
      Once the donation is complete, please log in and click <strong>Confirm Donation</strong>
      so the donor receives proper credit.
    </p>

    <!-- CTA Button -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#991b1b;border-radius:8px;">
          <a href="${BASE_URL}/patient/dashboard"
             style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
            Go to My Dashboard →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#999999;font-size:13px;">
      If the donor does not arrive, please click <em>Did Not Come</em> on your dashboard
      so the system can find another available donor for you.
    </p>
  `);

  await send(requesterEmail, `✅ A donor is ready to help — ${bloodGroup}${rh} at ${hospitalName}`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 3 — To DONOR when patient confirms the donation
// Triggered: PATCH /api/matches/:matchId/confirm-donation
// ─────────────────────────────────────────────────────────────────────────────
async function notifyDonorOfConfirmation({ donorEmail, donorName, bloodGroup, rh, hospitalName, confirmedAt }) {
  const date = new Date(confirmedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  });

  const html = wrap(`
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px;">Your Donation Has Been Confirmed 🎉</h2>
    <p style="margin:0 0 24px;color:#555555;font-size:15px;line-height:1.6;">
      Thank you, <strong>${donorName}</strong>. The patient has confirmed that your
      <strong style="color:#991b1b;">${bloodGroup}${rh}</strong> donation at
      <strong>${hospitalName}</strong> was received successfully.
    </p>

    <!-- Confirmation card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:2px solid #fecaca;border-radius:10px;margin-bottom:28px;text-align:center;">
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 8px;font-size:48px;">🩸</p>
          <p style="margin:0 0 4px;color:#991b1b;font-size:26px;font-weight:bold;">1 Donation</p>
          <p style="margin:0 0 16px;color:#555555;font-size:14px;">Confirmed on ${date}</p>
          <p style="margin:0;background:#991b1b;color:#ffffff;font-size:14px;font-weight:bold;
                    padding:10px 24px;border-radius:20px;display:inline-block;">
            Up to 3 lives may have been saved
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;color:#555555;font-size:14px;line-height:1.6;">
      Your donation count has been updated in your profile and you may have earned a new badge.
      The 56-day recovery period has started — your next eligible donation date has been set automatically.
    </p>

    <!-- CTA Button -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#991b1b;border-radius:8px;">
          <a href="${BASE_URL}/donor/dashboard"
             style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
            View My Donation History →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#555555;font-size:14px;font-style:italic;">
      "Someone Is Already Looking For Your Blood Type Right Now" — Jeevan Saarthi
    </p>
  `);

  await send(donorEmail, `🎉 Confirmed — Your blood donation at ${hospitalName} saved a life`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 4 — To PATIENT when donor is marked as No Show
// Triggered: PATCH /api/matches/:matchId/no-show
// ─────────────────────────────────────────────────────────────────────────────
async function notifyRequesterOfNoShow({ requesterEmail, requesterName, bloodGroup, rh, hospitalName }) {
  const html = wrap(`
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px;">Finding You Another Donor</h2>
    <p style="margin:0 0 24px;color:#555555;font-size:15px;line-height:1.6;">
      Hi <strong>${requesterName}</strong>, we noticed that the donor who accepted your
      <strong style="color:#991b1b;">${bloodGroup}${rh}</strong> blood request at
      <strong>${hospitalName}</strong> did not arrive. We are sorry for the inconvenience.
    </p>

    <!-- Status card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 8px;color:#92400e;font-size:13px;font-weight:bold;text-transform:uppercase;">
            ⚠️ What Happens Next
          </p>
          <ul style="margin:0;padding-left:20px;color:#555555;font-size:14px;line-height:1.8;">
            <li>Your blood request is still <strong>Open</strong> on the platform</li>
            <li>Other compatible donors can still see and accept it</li>
            <li>You can click <strong>Find Donors</strong> again to re-notify donors</li>
            <li>For emergencies please also call Nepal Red Cross: <strong>01-4270650</strong></li>
          </ul>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:#991b1b;border-radius:8px;">
          <a href="${BASE_URL}/patient/dashboard"
             style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
            Go to My Dashboard →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#999999;font-size:13px;">
      We will continue working to help you find a compatible donor as quickly as possible.
    </p>
  `);

  await send(requesterEmail, `⚠️ Your donor didn't arrive — we're finding another for ${bloodGroup}${rh}`, html);
}


// EMAIL 5 — OTP Verification email on Registration
// Triggered: POST /api/auth/register  (donor and patient only)

async function sendOTPEmail({ email, fullName, otp }) {
  const html = wrap(`
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px;">Verify Your Email Address</h2>
    <p style="margin:0 0 24px;color:#555555;font-size:15px;line-height:1.6;">
      Hi <strong>${fullName}</strong>, welcome to Jeevan Saarthi!
      Please use the verification code below to confirm your email address.
    </p>

    <!-- OTP Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:14px;
                      padding:28px 40px;display:inline-block;text-align:center;">
            <p style="margin:0 0 6px;color:#991b1b;font-size:12px;font-weight:bold;
                      text-transform:uppercase;letter-spacing:2px;">
              Your Verification Code
            </p>
            <p style="margin:0;color:#991b1b;font-size:42px;font-weight:bold;
                      letter-spacing:10px;font-family:monospace;">
              ${otp}
            </p>
            <p style="margin:8px 0 0;color:#999999;font-size:12px;">
              This code expires in <strong>10 minutes</strong>
            </p>
          </div>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;color:#555555;font-size:14px;line-height:1.6;">
      Enter this code on the verification screen to activate your account.
      After verification you will be redirected to the login page.
    </p>

    <p style="margin:0;color:#999999;font-size:13px;">
      If you did not create an account on Jeevan Saarthi, please ignore this email.
    </p>
  `);

  await send(email, `${otp} — Your Jeevan Saarthi Verification Code`, html);
}

module.exports = {
  notifyDonorOfRequest,
  notifyRequesterOfAcceptance,
  notifyDonorOfConfirmation,
  notifyRequesterOfNoShow,
  sendOTPEmail,
};