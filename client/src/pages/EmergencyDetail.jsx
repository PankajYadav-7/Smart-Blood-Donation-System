import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  CheckCircle, AlertCircle, Clock, Phone,
  Droplets, MapPin, User, Mail, Loader,
  Heart, ArrowLeft, Shield,
} from "lucide-react";

const API = "http://localhost:5000/api";

const EmergencyDetail = () => {
  const { emergencyId } = useParams();
  const navigate        = useNavigate();
  const token           = localStorage.getItem("token");
  const user            = JSON.parse(localStorage.getItem("user") || "null");

  const [emergency,  setEmergency]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [accepting,  setAccepting]  = useState(false);
  const [accepted,   setAccepted]   = useState(false);
  const [donated,    setDonated]    = useState(false);
  const [donating,   setDonating]   = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => {
    if (!token) {
      navigate(`/login?redirect=/emergency/detail/${emergencyId}`);
      return;
    }
    fetchEmergency();
  }, [emergencyId]);

  const fetchEmergency = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/emergency/${emergencyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmergency(res.data.emergency);

      // Check if already accepted or donated
      const myEntry = res.data.emergency.acceptedDonors?.find(
        d => d.donorEmail === user?.email
      );
      if (myEntry) {
        setAccepted(true);
        if (myEntry.donationStatus === "Donated") setDonated(true);
      }

    } catch (err) {
      setError(err.response?.data?.message || "Emergency request not found.");
    }
    setLoading(false);
  };

  const handleMarkDonated = async () => {
    setDonating(true);
    setError("");
    try {
      await axios.patch(`${API}/emergency/${emergencyId}/mark-donated`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonated(true);
      await fetchEmergency();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to confirm. Please try again.");
    }
    setDonating(false);
  };

  const handleAccept = async () => {
    setAccepting(true);
    setError("");
    try {
      await axios.post(`${API}/emergency/${emergencyId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccepted(true);
      await fetchEmergency();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept. Please try again.");
    }
    setAccepting(false);
  };

  const getUrgencyColor = (level) => {
    if (level === "Critical") return "from-red-600 to-red-700";
    if (level === "Urgent")   return "from-orange-500 to-orange-600";
    return "from-yellow-500 to-yellow-600";
  };

  const timeAgo = (date) => {
    const mins = Math.floor((new Date() - new Date(date)) / 60000);
    if (mins < 1)  return "Just now";
    if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
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

  if (error && !emergency) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not Found</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => navigate("/donor/dashboard")}
            className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition-all">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Back button */}
        <button onClick={() => navigate("/donor/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-5 text-sm font-medium transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to Dashboard
        </button>

        {/* ── SUCCESS STATE ── */}
        {accepted && (
          <div className="bg-green-600 rounded-2xl p-6 text-white text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-1">You Accepted! 🩸</h2>
            <p className="text-green-100 text-sm">
              The requester has been notified with your contact details.
              They will reach out to you directly.
            </p>
          </div>
        )}

        {/* Emergency Header */}
        <div className={`bg-gradient-to-r ${getUrgencyColor(emergency?.urgencyLevel)} rounded-2xl p-6 text-white mb-5`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-80 font-medium">Emergency Request</p>
              <p className="text-lg font-bold tracking-wider">{emergency?.trackingCode}</p>
            </div>
            <div className="text-right">
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                {emergency?.urgencyLevel}
              </span>
              <p className="text-xs opacity-70 mt-1">{timeAgo(emergency?.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {emergency?.bloodGroup}{emergency?.rh}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold">{emergency?.bloodGroup}{emergency?.rh} Blood Needed</p>
              <p className="text-sm opacity-85">
                {emergency?.unitsRequired} unit{emergency?.unitsRequired > 1 ? "s" : ""} required · {emergency?.hospitalName}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Requester Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-red-600" />
            Who Needs Blood
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Requester Name</p>
                <p className="font-semibold text-gray-900">{emergency?.requesterName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Phone Number</p>
                <a href={`tel:${emergency?.requesterPhone}`}
                  className="font-bold text-green-600 text-lg hover:underline">
                  {emergency?.requesterPhone}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Hospital</p>
                <p className="font-semibold text-gray-900">{emergency?.hospitalName}</p>
              </div>
            </div>
            {emergency?.medicalCondition && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Heart className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Medical Condition</p>
                  <p className="font-semibold text-gray-900">{emergency?.medicalCondition}</p>
                </div>
              </div>
            )}
            {emergency?.patientName && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Patient Name</p>
                  <p className="font-semibold text-gray-900">{emergency?.patientName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Request Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-4">Request Status</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-blue-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-blue-600">{emergency?.donorsNotified}</p>
              <p className="text-xs text-blue-500 mt-0.5">Notified</p>
            </div>
            <div className="text-center bg-green-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-green-600">{emergency?.acceptedDonors?.length || 0}</p>
              <p className="text-xs text-green-500 mt-0.5">Accepted</p>
            </div>
            <div className="text-center bg-red-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-red-600">{emergency?.unitsRequired}</p>
              <p className="text-xs text-red-500 mt-0.5">Units Needed</p>
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        {!accepted && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800 mb-1">Before you accept</p>
                <p className="text-xs text-yellow-700 leading-relaxed">
                  By accepting this emergency request, your <strong>name, phone number and email</strong> will be
                  shared immediately with the requester so they can contact you directly to coordinate the donation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Accept Button */}
        {!accepted ? (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl text-base shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {accepting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="h-5 w-5 animate-spin" />
                Accepting Emergency Request...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Heart className="h-5 w-5" />
                🩸 I Can Help — Accept This Emergency
              </span>
            )}
          </button>
        ) : (
          <div className="space-y-3 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-800">You have accepted this emergency</p>
                <p className="text-xs text-green-600 mt-0.5">
                  The requester has been notified with your contact details.
                  Please call them on <strong>{emergency?.requesterPhone}</strong> to coordinate.
                </p>
              </div>
            </div>

            {/* I Donated button */}
            {!donated ? (
              <div className="space-y-2">
                <button
                  onClick={handleMarkDonated}
                  disabled={donating}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {donating
                    ? <><Loader className="h-4 w-4 animate-spin" />Confirming...</>
                    : <>🩸 I Donated — Confirm My Donation</>
                  }
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Click this after you have physically donated blood to this person
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-2xl p-5">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-green-800">Donation Confirmed! 🩸</h3>
                  <p className="text-sm text-green-600 mt-1">
                    You have officially confirmed your donation
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-green-100">
                    <span className="text-gray-500">Blood Donated</span>
                    <span className="font-bold text-red-600">{emergency?.bloodGroup}{emergency?.rh}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-green-100">
                    <span className="text-gray-500">Hospital</span>
                    <span className="font-semibold text-gray-900">{emergency?.hospitalName}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-green-100">
                    <span className="text-gray-500">Tracking Code</span>
                    <span className="font-bold text-red-600 text-xs">{emergency?.trackingCode}</span>
                  </div>
                </div>
                {emergency?.requesterEmail && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-blue-700 font-medium">
                      💙 The requester has been notified. They may send you a thank you.
                    </p>
                  </div>
                )}
                <div className="mt-3 bg-white border border-gray-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">
                    This donation is now recorded in your <strong>History tab</strong> with a 🚨 Emergency badge
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate("/donor/dashboard")}
              className="w-full border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {/* Nepal Red Cross */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold text-red-700 mb-1">Nepal Red Cross Emergency</p>
          <a href="tel:014270650" className="text-xl font-bold text-red-600 hover:underline">
            01-4270650
          </a>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default EmergencyDetail;
