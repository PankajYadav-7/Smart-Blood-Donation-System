import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Calendar, Clock, MapPin, Building, Phone, Droplets, ArrowLeft, Loader, CheckCircle, AlertCircle } from "lucide-react";

const API = "http://localhost:5000/api";

const CreateEvent = () => {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const user     = JSON.parse(localStorage.getItem("user") || "null");

  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState(null);

  const [formData, setFormData] = useState({
    title:            "",
    description:      "",
    eventDate:        "",
    startTime:        "09:00",
    endTime:          "17:00",
    venueName:        "",
    address:          "",
    city:             "Kathmandu",
    bloodTypesNeeded: [],
    targetDonors:     50,
    whatToBring:      "Valid ID, eat well before donating",
    contactPerson:    user?.fullName || "",
    contactPhone:     "",
  });

  const bloodTypeOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleBloodToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      bloodTypesNeeded: prev.bloodTypesNeeded.includes(type)
        ? prev.bloodTypesNeeded.filter(t => t !== type)
        : [...prev.bloodTypesNeeded, type],
    }));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.eventDate || !formData.venueName || !formData.address) {
      showToast("Please fill all required fields", "error");
      return;
    }
    if (formData.bloodTypesNeeded.length === 0) {
      showToast("Please select at least one blood type", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/events`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Event created successfully!");
      setTimeout(() => {
        if (user?.role === "hospital") navigate("/hospital/dashboard");
        else navigate("/ngo/dashboard");
      }, 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create event", "error");
    }
    setLoading(false);
  };

  // Get tomorrow's date as min for date input
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold ${
          toast.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"
        }`}>
          {toast.type === "error" ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-5 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white mb-6">
          <h1 className="text-2xl font-bold mb-1">🩸 Create Blood Donation Event</h1>
          <p className="text-red-100 text-sm">Organize a community blood drive and connect with donors in your area</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-600" />Event Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Community Blood Donation Drive"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Brief description of the event purpose, who organizes it, etc."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  min={minDateStr}
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />Venue & Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Venue Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  placeholder="e.g. Civil Hospital Auditorium"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Address <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. New Baneshwor, Kathmandu"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                >
                  <option>Kathmandu</option>
                  <option>Lalitpur</option>
                  <option>Bhaktapur</option>
                  <option>Pokhara</option>
                  <option>Biratnagar</option>
                  <option>Birgunj</option>
                  <option>Butwal</option>
                  <option>Dharan</option>
                  <option>Nepalgunj</option>
                  <option>Hetauda</option>
                  <option>Janakpur</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Blood Needs */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-red-600" />Blood Types Needed <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-gray-500 mb-3">Select all blood types you need for this event</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {bloodTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleBloodToggle(type)}
                  className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                    formData.bloodTypesNeeded.includes(type)
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Donors</label>
              <input
                type="number"
                min="1"
                value={formData.targetDonors}
                onChange={(e) => setFormData({ ...formData, targetDonors: Number(e.target.value) })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-red-600" />Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Person</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="98xxxxxxxx"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">What Donors Should Bring</label>
                <textarea
                  value={formData.whatToBring}
                  onChange={(e) => setFormData({ ...formData, whatToBring: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl text-base shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader className="h-5 w-5 animate-spin" />Creating Event...</>
              : <>🩸 Create Event</>
            }
          </button>

        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateEvent;