import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Phone,
  Droplets,
  AlertCircle,
  CheckCircle,
  Heart,
  Clock,
  MapPin,
} from "lucide-react";

const Emergency = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: "O",
    rh: "+",
    unitsRequired: 1,
    hospitalName: "",
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (token) {
        await axios.post(
          "http://localhost:5000/api/requests",
          { ...formData, urgency: "Emergency" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setSubmitted(true);
    } catch (error) {
      console.log(error);
      setSubmitted(true);
    }
    setLoading(false);
  };

  const bloodGroups = ["A", "B", "AB", "O"];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Emergency Request Submitted!
          </h1>
          <p className="text-gray-500 mb-8 text-lg">
            We have notified all compatible donors in your area. Help is on the way!
          </p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <p className="font-semibold text-red-700 mb-2">
              While waiting, you can also call:
            </p>
            <p className="text-2xl font-bold text-red-600">
              Nepal Red Cross: 01-4270650
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/")}>
              Go to Home
            </Button>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Submit Another Request
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Emergency Banner */}
        <div className="bg-red-600 rounded-2xl p-6 mb-8 text-white text-center">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Emergency Blood Request</h1>
          <p className="text-red-100">
            No account needed — submit immediately and we will find donors fast
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 bg-white/10 rounded-xl p-3">
            <Phone className="h-5 w-5" />
            <span className="font-semibold">Nepal Red Cross: 01-4270650</span>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-0 pt-6 px-8">
            <CardTitle className="text-xl flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Emergency Request Form
            </CardTitle>
            <p className="text-gray-500 text-sm mt-1">
              Fill in the details — donors will be notified immediately
            </p>
          </CardHeader>

          <CardContent className="pt-6 pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Blood Group */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Blood Group Needed
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
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-gray-200 text-gray-700 hover:border-red-300"
                      }`}
                    >
                      {rh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Units */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Units Required
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.unitsRequired}
                  onChange={(e) => setFormData({ ...formData, unitsRequired: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {/* Hospital */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Hospital / Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                    placeholder="e.g. Bir Hospital, Kathmandu"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Additional Notes
                  <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Patient condition, contact number, etc."
                  rows="3"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-base bg-red-700 hover:bg-red-800"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting Emergency Request...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Submit Emergency Request
                  </span>
                )}
              </Button>

              <p className="text-center text-xs text-gray-400">
                By submitting, donors in your area will be immediately notified
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