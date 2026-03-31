import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Droplets,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  User,
} from "lucide-react";

const DonorProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    bloodGroup: "A",
    rh: "+",
    locationName: "",
    locationLat: "",
    locationLng: "",
    radiusKm: 10,
    availability: true,
    lastDonationDate: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    axios.get("http://localhost:5000/api/donor/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      const p = res.data.profile;
      setFormData({
        bloodGroup: p.bloodGroup || "A",
        rh: p.rh || "+",
        locationName: p.locationName || "",
        locationLat: p.locationLat || "",
        locationLng: p.locationLng || "",
        radiusKm: p.radiusKm || 10,
        availability: p.availability,
        lastDonationDate: p.lastDonationDate ? p.lastDonationDate.split("T")[0] : "",
      });
    })
    .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await axios.post(
        "http://localhost:5000/api/donor/profile",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Profile saved successfully!");
      setTimeout(() => navigate("/donor/dashboard"), 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save profile");
    }
    setLoading(false);
  };

  const bloodGroups = ["A", "B", "AB", "O"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-0 pt-8 px-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <User className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">{user?.fullName}</CardTitle>
                <p className="text-gray-500 text-sm">Complete your donor profile</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4 pb-8 px-8">
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Blood Group */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Blood Group
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {bloodGroups.map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setFormData({ ...formData, bloodGroup: group })}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rh Factor
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "+", label: "Positive (+)" },
                    { value: "-", label: "Negative (−)" },
                  ].map((rh) => (
                    <button
                      key={rh.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, rh: rh.value })}
                      className={`py-3 rounded-xl border-2 font-semibold transition-all ${
                        formData.rh === rh.value
                          ? "border-red-600 bg-red-600 text-white shadow-md"
                          : "border-gray-200 text-gray-700 hover:border-red-300"
                      }`}
                    >
                      {rh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blood Type Preview */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold">
                    {formData.bloodGroup}{formData.rh}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-red-700 text-lg">
                    {formData.bloodGroup}{formData.rh} Blood Type
                  </p>
                  <p className="text-xs text-red-500">
                    You will be matched with requests needing this blood type
                  </p>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Your Location
                  <span className="text-gray-400 font-normal ml-1">(City/Area)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    placeholder="e.g. Kathmandu, Lalitpur"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Radius */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Preferred Radius
                  <span className="text-gray-400 font-normal ml-1">(km)</span>
                </label>
                <input
                  type="number"
                  value={formData.radiusKm}
                  onChange={(e) => setFormData({ ...formData, radiusKm: e.target.value })}
                  min="1"
                  max="100"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Last Donation Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Last Donation Date
                  <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="date"
                  value={formData.lastDonationDate}
                  onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Availability Toggle */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Available to Donate</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Turn off to temporarily stop receiving requests
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, availability: !formData.availability })}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors shadow-inner ${
                      formData.availability ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                      formData.availability ? "translate-x-8" : "translate-x-1"
                    }`} />
                  </button>
                </div>
                <div className={`mt-2 text-xs font-medium ${formData.availability ? "text-green-600" : "text-gray-400"}`}>
                  {formData.availability ? "✅ You are available to donate" : "⏸️ You are not available right now"}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving Profile...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Save Profile
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default DonorProfile;
