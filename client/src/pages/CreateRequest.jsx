import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Droplets,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Heart,
} from "lucide-react";

const CreateRequest = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    bloodGroup: "A",
    rh: "+",
    unitsRequired: 1,
    urgency: "Normal",
    hospitalName: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await axios.post(
        "http://localhost:5000/api/requests",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Blood request created successfully!");
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create request");
    }
    setLoading(false);
  };

  const bloodGroups = ["A", "B", "AB", "O"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-0 pt-8 px-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Droplets className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Create Blood Request</CardTitle>
                <p className="text-gray-500 text-sm mt-0.5">
                  Fill in the details to find matching donors
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 pb-8 px-8">
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

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Blood Group Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Blood Group Required
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

              {/* Selected Blood Type Preview */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {formData.bloodGroup}{formData.rh}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-red-700">
                    {formData.bloodGroup}{formData.rh} Blood Type Selected
                  </p>
                  <p className="text-xs text-red-500">
                    We will match donors with compatible blood types
                  </p>
                </div>
              </div>

              {/* Units Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Units Required
                </label>
                <input
                  type="number"
                  name="unitsRequired"
                  min="1"
                  max="10"
                  value={formData.unitsRequired}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Urgency Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "Normal", label: "Normal", description: "Within 24 hours", color: "green" },
                    { value: "Emergency", label: "Emergency", description: "Immediately", color: "red" },
                  ].map((urgency) => (
                    <button
                      key={urgency.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, urgency: urgency.value })}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        formData.urgency === urgency.value
                          ? urgency.color === "red"
                            ? "border-red-600 bg-red-50"
                            : "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className={`font-semibold text-sm ${
                        formData.urgency === urgency.value
                          ? urgency.color === "red" ? "text-red-700" : "text-green-700"
                          : "text-gray-700"
                      }`}>
                        {urgency.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{urgency.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hospital Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Hospital / Location Name
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  placeholder="e.g. Bir Hospital, Kathmandu"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Additional Notes
                  <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional information about the patient or request..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Request...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Create Blood Request
                  </span>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default CreateRequest;