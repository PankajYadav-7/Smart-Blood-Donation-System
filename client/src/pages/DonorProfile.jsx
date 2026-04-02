import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Droplets, MapPin, ArrowLeft, CheckCircle,
  AlertCircle, Save, Loader,
} from "lucide-react";

const DonorProfile = () => {
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");
  const user      = JSON.parse(localStorage.getItem("user") || "null");

  const [loading,  setLoading]  = useState(true);   // loading existing data
  const [saving,   setSaving]   = useState(false);  // saving form
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const [formData, setFormData] = useState({
    bloodGroup:       "O",
    rh:               "+",
    locationName:     "",
    radiusKm:         10,
    lastDonationDate: "",
    availability:     true,
  });

  const bloodGroups = ["A", "B", "AB", "O"];

  // ── Load existing profile on mount ──
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
        });
      }
    } catch (err) {
      // 404 means no profile yet — that is fine, show empty form
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
      await axios.post(
        "http://localhost:5000/api/donor/profile",
        {
          bloodGroup:       formData.bloodGroup,
          rh:               formData.rh,
          locationName:     formData.locationName,
          radiusKm:         Number(formData.radiusKm),
          lastDonationDate: formData.lastDonationDate || null,
          availability:     formData.availability,
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

  // Calculate next eligible date (56 days after last donation)
  const getNextEligible = () => {
    if (!formData.lastDonationDate) return null;
    const last = new Date(formData.lastDonationDate);
    const next = new Date(last.getTime() + 56 * 24 * 60 * 60 * 1000);
    return next;
  };

  const nextEligible   = getNextEligible();
  const isEligible     = !nextEligible || nextEligible <= new Date();
  const daysUntilNext  = nextEligible
    ? Math.ceil((nextEligible - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

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

        {/* Back button */}
        <button
          onClick={() => navigate("/donor/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Donor Profile</h1>
          <p className="text-gray-500 mt-1">
            Keep your profile updated so we can match you with compatible requests
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            Profile saved successfully! You are now visible to matching blood requests.
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* Blood Group Card */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Droplets className="h-5 w-5 text-red-600" />
                Your Blood Group
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Blood group selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Blood Group
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {bloodGroups.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setFormData({ ...formData, bloodGroup: bg })}
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

              {/* Rh factor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rh Factor
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "+", label: "Positive (+)" },
                    { value: "-", label: "Negative (−)" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, rh: option.value })}
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

              {/* Selected blood type display */}
              {formData.bloodGroup && formData.rh && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {formData.bloodGroup}{formData.rh}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-red-800">
                      {formData.bloodGroup}{formData.rh} Blood Type
                    </p>
                    <p className="text-red-600 text-sm mt-0.5">
                      You will be matched with requests needing this blood type
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5 text-red-600" />
                Your Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your City / Area
                </label>
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  placeholder="e.g. Kathmandu, Lalitpur, Bhaktapur"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Preferred Radius (km)
                </label>
                <select
                  value={formData.radiusKm}
                  onChange={(e) => setFormData({ ...formData, radiusKm: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                >
                  {[5, 10, 15, 20, 30, 50].map(km => (
                    <option key={km} value={km}>{km} km radius</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Donation History + Eligibility Card */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Donation Eligibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Donation Date <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={formData.lastDonationDate}
                  onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Eligibility status */}
              {formData.lastDonationDate && (
                <div className={`rounded-xl p-4 border ${
                  isEligible
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {isEligible
                      ? <CheckCircle className="h-5 w-5 text-green-600" />
                      : <AlertCircle className="h-5 w-5 text-yellow-600" />
                    }
                    <span className={`font-semibold text-sm ${
                      isEligible ? "text-green-800" : "text-yellow-800"
                    }`}>
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
                    If this is your first donation or you are unsure of the date — leave this empty.
                    You will be treated as eligible to donate.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Availability Card */}
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Available to Donate</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Turn off to temporarily stop receiving requests
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, availability: !formData.availability })}
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
                formData.availability
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-50 border border-gray-200"
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
            {saving ? (
              <><Loader className="h-5 w-5 animate-spin" />Saving Profile...</>
            ) : (
              <><Save className="h-5 w-5" />Save Profile</>
            )}
          </button>

        </form>
      </div>
      <Footer />
    </div>
  );
};

export default DonorProfile;
