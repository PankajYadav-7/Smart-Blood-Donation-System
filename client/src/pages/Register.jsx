import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Navbar from "../components/Navbar";
import {
  Droplets, User, Building, Users, Eye, EyeOff,
  Upload, CheckCircle, Clock, Mail, Phone,
  FileText, MapPin, Shield, ArrowLeft,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// OTP VERIFICATION SCREEN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const OTPScreen = ({ email, onSuccess, onChangeEmail }) => {
  const [otp, setOtp]                 = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) { setError("Please enter the complete 6-digit code."); return; }
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });
      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await axios.post("http://localhost:5000/api/auth/resend-otp", { email });
      setSuccess("New verification code sent to your email!");
      setResendTimer(60);
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-10 pb-10 px-8 text-center">

              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <Mail className="h-10 w-10 text-red-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
              <p className="text-gray-500 mb-2 leading-relaxed text-sm">
                We sent a 6-digit verification code to:
              </p>
              <p className="text-red-600 font-semibold mb-2 text-sm break-all">{email}</p>

              {/* ── Wrong email — go back button ── */}
              <button
                onClick={onChangeEmail}
                className="text-xs text-gray-400 hover:text-red-600 underline mb-6 block mx-auto transition-colors"
              >
                ✏️ Wrong email? Go back and fix it
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm text-left">
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm text-left">
                  ✅ {success}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-center text-3xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                />
                <p className="text-xs text-gray-400 mt-2 text-left">
                  Code expires in 10 minutes. Check your spam folder if you don't see it.
                </p>
              </div>

              <button
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-base shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Verifying...
                  </span>
                ) : "Verify Email"}
              </button>

              <p className="text-sm text-gray-500">
                Did not receive the code?{" "}
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className={`font-semibold transition-all ${
                    resendTimer > 0 ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:underline cursor-pointer"
                  }`}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                </button>
              </p>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PHONE VALIDATION — Nepal 10 digits starting with 97 or 98
