import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  CheckCircle, AlertCircle, Clock, Phone,
  Droplets, MapPin, User, Mail, Loader,
  RefreshCw,
} from "lucide-react";

const API = "http://localhost:5000/api";

const EmergencyTracking = () => {
  const { trackingCode } = useParams();
  const navigate         = useNavigate();

  const [emergency, setEmergency] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchEmergency();
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchEmergency(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [trackingCode]);

  const fetchEmergency = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/emergency/track/${trackingCode}`);
      setEmergency(res.data.emergency);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.response?.data?.message || "Emergency request not found.");
    }
    if (showLoader) setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":    return "bg-red-100 text-red-700 border-red-200";
      case "Fulfilled": return "bg-green-100 text-green-700 border-green-200";
      case "Cancelled": return "bg-gray-100 text-gray-600 border-gray-200";
      default:          return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case "Critical": return "bg-red-600 text-white";
      case "Urgent":   return "bg-orange-500 text-white";
      default:         return "bg-green-600 text-white";
    }
  };

  const timeAgo = (date) => {
    const mins = Math.floor((new Date() - new Date(date)) / 60000);
    if (mins < 1)  return "Just now";
    if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader className="h-10 w-10 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading emergency status...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not Found</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate("/emergency")}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-all"
          >
            Submit New Emergency
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className={`rounded-2xl p-6 mb-6 text-white ${
          emergency.status === "Fulfilled" ? "bg-green-600" :
          emergency.urgencyLevel === "Critical" ? "bg-red-600" : "bg-orange-500"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm opacity-80 font-medium">Emergency Tracking</p>
              <p className="text-2xl font-bold tracking-wider">{emergency.trackingCode}</p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
              emergency.status === "Active"
                ? "bg-white/20"
                : "bg-white/20"
            }`}>
              {emergency.status === "Active" ? "🔴 Active" :
               emergency.status === "Fulfilled" ? "✅ Fulfilled" : "Cancelled"}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <span>🩸 {emergency.bloodGroup}{emergency.rh}</span>
            <span>🏥 {emergency.hospitalName}</span>
            <span>⏱ {timeAgo(emergency.createdAt)}</span>
          </div>
        </div>

        {/* Auto refresh notice */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 30s
          </p>
          <button
            onClick={() => fetchEmergency()}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:underline font-medium"
          >
            <RefreshCw className="h-3 w-3" />Refresh Now
          </button>
        </div>

        {/* Status Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h3 className="font-bold text-gray-900 mb-4">Request Status</h3>
          <div className="space-y-3">

            {/* Submitted */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Request Submitted</p>
                <p className="text-xs text-gray-500">{timeAgo(emergency.createdAt)}</p>
              </div>
            </div>

            {/* Donors notified */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                emergency.donorsNotified > 0 ? "bg-green-100" : "bg-gray-100"
              }`}>
                {emergency.donorsNotified > 0
                  ? <CheckCircle className="h-4 w-4 text-green-600" />
                  : <Clock className="h-4 w-4 text-gray-400" />
                }
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${emergency.donorsNotified > 0 ? "text-gray-900" : "text-gray-400"}`}>
                  Donors Notified
                </p>
                <p className="text-xs text-gray-500">
                  {emergency.donorsNotified > 0
                    ? `${emergency.donorsNotified} compatible donor${emergency.donorsNotified > 1 ? "s" : ""} alerted`
                    : "Searching for compatible donors..."}
                </p>
              </div>
              {emergency.donorsNotified > 0 && (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {emergency.donorsNotified}
                </span>
              )}
            </div>

            {/* Donors accepted */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                emergency.acceptedDonors?.length > 0 ? "bg-blue-100" : "bg-gray-100"
              }`}>
                {emergency.acceptedDonors?.length > 0
                  ? <CheckCircle className="h-4 w-4 text-blue-600" />
                  : <Clock className="h-4 w-4 text-gray-400 animate-pulse" />
                }
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${emergency.acceptedDonors?.length > 0 ? "text-gray-900" : "text-gray-400"}`}>
                  Donor Response
                </p>
                <p className="text-xs text-gray-500">
                  {emergency.acceptedDonors?.length > 0
                    ? `${emergency.acceptedDonors.length} donor${emergency.acceptedDonors.length > 1 ? "s have" : " has"} accepted`
                    : "Waiting for donors to respond..."}
                </p>
              </div>
              {emergency.acceptedDonors?.length > 0 && (
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {emergency.acceptedDonors.length}
                </span>
              )}
            </div>

            {/* Fulfilled */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                emergency.status === "Fulfilled" ? "bg-green-100" : "bg-gray-100"
              }`}>
                {emergency.status === "Fulfilled"
                  ? <CheckCircle className="h-4 w-4 text-green-600" />
                  : <Clock className="h-4 w-4 text-gray-400" />
                }
              </div>
              <div>
                <p className={`text-sm font-semibold ${emergency.status === "Fulfilled" ? "text-gray-900" : "text-gray-400"}`}>
                  Request Fulfilled
                </p>
                <p className="text-xs text-gray-400">
                  {emergency.status === "Fulfilled" ? "Blood donation completed" : "Pending"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Accepted Donors */}
        {emergency.acceptedDonors?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-5 mb-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Donors Who Accepted ({emergency.acceptedDonors.length})
            </h3>
            <div className="space-y-3">
              {emergency.acceptedDonors.map((donor, i) => (
                <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{donor.donorName}</p>
                      {donor.donorBloodGroup && (
                        <p className="text-xs text-red-600 font-medium">Blood: {donor.donorBloodGroup}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {donor.donorPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <a href={`tel:${donor.donorPhone}`} className="text-green-700 font-bold text-base hover:underline">
                          {donor.donorPhone}
                        </a>
                      </div>
                    )}
                    {donor.donorEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <a href={`mailto:${donor.donorEmail}`} className="text-gray-600 hover:underline">
                          {donor.donorEmail}
                        </a>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">Accepted {timeAgo(donor.acceptedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h3 className="font-bold text-gray-900 mb-4">Request Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Blood Group:</span>
              <span className="font-bold text-red-600">{emergency.bloodGroup}{emergency.rh}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Units Required:</span>
              <span className="font-semibold">{emergency.unitsRequired}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Hospital:</span>
              <span className="font-semibold text-right">{emergency.hospitalName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Urgency:</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${getUrgencyColor(emergency.urgencyLevel)}`}>
                {emergency.urgencyLevel}
              </span>
            </div>
            {emergency.medicalCondition && (
              <div className="flex justify-between">
                <span className="text-gray-500">Condition:</span>
                <span className="font-semibold text-right max-w-[200px]">{emergency.medicalCondition}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Donors Notified:</span>
              <span className="font-semibold">{emergency.donorsNotified}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Hospitals Notified:</span>
              <span className="font-semibold">{emergency.hospitalsNotified}</span>
            </div>
          </div>
        </div>

        {/* Nepal Red Cross */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-5 text-center">
          <p className="text-sm font-semibold text-red-700 mb-1">
            While waiting, you can also call:
          </p>
          <a href="tel:014270650" className="text-2xl font-bold text-red-600 hover:underline">
            🇳🇵 Nepal Red Cross: 01-4270650
          </a>
          <p className="text-xs text-red-500 mt-1">Available 24/7 for blood emergencies</p>
        </div>

        {/* Share tracking link */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold text-blue-800 mb-2">
            📋 Share this tracking link with hospital staff or family:
          </p>
          <p className="text-xs bg-white border border-blue-200 rounded-lg px-3 py-2 font-mono text-blue-700 break-all">
            {window.location.href}
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }}
            className="mt-2 text-xs text-blue-600 hover:underline font-semibold"
          >
            Copy Link
          </button>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default EmergencyTracking;
