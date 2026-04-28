import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  CheckCircle, AlertCircle, Clock, Phone,
  Droplets, MapPin, User, Mail, Loader,
  Heart, ArrowLeft, Users, RefreshCw,
  Building, ExternalLink, Copy,
} from "lucide-react";

const API = "http://localhost:5000/api";

const EmergencyOrgDetail = () => {
  const { trackingCode } = useParams();
  const navigate         = useNavigate();
  const token            = localStorage.getItem("token");
  const user             = JSON.parse(localStorage.getItem("user") || "null");

  const [emergency,  setEmergency]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [copied,     setCopied]     = useState(false);

  const isHospital = user?.role === "hospital";
  const isNGO      = user?.role === "ngo";

  useEffect(() => {
    if (!token) {
      navigate(`/login?redirect=/emergency/org-detail/${trackingCode}`);
      return;
    }
    fetchEmergency();
    const interval = setInterval(() => fetchEmergency(false), 30000);
    return () => clearInterval(interval);
  }, [trackingCode]);

  const fetchEmergency = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await axios.get(`${API}/emergency/track/${trackingCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmergency(res.data.emergency);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.response?.data?.message || "Emergency request not found.");
    }
    if (showLoader) setLoading(false);
  };

  const handleFulfill = async () => {
    if (!window.confirm("Mark this emergency as fulfilled?")) return;
    try {
      await axios.patch(`${API}/emergency/${emergency._id}/fulfill`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmergency();
    } catch (err) {
      alert("Failed to mark as fulfilled");
    }
  };

  const copyTrackingLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/emergency/track/${trackingCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getUrgencyBg = (level) => {
    if (level === "Critical") return "bg-red-600";
    if (level === "Urgent")   return "bg-orange-500";
    return "bg-yellow-500";
  };

  const getStatusBg = (status) => {
    if (status === "Active")    return "bg-red-100 text-red-700 border-red-200";
    if (status === "Fulfilled") return "bg-green-100 text-green-700 border-green-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  const timeAgo = (date) => {
    const mins = Math.floor((new Date() - new Date(date)) / 60000);
    if (mins < 1)  return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader className="h-10 w-10 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading emergency details...</p>
        </div>
      </div>
    </div>
  );

  if (error || !emergency) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not Found</h2>
          <p className="text-gray-500 mb-6">{error || "Emergency not found"}</p>
          <button
            onClick={() => navigate(isHospital ? "/hospital/dashboard" : "/ngo/dashboard")}
            className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back button */}
        <button
          onClick={() => navigate(isHospital ? "/hospital/dashboard" : "/ngo/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-5 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {isHospital ? "Hospital" : "NGO"} Dashboard
        </button>

        {/* ── TOP HEADER BAR ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Blood type badge */}
              <div className={`w-16 h-16 rounded-2xl ${getUrgencyBg(emergency.urgencyLevel)} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-bold text-xl">{emergency.bloodGroup}{emergency.rh}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl font-bold text-gray-900">
                    {emergency.bloodGroup}{emergency.rh} Emergency Request
                  </h1>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBg(emergency.status)}`}>
                    {emergency.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                  <span className="font-bold text-red-600">{emergency.trackingCode}</span>
                  <span>·</span>
                  <span>{timeAgo(emergency.createdAt)}</span>
                  <span>·</span>
                  <span>{emergency.unitsRequired} unit{emergency.unitsRequired > 1 ? "s" : ""} needed</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchEmergency()}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 border border-gray-200 px-3 py-1.5 rounded-lg transition-all"
              >
                <RefreshCw className="h-3 w-3" />Refresh
              </button>
              <span className="text-xs text-gray-400">
                {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

          {/* ── LEFT: Requester & Medical Info ── */}
          <div className="space-y-4">

            {/* Requester contact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-red-600">
                <Phone className="h-4 w-4" />Requester Contact
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Name</p>
                  <p className="font-bold text-gray-900 text-lg">{emergency.requesterName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Phone — Call directly</p>
                  <a href={`tel:${emergency.requesterPhone}`}
                    className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 font-bold text-lg px-4 py-2 rounded-xl hover:bg-green-100 transition-all">
                    <Phone className="h-5 w-5" />
                    {emergency.requesterPhone}
                  </a>
                </div>
                {emergency.requesterEmail && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <a href={`mailto:${emergency.requesterEmail}`}
                      className="text-sm text-blue-600 hover:underline">
                      {emergency.requesterEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Medical details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-red-600">
                <Heart className="h-4 w-4" />Medical Information
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-red-500 mb-1">Blood Needed</p>
                    <p className="text-2xl font-bold text-red-600">{emergency.bloodGroup}{emergency.rh}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Units</p>
                    <p className="text-2xl font-bold text-gray-900">{emergency.unitsRequired}</p>
                  </div>
                </div>
                {emergency.patientName && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Patient Name</p>
                    <p className="font-semibold text-gray-900">{emergency.patientName}</p>
                  </div>
                )}
                {emergency.medicalCondition && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Medical Condition / Reason</p>
                    <p className="text-sm text-gray-700 bg-red-50 border border-red-100 rounded-xl p-3">
                      {emergency.medicalCondition}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Hospital / Location</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-gray-400" />
                    {emergency.hospitalName}
                  </p>
                  {emergency.location && emergency.location !== emergency.hospitalName && (
                    <p className="text-xs text-gray-500 mt-0.5 ml-5">{emergency.location}</p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT: Response Status & Actions ── */}
          <div className="space-y-4">

            {/* Live response stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-red-600">
                <Users className="h-4 w-4" />Live Response Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-600">Donors Notified</span>
                  <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
                    {emergency.donorsNotified}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-600">Donors Accepted</span>
                  <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                    emergency.acceptedDonors?.length > 0
                      ? "text-green-600 bg-green-50"
                      : "text-gray-500 bg-gray-50"
                  }`}>
                    {emergency.acceptedDonors?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-600">Hospitals Notified</span>
                  <span className="font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-sm">
                    {emergency.hospitalsNotified}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">NGOs Notified</span>
                  <span className="font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-sm">
                    {emergency.ngosNotified}
                  </span>
                </div>
              </div>
            </div>

            {/* Accepted donors list */}
            {emergency.acceptedDonors?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Donors Who Accepted ({emergency.acceptedDonors.length})
                </h3>
                <div className="space-y-3">
                  {emergency.acceptedDonors.map((donor, i) => (
                    <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-gray-900 text-sm">{donor.donorName}</p>
                        {donor.donorBloodGroup && (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            {donor.donorBloodGroup}
                          </span>
                        )}
                      </div>
                      {donor.donorPhone && (
                        <a href={`tel:${donor.donorPhone}`}
                          className="flex items-center gap-1.5 text-sm text-green-700 font-semibold hover:underline">
                          <Phone className="h-3.5 w-3.5" />
                          {donor.donorPhone}
                        </a>
                      )}
                      {donor.donorEmail && (
                        <a href={`mailto:${donor.donorEmail}`}
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:underline mt-1">
                          <Mail className="h-3 w-3" />
                          {donor.donorEmail}
                        </a>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Accepted {timeAgo(donor.acceptedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NGO specific — coordination actions */}
            {isNGO && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h3 className="font-bold text-blue-800 mb-3 text-sm uppercase tracking-wide">
                  🤝 NGO Coordination Actions
                </h3>
                <div className="space-y-2">
                  <a href={`tel:${emergency.requesterPhone}`}
                    className="flex items-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all">
                    <Phone className="h-4 w-4" />Call Requester Directly
                  </a>
                  <button
                    onClick={() => navigate("/create-request")}
                    className="flex items-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all"
                  >
                    <Droplets className="h-4 w-4" />Create Formal Blood Request
                  </button>
                  <button
                    onClick={() => navigate("/donor-search")}
                    className="flex items-center gap-2 w-full border border-blue-300 text-blue-700 font-semibold py-2.5 px-4 rounded-xl text-sm hover:bg-blue-100 transition-all"
                  >
                    <Users className="h-4 w-4" />Search Available Donors
                  </button>
                </div>
              </div>
            )}

            {/* Hospital specific — actions */}
            {isHospital && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
                <h3 className="font-bold text-purple-800 mb-3 text-sm uppercase tracking-wide">
                  🏥 Hospital Actions
                </h3>
                <div className="space-y-2">
                  <a href={`tel:${emergency.requesterPhone}`}
                    className="flex items-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all">
                    <Phone className="h-4 w-4" />Contact Requester
                  </a>
                  <button
                    onClick={() => navigate("/create-request")}
                    className="flex items-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all"
                  >
                    <Droplets className="h-4 w-4" />Create Blood Request for This Patient
                  </button>
                  {emergency.status === "Active" && emergency.acceptedDonors?.length > 0 && (
                    <button
                      onClick={handleFulfill}
                      className="flex items-center gap-2 w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all"
                    >
                      <CheckCircle className="h-4 w-4" />Mark as Fulfilled
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Share tracking link */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">📋 Share Tracking Link</h3>
          <div className="flex gap-2">
            <p className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
              {window.location.origin}/emergency/track/{trackingCode}
            </p>
            <button
              onClick={copyTrackingLink}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                copied
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Share this link with the requester or family so they can track donor responses in real time.
          </p>
        </div>

        {/* Nepal Red Cross */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold text-red-700 mb-1">Nepal Red Cross Emergency Line</p>
          <a href="tel:014270650" className="text-xl font-bold text-red-600 hover:underline">
            🇳🇵 01-4270650
          </a>
          <p className="text-xs text-red-400 mt-1">Available 24/7</p>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default EmergencyOrgDetail;