// ─────────────────────────────────────────────────────────────────────────────
const validateNepalPhone = (phone) => {
  const cleaned = phone.replace(/[\s\-\+]/g, "");
  return /^(97|98)\d{8}$/.test(cleaned);
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN REGISTER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Register = () => {
  const navigate  = useNavigate();
  const [userType, setUserType]           = useState("donor");
  const [loading,  setLoading]            = useState(false);
  const [error,    setError]              = useState("");
  const [showPass, setShowPass]           = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitted, setSubmitted]         = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [showOTP, setShowOTP]             = useState(false);
  const [otpEmail, setOtpEmail]           = useState("");
  const [phoneError, setPhoneError]       = useState("");

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", confirmPassword: "",
    bloodType: "", age: "", location: "", lastDonation: "",
    gender: "male", dateOfBirth: "", weight: "",
    hasIllness: "no", illnessDetails: "",
    orgName: "", licenseNumber: "", address: "", orgDescription: "",
    website: "",
  });

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const tabs = [
    { value: "donor",     label: "Donor",    icon: User     },
    { value: "requester", label: "Patient",  icon: User     },
    { value: "hospital",  label: "Hospital", icon: Building },
    { value: "ngo",       label: "NGO",      icon: Users    },
  ];

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  // Phone input — digits only, max 10, validate Nepal format
  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    set("phone", digits);
    if (digits.length === 10) {
      if (!validateNepalPhone(digits)) {
        setPhoneError("Nepal phone numbers must start with 97 or 98 and be 10 digits.");
      } else {
        setPhoneError("");
      }
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) { setError("Please accept the Terms of Service to continue."); return; }
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters."); return; }

    // Nepal phone validation for donor and patient
    if (userType === "donor" || userType === "requester") {
      if (!formData.phone) { setError("Phone number is required."); return; }
      if (!validateNepalPhone(formData.phone)) {
        setError("Please enter a valid Nepal phone number — 10 digits starting with 97 or 98.");
        return;
      }
    }

    setLoading(true);
    setError("");

    const isOrg = userType === "hospital" || userType === "ngo";
    const fullName = isOrg
      ? formData.orgName
      : `${formData.firstName} ${formData.lastName}`.trim();

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        fullName,
        email:          formData.email,
        password:       formData.password,
        role:           userType,
        phone:          formData.phone,
        licenseNumber:  formData.licenseNumber,
        address:        formData.address,
        orgDescription: formData.orgDescription,
        bloodType:      formData.bloodType,
        location:       formData.location,
        gender:         formData.gender,
        dateOfBirth:    formData.dateOfBirth,
        weight:         formData.weight,
        hasIllness:     formData.hasIllness,
        illnessDetails: formData.illnessDetails,
      });

      if (response.data.requiresApproval) {
        setSubmittedData({ name: fullName, email: formData.email, role: userType });
        setSubmitted(true);
        return;
      }

      if (response.data.requiresOTP) {
        setOtpEmail(response.data.email);
        setShowOTP(true);
        return;
      }

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  // ── OTP SCREEN ──
  if (showOTP) {
    return (
      <OTPScreen
        email={otpEmail}
        onSuccess={() => navigate("/login")}
        onChangeEmail={() => {
          setShowOTP(false);
          setOtpEmail("");
          set("email", "");
          setLoading(false); // ← this fixes the spinning button
        }}
      />
    );
  }

  // ── PENDING APPROVAL SCREEN ──
  if (submitted && submittedData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-lg">
            <Card className="border-0 shadow-xl">
              <CardContent className="pt-10 pb-10 px-8 text-center">
                <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-10 w-10 text-yellow-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h1>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  Thank you for registering <strong className="text-gray-800">{submittedData.name}</strong> on
                  Jeevan Saarthi. Your application is now under review by our verification team.
                </p>
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left space-y-4">
                  {[
                    { icon: <CheckCircle className="h-4 w-4 text-green-600" />, bg: "bg-green-100", title: "Application Submitted", sub: "Your details have been received" },
                    { icon: <Clock className="h-4 w-4 text-yellow-600 animate-spin" />, bg: "bg-yellow-100", title: "Under Review by Our Team", sub: "Our team is verifying your organisation — 2 to 3 business days" },
                    { icon: <Mail className="h-4 w-4 text-gray-400" />, bg: "bg-gray-100", title: "Email Notification", sub: `You will receive an approval email at ${submittedData.email}`, muted: true },
                    { icon: <Shield className="h-4 w-4 text-gray-400" />, bg: "bg-gray-100", title: "Account Activated", sub: "Login and access your dashboard after approval", muted: true },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${step.bg} flex items-center justify-center flex-shrink-0`}>
                        {step.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${step.muted ? "text-gray-400" : "text-gray-900"}`}>{step.title}</p>
                        <p className="text-xs text-gray-400">{step.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                  <p className="text-xs text-blue-700 font-semibold mb-1">📧 Check your email</p>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    A confirmation has been sent to <strong>{submittedData.email}</strong>.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link to="/login" className="w-full inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-all">
                    Go to Login Page
                  </Link>
                  <Link to="/" className="w-full inline-flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-xl text-sm transition-all">
                    Back to Home
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN REGISTER FORM ──
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <Card className="border-0 shadow-xl">

            <CardHeader className="text-center pb-2 pt-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg">
                  <Droplets className="h-7 w-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Join Jeevan Saarthi</CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                Create your account and start saving lives today
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 pb-8 px-8">

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
                  <span className="flex-shrink-0">⚠️</span>{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Role Tabs */}
                <div>
                  <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-xl p-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => { setUserType(tab.value); setError(""); setPhoneError(""); }}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          userType === tab.value ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <tab.icon className="h-3.5 w-3.5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {(userType === "hospital" || userType === "ngo") && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
                      <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800 leading-relaxed">
                        <strong>Organisation accounts require verification.</strong> After registration your details will be reviewed by our team within 2–3 business days.
                      </p>
                    </div>
                  )}

                  {(userType === "donor" || userType === "requester") && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                      <Mail className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800 leading-relaxed">
                        <strong>Email verification required.</strong> After registration a 6-digit code will be sent to your email. You must verify before logging in.
                      </p>
                    </div>
                  )}
                </div>

                {/* ── DONOR / PATIENT FORM ── */}
                {(userType === "donor" || userType === "requester") && (
                  <div className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>First Name *</label>
                        <input className={inputCls} placeholder="Pankaj" value={formData.firstName} onChange={e => set("firstName", e.target.value)} required />
                      </div>
                      <div>
                        <label className={labelCls}>Last Name *</label>
                        <input className={inputCls} placeholder="Yadav" value={formData.lastName} onChange={e => set("lastName", e.target.value)} required />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Email Address *</label>
                      <input className={inputCls} type="email" placeholder="your@email.com" value={formData.email} onChange={e => set("email", e.target.value)} required />
                      <p className="text-xs text-orange-500 mt-1 font-medium">
                        ⚠️ Double check your email — a verification code will be sent here and cannot be changed after this step
                      </p>
                    </div>

                    {/* Nepal phone validation */}
                    <div>
                      <label className={labelCls}>Phone Number *</label>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 text-sm font-semibold flex-shrink-0">
                          +977
                        </span>
                        <div className="flex-1">
                          <input
                            className={`${inputCls} ${phoneError ? "border-red-400 focus:ring-red-400" : formData.phone.length === 10 && validateNepalPhone(formData.phone) ? "border-green-400 focus:ring-green-400" : ""}`}
                            type="tel"
                            placeholder="98XXXXXXXX"
                            value={formData.phone}
                            onChange={e => handlePhoneChange(e.target.value)}
                            maxLength={10}
                            required
                          />
                        </div>
                      </div>
                      {phoneError ? (
                        <p className="text-xs text-red-500 mt-1">⚠️ {phoneError}</p>
                      ) : formData.phone.length === 10 && validateNepalPhone(formData.phone) ? (
                        <p className="text-xs text-green-600 mt-1">✅ Valid Nepal number</p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1">Enter 10-digit number starting with 97 or 98 (e.g. 9841234567)</p>
                      )}
                    </div>

                    {/* Donor specific */}
                    {userType === "donor" && (
                      <div className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelCls}>Gender *</label>
                            <select className={inputCls} value={formData.gender} onChange={e => set("gender", e.target.value)} required>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Date of Birth *</label>
                            <input className={inputCls} type="date"
                              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                              value={formData.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} required />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelCls}>Blood Type *</label>
                            <select className={inputCls} value={formData.bloodType} onChange={e => set("bloodType", e.target.value)} required>
                              <option value="">Select blood type</option>
                              {bloodTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Weight (kg) *</label>
                            <input className={inputCls} type="number" placeholder="e.g. 65" min="50" max="200"
                              value={formData.weight} onChange={e => set("weight", e.target.value)} required />
                            <p className="text-xs text-gray-400 mt-1">Minimum 50kg required to donate</p>
                          </div>
                        </div>

                        <div>
                          <label className={labelCls}>Do you have any chronic illness? *</label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { value: "no",  label: "✅ No — I am healthy" },
                              { value: "yes", label: "⚠️ Yes — I have a condition" },
                            ].map(opt => (
                              <button key={opt.value} type="button" onClick={() => set("hasIllness", opt.value)}
                                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                                  formData.hasIllness === opt.value
                                    ? opt.value === "no" ? "border-green-500 bg-green-50 text-green-700" : "border-yellow-500 bg-yellow-50 text-yellow-700"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {formData.hasIllness === "yes" && (
                          <div>
                            <label className={labelCls}>Please describe your condition *</label>
                            <textarea className={inputCls} rows={2}
                              placeholder="e.g. Diabetes, Hepatitis B, Heart condition..."
                              value={formData.illnessDetails} onChange={e => set("illnessDetails", e.target.value)} required />
                            <p className="text-xs text-yellow-600 mt-1">⚠️ Some conditions may affect eligibility. Our team will review.</p>
                          </div>
                        )}

                      </div>
                    )}

                    <div>
                      <label className={labelCls}>Location *</label>
                      <input className={inputCls} placeholder="Kathmandu, Nepal" value={formData.location} onChange={e => set("location", e.target.value)} required />
                    </div>

                  </div>
                )}

                {/* ── HOSPITAL FORM ── */}
                {userType === "hospital" && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Hospital Name *</label>
                      <input className={inputCls} placeholder="Bir Hospital" value={formData.orgName} onChange={e => set("orgName", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Official Email *</label>
                      <input className={inputCls} type="email" placeholder="contact@hospital.com" value={formData.email} onChange={e => set("email", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number *</label>
                      <input className={inputCls} type="tel" placeholder="+977-01-XXXXXXX" value={formData.phone} onChange={e => set("phone", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Medical License Number *</label>
                      <input className={inputCls} placeholder="License #12345" value={formData.licenseNumber} onChange={e => set("licenseNumber", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Hospital Address *</label>
                      <textarea className={inputCls} rows={2} placeholder="Full hospital address" value={formData.address} onChange={e => set("address", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>About the Hospital</label>
                      <textarea className={inputCls} rows={2} placeholder="Brief description of services offered..." value={formData.orgDescription} onChange={e => set("orgDescription", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Upload Verification Documents</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Upload medical license, registration certificate</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG — max 5MB each</p>
                        <button type="button" className="mt-2 text-xs border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50">Choose Files</button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Note: Document upload will be available after approval.</p>
                    </div>
                  </div>
                )}

                {/* ── NGO FORM ── */}
                {userType === "ngo" && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Organisation Name *</label>
                      <input className={inputCls} placeholder="Nepal Red Cross" value={formData.orgName} onChange={e => set("orgName", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Official Email *</label>
                      <input className={inputCls} type="email" placeholder="contact@ngo.org" value={formData.email} onChange={e => set("email", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number *</label>
                      <input className={inputCls} type="tel" placeholder="+977-98XXXXXXXX" value={formData.phone} onChange={e => set("phone", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Registration Number *</label>
                      <input className={inputCls} placeholder="NGO Registration #" value={formData.licenseNumber} onChange={e => set("licenseNumber", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Organisation Address *</label>
                      <textarea className={inputCls} rows={2} placeholder="Full organisation address" value={formData.address} onChange={e => set("address", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Mission Statement</label>
                      <textarea className={inputCls} rows={2} placeholder="Describe your organisation's mission..." value={formData.orgDescription} onChange={e => set("orgDescription", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Upload Verification Documents</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Upload registration certificate, tax documents</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG — max 5MB each</p>
                        <button type="button" className="mt-2 text-xs border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50">Choose Files</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PASSWORD FIELDS ── */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Password *</label>
                    <div className="relative">
                      <input className={inputCls + " pr-10"} type={showPass ? "text" : "password"} placeholder="Min 6 characters" value={formData.password} onChange={e => set("password", e.target.value)} required />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Confirm Password *</label>
                    <div className="relative">
                      <input className={inputCls + " pr-10"} type={showConfirm ? "text" : "password"} placeholder="Repeat password" value={formData.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} required />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-0.5 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I agree to the <span className="text-red-600 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-red-600 hover:underline cursor-pointer">Privacy Policy</span>
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !!phoneError}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-base shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      {userType === "hospital" || userType === "ngo" ? "Submitting Application..." : "Creating Account..."}
                    </span>
                  ) : (
                    userType === "hospital" || userType === "ngo" ? "Submit Application" : "Create Account"
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-red-600 hover:underline font-semibold">Sign in</Link>
              </p>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;