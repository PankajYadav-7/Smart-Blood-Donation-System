import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Calendar, Clock, MapPin, Phone, Droplets, ArrowLeft, Loader, CheckCircle, AlertCircle } from "lucide-react";
import LocationAutocomplete from "../components/LocationAutocomplete";

import API from "../config";

const EditEvent = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const user     = JSON.parse(localStorage.getItem("user") || "null");

  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState(null);
  const [formData,    setFormData]    = useState(null);

  const bloodTypeOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/events/${id}`);
      const event = res.data.event;

      // Only organizer can edit
      if (event.organizerId !== user?.id) {
        navigate(`/events/${id}`);
        return;
      }

      setFormData({
        title:            event.title,
        description:      event.description || "",
        eventDate:        event.eventDate?.split("T")[0] || "",
        startTime:        event.startTime,
        endTime:          event.endTime,
        venueName:        event.venueName,
        address:          event.address,
        city:             event.city,
        locationLat:      event.locationLat || null,
        locationLng:      event.locationLng || null,
        bloodTypesNeeded: event.bloodTypesNeeded || [],
        targetDonors:     event.targetDonors,
        whatToBring:      event.whatToBring || "",
        contactPerson:    event.contactPerson || "",
        contactPhone:     event.contactPhone || "",
      });
    } catch (err) {
      showToast("Failed to load event", "error");
    }
    setLoading(false);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleBloodToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      bloodTypesNeeded: prev.bloodTypesNeeded.includes(type)
        ? prev.bloodTypesNeeded.filter(t => t !== type)
        : [...prev.bloodTypesNeeded, type],
    }));
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

    setSaving(true);
    try {
      await axios.patch(`${API}/events/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Event updated! Registered donors have been notified by email.");
      setTimeout(() => navigate(`/events/${id}`), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update event", "error");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-10 w-10 text-red-600 animate-spin" />
      </div>
    </div>
  );

  if (!formData) return null;

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
          <ArrowLeft className="h-4 w-4" />Back
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white mb-6">
          <h1 className="text-2xl font-bold mb-1">✏️ Edit Event</h1>
          <p className="text-purple-100 text-sm">
            Update event details below. All registered donors will be notified by email about any changes.
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> All donors who have already RSVP'd will receive an email notification about changes to date, time, venue or address.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />Event Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
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
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />Venue & Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Venue Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  required
                />
              </div>
              <div>
                <LocationAutocomplete
                  label="Full Address *"
                  value={formData.address}
                  onChange={(text) => setFormData({ ...formData, address: text, locationLat: null, locationLng: null })}
                  onLocationSelect={({ lat, lng }) => setFormData(prev => ({ ...prev, locationLat: lat, locationLng: lng }))}
                  placeholder="e.g. New Baneshwor, Kathmandu"
                  hint="Type address and select from suggestions to save coordinates"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
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

          {/* Blood Types */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-purple-600" />Blood Types Needed <span className="text-red-500">*</span>
            </h2>
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
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-purple-600" />Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Person</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">What Donors Should Bring</label>
                <textarea
                  value={formData.whatToBring}
                  onChange={(e) => setFormData({ ...formData, whatToBring: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-2xl text-base shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving
              ? <><Loader className="h-5 w-5 animate-spin" />Saving Changes...</>
              : <>✏️ Save Changes & Notify Donors</>
            }
          </button>

        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditEvent;
