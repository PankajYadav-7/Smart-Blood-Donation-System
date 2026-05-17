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
  donorEmail, donorBloodGroup, donorGender, bloodGroup, rh, hospitalName, trackingCode,
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
            <td style="padding:5px 0;font-weight:bold;font-size:18px;">
              ${donorPhone
                ? `<a href="tel:${donorPhone}" style="color:#16a34a;text-decoration:none;font-weight:bold;">${donorPhone}</a>`
                : `<span style="color:#dc2626;">Not provided — contact via email</span>`
              }
            </td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Email:</td>
            <td style="padding:5px 0;">
              <a href="mailto:${donorEmail}" style="color:#2563eb;font-weight:bold;">${donorEmail}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Blood Group:</td>
            <td style="padding:5px 0;font-weight:bold;color:#dc2626;font-size:16px;">${donorBloodGroup || "Compatible"}</td>
          </tr>
          ${donorGender ? `<tr>
            <td style="padding:5px 0;color:#6b7280;">Gender:</td>
            <td style="padding:5px 0;font-weight:bold;">${donorGender}</td>
          </tr>` : ""}
          <tr>
            <td style="padding:5px 0;color:#6b7280;">Tracking Code:</td>
            <td style="padding:5px 0;font-weight:bold;">${trackingCode}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <p style="margin:0 0 16px;color:#555555;font-size:14px;line-height:1.6;">
      Please contact <strong>${donorName}</strong> immediately to coordinate the blood donation at <strong>${hospitalName}</strong>.
      ${donorPhone
        ? `Call them directly on <strong style="color:#16a34a;font-size:16px;">${donorPhone}</strong> or`
        : `Phone not provided —`
      }
      email them at <a href="mailto:${donorEmail}" style="color:#2563eb;font-weight:bold;">${donorEmail}</a>.
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

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 11 — Certificate Earned Congratulations
// ─────────────────────────────────────────────────────────────────────────────
async function sendCertificateEarnedEmail({
  donorEmail, donorName, certTitle, certLevel,
  earnedAt, donationCount, certificateNumber,
}) {
  const sealEmoji  = certLevel === "bronze" ? "🥉" : certLevel === "silver" ? "🥈" : "🥇";
  const levelColor = certLevel === "bronze" ? "#cd7f32" : certLevel === "silver" ? "#a8a9ad" : "#d4af37";
  const earnedDate = new Date(earnedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#c0392b,#922b21);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
      <p style="color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Jeevan Saarthi — Blood Donation System</p>
      <h1 style="color:#ffffff;font-size:26px;margin:0;font-weight:800;">🎉 Certificate Earned!</h1>
    </div>

    <!-- Certificate Preview -->
    <div style="background:linear-gradient(135deg,#fff9f0,#ffffff,#fff9f0);border:3px solid ${levelColor};margin:24px;border-radius:12px;padding:32px;text-align:center;">
      <div style="border:1px solid ${levelColor};border-radius:8px;padding:24px;">
        <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${levelColor};font-weight:700;margin:0 0 4px;">Certificate of Recognition</p>
        <p style="font-size:48px;margin:16px 0;">${sealEmoji}</p>
        <h2 style="font-size:28px;color:#1a1a1a;margin:0 0 6px;font-weight:900;">${certTitle}</h2>
        <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${levelColor};font-weight:700;margin:0 0 20px;">${certLevel.charAt(0).toUpperCase() + certLevel.slice(1)} Certificate</p>
        <div style="width:80px;height:2px;background:linear-gradient(to right,transparent,${levelColor},transparent);margin:0 auto 20px;"></div>
        <p style="font-size:13px;color:#666;margin:0 0 6px;">This certificate is proudly awarded to</p>
        <p style="font-size:24px;color:#c0392b;font-weight:800;margin:0 0 12px;">${donorName}</p>
        <p style="font-size:12px;color:#555;margin:0 0 20px;line-height:1.6;">For completing <strong>${donationCount} blood donation${donationCount > 1 ? "s" : ""}</strong> and contributing to save lives across Nepal.</p>
        <div style="display:flex;justify-content:center;gap:32px;font-size:11px;color:#888;">
          <div><p style="margin:0;letter-spacing:2px;text-transform:uppercase;">Date Earned</p><p style="margin:4px 0 0;font-weight:700;color:#333;border-top:1px solid #ddd;padding-top:4px;">${earnedDate}</p></div>
          <div><p style="margin:0;letter-spacing:2px;text-transform:uppercase;">Certificate No.</p><p style="margin:4px 0 0;font-weight:700;color:#333;border-top:1px solid #ddd;padding-top:4px;">${certificateNumber}</p></div>
        </div>
      </div>
    </div>

    <!-- Message -->
    <div style="padding:0 24px 24px;">
      <p style="font-size:15px;color:#333;line-height:1.7;">
        Dear <strong>${donorName}</strong>,<br><br>
        Congratulations! You have officially earned your <strong>${certTitle}</strong> from Jeevan Saarthi.
        Your dedication to saving lives is truly inspiring. Every donation you make gives someone another chance at life.
      </p>
      <div style="background:#f8f9fa;border-left:4px solid ${levelColor};border-radius:4px;padding:16px;margin:16px 0;">
        <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">
          🩸 <strong>Donations completed:</strong> ${donationCount}<br>
          ❤️ <strong>Lives potentially saved:</strong> up to ${donationCount * 3}<br>
          📅 <strong>Certificate earned on:</strong> ${earnedDate}<br>
          🔖 <strong>Certificate number:</strong> ${certificateNumber}
        </p>
      </div>
      <p style="font-size:14px;color:#555;line-height:1.6;">
        Log in to your Jeevan Saarthi dashboard to download your official certificate and keep saving lives!
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin:24px 0;">
        <a href="http://localhost:5173/donor/dashboard"
          style="display:inline-block;background:linear-gradient(135deg,#c0392b,#922b21);color:white;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">
          🏆 View & Download Certificate
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#1a1a1a;padding:20px 24px;text-align:center;border-radius:0 0 12px 12px;">
      <p style="color:#999;font-size:11px;margin:0;">Jeevan Saarthi — Connecting donors, patients and hospitals across Nepal</p>
      <p style="color:#666;font-size:10px;margin:8px 0 0;">Nepal Red Cross Emergency: 01-4270650</p>
    </div>

  </div>`;

  await send(donorEmail, `🎉 Congratulations ${donorName}! You earned your ${certTitle} — Jeevan Saarthi`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 12 — Event RSVP Confirmation
// ─────────────────────────────────────────────────────────────────────────────
async function sendEventRSVPConfirmation({
  donorEmail, donorName, eventTitle, eventDate, startTime, endTime,
  venueName, address, city, organizerName, eventCode, contactPhone,
}) {
  const formattedDate = new Date(eventDate).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#c0392b,#922b21);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
      <p style="color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Jeevan Saarthi — Blood Donation Events</p>
      <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:800;">🩸 You're Registered!</h1>
      <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:8px 0 0;">See you at the event</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 24px;">
      <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
        Dear <strong>${donorName}</strong>,<br><br>
        Thank you for registering to attend our blood donation event. Your participation can help save lives across Nepal.
      </p>

      <!-- Event Card -->
      <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:20px;margin:20px 0;">
        <h2 style="margin:0 0 12px;color:#991b1b;font-size:18px;font-weight:800;">${eventTitle}</h2>

        <div style="border-top:1px solid #fecaca;padding-top:12px;">
          <table style="width:100%;font-size:13px;color:#444;">
            <tr>
              <td style="padding:6px 0;color:#888;width:120px;">📅 Date</td>
              <td style="padding:6px 0;font-weight:600;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;">⏰ Time</td>
              <td style="padding:6px 0;font-weight:600;">${startTime} — ${endTime}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;">📍 Venue</td>
              <td style="padding:6px 0;font-weight:600;">${venueName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;">🏙️ Location</td>
              <td style="padding:6px 0;">${address}, ${city}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;">🏥 Organized by</td>
              <td style="padding:6px 0;font-weight:600;">${organizerName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;">🔖 Event Code</td>
              <td style="padding:6px 0;font-weight:bold;color:#c0392b;">${eventCode}</td>
            </tr>
            ${contactPhone ? `<tr>
              <td style="padding:6px 0;color:#888;">📞 Contact</td>
              <td style="padding:6px 0;"><a href="tel:${contactPhone}" style="color:#c0392b;font-weight:600;text-decoration:none;">${contactPhone}</a></td>
            </tr>` : ""}
          </table>
        </div>
      </div>

      <!-- Preparation Tips -->
      <div style="background:#f0f9ff;border-left:4px solid #0284c7;border-radius:4px;padding:16px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#075985;">💡 Before You Come</p>
        <ul style="margin:0;padding-left:20px;color:#0c4a6e;font-size:13px;line-height:1.7;">
          <li>Eat a healthy meal 3 hours before donating</li>
          <li>Drink plenty of water — stay well hydrated</li>
          <li>Bring a valid government-issued ID</li>
          <li>Get a good night's sleep</li>
          <li>Avoid alcohol 24 hours before donation</li>
          <li>Wear comfortable clothing with sleeves you can roll up</li>
        </ul>
      </div>

      <!-- What to expect -->
      <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#444;">⏱ What to expect</p>
        <p style="margin:0;font-size:13px;color:#666;line-height:1.6;">
          The full process takes about 45-60 minutes. The actual blood donation only takes 8-10 minutes.
          You will be screened first, then donate, then rest with refreshments before leaving.
        </p>
      </div>

      <p style="font-size:14px;color:#555;line-height:1.6;margin:20px 0 0;">
        If you cannot attend, please cancel your RSVP from your dashboard so another donor can take your slot.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin:24px 0 8px;">
        <a href="http://localhost:5173/donor/dashboard"
          style="display:inline-block;background:linear-gradient(135deg,#c0392b,#922b21);color:white;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
          View My Dashboard
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#1a1a1a;padding:18px 24px;text-align:center;border-radius:0 0 12px 12px;">
      <p style="color:#999;font-size:11px;margin:0;">Jeevan Saarthi — Connecting donors and patients across Nepal</p>
      <p style="color:#666;font-size:10px;margin:8px 0 0;">Nepal Red Cross Emergency: 01-4270650</p>
    </div>

  </div>`;

  await send(donorEmail, `🩸 Registration Confirmed: ${eventTitle} — ${formattedDate}`, html);
}
// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 13 — Event Updated Notification (sent to all registered donors)
// ─────────────────────────────────────────────────────────────────────────────
async function sendEventUpdateEmail({
  donorEmail, donorName, eventTitle, eventDate, startTime, endTime,
  venueName, address, city, organizerName, eventCode, changes,
}) {
  const formattedDate = new Date(eventDate).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:linear-gradient(135deg,#d97706,#b45309);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
      <p style="color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Jeevan Saarthi — Event Update</p>
      <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:800;">⚠️ Event Details Updated</h1>
      <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:8px 0 0;">An event you registered for has been updated</p>
    </div>
    <div style="padding:28px 24px;">
      <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
        Dear <strong>${donorName}</strong>,<br><br>
        The organizer has updated the details for an event you are registered for.
        Please review the new information below.
      </p>
      <div style="background:#fffbeb;border:2px solid #fcd34d;border-radius:12px;padding:20px;margin:20px 0;">
        <h2 style="margin:0 0 12px;color:#92400e;font-size:18px;font-weight:800;">${eventTitle}</h2>
        <table style="width:100%;font-size:13px;color:#444;">
          <tr><td style="padding:6px 0;color:#888;width:120px;">📅 Date</td><td style="padding:6px 0;font-weight:600;">${formattedDate}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">⏰ Time</td><td style="padding:6px 0;font-weight:600;">${startTime} — ${endTime}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">📍 Venue</td><td style="padding:6px 0;font-weight:600;">${venueName}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">🏙️ Location</td><td style="padding:6px 0;">${address}, ${city}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">🏥 Organizer</td><td style="padding:6px 0;font-weight:600;">${organizerName}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">🔖 Event Code</td><td style="padding:6px 0;font-weight:bold;color:#d97706;">${eventCode}</td></tr>
        </table>
      </div>
      ${changes ? `<div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;padding:16px;margin:16px 0;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#92400e;">What changed:</p>
        <p style="margin:8px 0 0;font-size:13px;color:#78350f;">${changes}</p>
      </div>` : ""}
      <p style="font-size:13px;color:#555;margin:16px 0;">
        Your registration is still active. If the new details no longer work for you, you can cancel your RSVP from your dashboard.
      </p>
      <div style="text-align:center;margin:24px 0 8px;">
        <a href="http://localhost:5173/events/${eventCode}"
          style="display:inline-block;background:linear-gradient(135deg,#d97706,#b45309);color:white;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
          View Updated Event
        </a>
      </div>
    </div>
    <div style="background:#1a1a1a;padding:18px 24px;text-align:center;border-radius:0 0 12px 12px;">
      <p style="color:#999;font-size:11px;margin:0;">Jeevan Saarthi — Connecting donors and patients across Nepal</p>
      <p style="color:#666;font-size:10px;margin:8px 0 0;">Nepal Red Cross Emergency: 01-4270650</p>
    </div>
  </div>`;

  await send(donorEmail, `⚠️ Event Updated: ${eventTitle} — Please Check New Details`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 14 — Event Cancelled Notification (sent to all registered donors)
// ─────────────────────────────────────────────────────────────────────────────
async function sendEventCancelledEmail({
  donorEmail, donorName, eventTitle, eventDate, organizerName, eventCode,
}) {
  const formattedDate = new Date(eventDate).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
      <p style="color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Jeevan Saarthi — Event Cancelled</p>
      <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:800;">❌ Event Cancelled</h1>
      <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:8px 0 0;">An event you registered for has been cancelled</p>
    </div>
    <div style="padding:28px 24px;">
      <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
        Dear <strong>${donorName}</strong>,<br><br>
        We are sorry to inform you that the following event has been cancelled by the organizer.
        Your RSVP has been automatically removed.
      </p>
      <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <p style="font-size:11px;color:#dc2626;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Cancelled Event</p>
        <h2 style="margin:0 0 8px;color:#991b1b;font-size:20px;font-weight:800;">${eventTitle}</h2>
        <p style="margin:0;font-size:13px;color:#666;">📅 ${formattedDate}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#666;">🏥 Organized by ${organizerName}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#999;">Event Code: ${eventCode}</p>
      </div>
      <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:4px;padding:16px;margin:16px 0;">
        <p style="margin:0;font-size:13px;color:#166534;line-height:1.6;">
          💚 Thank you for your willingness to donate blood. Your generosity matters.
          Please check our Events page for other upcoming blood donation drives near you.
        </p>
      </div>
      <div style="text-align:center;margin:24px 0 8px;">
        <a href="http://localhost:5173/events"
          style="display:inline-block;background:linear-gradient(135deg,#c0392b,#922b21);color:white;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
          Browse Other Events
        </a>
      </div>
    </div>
    <div style="background:#1a1a1a;padding:18px 24px;text-align:center;border-radius:0 0 12px 12px;">
      <p style="color:#999;font-size:11px;margin:0;">Jeevan Saarthi — Connecting donors and patients across Nepal</p>
      <p style="color:#666;font-size:10px;margin:8px 0 0;">Nepal Red Cross Emergency: 01-4270650</p>
    </div>
  </div>`;

  await send(donorEmail, `❌ Event Cancelled: ${eventTitle} — ${formattedDate}`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL 15 — RSVP Cancellation Confirmation (sent to donor when they cancel)
// ─────────────────────────────────────────────────────────────────────────────
async function sendRSVPCancelledEmail({
  donorEmail, donorName, eventTitle, eventDate, organizerName, eventCode,
}) {
  const formattedDate = new Date(eventDate).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:linear-gradient(135deg,#6b7280,#4b5563);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
      <p style="color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Jeevan Saarthi — RSVP Cancelled</p>
      <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:800;">RSVP Cancelled</h1>
      <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:8px 0 0;">Your registration has been removed</p>
    </div>
    <div style="padding:28px 24px;">
      <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 16px;">
        Dear <strong>${donorName}</strong>,<br><br>
        Your RSVP for the following event has been successfully cancelled.
      </p>
      <div style="background:#f9fafb;border:2px solid #e5e7eb;border-radius:12px;padding:20px;margin:20px 0;">
        <h2 style="margin:0 0 8px;color:#374151;font-size:18px;font-weight:800;">${eventTitle}</h2>
        <p style="margin:0;font-size:13px;color:#666;">📅 ${formattedDate}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#666;">🏥 Organized by ${organizerName}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#999;">Event Code: ${eventCode}</p>
      </div>
      <p style="font-size:13px;color:#555;margin:16px 0;">
        Your slot has been freed up for another donor. If you change your mind, you can re-register from the Events page as long as the event is not full.
      </p>
      <div style="text-align:center;margin:24px 0 8px;">
        <a href="http://localhost:5173/events"
          style="display:inline-block;background:linear-gradient(135deg,#c0392b,#922b21);color:white;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
          Browse Events
        </a>
      </div>
    </div>
    <div style="background:#1a1a1a;padding:18px 24px;text-align:center;border-radius:0 0 12px 12px;">
      <p style="color:#999;font-size:11px;margin:0;">Jeevan Saarthi — Connecting donors and patients across Nepal</p>
      <p style="color:#666;font-size:10px;margin:8px 0 0;">Nepal Red Cross Emergency: 01-4270650</p>
    </div>
  </div>`;

  await send(donorEmail, `RSVP Cancelled: ${eventTitle} — ${formattedDate}`, html);
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
  sendCertificateEarnedEmail,
  sendEventRSVPConfirmation,
  sendEventUpdateEmail,
  sendEventCancelledEmail,
  sendRSVPCancelledEmail,
};