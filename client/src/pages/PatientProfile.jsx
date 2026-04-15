import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ArrowLeft, CheckCircle, AlertCircle,
  Save, Loader, User, Phone, Mail,
  MapPin, Heart, Droplets, Shield,
} from "lucide-react";

const API = "http://localhost:5000/api";

const PatientProfile = () => {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const user     = JSON.parse(localStorage.getItem("user") || "null");

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const [formData, setFormData] = useState({
    // Personal
    fullName:    "",
    gender:      "male",
    dateOfBirth: "",
    phone:       "",
    location:    "",
    // Blood need
    bloodGroupNeeded: "",
    rhNeeded:         "+",
    // Request context
    requestingFor:    "myself",
    patientName:      "",
    medicalCondition: "",
    hospitalName:     "",
    // Emergency contact
    emergencyContactName:  "",
    emergencyContactPhone: "",
  });

  // Change email state
  const [showEmailChange,  setShowEmailChange]  = useState(false);
  const [newEmail,         setNewEmail]         = useState("");
  const [emailOtp,         setEmailOtp]         = useState("");
  const [emailOtpSent,     setEmailOtpSent]     = useState(false);
  const [emailLoading,     setEmailLoading]     = useState(false);
  const [emailError,       setEmailError]       = useState("");
  const [emailSuccess,     setEmailSuccess]     = useState("");

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/patient/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const p = res.data.profile;
      if (p) {
        setFormData({
          fullName:             user?.fullName || "",
          gender:               p.gender              || "male",
          dateOfBirth:          p.dateOfBirth
            ? new Date(p.dateOfBirth).toISOString().split("T")[0]
            : "",
          phone:                p.phone               || "",
          location:             p.location            || "",
          bloodGroupNeeded:     p.bloodGroupNeeded    || "",
          rhNeeded:             p.rhNeeded            || "+",
          requestingFor:        p.requestingFor       || "myself",
          patientName:          p.patientName         || "",
          medicalCondition:     p.medicalCondition    || "",
          hospitalName:         p.hospitalName        || "",
          emergencyContactName:  p.emergencyContactName  || "",
          emergencyContactPhone: p.emergencyContactPhone || "",
        });
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError("Failed to load profile. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await axios.post(`${API}/patient/profile`, {
        gender:               formData.gender,
        dateOfBirth:          formData.dateOfBirth || null,
        phone:                formData.phone,
        location:             formData.location,
        bloodGroupNeeded:     formData.bloodGroupNeeded,
        rhNeeded:             formData.rhNeeded,
        requestingFor:        formData.requestingFor,
        patientName:          formData.patientName,
        medicalCondition:     formData.medicalCondition,
        hospitalName:         formData.hospitalName,
        emergencyContactName:  formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Please try again.");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="h-10 w-10 text-red-600 animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading your profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <button
          onClick={() => navigate("/patient/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Keep your details updated for faster blood request matching</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            Profile saved successfully!
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* ── PERSONAL INFORMATION ── */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-5 w-5 text-red-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Full name — read only */}
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  className={inputCls + " bg-gray-50 text-gray-500 cursor-not-allowed"}
                  value={formData.fullName}
                  readOnly
                />
                <p className="text-xs text-gray-400 mt-1">To change your name please contact support</p>
              </div>

              {/* Gender + DOB */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Gender</label>
                  <select className={inputCls} value={formData.gender} onChange={e => set("gender", e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={formData.dateOfBirth}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={e => set("dateOfBirth", e.target.value)}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className={labelCls}>Phone Number</label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 text-sm font-semibold flex-shrink-0">
                    +977
                  </span>
                  <input
                    type="tel"
                    className={inputCls}
                    placeholder="98XXXXXXXX"
                    value={formData.phone}
                    onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">10-digit Nepal number starting with 97 or 98</p>
              </div>

              {/* Location */}
              <div>
                <label className={labelCls}>Your Location</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Kathmandu, Lalitpur"
                  value={formData.location}
                  onChange={e => set("location", e.target.value)}
                />
              </div>

              {/* Change Email */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email Address</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailChange(!showEmailChange);
                      setEmailError(""); setEmailSuccess("");
                      setEmailOtpSent(false); setNewEmail(""); setEmailOtp("");
                    }}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    {showEmailChange ? "Cancel" : "Change Email"}
                  </button>
                </div>

                {showEmailChange && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                    {emailError   && <p className="text-xs text-red-600 font-medium">⚠️ {emailError}</p>}
                    {emailSuccess && <p className="text-xs text-green-600 font-medium">✅ {emailSuccess}</p>}

                    {!emailOtpSent ? (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">New Email Address</label>
                          <input type="email" className={inputCls} placeholder="your.new@email.com"
                            value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                        </div>
                        <button
                          type="button"
                          disabled={emailLoading || !newEmail}
                          onClick={async () => {
                            setEmailLoading(true); setEmailError("");
                            try {
                              await axios.post(`${API}/auth/change-email/request`, {
                                currentEmail: user?.email, newEmail,
                              });
                              setEmailOtpSent(true);
                            } catch (err) {
                              setEmailError(err.response?.data?.message || "Failed to send code.");
                            }
                            setEmailLoading(false);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
                        >
                          {emailLoading ? "Sending..." : "📨 Send Verification Code to New Email"}
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-blue-700">
                          Code sent to <strong>{newEmail}</strong>. Enter it below.
                        </p>
                        <input
                          type="text" maxLength={6} value={emailOtp}
                          onChange={e => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="000000"
                          className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                        />
                        <button
                          type="button"
                          disabled={emailLoading || emailOtp.length !== 6}
                          onClick={async () => {
                            setEmailLoading(true); setEmailError("");
                            try {
                              await axios.post(`${API}/auth/change-email/verify`, {
                                currentEmail: user?.email, newEmail, otp: emailOtp,
                              });
                              setEmailSuccess("Email updated! Logging you out in 3 seconds...");
                              setShowEmailChange(false);
                              setTimeout(() => {
                                localStorage.removeItem("token");
                                localStorage.removeItem("user");
                                window.location.href = "/login";
                              }, 3000);
                            } catch (err) {
                              setEmailError(err.response?.data?.message || "Incorrect code.");
                            }
                            setEmailLoading(false);
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
                        >
                          {emailLoading ? "Verifying..." : "✅ Confirm New Email"}
                        </button>
                        <button type="button"
                          onClick={() => { setEmailOtpSent(false); setEmailOtp(""); setEmailError(""); }}
                          className="w-full text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                          Wrong email? Go back
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          {/* ── BLOOD NEED DETAILS ── */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Droplets className="h-5 w-5 text-red-600" />
                Blood Requirement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Blood Group Needed</label>
                  <select className={inputCls} value={formData.bloodGroupNeeded} onChange={e => set("bloodGroupNeeded", e.target.value)}>
                    <option value="">Not specified</option>
                    {["A", "B", "AB", "O"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Rh Factor</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {[
                      { value: "+", label: "Positive (+)" },
                      { value: "-", label: "Negative (−)" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => set("rhNeeded", opt.value)}
                        className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                          formData.rhNeeded === opt.value
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-red-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {formData.bloodGroupNeeded && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{formData.bloodGroupNeeded}{formData.rhNeeded}</span>
                  </div>
                  <p className="text-sm text-red-700">
                    Your requests will be matched with donors who have <strong>{formData.bloodGroupNeeded}{formData.rhNeeded}</strong> blood type
                  </p>
                </div>
              )}

            </CardContent>
          </Card>

          {/* ── REQUEST CONTEXT ── */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-5 w-5 text-red-600" />
                Request Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Requesting for */}
              <div>
                <label className={labelCls}>Who are you requesting blood for?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "myself", label: "🙋 Myself" },
                    { value: "family", label: "👨‍👩‍👧 Family Member" },
                    { value: "friend", label: "🤝 Friend" },
                    { value: "other",  label: "👤 Other Person" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("requestingFor", opt.value)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                        formData.requestingFor === opt.value
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient name — only if not for myself */}
              {formData.requestingFor !== "myself" && (
                <div>
                  <label className={labelCls}>Patient's Full Name</label>
                  <input
                    className={inputCls}
                    placeholder="Name of the person who needs blood"
                    value={formData.patientName}
                    onChange={e => set("patientName", e.target.value)}
                  />
                </div>
              )}

              {/* Medical condition */}
              <div>
                <label className={labelCls}>Medical Condition / Reason</label>
                <textarea
                  className={inputCls}
                  rows={2}
                  placeholder="e.g. Surgery, Accident, Cancer treatment, Anaemia..."
                  value={formData.medicalCondition}
                  onChange={e => set("medicalCondition", e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">This helps donors understand the urgency</p>
              </div>

              {/* Hospital name */}
              <div>
                <label className={labelCls}>Hospital / Medical Centre</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Bir Hospital, Kathmandu"
                  value={formData.hospitalName}
                  onChange={e => set("hospitalName", e.target.value)}
                />
              </div>

            </CardContent>
          </Card>

          {/* ── EMERGENCY CONTACT ── */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-red-600" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-gray-500">
                This person will be contacted in case you are unreachable during a blood request emergency.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Contact Name</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Ram Sharma"
                    value={formData.emergencyContactName}
                    onChange={e => set("emergencyContactName", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Contact Phone</label>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 text-sm font-semibold flex-shrink-0">
                      +977
                    </span>
                    <input
                      type="tel"
                      className={inputCls}
                      placeholder="98XXXXXXXX"
                      value={formData.emergencyContactPhone}
                      onChange={e => set("emergencyContactPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-base shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving
              ? <><Loader className="h-5 w-5 animate-spin" />Saving Profile...</>
              : <><Save className="h-5 w-5" />Save Profile</>
            }
          </button>

        </form>
      </div>
      <Footer />
    </div>
  );
};

export default PatientProfile;
