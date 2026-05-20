import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Droplets, Heart, Clock, MapPin, Award, CheckCircle,
  User, Trophy, Medal, Star, Bell, BellOff, Activity,
  AlertCircle, Calendar, Loader, Building, Hash,
  ChevronDown, ChevronUp, ThumbsUp, Mail, Phone,
} from "lucide-react";

const API = "http://localhost:5000/api";

const DonorDashboard = () => {
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");
  const user      = JSON.parse(localStorage.getItem("user") || "null");

  const [matches,         setMatches]         = useState([]);
  const [donorProfile,    setDonorProfile]    = useState(null);
  const [acceptedCount,   setAcceptedCount]   = useState(0);
  const [loading,         setLoading]         = useState(true);
  const [activeTab,       setActiveTab]       = useState("requests");
  const [isSnoozed,       setIsSnoozed]       = useState(false);
  const [toast,           setToast]           = useState(null);
  const [eligibilityInfo, setEligibilityInfo] = useState(null);

  const [emergencies,      setEmergencies]      = useState([]);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [acceptingId,      setAcceptingId]      = useState(null);

  const [myRsvpEvents,    setMyRsvpEvents]    = useState([]);
  const [allEvents,       setAllEvents]       = useState([]);
  const [eventsLoading,   setEventsLoading]   = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchMatches(), fetchDonorProfile(), fetchAcceptedCount()]);
    setLoading(false);
  };

  const fetchMatches = async () => {
    try {
      const res = await axios.get(`${API}/matches/compatible-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches(res.data.requests || []);
      setEligibilityInfo({
        status:           res.data.eligibilityStatus || "eligible",
        daysLeft:         res.data.daysLeft           || 0,
        nextEligibleDate: res.data.nextEligibleDate   || null,
      });
    } catch (err) { console.log(err); }
  };

  const fetchDonorProfile = async () => {
    try {
      const res = await axios.get(`${API}/donor/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonorProfile(res.data.profile);
    } catch (err) { console.log(err); }
  };

  const fetchAcceptedCount = async () => {
    try {
      const [regularRes, emergencyRes] = await Promise.all([
        axios.get(`${API}/matches/my-history`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/emergency/my-accepted`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const regularCount   = regularRes.data.count || 0;
      const emergencyCount = (emergencyRes.data.emergencies || []).filter(
        em => em.donationStatus === "Donated"
      ).length;

      setAcceptedCount(regularCount + emergencyCount);
    } catch (err) { console.log(err); }
  };

  const fetchEmergencies = async () => {
    setEmergencyLoading(true);
    try {
      const res = await axios.get(`${API}/emergency/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmergencies(res.data.emergencies || []);
    } catch (err) { console.log(err); }
    setEmergencyLoading(false);
  };

  const fetchEventsData = async () => {
    setEventsLoading(true);
    try {
      const [rsvpRes, allRes] = await Promise.all([
        axios.get(`${API}/events/my-rsvps`,   { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/events/upcoming`),
      ]);
      setMyRsvpEvents(rsvpRes.data.events || []);
      setAllEvents(allRes.data.events     || []);
    } catch (err) { console.log(err); }
    setEventsLoading(false);
  };

  useEffect(() => {
    if (activeTab === "emergency") fetchEmergencies();
    if (activeTab === "events")    fetchEventsData();
  }, [activeTab]);

  const handleAcceptEmergency = async (emergencyId) => {
    setAcceptingId(emergencyId);
    try {
      await axios.post(`${API}/emergency/${emergencyId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("You accepted this emergency! The requester has been notified with your contact details.");
      fetchEmergencies();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to accept", "error");
    }
    setAcceptingId(null);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleAvailability = async () => {
    if (!donorProfile) { navigate("/donor/profile"); return; }
    try {
      const res = await axios.patch(
        `${API}/donor/availability`,
        { availability: !donorProfile.availability },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDonorProfile(prev => ({ ...prev, availability: res.data.availability }));
      showToast(res.data.availability ? "You are now available to donate" : "You are now unavailable");
      fetchMatches();
    } catch { showToast("Failed to update availability", "error"); }
  };

  const handleRespond = async (matchId, requestId, status) => {
    try {
      if (matchId) {
        await axios.patch(`${API}/matches/${matchId}/respond`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API}/matches/respond-direct`, { requestId, status }, { headers: { Authorization: `Bearer ${token}` } });
      }
      showToast(status === "Accepted" ? "Request accepted! The patient has been notified." : "Request declined.");
      fetchMatches();
      fetchAcceptedCount();
    } catch { showToast("Failed to respond", "error"); }
  };

  const handleSnooze = (hours) => {
    setIsSnoozed(true);
    setTimeout(() => setIsSnoozed(false), hours * 60 * 60 * 1000);
    showToast(`Alerts snoozed for ${hours} hours`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getEligibility = () => {
    if (!donorProfile?.lastDonationDate) return { label: "Eligible Now", color: "text-green-600 bg-green-50" };
    const next = new Date(donorProfile.lastDonationDate);
    next.setDate(next.getDate() + 56);
    if (next <= new Date()) return { label: "Available Now", color: "text-green-600 bg-green-50" };
    const days = Math.ceil((next - new Date()) / (1000 * 60 * 60 * 24));
    return { label: `${days} days`, color: "text-orange-600 bg-orange-50" };
  };

  const getBadges = () => {
    const b = [];
    if (acceptedCount >= 1)  b.push({ title: "First Drop",    description: "Made your first donation", icon: Droplets, color: "text-blue-600 bg-blue-50 border-blue-200"      });
    if (acceptedCount >= 3)  b.push({ title: "Life Saver",    description: "Donated 3+ times",          icon: Heart,    color: "text-red-600 bg-red-50 border-red-200"          });
    if (acceptedCount >= 5)  b.push({ title: "Regular Donor", description: "Donated 5+ times",          icon: Award,    color: "text-yellow-600 bg-yellow-50 border-yellow-200" });
    if (acceptedCount >= 10) b.push({ title: "Hero Donor",    description: "Donated 10+ times",         icon: Trophy,   color: "text-purple-600 bg-purple-50 border-purple-200" });
    return b;
  };

  const getCertificates = () => {
    const c = [];
    if (acceptedCount >= 1)  c.push({ title: "First Time Donor",   level: "Bronze Certificate", icon: Medal,  color: "text-orange-600 bg-orange-50 border-orange-200" });
    if (acceptedCount >= 5)  c.push({ title: "Regular Contributor", level: "Silver Certificate", icon: Star,   color: "text-gray-600 bg-gray-50 border-gray-200"       });
    if (acceptedCount >= 10) c.push({ title: "Life Saver Champion", level: "Gold Certificate",   icon: Trophy, color: "text-yellow-600 bg-yellow-50 border-yellow-200" });
    return c;
  };

  const eligibility  = getEligibility();
  const badges       = getBadges();
  const certificates = getCertificates();
  const isAvailable  = donorProfile?.availability ?? false;
  const bloodType    = donorProfile ? `${donorProfile.bloodGroup}${donorProfile.rh}` : "Not set";

  const tabs = [
    { id: "requests",     label: "🔔 Nearby Requests" },
    { id: "emergency",    label: "🚨 Emergency"        },
    { id: "events",       label: "🩸 Events"            },
    { id: "history",      label: "📋 History"          },
    { id: "profile",      label: "👤 Profile & Badges" },
    { id: "certificates", label: "🏆 Certificates"     },
  ];

  const getUrgencyColor = (level) => {
    if (level === "Critical") return "bg-red-600 text-white";
    if (level === "Urgent")   return "bg-orange-500 text-white";
    return "bg-yellow-500 text-white";
  };

  const timeAgo = (date) => {
    const mins = Math.floor((new Date() - new Date(date)) / 60000);
    if (mins < 1)  return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all duration-300 ${
          toast.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"
        }`}>
          {toast.type === "error" ? <AlertCircle className="h-5 w-5 flex-shrink-0" /> : <CheckCircle className="h-5 w-5 flex-shrink-0" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.fullName?.split(" ")[0]}! 👋</h1>
            <p className="text-gray-500 mt-1">
              {acceptedCount === 0
                ? "Complete your profile and make your first donation to start saving lives!"
                : acceptedCount < 3
                ? `You have donated ${acceptedCount} time${acceptedCount > 1 ? "s" : ""} — keep going, you are making a difference!`
                : `${acceptedCount} donations completed — you are a life saver! 🩸`
              }
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <div className={`w-3 h-3 rounded-full ${isAvailable && !isSnoozed ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="text-sm font-medium text-gray-700">
                {!donorProfile ? "Set Profile" : isSnoozed ? "Snoozed" : isAvailable ? "Available" : "Unavailable"}
              </span>
              <button
                onClick={handleToggleAvailability}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAvailable && !isSnoozed ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${isAvailable && !isSnoozed ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/donor/profile")}>Edit Profile</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Donations", value: acceptedCount.toString(),       icon: Droplets,    color: "text-red-600 bg-red-50"   },
            { label: "Lives Impacted",  value: (acceptedCount * 3).toString(), icon: Heart,       color: "text-pink-600 bg-pink-50" },
            { label: "Blood Type",      value: bloodType,                       icon: Activity,    color: "text-blue-600 bg-blue-50" },
            { label: "Next Eligible",   value: eligibility.label,               icon: CheckCircle, color: eligibility.color          },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No profile warning */}
        {!donorProfile && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800">Profile not complete</p>
              <p className="text-xs text-yellow-700 mt-0.5">Please set your blood group and location to start receiving matching requests.</p>
            </div>
            <Button size="sm" onClick={() => navigate("/donor/profile")} className="flex-shrink-0">Complete Profile</Button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── EMERGENCY TAB ── */}
        {activeTab === "emergency" && (
          <div className="space-y-4">

            <div className="bg-red-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-6 w-6 flex-shrink-0" />
                <h2 className="text-xl font-bold">🚨 Active Emergency Requests</h2>
              </div>
              <p className="text-red-100 text-sm">
                Urgent emergency requests submitted directly by people in need.
                If you accept, your phone number will be shared with the requester immediately.
              </p>
            </div>

            {emergencyLoading && (
              <div className="text-center py-12">
                <Loader className="h-8 w-8 text-red-600 animate-spin mx-auto" />
                <p className="text-gray-500 mt-3 text-sm">Loading emergencies...</p>
              </div>
            )}

            {!emergencyLoading && emergencies.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No active emergencies</h3>
                  <p className="text-gray-500 text-sm mb-4">There are no active emergency requests right now.</p>
                  <button onClick={fetchEmergencies} className="text-sm text-red-600 hover:underline font-medium">Refresh</button>
                </CardContent>
              </Card>
            )}

            {emergencies.filter((emergency) => {
              const myEntry = emergency.acceptedDonors?.find(
                d => d.donorUserId?.toString() === user?._id?.toString() || d.donorEmail === user?.email
              );
              return myEntry?.donationStatus !== "Donated";
            }).map((emergency) => {
              const myEntry = emergency.acceptedDonors?.find(
                d => d.donorUserId?.toString() === user?._id?.toString() || d.donorEmail === user?.email
              );
              const alreadyAccepted = !!myEntry;
              const alreadyDonated  = myEntry?.donationStatus === "Donated";
              return (
                <Card key={emergency._id} className="border-0 shadow-md border-l-4 border-l-red-500">
                  <CardContent className="pt-5 pb-4">

                    {/* Header — title is clickable */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 cursor-pointer hover:bg-red-700 transition-colors"
                          onClick={() => navigate(`/emergency/detail/${emergency._id}`)}
                        >
                          {emergency.bloodGroup}{emergency.rh}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* ── CLICKABLE TITLE ── */}
                            <h3
                              className="text-lg font-bold text-gray-900 hover:text-red-600 cursor-pointer transition-colors hover:underline underline-offset-2"
                              onClick={() => navigate(`/emergency/detail/${emergency._id}`)}
                            >
                              {emergency.bloodGroup}{emergency.rh} Blood Needed
                            </h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getUrgencyColor(emergency.urgencyLevel)}`}>
                              {emergency.urgencyLevel}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">🏥 {emergency.hospitalName}</p>
                          <p className="text-xs text-gray-400">{timeAgo(emergency.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-red-600">{emergency.trackingCode}</p>
                        <p className="text-xs text-gray-400">{emergency.unitsRequired} unit{emergency.unitsRequired > 1 ? "s" : ""} needed</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700">Requested by: <strong>{emergency.requesterName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <a href={`tel:${emergency.requesterPhone}`} className="text-red-600 font-bold hover:underline">
                          {emergency.requesterPhone}
                        </a>
                      </div>
                      {emergency.medicalCondition && (
                        <div className="flex items-start gap-2 text-sm">
                          <Heart className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{emergency.medicalCondition}</span>
                        </div>
                      )}
                      {emergency.acceptedDonors?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-green-700 font-medium">
                            {emergency.acceptedDonors.length} donor{emergency.acceptedDonors.length > 1 ? "s have" : " has"} already accepted
                          </span>
                        </div>
                      )}
                    </div>

                    {/* View Full Details button */}
                    <button
                      onClick={() => navigate(`/emergency/detail/${emergency._id}`)}
                      className="w-full text-sm text-red-600 hover:text-red-700 font-semibold py-2 border border-red-200 rounded-xl hover:bg-red-50 transition-all mb-3"
                    >
                      📋 View Full Details & Accept →
                    </button>

                    {/* Warning */}
                    {!alreadyAccepted && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3">
                        <p className="text-xs text-yellow-800 font-medium">
                          ⚠️ If you accept, your phone number and email will be shared with the requester immediately.
                        </p>
                      </div>
                    )}

                    {/* Accept / Already Donated / Already Accepted */}
                    {alreadyDonated ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-blue-700 font-bold">🩸 Donation Confirmed</p>
                          <p className="text-xs text-blue-500 mt-0.5">You marked this as donated. Check your History tab for the full record.</p>
                        </div>
                      </div>
                    ) : alreadyAccepted ? (
                      <div className="space-y-2">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <p className="text-sm text-green-700 font-semibold">
                            ✅ Accepted — Go to details to mark as donated
                          </p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAcceptEmergency(emergency._id)}
                        disabled={acceptingId === emergency._id}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {acceptingId === emergency._id
                          ? <><Loader className="h-4 w-4 animate-spin" />Accepting...</>
                          : <><Heart className="h-4 w-4" />🩸 I Can Help — Accept Emergency</>
                        }
                      </button>
                    )}

                  </CardContent>
                </Card>
              );
            })}

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <p className="text-sm font-semibold text-red-700 mb-1">Nepal Red Cross Emergency Line</p>
              <a href="tel:014270650" className="text-xl font-bold text-red-600 hover:underline">01-4270650</a>
            </div>

          </div>
        )}

        {/* ── REQUESTS TAB ── */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">🔔 Blood Requests Matching You</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleSnooze(4)} className="text-gray-600">
                  <BellOff className="h-4 w-4 mr-1" />Snooze All 4h
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSnooze(24)} className="text-gray-600">
                  <BellOff className="h-4 w-4 mr-1" />Snooze All 24h
                </Button>
              </div>
            </div>

            {loading && (
              <div className="text-center py-12">
                <Loader className="h-8 w-8 text-red-600 animate-spin mx-auto" />
                <p className="text-gray-500 mt-3">Loading matches...</p>
              </div>
            )}

            {!loading && matches.length === 0 && (
              <>
                {eligibilityInfo?.status === "cooldown" && (
                  <Card className="border-0 shadow-md border-l-4 border-l-orange-400">
                    <CardContent className="py-8 px-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-7 w-7 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">You donated blood recently 🩸</h3>
                          <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                            Thank you for your life-saving donation! Your body needs time to fully recover.
                          </p>
                          <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                              <p className="text-xs text-orange-600 uppercase tracking-wider mb-1 font-semibold">Days Remaining</p>
                              <p className="text-4xl font-bold text-orange-700">{eligibilityInfo.daysLeft}</p>
                              <p className="text-xs text-orange-500 mt-1">days until eligible</p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                              <p className="text-xs text-green-600 uppercase tracking-wider mb-1 font-semibold">Next Eligible Date</p>
                              <p className="text-base font-bold text-green-700 mt-1">
                                {eligibilityInfo.nextEligibleDate
                                  ? new Date(eligibilityInfo.nextEligibleDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                                  : "—"}
                              </p>
                            </div>
                          </div>
                          <div className="mb-5">
                            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                              <span>Recovery Progress</span>
                              <span>{56 - (eligibilityInfo.daysLeft || 0)} of 56 days</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-orange-400 to-green-500 h-3 rounded-full transition-all"
                                style={{ width: `${Math.min(((56 - (eligibilityInfo.daysLeft || 0)) / 56) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <p className="text-xs font-bold text-blue-700 mb-2">💡 What you can do now:</p>
                            <ul className="text-xs text-blue-600 space-y-1.5 leading-relaxed">
                              <li>• Eat iron-rich foods and stay hydrated to recover faster</li>
                              <li>• Check the Emergency tab — you can still help in critical cases</li>
                              <li>• Check your History tab to see your donation record</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {eligibilityInfo?.status === "unavailable" && (
                  <Card className="border-0 shadow-md">
                    <CardContent className="py-12 text-center">
                      <BellOff className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">You are currently unavailable</h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-5">Toggle your availability to ON to start receiving requests.</p>
                      <Button onClick={handleToggleAvailability}>Turn Availability ON</Button>
                    </CardContent>
                  </Card>
                )}
                {eligibilityInfo?.status === "no_profile" && (
                  <Card className="border-0 shadow-md">
                    <CardContent className="py-12 text-center">
                      <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Complete your profile first</h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-5">Set your blood group and availability.</p>
                      <Button onClick={() => navigate("/donor/profile")}>Complete Profile</Button>
                    </CardContent>
                  </Card>
                )}
                {(eligibilityInfo?.status === "eligible" || !eligibilityInfo?.status) && (
                  <Card className="border-0 shadow-md">
                    <CardContent className="py-12 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No matching requests right now</h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto">You are eligible and available. New requests will appear here automatically.</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {matches.map((match) => (
              <Card key={match._id} className="border-0 shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
                <CardContent className="pt-6 pb-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                          <Droplets className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {match.requestId?.bloodGroup}{match.requestId?.rh} Blood Needed
                          </h3>
                          <p className="text-xs text-green-600 font-medium">
                            ✅ Your {bloodType} blood is compatible with this request
                          </p>
                          <Badge className={match.requestId?.urgency === "Emergency" ? "bg-red-100 text-red-700 border-red-200" : "bg-gray-100 text-gray-700 border-gray-200"}>
                            {match.requestId?.urgency}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1.5 ml-1">
                        {match.status === "New" && (
                          <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium mb-1">🔵 New Request</span>
                        )}
                        <p className="text-sm text-gray-600 flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" />{match.requestId?.hospitalName}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-2"><Droplets className="h-4 w-4 text-gray-400" />Units Required: {match.requestId?.unitsRequired}</p>
                        {match.requestId?.notes && (
                          <p className="text-sm text-gray-500 flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" />{match.requestId?.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-3 justify-end">
                      <Button onClick={() => handleRespond(match._id, match.requestId?._id, "Accepted")} className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="h-4 w-4 mr-2" />Accept
                      </Button>
                      <Button variant="outline" onClick={() => handleRespond(match._id, match.requestId?._id, "Declined")} className="flex-1 md:flex-none text-gray-600">
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── EVENTS TAB ── */}
        {activeTab === "events" && (
          <div className="space-y-4">

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="h-6 w-6" />
                <h2 className="text-xl font-bold">🩸 Blood Donation Events</h2>
              </div>
              <p className="text-purple-100 text-sm">
                Browse upcoming blood drives and register to attend. Hospitals and NGOs organize these community events to collect blood donations.
              </p>
            </div>

            {eventsLoading && (
              <div className="text-center py-12">
                <Loader className="h-8 w-8 text-purple-600 animate-spin mx-auto" />
              </div>
            )}

            {/* My RSVP'd Events */}
            {!eventsLoading && myRsvpEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    My Registrations ({myRsvpEvents.length})
                  </p>
                </div>
                <div className="space-y-3">
                  {myRsvpEvents.map((event) => {
                    const eventDay   = new Date(event.eventDate).getDate();
                    const eventMonth = new Date(event.eventDate).toLocaleDateString("en-GB", { month: "short" });
                    const isPast     = new Date(event.eventDate) < new Date();
                    return (
                      <Card key={event._id} className={`border-0 shadow-md cursor-pointer hover:shadow-lg transition-all border-l-4 ${event.status === "cancelled" ? "border-l-red-500 opacity-75" : "border-l-green-500"}`}
                        onClick={() => navigate(`/events/${event._id}`)}>
                        <CardContent className="pt-5 pb-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl w-14 h-14 flex flex-col items-center justify-center flex-shrink-0">
                              <p className="text-lg font-black leading-none">{eventDay}</p>
                              <p className="text-xs uppercase mt-0.5">{eventMonth}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 text-base truncate">{event.title}</h3>
                                {event.status === "cancelled" ? (
                                  <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">❌ Cancelled</Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">✅ Registered</Badge>
                                )}
                              </div>
                              <p className="text-xs text-purple-600 font-bold mb-2">{event.eventCode}</p>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Building className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{event.organizerName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{event.venueName}, {event.city}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                  <span>{event.startTime} — {event.endTime}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Upcoming Events */}
            {!eventsLoading && (
              <div>
                <div className="flex items-center justify-between mb-3 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      All Upcoming Events ({allEvents.length})
                    </p>
                  </div>
                  <button onClick={() => navigate("/events")} className="text-xs text-purple-600 hover:underline font-bold">
                    Browse All →
                  </button>
                </div>

                {allEvents.filter(e => !e.registeredDonors?.find(d => d.donorEmail === user?.email)).length === 0 ? (
                  <Card className="border-0 shadow-md">
                    <CardContent className="py-12 text-center">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No upcoming events</h3>
                      <p className="text-gray-500 text-sm">Hospitals and NGOs will post events here as they are scheduled.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {allEvents.filter(e => !e.registeredDonors?.find(d => d.donorEmail === user?.email)).slice(0, 5).map((event) => {
                      const eventDay     = new Date(event.eventDate).getDate();
                      const eventMonth   = new Date(event.eventDate).toLocaleDateString("en-GB", { month: "short" });
                      const alreadyRsvp  = event.registeredDonors?.find(d => d.donorEmail === user?.email);
                      const daysUntil    = Math.ceil((new Date(event.eventDate) - new Date()) / (1000 * 60 * 60 * 24));
                      const daysLabel    = daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`;
                      return (
                        <Card key={event._id} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-all"
                          onClick={() => navigate(`/events/${event._id}`)}>
                          <CardContent className="pt-5 pb-4">
                            <div className="flex items-start gap-4">
                              <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl w-14 h-14 flex flex-col items-center justify-center flex-shrink-0">
                                <p className="text-lg font-black leading-none">{eventDay}</p>
                                <p className="text-xs uppercase mt-0.5">{eventMonth}</p>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                                  <h3 className="font-bold text-gray-900 text-base truncate">{event.title}</h3>
                                  {alreadyRsvp ? (
                                    event.status === "cancelled" ? (
                                      <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">❌ Cancelled</Badge>
                                    ) : (
                                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">✅ Registered</Badge>
                                    )
                                  ) : (
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">{daysLabel}</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-purple-600 font-bold mb-2">{event.eventCode}</p>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Building className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{event.organizerName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{event.venueName}, {event.city}</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {event.bloodTypesNeeded?.slice(0, 4).map(t => (
                                    <span key={t} className="bg-red-50 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{t}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-red-600" />Donation History
              </CardTitle>
            </CardHeader>
            <CardContent><HistoryTab token={token} /></CardContent>
          </Card>
        )}

        {/* ── PROFILE & BADGES TAB ── */}
        {activeTab === "profile" && (
          <div className="space-y-6">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 pt-6 pb-10 relative">
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-t-3xl" />
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center border-2 border-white/30">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{user?.fullName}</h3>
                    <p className="text-red-100 text-sm">{user?.email}</p>
                    <span className="inline-block mt-1 bg-white/20 text-white text-xs font-bold px-3 py-0.5 rounded-full">Blood Donor</span>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-red-500 uppercase tracking-wider font-semibold">Blood Type</p>
                    <p className="text-3xl font-black text-red-600 mt-1">{bloodType}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Location</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{donorProfile?.locationName || "Not set"}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-green-600 uppercase tracking-wider font-semibold">Total Donations</p>
                    <p className="text-3xl font-black text-green-600 mt-1">{acceptedCount}</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${eligibility.color}`}>
                    <p className="text-xs uppercase tracking-wider font-semibold opacity-70">Next Eligible</p>
                    <p className="text-sm font-bold mt-1">{eligibility.label}</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => navigate("/donor/profile")}>Edit Profile</Button>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Achievements & Badges</h3>
                <span className="text-xs text-gray-400 font-medium">{badges.length} earned</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { title: "First Drop",    story: "You donated blood for the first time. One person's life changed forever because of you.",           icon: Droplets, target: 1,  color: "from-blue-400 to-blue-600",     bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-200"   },
                  { title: "Life Saver",    story: "You have donated 3 times. Up to 9 lives have been touched by your generosity.",                     icon: Heart,    target: 3,  color: "from-red-400 to-red-600",       bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200"    },
                  { title: "Regular Donor", story: "5 donations completed. You are now one of the most reliable donors on Jeevan Saarthi.",             icon: Award,    target: 5,  color: "from-yellow-400 to-orange-500", bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" },
                  { title: "Hero Donor",    story: "10 donations. Up to 30 lives saved. You are not just a donor — you are someone's reason to live.",  icon: Trophy,   target: 10, color: "from-purple-400 to-purple-600", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
                ].map((badge, i) => {
                  const earned      = acceptedCount >= badge.target;
                  const pct         = Math.min((acceptedCount / badge.target) * 100, 100);
                  const livesSaved  = badge.target * 3;
                  const bronzeCert  = donorProfile?.certificatesEarned?.find(c => c.level === "bronze");
                  const silverCert  = donorProfile?.certificatesEarned?.find(c => c.level === "silver");
                  const goldCert    = donorProfile?.certificatesEarned?.find(c => c.level === "gold");
                  const badgeDateMap = {
                    1:  bronzeCert?.earnedAt,
                    3:  silverCert?.earnedAt || bronzeCert?.earnedAt,
                    5:  silverCert?.earnedAt,
                    10: goldCert?.earnedAt,
                  };
                  const earnedDate  = badgeDateMap[badge.target] && earned
                    ? new Date(badgeDateMap[badge.target]).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                    : earned ? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;
                  return (
                    <div key={i} className={`rounded-xl p-4 border-2 transition-all ${
                      earned ? `${badge.border} shadow-md ${badge.bg}` : "border-gray-100 bg-gray-50"
                    }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                        earned ? `bg-gradient-to-br ${badge.color} shadow-lg` : "bg-gray-200"
                      }`}>
                        <badge.icon className={`h-6 w-6 ${earned ? "text-white" : "text-gray-400"}`} />
                      </div>
                      <p className={`font-bold text-sm mb-1 ${earned ? "text-gray-900" : "text-gray-400"}`}>
                        {badge.title}
                      </p>
                      {earned ? (
                        <>
                          <p className="text-xs text-gray-600 leading-relaxed mb-2">{badge.story}</p>
                          <div className="flex items-center gap-1 mb-2">
                            <Heart className="h-3 w-3 text-red-500 flex-shrink-0" />
                            <p className="text-xs font-semibold text-red-600">Up to {livesSaved} lives saved</p>
                          </div>
                          {earnedDate && (
                            <p className="text-xs text-gray-400">Earned {earnedDate}</p>
                          )}
                          <p className={`text-xs mt-1 font-semibold ${badge.text}`}>✅ Earned</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-gray-400 mb-2">{badge.target} donations needed</p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full transition-all bg-gradient-to-r ${badge.color} opacity-40`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs mt-1 text-gray-400">{acceptedCount}/{badge.target}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              {acceptedCount < 10 && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Star className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Next Badge</p>
                    {acceptedCount < 1  && <p className="text-sm text-gray-700">Donate once to earn <strong>First Drop</strong></p>}
                    {acceptedCount >= 1 && acceptedCount < 3  && <p className="text-sm text-gray-700">{3  - acceptedCount} more to earn <strong>Life Saver</strong></p>}
                    {acceptedCount >= 3 && acceptedCount < 5  && <p className="text-sm text-gray-700">{5  - acceptedCount} more to earn <strong>Regular Donor</strong></p>}
                    {acceptedCount >= 5 && acceptedCount < 10 && <p className="text-sm text-gray-700">{10 - acceptedCount} more to earn <strong>Hero Donor</strong></p>}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── CERTIFICATES TAB ── */}
        {activeTab === "certificates" && (
          <div className="space-y-6">

            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-1">
                <Trophy className="h-6 w-6" />
                <h2 className="text-xl font-bold">Your Certificates</h2>
              </div>
              <p className="text-yellow-100 text-sm">
                Earn certificates by donating blood. Download your official certificate as a PDF.
              </p>
            </div>

            {[
              { title: "First Time Donor",   level: "Bronze Certificate", description: "Awarded for completing your first blood donation",  target: 1,  seal: "🥉", gradient: "from-orange-100 via-amber-50 to-orange-100",   border: "border-2 border-orange-400", badge: "bg-orange-100 text-orange-800", cornerColor: "border-orange-400/50", levelColor: "#cd7f32" },
              { title: "Regular Contributor", level: "Silver Certificate", description: "Awarded for completing 5 blood donations",           target: 5,  seal: "🥈", gradient: "from-slate-100 via-gray-50 to-slate-100",     border: "border-2 border-slate-400",  badge: "bg-slate-100 text-slate-800",  cornerColor: "border-slate-400/50",  levelColor: "#708090" },
              { title: "Life Saver Champion", level: "Gold Certificate",   description: "Awarded for completing 10 blood donations",          target: 10, seal: "🥇", gradient: "from-yellow-100 via-amber-50 to-yellow-100",  border: "border-2 border-yellow-500", badge: "bg-yellow-100 text-yellow-800", cornerColor: "border-yellow-500/50", levelColor: "#d4af37" },
            ].map((cert, i) => {
              const earnedRecord  = donorProfile?.certificatesEarned?.find(c => c.level === cert.level);
              const earned        = earnedRecord ? true : acceptedCount >= cert.target;
              const pct           = Math.min((acceptedCount / cert.target) * 100, 100);
              const displayCount  = earnedRecord?.donationCountAtTime || cert.target;
              const displayDate   = earnedRecord?.earnedAt ? new Date(earnedRecord.earnedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
              const certPrefix    = cert.level === "Bronze Certificate" ? "BR" : cert.level === "Silver Certificate" ? "SL" : "GD";
              const displayCertNo = earnedRecord?.certificateNumber || `JS-${certPrefix}-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
              return (
                <div key={i} className={`rounded-2xl overflow-hidden shadow-md border-2 ${earned ? cert.border : "border-gray-200"}`}>
                  <div className={`relative p-6 ${earned ? "bg-gradient-to-r " + cert.gradient : "bg-gray-50"}`}>
                    {earned && (
                      <>
                        <div className={`absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 ${cert.cornerColor} rounded-tl-lg`} />
                        <div className={`absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 ${cert.cornerColor} rounded-tr-lg`} />
                        <div className={`absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 ${cert.cornerColor} rounded-bl-lg`} />
                        <div className={`absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 ${cert.cornerColor} rounded-br-lg`} />
                      </>
                    )}
                    <div className="text-center">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Jeevan Saarthi — Blood Donation System</p>
                      <p className="text-xs text-gray-400 mb-4">Certificate of Recognition</p>
                      <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${earned ? "bg-white/60 shadow-lg" : "bg-gray-200"}`}>
                        <span className="text-3xl">{cert.seal}</span>
                      </div>
                      <h3 className={`text-xl font-black mb-1 ${earned ? "text-gray-900" : "text-gray-400"}`}>{cert.title}</h3>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${earned ? "" : "text-gray-400"}`} style={earned ? { color: cert.levelColor } : {}}>{cert.level}</p>
                      {earned ? (
                        <>
                          <p className="text-sm text-gray-700 mb-1">This certifies that</p>
                          <p className="text-lg font-black text-gray-900 mb-1">{user?.fullName}</p>
                          <p className="text-sm text-gray-600 mb-4">{cert.description}</p>
                          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 flex-wrap">
                            <span>Milestone: <strong className="text-gray-900">{displayCount} donation{displayCount > 1 ? "s" : ""}</strong></span>
                            <span>•</span>
                            <span>Blood Type: <strong className="text-red-600">{bloodType}</strong></span>
                            <span>•</span>
                            <span>Earned: <strong className="text-gray-900">{displayDate}</strong></span>
                          </div>
                        </>
                      ) : (
                        <div className="py-2">
                          <p className="text-sm text-gray-400 mb-3">Complete {cert.target} donations to unlock</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div className="h-2 rounded-full bg-gradient-to-r from-red-400 to-red-600 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs text-gray-400">{acceptedCount}/{cert.target} donations</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`px-6 py-3 flex items-center justify-between ${earned ? "bg-white" : "bg-gray-100"}`}>
                    {earned ? (
                      <>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${cert.badge}`}>✅ Earned</span>
                        <button
                          onClick={() => {
                            const certNo     = displayCertNo;
                            const earnedDate = displayDate;
                            const bgColor    = cert.levelColor === "#cd7f32"
                              ? "linear-gradient(135deg, #fdf6e3 0%, #fffdf7 50%, #fdf6e3 100%)"
                              : cert.levelColor === "#708090"
                              ? "linear-gradient(135deg, #f4f6f8 0%, #ffffff 50%, #f4f6f8 100%)"
                              : "linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #fffbeb 100%)";
                            const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Lato', Georgia, serif; background: #fff; }
  .page {
    width: 842px; height: 595px;
    display: flex; align-items: center; justify-content: center;
    background: ${bgColor};
    position: relative; overflow: hidden;
  }
  .border-outer { position: absolute; inset: 12px; border: 3px solid ${cert.levelColor}; border-radius: 6px; }
  .border-inner  { position: absolute; inset: 18px; border: 1px solid ${cert.levelColor}88; border-radius: 4px; }
  .corner { position: absolute; width: 48px; height: 48px; }
  .tl { top: 24px; left: 24px; border-top: 3px solid ${cert.levelColor}; border-left: 3px solid ${cert.levelColor}; }
  .tr { top: 24px; right: 24px; border-top: 3px solid ${cert.levelColor}; border-right: 3px solid ${cert.levelColor}; }
  .bl { bottom: 24px; left: 24px; border-bottom: 3px solid ${cert.levelColor}; border-left: 3px solid ${cert.levelColor}; }
  .br { bottom: 24px; right: 24px; border-bottom: 3px solid ${cert.levelColor}; border-right: 3px solid ${cert.levelColor}; }
  .watermark {
    position: absolute; font-size: 130px; font-family: 'Playfair Display', serif;
    color: ${cert.levelColor}08; font-weight: 900;
    top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-25deg);
    white-space: nowrap; pointer-events: none; letter-spacing: 8px;
  }
  .content { text-align: center; padding: 32px 72px; position: relative; z-index: 1; width: 100%; }
  .header-line {
    display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 6px;
  }
  .header-dot { width: 6px; height: 6px; border-radius: 50%; background: ${cert.levelColor}; }
  .org {
    font-family: 'Lato', sans-serif; font-size: 10px; letter-spacing: 5px;
    text-transform: uppercase; color: ${cert.levelColor}; font-weight: 700;
  }
  .sub { font-size: 9px; letter-spacing: 3px; color: #aaa; text-transform: uppercase; margin-bottom: 14px; font-family: 'Lato', sans-serif; }
  .seal-wrap {
    width: 70px; height: 70px; border-radius: 50%; margin: 0 auto 12px;
    background: ${cert.levelColor}18; border: 2px solid ${cert.levelColor}44;
    display: flex; align-items: center; justify-content: center;
  }
  .seal { font-size: 40px; line-height: 1; }
  .title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 30px; font-weight: 900; color: #1a1a1a; margin-bottom: 3px; letter-spacing: 1px;
  }
  .level { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: ${cert.levelColor}; margin-bottom: 14px; font-weight: 700; }
  .divider-wrap { display: flex; align-items: center; gap: 10px; margin: 0 auto 14px; width: 260px; }
  .divider-line { flex: 1; height: 1px; background: linear-gradient(to right, transparent, ${cert.levelColor}88); }
  .divider-line.right { background: linear-gradient(to left, transparent, ${cert.levelColor}88); }
  .divider-diamond { width: 6px; height: 6px; background: ${cert.levelColor}; transform: rotate(45deg); flex-shrink: 0; }
  .awarded { font-size: 11px; color: #888; letter-spacing: 1px; margin-bottom: 5px; font-style: italic; }
  .name {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 26px; color: #c0392b; font-weight: 700; margin-bottom: 6px; letter-spacing: 1px;
  }
  .desc { font-size: 11px; color: #666; line-height: 1.65; margin-bottom: 16px; max-width: 560px; margin-left: auto; margin-right: auto; }
  .blood-badge {
    display: inline-block; background: #c0392b; color: white;
    font-size: 10px; font-weight: 700; padding: 2px 9px; border-radius: 20px; letter-spacing: 0.5px;
  }
  .footer { display: flex; justify-content: center; gap: 40px; margin-top: 4px; padding-top: 14px; border-top: 1px solid ${cert.levelColor}33; }
  .fi { text-align: center; min-width: 90px; }
  .fl { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: #bbb; margin-bottom: 5px; font-family: 'Lato', sans-serif; }
  .fv { font-size: 11px; font-weight: 700; color: #333; font-family: 'Lato', sans-serif; }
</style>
</head>
<body>
<div class="page">
  <div class="border-outer"></div>
  <div class="border-inner"></div>
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>
  <div class="watermark">JS</div>
  <div class="content">
    <div class="header-line">
      <div class="header-dot"></div>
      <div class="org">Jeevan Saarthi — Smart Blood Donation System — Nepal</div>
      <div class="header-dot"></div>
    </div>
    <div class="sub">Certificate of Recognition</div>
    <div class="seal-wrap"><div class="seal">${cert.seal}</div></div>
    <div class="title">${cert.title}</div>
    <div class="level">${cert.level}</div>
    <div class="divider-wrap">
      <div class="divider-line"></div>
      <div class="divider-diamond"></div>
      <div class="divider-line right"></div>
    </div>
    <div class="awarded">This certificate is proudly awarded to</div>
    <div class="name">${user?.fullName}</div>
    <div class="desc">
      ${cert.description} — contributing to save lives across Nepal
      with <span class="blood-badge">${bloodType} Blood</span>
      and <strong>${displayCount}</strong> confirmed donation${displayCount > 1 ? "s" : ""}.
    </div>
    <div class="footer">
      <div class="fi">
        <div class="fl">Date Issued</div>
        <div class="fv">${earnedDate}</div>
      </div>
      <div class="fi">
        <div class="fl">Blood Type</div>
        <div class="fv">${bloodType}</div>
      </div>
      <div class="fi">
        <div class="fl">Certificate No.</div>
        <div class="fv">${certNo}</div>
      </div>
      <div class="fi">
        <div class="fl">Milestone</div>
        <div class="fv">${displayCount} Donation${displayCount > 1 ? "s" : ""}</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
                            const blob = new Blob([html], { type: "text/html" });
                            const url  = URL.createObjectURL(blob);
                            const a    = document.createElement("a");
                            a.href     = url;
                            a.download = `Jeevan-Saarthi-${cert.title.replace(/ /g, "-")}-Certificate.html`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                        >
                          <Trophy className="h-3.5 w-3.5" />
                          Download Certificate
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">
                        🔒 Locked — {cert.target - acceptedCount > 0 ? `${cert.target - acceptedCount} more donation${cert.target - acceptedCount > 1 ? "s" : ""} needed` : "Processing..."}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

// ── HISTORY TAB COMPONENT ─────────────────────────────────────────────────────
// 1. Awaiting Confirmation — donor accepted, patient not yet confirmed
// 2. Confirmed Donations   — patient confirmed, counts as real donation
// ─────────────────────────────────────────────────────────────────────────────
const HistoryTab = ({ token }) => {
  const [confirmed, setConfirmed] = useState([]);
  const [pending,   setPending]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState(null);

  const [emergencyDonations, setEmergencyDonations] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [confirmedRes, pendingRes, emergencyRes] = await Promise.all([
          axios.get("http://localhost:5000/api/matches/my-accepted",          { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/matches/pending-confirmation", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/emergency/my-accepted",        { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setConfirmed(confirmedRes.data.matches       || []);
        setPending(pendingRes.data.matches           || []);
        setEmergencyDonations(emergencyRes.data.emergencies || []);
      } catch (err) { console.log(err); }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="text-center py-8">
      <Loader className="h-8 w-8 text-red-600 animate-spin mx-auto" />
    </div>
  );

  if (confirmed.length === 0 && pending.length === 0 && emergencyDonations.length === 0) return (
    <div className="text-center py-10">
      <Calendar className="h-12 w-12 text-gray-200 mx-auto mb-3" />
      <p className="text-gray-500 text-sm font-medium">No donation history yet</p>
      <p className="text-gray-400 text-xs mt-1">
        When you accept a request it will appear here. Once the recipient confirms it counts as a donation.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── AWAITING CONFIRMATION ── */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Awaiting Confirmation ({pending.length})
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3">
            <p className="text-xs text-yellow-800 leading-relaxed">
              <strong>You accepted these requests.</strong> If you have already donated blood,
              the recipient needs to confirm your donation. You can send them a reminder below.
            </p>
          </div>

          <div className="space-y-3">
            {pending.map((match, i) => {
              const key    = `pending-${match._id || i}`;
              const isOpen = expanded === key;
              const req    = match.requestId;

              return (
                <div key={key} className={`border-2 rounded-xl transition-all duration-200 ${
                  isOpen ? "border-yellow-400 shadow-md" : "border-yellow-200 hover:border-yellow-400"
                }`}>
                  <button className="w-full p-4 text-left" onClick={() => setExpanded(isOpen ? null : key)}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{req?.hospitalName || "Hospital"}</p>
                          <p className="text-xs text-gray-500">
                            {req?.bloodGroup}{req?.rh} — {req?.unitsRequired} unit{req?.unitsRequired > 1 ? "s" : ""}
                            {req?.urgency ? ` · ${req.urgency}` : ""}
                          </p>
                          <p className="text-xs text-gray-400">
                            Accepted: {match.respondedAt
                              ? new Date(match.respondedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">⏳ Confirmation Pending</Badge>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isOpen ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-400"}`}>
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-yellow-100 p-4 bg-yellow-50 rounded-b-xl space-y-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Donation Details</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Blood Type</p>
                          <p className="text-xl font-bold text-red-600">{req?.bloodGroup}{req?.rh}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Units</p>
                          <p className="text-xl font-bold text-gray-900">{req?.unitsRequired || "—"}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100 col-span-2">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Hospital</p>
                          <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-gray-400" />{req?.hospitalName || "—"}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">You Accepted On</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {match.respondedAt
                              ? new Date(match.respondedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                              : "—"}
                          </p>
                        </div>
                        <div className="bg-yellow-100 rounded-xl p-3 border border-yellow-200">
                          <p className="text-xs text-yellow-700 uppercase tracking-wider mb-1">Status</p>
                          <p className="text-sm font-bold text-yellow-800">⏳ Waiting for recipient</p>
                        </div>
                        {req?.notes && (
                          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 col-span-2">
                            <p className="text-xs text-blue-500 uppercase tracking-wider mb-1">Request Notes</p>
                            <p className="text-sm text-blue-800">{req.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-white border border-yellow-200 rounded-xl p-4 mt-2">
                        <p className="text-xs font-bold text-gray-700 mb-2">Already donated? Send a reminder:</p>
                        <a
                          href={`mailto:?subject=Blood Donation Confirmation Reminder — Jeevan Saarthi&body=Hello,%0D%0A%0D%0AI donated blood for your request at ${req?.hospitalName || "the hospital"} on ${match.respondedAt ? new Date(match.respondedAt).toLocaleDateString() : "the scheduled date"}.%0D%0A%0D%0ACould you please confirm my donation in the Jeevan Saarthi system so my contribution is recorded?%0D%0A%0D%0AThank you for helping save lives!%0D%0A%0D%0AJeevan Saarthi Donor`}
                          className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-all"
                        >
                          <Mail className="h-3.5 w-3.5" />Send Reminder Email
                        </a>
                        <p className="text-xs text-gray-400 mt-2 text-center">Opens your email app with a pre-written reminder</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CONFIRMED DONATIONS ── */}
      {confirmed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Confirmed Donations ({confirmed.length})
            </p>
          </div>

          <div className="space-y-3">
            {confirmed.map((match, i) => {
              const key    = `confirmed-${match._id || i}`;
              const isOpen = expanded === key;
              const req    = match.requestId;
              const date   = match.donationConfirmedAt || match.respondedAt;

              return (
                <div key={key} className={`border rounded-xl transition-all duration-200 ${
                  isOpen ? "border-green-300 shadow-md" : "border-gray-200 hover:border-green-200"
                }`}>
                  <button className="w-full p-4 text-left" onClick={() => setExpanded(isOpen ? null : key)}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Droplets className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{req?.hospitalName || "Hospital"}</p>
                          <p className="text-xs text-gray-500">
                            {req?.bloodGroup}{req?.rh} — {req?.unitsRequired} unit{req?.unitsRequired > 1 ? "s" : ""}
                            {req?.urgency ? ` · ${req.urgency}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-600">
                            {date ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </p>
                          <Badge className="mt-0.5 bg-green-100 text-green-700 border-green-200 text-xs">🎉 Confirmed</Badge>
                        </div>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isOpen ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Donation Details</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Blood Type Donated</p>
                          <p className="text-xl font-bold text-red-600">{req?.bloodGroup}{req?.rh}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Units Donated</p>
                          <p className="text-xl font-bold text-gray-900">{req?.unitsRequired || "—"}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100 col-span-2">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Hospital</p>
                          <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-gray-400" />{req?.hospitalName || "—"}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Urgency</p>
                          <Badge className={
                            req?.urgency === "Emergency" ? "bg-red-100 text-red-700 border-red-200" :
                            req?.urgency === "Urgent"    ? "bg-orange-100 text-orange-700 border-orange-200" :
                            "bg-gray-100 text-gray-700 border-gray-200"
                          }>
                            {req?.urgency || "Normal"}
                          </Badge>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                          <p className="text-xs text-green-600 uppercase tracking-wider mb-1">Confirmed On</p>
                          <p className="font-semibold text-green-800 text-sm flex items-center gap-1.5">
                            <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                            {match.donationConfirmedAt
                              ? new Date(match.donationConfirmedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                              : date ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"
                            }
                          </p>
                        </div>
                        {req?.notes && (
                          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 col-span-2">
                            <p className="text-xs text-blue-500 uppercase tracking-wider mb-1">Request Notes</p>
                            <p className="text-sm text-blue-800">{req.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-xl p-3 flex items-center gap-3">
                        <Heart className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <p className="text-xs text-red-700 font-medium">
                          Your donation helped save up to 3 lives. Thank you for being a hero! 🩸
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {confirmed.length === 0 && pending.length > 0 && (
        <div className="text-center py-2">
          <p className="text-xs text-gray-400">
            Confirmed donations will appear here once recipients verify your donation
          </p>
        </div>
      )}

      {/* ── EMERGENCY DONATIONS ── */}
      {emergencyDonations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Emergency Donations ({emergencyDonations.length})
            </p>
          </div>
          <div className="space-y-3">
            {emergencyDonations.map((em, i) => {
              const key    = `emergency-${em.emergencyId || i}`;
              const isOpen = expanded === key;
              return (
                <div key={key} className={`rounded-xl border-l-4 transition-all duration-200 ${
                  em.donationStatus === "Donated"
                    ? isOpen ? "border border-green-300 border-l-green-500 shadow-md" : "border border-gray-200 border-l-green-500 bg-white hover:border-green-200"
                    : isOpen ? "border border-red-300 border-l-red-500 shadow-md" : "border border-red-100 border-l-red-500 bg-red-50 hover:border-red-300"
                }`}>

                  {/* Card Header — clickable */}
                  <button className="w-full p-4 text-left" onClick={() => setExpanded(isOpen ? null : key)}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          em.donationStatus === "Donated" ? "bg-green-100" : "bg-red-100"
                        }`}>
                          <span className="text-sm font-bold text-red-600">{em.bloodGroup}{em.rh}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{em.hospitalName}</p>
                          <p className="text-xs text-gray-500">{em.trackingCode}</p>
                          <p className="text-xs text-gray-400">
                            {em.donatedAt
                              ? `Donated: ${new Date(em.donatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                              : `Accepted: ${new Date(em.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end gap-1">
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">🚨 Emergency</Badge>
                          {em.donationStatus === "Donated"
                            ? <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">✅ Donated</Badge>
                            : <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">⏳ Accepted</Badge>
                          }
                        </div>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          isOpen ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400"
                        }`}>
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isOpen && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl space-y-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Emergency Donation Details</p>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Blood Donated</p>
                          <p className="text-xl font-bold text-red-600">{em.bloodGroup}{em.rh}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Urgency</p>
                          <Badge className={
                            em.urgencyLevel === "Critical" ? "bg-red-100 text-red-700 border-red-200" :
                            em.urgencyLevel === "Urgent"   ? "bg-orange-100 text-orange-700 border-orange-200" :
                            "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }>
                            {em.urgencyLevel}
                          </Badge>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100 col-span-2">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Hospital</p>
                          <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-gray-400" />{em.hospitalName}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tracking Code</p>
                          <p className="text-sm font-bold text-red-600">{em.trackingCode}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Requester</p>
                          <p className="text-sm font-semibold text-gray-900">{em.requesterName}</p>
                        </div>
                        {em.medicalCondition && (
                          <div className="bg-red-50 rounded-xl p-3 border border-red-100 col-span-2">
                            <p className="text-xs text-red-500 uppercase tracking-wider mb-1">Medical Condition</p>
                            <p className="text-sm text-red-800">{em.medicalCondition}</p>
                          </div>
                        )}
                        {em.donatedAt && (
                          <div className="bg-green-50 rounded-xl p-3 border border-green-200 col-span-2">
                            <p className="text-xs text-green-600 uppercase tracking-wider mb-1">Donation Confirmed On</p>
                            <p className="font-semibold text-green-800 text-sm flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                              {new Date(em.donatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Thank you message if received */}
                      {em.thankYouReceived && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">💙 Message from Requester</p>
                          <p className="text-sm text-blue-800 italic">"{em.thankYouMessage || "Thank you for saving my life!"}"</p>
                        </div>
                      )}

                      {/* Motivational footer */}
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-xl p-3 flex items-center gap-3">
                        <Heart className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <p className="text-xs text-red-700 font-medium">
                          You responded to an emergency and potentially saved a life. You are a hero! 🩸
                        </p>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default DonorDashboard;