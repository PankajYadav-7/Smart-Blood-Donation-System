import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Droplets, MapPin, ArrowLeft, CheckCircle,
  AlertCircle, Save, Loader, User, Phone,
  Mail, Heart, LogOut,
} from "lucide-react";

const DonorProfile = () => {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const user     = JSON.parse(localStorage.getItem("user") || "null");

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  // ── Change email state ──────────────────────────────────────────────────
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail,        setNewEmail]        = useState("");
  const [emailOtp,        setEmailOtp]        = useState("");
  const [emailOtpSent,    setEmailOtpSent]    = useState(false);
  const [emailLoading,    setEmailLoading]    = useState(false);
  const [emailError,      setEmailError]      = useState("");
  const [emailSuccess,    setEmailSuccess]    = useState("");

  const [formData, setFormData] = useState({
    // Blood
    bloodGroup:       "O",
    rh:               "+",
    // Location
    locationName:     "",
    radiusKm:         10,
    // Eligibility
    lastDonationDate: "",
    availability:     true,
    // Personal info
    fullName:         "",
    phone:            "",
    gender:           "male",
    dateOfBirth:      "",
    weight:           "",
    // Health
    hasIllness:       false,
    illnessDetails:   "",
  });

  const bloodGroups = ["A", "B", "AB", "O"];

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/donor/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const p = res.data.profile;
      if (p) {
        setFormData({
          bloodGroup:       p.bloodGroup       || "O",
          rh:               p.rh               || "+",
          locationName:     p.locationName     || "",
          radiusKm:         p.radiusKm         || 10,
          lastDonationDate: p.lastDonationDate
            ? new Date(p.lastDonationDate).toISOString().split("T")[0]
            : "",
          availability:     p.availability !== undefined ? p.availability : true,
          fullName:         user?.fullName      || "",
          phone:            p.phone             || "",
          gender:           p.gender            || "male",
          dateOfBirth:      p.dateOfBirth
            ? new Date(p.dateOfBirth).toISOString().split("T")[0]
            : "",
          weight:           p.weight            || "",
          hasIllness:       p.hasIllness        || false,
          illnessDetails:   p.illnessDetails    || "",
        });
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError("Failed to load profile. Please try again.");
      }
    }
    setLoading(false);
  };

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await axios.post(
        "http://localhost:5000/api/donor/profile",
        {
          bloodGroup:       formData.bloodGroup,
          rh:               formData.rh,
          locationName:     formData.locationName,
          radiusKm:         Number(formData.radiusKm),
          lastDonationDate: formData.lastDonationDate || null,
          availability:     formData.availability,
          phone:            formData.phone,
          gender:           formData.gender,
          dateOfBirth:      formData.dateOfBirth || null,
          weight:           formData.weight ? Number(formData.weight) : null,
          hasIllness:       formData.hasIllness,
          illnessDetails:   formData.illnessDetails,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile. Please try again.");
    }
    setSaving(false);
  };

  const getNextEligible = () => {
    if (!formData.lastDonationDate) return null;
    const last = new Date(formData.lastDonationDate);
    return new Date(last.getTime() + 56 * 24 * 60 * 60 * 1000);
  };

  const nextEligible  = getNextEligible();
  const isEligible    = !nextEligible || nextEligible <= new Date();
  const daysUntilNext = nextEligible
    ? Math.ceil((nextEligible - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

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
          onClick={() => navigate("/donor/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-500 mt-1">
            Keep your profile updated so we can match you with compatible requests
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            Profile saved successfully! Your changes are now live.
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

              {/* Full Name — read only, shown for reference */}
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  className={inputCls + " bg-gray-50 text-gray-500 cursor-not-allowed"}
                  value={formData.fullName}
                  readOnly
                  placeholder="Your full name"
                />
                <p className="text-xs text-gray-400 mt-1">
                  To change your name please contact support
                </p>
              </div>

              {/* Gender + Date of Birth */}
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
                    onChange={e => set("dateOfBirth", e.target.value)}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
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

              {/* Weight */}
              <div>
                <label className={labelCls}>Weight (kg)</label>
                <input
                  type="number"
                  className={inputCls}
                  placeholder="e.g. 65"
                  min="50"
                  max="200"
                  value={formData.weight}
                  onChange={e => set("weight", e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 50kg required to be eligible to donate</p>
              </div>

              {/* ── Change Email Section ── */}
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
                      setEmailError("");
                      setEmailSuccess("");
                      setEmailOtpSent(false);
                      setNewEmail("");
                      setEmailOtp("");
                    }}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    {showEmailChange ? "Cancel" : "Change Email"}
                  </button>
                </div>

                {showEmailChange && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">

                    {emailError && (
                      <p className="text-xs text-red-600 font-medium">⚠️ {emailError}</p>
                    )}
                    {emailSuccess && (
                      <p className="text-xs text-green-600 font-medium">✅ {emailSuccess}</p>
                    )}

                    {!emailOtpSent ? (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">New Email Address</label>
                          <input
                            type="email"
                            className={inputCls}
                            placeholder="your.new@email.com"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          disabled={emailLoading || !newEmail}
                          onClick={async () => {
                            setEmailLoading(true);
                            setEmailError("");
                            try {
                              await axios.post("http://localhost:5000/api/auth/change-email/request", {
                                currentEmail: user?.email,
                                newEmail,
                              });
                              setEmailOtpSent(true);
                            } catch (err) {
                              setEmailError(err.response?.data?.message || "Failed to send code. Try again.");
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
                          A 6-digit code was sent to <strong>{newEmail}</strong>. Enter it below to confirm.
                        </p>
                        <input
                          type="text"
                          maxLength={6}
                          value={emailOtp}
                          onChange={e => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="000000"
                          className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                        />
                        <button
                          type="button"
                          disabled={emailLoading || emailOtp.length !== 6}
                          onClick={async () => {
                            setEmailLoading(true);
                            setEmailError("");
                            try {
                              await axios.post("http://localhost:5000/api/auth/change-email/verify", {
                                currentEmail: user?.email,
                                newEmail,
                                otp: emailOtp,
                              });
                              setEmailSuccess("Email updated successfully! Please log in again with your new email.");
                              setShowEmailChange(false);
                              // Update localStorage and force re-login after 3 seconds
                              setTimeout(() => {
                                localStorage.removeItem("token");
                                localStorage.removeItem("user");
                                window.location.href = "/login";
                              }, 3000);
                            } catch (err) {
                              setEmailError(err.response?.data?.message || "Incorrect code. Try again.");
                            }
                            setEmailLoading(false);
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
                        >
                          {emailLoading ? "Verifying..." : "✅ Confirm New Email"}
                        </button>
                        <button
                          type="button"
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

          {/* ── BLOOD GROUP ── */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Droplets className="h-5 w-5 text-red-600" />
                Your Blood Group
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Blood Group</label>
                <div className="grid grid-cols-4 gap-2">
                  {bloodGroups.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => set("bloodGroup", bg)}
                      className={`py-3 rounded-xl font-bold text-lg border-2 transition-all duration-200 ${
                        formData.bloodGroup === bg
                          ? "border-red-600 bg-red-600 text-white shadow-md"
                          : "border-gray-200 bg-white text-gray-700 hover:border-red-300"
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Rh Factor</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "+", label: "Positive (+)" },
                    { value: "-", label: "Negative (−)" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => set("rh", option.value)}
                      className={`py-3 px-4 rounded-xl font-semibold text-sm border-2 transition-all duration-200 ${
                        formData.rh === option.value
                          ? "border-red-600 bg-red-600 text-white shadow-md"
                          : "border-gray-200 bg-white text-gray-700 hover:border-red-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.bloodGroup && formData.rh && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">{formData.bloodGroup}{formData.rh}</span>
                  </div>
                  <div>
                    <p className="font-bold text-red-800">{formData.bloodGroup}{formData.rh} Blood Type</p>
                    <p className="text-red-600 text-sm mt-0.5">You will be matched with requests needing this blood type</p>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          {/* ── HEALTH CONDITION ── */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-5 w-5 text-red-600" />
                Health Condition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Do you have any chronic illness?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: false, label: "✅ No — I am healthy" },
                    { value: true,  label: "⚠️ Yes — I have a condition" },
                  ].map(opt => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => set("hasIllness", opt.value)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                        formData.hasIllness === opt.value
                          ? !opt.value
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-yellow-500 bg-yellow-50 text-yellow-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.hasIllness && (
                <div>
                  <label className={labelCls}>Please describe your condition</label>
                  <textarea
                    className={inputCls}
                    rows={2}
                    placeholder="e.g. Diabetes, Hepatitis B, Heart condition..."
                    value={formData.illnessDetails}
                    onChange={e => set("illnessDetails", e.target.value)}
                  />
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ Some conditions may affect eligibility to donate blood
                  </p>
                </div>
              )}

            </CardContent>
          </Card>

          {/* ── LOCATION ── */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5 text-red-600" />
                Your Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={labelCls}>Your City / Area</label>
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={e => set("locationName", e.target.value)}
                  placeholder="e.g. Kathmandu, Lalitpur, Bhaktapur"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Preferred Radius (km)</label>
                <select
                  value={formData.radiusKm}
                  onChange={e => set("radiusKm", Number(e.target.value))}
                  className={inputCls}
                >
                  {[5, 10, 15, 20, 30, 50].map(km => (
                    <option key={km} value={km}>{km} km radius</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* ── DONATION ELIGIBILITY ── */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Donation Eligibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={labelCls}>
                  Last Donation Date <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={formData.lastDonationDate}
                  onChange={e => set("lastDonationDate", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className={inputCls}
                />
              </div>

              {formData.lastDonationDate && (
                <div className={`rounded-xl p-4 border ${isEligible ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {isEligible
                      ? <CheckCircle className="h-5 w-5 text-green-600" />
                      : <AlertCircle className="h-5 w-5 text-yellow-600" />
                    }
                    <span className={`font-semibold text-sm ${isEligible ? "text-green-800" : "text-yellow-800"}`}>
                      {isEligible ? "Eligible to Donate Now" : `Not Yet Eligible — ${daysUntilNext} days remaining`}
                    </span>
                  </div>
                  <p className={`text-xs ${isEligible ? "text-green-700" : "text-yellow-700"}`}>
                    {isEligible
                      ? "It has been more than 56 days since your last donation. You are ready!"
                      : `Next eligible date: ${nextEligible?.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. Blood donors must wait 56 days between donations.`
                    }
                  </p>
                </div>
              )}

              {!formData.lastDonationDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs text-blue-700">
                    If this is your first donation or you are unsure of the date — leave this empty. You will be treated as eligible to donate.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── AVAILABILITY ── */}
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Available to Donate</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Turn off to temporarily stop receiving requests</p>
                </div>
                <button
                  type="button"
                  onClick={() => set("availability", !formData.availability)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                    formData.availability ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                    formData.availability ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
              <div className={`mt-4 rounded-xl px-4 py-3 flex items-center gap-2 ${
                formData.availability ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"
              }`}>
                {formData.availability
                  ? <><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-sm text-green-700 font-medium">You are available to donate</span></>
                  : <><AlertCircle className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-500">You are not available — you will not receive requests</span></>
                }
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

export default DonorProfile;