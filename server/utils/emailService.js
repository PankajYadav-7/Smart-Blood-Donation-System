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

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 6 — Password Reset Email
// Triggered: POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
async function sendPasswordResetEmail({ email, fullName, otp }) {
  const html = wrap(`
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px;">Reset Your Password</h2>
    <p style="margin:0 0 24px;color:#555555;font-size:15px;line-height:1.6;">
      Hi <strong>${fullName}</strong>, we received a request to reset your
      Jeevan Saarthi password. Use the code below to reset it.
    </p>

    <!-- OTP Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:14px;
                      padding:28px 40px;display:inline-block;text-align:center;">
            <p style="margin:0 0 6px;color:#991b1b;font-size:12px;font-weight:bold;
                      text-transform:uppercase;letter-spacing:2px;">
              Password Reset Code
            </p>
            <p style="margin:0;color:#991b1b;font-size:42px;font-weight:bold;
                      letter-spacing:10px;font-family:monospace;">
              ${otp}
            </p>
            <p style="margin:8px 0 0;color:#999999;font-size:12px;">
              This code expires in <strong>15 minutes</strong>
            </p>
          </div>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;color:#555555;font-size:14px;line-height:1.6;">
      Enter this code on the password reset page to set your new password.
    </p>

    <p style="margin:0;color:#999999;font-size:13px;">
      If you did not request a password reset, please ignore this email.
      Your account is safe and no changes have been made.
    </p>
  `);

  await send(email, `🔐 Your Jeevan Saarthi Password Reset Code — ${otp}`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 7 — Emergency Donor Alert
// ─────────────────────────────────────────────────────────────────────────────
async function sendEmergencyDonorAlert({
  donorEmail, donorName, bloodGroup, rh, urgencyLevel,
  hospitalName, location, unitsRequired, requesterName,
  requesterPhone, medicalCondition, trackingCode, emergencyId,
}) {
  const html = wrap(`
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#dc2626;border-radius:10px;margin-bottom:24px;">
      <tr><td style="padding:16px 24px;text-align:center;">
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">🚨 EMERGENCY BLOOD REQUEST</p>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Immediate response needed</p>
      </td></tr>
    </table>

    <p style="margin:0 0 16px;color:#1a1a1a;font-size:16px;">
      Hi <strong>${donorName}</strong>, someone urgently needs <strong style="color:#dc2626;">${bloodGroup}${rh}</strong> blood right now.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:2px solid #fecaca;border-radius:10px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:5px 0;color:#6b7280;width:160px;">Blood Needed:</td>
            <td style="padding:5px 0;font-weight:bold;color:#dc2626;font-size:18px;">${bloodGroup}${rh}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Units Required:</td>
            <td style="padding:5px 0;font-weight:bold;">${unitsRequired} unit${unitsRequired > 1 ? "s" : ""}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Hospital:</td>
            <td style="padding:5px 0;font-weight:bold;">${hospitalName}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Location:</td>
            <td style="padding:5px 0;font-weight:bold;">${location}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Urgency:</td>
            <td style="padding:5px 0;font-weight:bold;color:#dc2626;">${urgencyLevel}</td>
          </tr>
          ${medicalCondition ? `<tr>
            <td style="padding:5px 0;color:#6b7280;">Condition:</td>
            <td style="padding:5px 0;">${medicalCondition}</td>
          </tr>` : ""}
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Contact:</td>
            <td style="padding:5px 0;font-weight:bold;">${requesterName} — ${requesterPhone}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Tracking:</td>
            <td style="padding:5px 0;font-weight:bold;color:#991b1b;">${trackingCode}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <p style="margin:0 0 20px;color:#555555;font-size:14px;">
      If you are available and willing to donate, please log in to your dashboard and accept this emergency request, or contact the requester directly on <strong>${requesterPhone}</strong>.
    </p>

    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;width:100%;">
      <tr>
        <td style="background:#dc2626;border-radius:8px;text-align:center;padding:14px 20px;">
          <a href="${BASE_URL}/login?redirect=/emergency/detail/${emergencyId}" style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
            🩸 Accept Emergency Request →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#999999;font-size:12px;text-align:center;">
      Nepal Red Cross Emergency: <strong>01-4270650</strong>
    </p>
  `);

  await send(donorEmail, `🚨 EMERGENCY: ${bloodGroup}${rh} blood needed NOW at ${hospitalName}`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 8 — Notify emergency requester that donor accepted
// ─────────────────────────────────────────────────────────────────────────────
async function sendEmergencyAcceptedNotification({
  requesterEmail, requesterName, donorName, donorPhone,
  donorEmail, donorBloodGroup, bloodGroup, rh, hospitalName, trackingCode,
}) {
  const html = wrap(`
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#16a34a;border-radius:10px;margin-bottom:24px;">
      <tr><td style="padding:16px 24px;text-align:center;">
        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">✅ A DONOR HAS ACCEPTED!</p>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Contact them immediately</p>
      </td></tr>
    </table>

    <p style="margin:0 0 16px;color:#1a1a1a;font-size:16px;">
      Dear <strong>${requesterName}</strong>, a compatible donor has accepted your emergency blood request for <strong style="color:#dc2626;">${bloodGroup}${rh}</strong> at <strong>${hospitalName}</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:10px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 12px;color:#166534;font-size:13px;font-weight:bold;text-transform:uppercase;">Donor Contact Details</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:5px 0;color:#6b7280;width:160px;">Donor Name:</td>
            <td style="padding:5px 0;font-weight:bold;font-size:16px;">${donorName}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Phone Number:</td>
            <td style="padding:5px 0;font-weight:bold;font-size:16px;color:#16a34a;">${donorPhone}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Email:</td>
            <td style="padding:5px 0;">${donorEmail}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Blood Group:</td>
            <td style="padding:5px 0;font-weight:bold;color:#dc2626;">${donorBloodGroup}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Tracking Code:</td>
            <td style="padding:5px 0;font-weight:bold;">${trackingCode}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <p style="margin:0 0 16px;color:#555555;font-size:14px;">
      Please contact the donor immediately on <strong>${donorPhone}</strong> and coordinate the blood donation at <strong>${hospitalName}</strong>.
    </p>

    <p style="margin:0;color:#999999;font-size:12px;text-align:center;">
      Nepal Red Cross Emergency: <strong>01-4270650</strong>
    </p>
  `);

  await send(requesterEmail, `✅ Donor Found! ${donorName} accepted your emergency request — Contact Now`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 9 — Emergency Alert to Hospital / NGO
// ─────────────────────────────────────────────────────────────────────────────
async function sendEmergencyHospitalAlert({
  recipientEmail, recipientName, recipientType,
  bloodGroup, rh, urgencyLevel, hospitalName, location,
  unitsRequired, requesterName, requesterPhone, trackingCode,
}) {
  const html = wrap(`
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#991b1b;border-radius:10px;margin-bottom:24px;">
      <tr><td style="padding:16px 24px;text-align:center;">
        <p style="margin:0;color:#ffffff;font-size:18px;font-weight:bold;">🚨 Emergency Blood Alert — ${recipientType} Notification</p>
      </td></tr>
    </table>

    <p style="margin:0 0 16px;color:#1a1a1a;font-size:15px;">
      Dear <strong>${recipientName}</strong>, an emergency blood request has been submitted on Jeevan Saarthi that requires immediate attention.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:5px 0;color:#6b7280;width:160px;">Blood Needed:</td>
            <td style="padding:5px 0;font-weight:bold;color:#dc2626;font-size:18px;">${bloodGroup}${rh}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Units:</td>
            <td style="padding:5px 0;font-weight:bold;">${unitsRequired}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Hospital:</td>
            <td style="padding:5px 0;font-weight:bold;">${hospitalName}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Urgency:</td>
            <td style="padding:5px 0;font-weight:bold;color:#dc2626;">${urgencyLevel}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Requester:</td>
            <td style="padding:5px 0;">${requesterName} — ${requesterPhone}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Tracking:</td>
            <td style="padding:5px 0;font-weight:bold;">${trackingCode}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;width:100%;">
      <tr>
        <td style="background:#991b1b;border-radius:8px;text-align:center;padding:14px 20px;">
          <a href="${BASE_URL}/login?redirect=/emergency/org-detail/${trackingCode}" style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
            View Emergency Details & Coordinate →
          </a>
        </td>
      </tr>
    </table>
  `);

  await send(recipientEmail, `🚨 Emergency Alert: ${bloodGroup}${rh} blood needed at ${hospitalName} — Tracking: ${trackingCode}`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 10 — Life Saved Email to Requester
// ─────────────────────────────────────────────────────────────────────────────
async function sendLifeSavedEmail({
  requesterEmail, requesterName, donorName, donorEmail,
  bloodGroup, rh, hospitalName, trackingCode, emergencyId, donorEntryId,
}) {
  const thankYouUrl = `${BASE_URL}/emergency/feedback/${emergencyId}/${donorEntryId}`;

  const html = wrap(`
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#16a34a;border-radius:10px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;text-align:center;">
        <p style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">🩸 Someone Saved Your Life Today</p>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">A donor responded to your emergency request</p>
      </td></tr>
    </table>

    <p style="margin:0 0 16px;color:#1a1a1a;font-size:16px;">
      Dear <strong>${requesterName}</strong>,
    </p>
    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
      We are glad to inform you that a blood donor has confirmed they donated <strong style="color:#dc2626;">${bloodGroup}${rh}</strong> blood for your emergency request at <strong>${hospitalName}</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:10px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 12px;color:#166534;font-size:13px;font-weight:bold;text-transform:uppercase;">Donor Details</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:5px 0;color:#6b7280;width:140px;">Donor Name:</td>
            <td style="padding:5px 0;font-weight:bold;color:#111827;">${donorName}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Blood Donated:</td>
            <td style="padding:5px 0;font-weight:bold;color:#dc2626;">${bloodGroup}${rh}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Hospital:</td>
            <td style="padding:5px 0;font-weight:bold;">${hospitalName}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Tracking Code:</td>
            <td style="padding:5px 0;font-weight:bold;color:#991b1b;">${trackingCode}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <p style="margin:0 0 20px;color:#374151;font-size:14px;line-height:1.6;">
      If this donor truly helped you, a small thank you would mean the world to them and encourage more people to donate blood in the future.
    </p>

    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:12px;">
      <tr>
        <td style="background:#16a34a;border-radius:8px;text-align:center;padding:14px 20px;">
          <a href="${thankYouUrl}?action=thanks" style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
            💙 Send Thank You to Donor
          </a>
        </td>
      </tr>
    </table>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
      <tr>
        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;text-align:center;padding:12px 20px;">
          <a href="${thankYouUrl}?action=issue" style="color:#6b7280;font-size:13px;font-weight:bold;text-decoration:none;">
            ⚠️ Something went wrong — Report an Issue
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
      Nepal Red Cross Emergency: <strong>01-4270650</strong><br/>
      Jeevan Saarthi — Connecting donors and patients across Nepal
    </p>
  `);

  await send(
    requesterEmail,
    `💙 ${donorName} donated blood for your emergency — Thank them today`,
    html
  );
}

module.exports = {
  notifyDonorOfRequest,
  notifyRequesterOfAcceptance,
  notifyDonorOfConfirmation,
  notifyRequesterOfNoShow,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendEmergencyDonorAlert,
  sendEmergencyAcceptedNotification,
  sendEmergencyHospitalAlert,
  sendLifeSavedEmail,
};