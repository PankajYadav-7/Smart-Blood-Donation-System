import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Phone, Droplets, AlertCircle, CheckCircle,
  Heart, Clock, MapPin, User, Mail, Copy,
} from "lucide-react";

const API = "http://localhost:5000/api";

const Emergency = () => {
  const navigate = useNavigate();
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState("");

  const [formData, setFormData] = useState({
    // Requester info
    requesterName:  "",
    requesterPhone: "",
    requesterEmail: "",
    // Blood
    bloodGroup:     "O",
    rh:             "+",
    unitsRequired:  1,
    // Location
    hospitalName:   "",
    location:       "",
    // Urgency
    urgencyLevel:   "Critical",
    // Patient
    patientName:      "",
    medicalCondition: "",
  });

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const bloodGroups = ["A", "B", "AB", "O"];

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!formData.requesterName.trim()) { setError("Your name is required."); setLoading(false); return; }
    if (!formData.requesterPhone.trim()) { setError("Your phone number is required."); setLoading(false); return; }
    if (!formData.hospitalName.trim()) { setError("Hospital name is required."); setLoading(false); return; }

    try {
      const res = await axios.post(`${API}/emergency`, formData);
      setResult(res.data);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit. Please try again or call 01-4270650.");
    }
    setLoading(false);
  };

  // ── SUCCESS SCREEN ─────────────────────────────────────────────────────────
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-12">

          {/* Success header */}
          <div className="bg-green-600 rounded-2xl p-6 text-white text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Emergency Request Submitted!</h1>
            <p className="text-green-100 text-sm">Help is on the way</p>
          </div>

          {/* Tracking code */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-red-200 p-6 mb-5 text-center">
            <p className="text-sm text-gray-500 mb-1">Your Emergency Tracking Code</p>
            <p className="text-4xl font-bold text-red-600 tracking-wider mb-2">
              {result.trackingCode}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Save this code to track your emergency request status
            </p>
            <button
              onClick={() => navigate(`/emergency/track/${result.trackingCode}`)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all mb-3"
            >
              📍 Track Emergency Status
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/emergency/track/${result.trackingCode}`
                );
                alert("Tracking link copied!");
              }}
              className="w-full border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <Copy className="h-4 w-4" />Copy Tracking Link
            </button>
          </div>

          {/* Notification summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5">
            <p className="text-sm font-bold text-blue-800 mb-3">✅ We have notified:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Compatible Donors</span>
                <span className="font-bold text-blue-900 bg-blue-200 px-3 py-1 rounded-full text-sm">
                  {result.donorsNotified}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Hospitals</span>
                <span className="font-bold text-blue-900 bg-blue-200 px-3 py-1 rounded-full text-sm">
                  {result.hospitalsNotified}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">NGOs</span>
                <span className="font-bold text-blue-900 bg-blue-200 px-3 py-1 rounded-full text-sm">
                  {result.ngosNotified}
                </span>
              </div>
            </div>
            {formData.requesterEmail && (
              <p className="text-xs text-blue-600 mt-3 border-t border-blue-200 pt-3">
                📧 You will receive an email at <strong>{formData.requesterEmail}</strong> when a donor accepts your request.
              </p>
            )}
          </div>

          {/* Nepal Red Cross */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center mb-5">
            <p className="text-sm font-semibold text-red-700 mb-1">
              While waiting, also call:
            </p>
            <a href="tel:014270650" className="text-2xl font-bold text-red-600 hover:underline">
              🇳🇵 Nepal Red Cross: 01-4270650
            </a>
            <p className="text-xs text-red-500 mt-1">Available 24/7</p>
          </div>

          <button
            onClick={() => { setSubmitted(false); setResult(null); setError(""); }}
            className="w-full border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-all"
          >
            Submit Another Emergency Request
          </button>

        </div>
        <Footer />
      </div>
    );
  }

  // ── EMERGENCY FORM ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Emergency Banner */}
        <div className="bg-red-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">🚨 Emergency Blood Request</h1>
              <p className="text-red-100 text-sm">
                No account needed — fill the form and donors are notified instantly
              </p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 flex items-center gap-2">
            <Phone className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-xs text-red-100">For immediate help also call:</p>
              <a href="tel:014270650" className="font-bold text-white hover:underline">
                Nepal Red Cross: 01-4270650
              </a>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-0 pt-6 px-8">
            <CardTitle className="text-xl flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Emergency Request Form
            </CardTitle>
            <p className="text-gray-500 text-sm mt-1">
              Fields marked * are required. Donors will be notified immediately after submission.
            </p>
          </CardHeader>

          <CardContent className="pt-6 pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ── SECTION 1: Your Contact Info ── */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <User className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Your Contact Information</p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Your Name *</label>
                      <input
                        className={inputCls}
                        placeholder="Full name"
                        value={formData.requesterName}
                        onChange={e => set("requesterName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Your Phone *</label>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 text-sm font-semibold flex-shrink-0">
                          +977
                        </span>
                        <input
                          className={inputCls}
                          type="tel"
                          placeholder="98XXXXXXXX"
                          value={formData.requesterPhone}
                          onChange={e => set("requesterPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                          maxLength={10}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>
                      Your Email
                      <span className="text-gray-400 font-normal ml-1">(Optional — to receive donor acceptance alerts)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        className={inputCls + " pl-10"}
                        type="email"
                        placeholder="your@email.com"
                        value={formData.requesterEmail}
                        onChange={e => set("requesterEmail", e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      💡 If you provide your email, you will receive an instant alert when a donor accepts
                    </p>
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: Blood Requirement ── */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <Droplets className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Blood Requirement</p>
                </div>
                <div className="space-y-4">

                  {/* Blood Group */}
                  <div>
                    <label className={labelCls}>Blood Group Needed *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {bloodGroups.map(group => (
                        <button
                          key={group}
                          type="button"
                          onClick={() => set("bloodGroup", group)}
                          className={`py-3 rounded-xl border-2 font-bold text-lg transition-all ${
                            formData.bloodGroup === group
                              ? "border-red-600 bg-red-600 text-white shadow-md"
                              : "border-gray-200 text-gray-700 hover:border-red-300"
                          }`}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rh Factor */}
                  <div>
                    <label className={labelCls}>Rh Factor *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "+", label: "Positive (+)" },
                        { value: "-", label: "Negative (−)" },
                      ].map(rh => (
                        <button
                          key={rh.value}
                          type="button"
                          onClick={() => set("rh", rh.value)}
                          className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                            formData.rh === rh.value
                              ? "border-red-600 bg-red-600 text-white"
                              : "border-gray-200 text-gray-700 hover:border-red-300"
                          }`}
                        >
                          {rh.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Blood type confirmation */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{formData.bloodGroup}{formData.rh}</span>
                    </div>
                    <p className="text-sm text-red-700">
                      Searching for <strong>{formData.bloodGroup}{formData.rh}</strong> donors — all compatible donors will be notified
                    </p>
                  </div>

                  {/* Units */}
                  <div>
                    <label className={labelCls}>Units Required *</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.unitsRequired}
                      onChange={e => set("unitsRequired", e.target.value)}
                      className={inputCls}
                      required
                    />
                  </div>

                </div>
              </div>

              {/* ── SECTION 3: Urgency ── */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <Clock className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Urgency Level *</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "Critical", label: "🔴 Critical", sub: "Within 1 hour", color: "border-red-500 bg-red-50 text-red-700" },
                    { value: "Urgent",   label: "🟠 Urgent",   sub: "Within 4 hours", color: "border-orange-500 bg-orange-50 text-orange-700" },
                    { value: "Normal",   label: "🟡 Normal",   sub: "Within today", color: "border-yellow-500 bg-yellow-50 text-yellow-700" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("urgencyLevel", opt.value)}
                      className={`py-3 px-2 rounded-xl border-2 font-semibold text-xs transition-all text-center ${
                        formData.urgencyLevel === opt.value
                          ? opt.color
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-bold">{opt.label}</p>
                      <p className="font-normal mt-0.5 opacity-75">{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── SECTION 4: Location ── */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Location</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Hospital / Medical Centre *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        className={inputCls + " pl-10"}
                        placeholder="e.g. Bir Hospital, Kathmandu"
                        value={formData.hospitalName}
                        onChange={e => set("hospitalName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>
                      Area / District
                      <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <input
                      className={inputCls}
                      placeholder="e.g. Kathmandu, Lalitpur, Bhaktapur"
                      value={formData.location}
                      onChange={e => set("location", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* ── SECTION 5: Patient Details ── */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <Heart className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Patient Details
                    <span className="text-gray-400 font-normal ml-1 normal-case">(Optional but helps donors)</span>
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Patient Name</label>
                    <input
                      className={inputCls}
                      placeholder="Name of the patient"
                      value={formData.patientName}
                      onChange={e => set("patientName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Medical Condition / Reason</label>
                    <textarea
                      className={inputCls}
                      rows={3}
                      placeholder="e.g. Surgery, Accident, Cancer treatment, Thalassemia..."
                      value={formData.medicalCondition}
                      onChange={e => set("medicalCondition", e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      This helps donors understand the urgency and makes them more likely to respond
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-base shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Submitting Emergency Request...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    🚨 Submit Emergency Request — Notify Donors Now
                  </span>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                All compatible donors, hospitals and NGOs will be notified immediately.
                No account required.
              </p>

            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Emergency;
