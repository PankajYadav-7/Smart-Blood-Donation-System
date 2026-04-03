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
  ChevronDown, ChevronUp, ThumbsUp, Mail,
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
  // ── NEW: eligibility info returned from backend ──
  const [eligibilityInfo, setEligibilityInfo] = useState(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchMatches(), fetchDonorProfile(), fetchAcceptedCount()]);
    setLoading(false);
  };

  // ── UPDATED: now stores eligibilityInfo from backend ──
  const fetchMatches = async () => {
    try {
      const res = await axios.get(`${API}/matches/compatible-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches(res.data.requests || []);
      setEligibilityInfo({
        status:           res.data.eligibilityStatus  || "eligible",
        daysLeft:         res.data.daysLeft            || 0,
        nextEligibleDate: res.data.nextEligibleDate    || null,
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
      const res = await axios.get(`${API}/matches/my-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAcceptedCount(res.data.count || 0);
    } catch (err) { console.log(err); }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
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
      // Refresh matches after availability change
      fetchMatches();
    } catch { showToast("Failed to update availability", "error"); }
  };

  const handleRespond = async (matchId, requestId, status) => {
    try {
      if (matchId) {
        await axios.patch(
          `${API}/matches/${matchId}/respond`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API}/matches/respond-direct`,
          { requestId, status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      showToast(
        status === "Accepted"
          ? "Request accepted! The patient has been notified."
          : "Request declined."
      );
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
    if (!donorProfile?.lastDonationDate) return { label: "Available", color: "text-green-600 bg-green-50" };
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
    { id: "history",      label: "📋 History"          },
    { id: "profile",      label: "👤 Profile & Badges" },
    { id: "certificates", label: "🏆 Certificates"     },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all duration-300 ${
          toast.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"
        }`}>
          {toast.type === "error"
            ? <AlertCircle className="h-5 w-5 flex-shrink-0" />
            : <CheckCircle className="h-5 w-5 flex-shrink-0" />
          }
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.fullName?.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-500 mt-1">You are making a difference — keep saving lives!</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <div className={`w-3 h-3 rounded-full ${isAvailable && !isSnoozed ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="text-sm font-medium text-gray-700">
                {!donorProfile ? "Set Profile" : isSnoozed ? "Snoozed" : isAvailable ? "Available" : "Unavailable"}
              </span>
              <button
                onClick={handleToggleAvailability}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAvailable && !isSnoozed ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                  isAvailable && !isSnoozed ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/donor/profile")}>
              Edit Profile
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
              Logout
            </Button>
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
            <Button size="sm" onClick={() => navigate("/donor/profile")} className="flex-shrink-0">
              Complete Profile
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── REQUESTS TAB ── */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">🔔 Blood Requests Matching You</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleSnooze(4)} className="text-gray-600">
                  <BellOff className="h-4 w-4 mr-1" />Snooze 4h
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSnooze(24)} className="text-gray-600">
                  Snooze 24h
                </Button>
              </div>
            </div>

            {loading && (
              <div className="text-center py-12">
                <Loader className="h-8 w-8 text-red-600 animate-spin mx-auto" />
                <p className="text-gray-500 mt-3">Loading matches...</p>
              </div>
            )}

            {/* ── SMART EMPTY STATES based on eligibility ── */}
            {!loading && matches.length === 0 && (
              <>
                {/* 1. COOLDOWN — donated recently, not eligible yet */}
                {eligibilityInfo?.status === "cooldown" && (
                  <Card className="border-0 shadow-md border-l-4 border-l-orange-400">
                    <CardContent className="py-8 px-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-7 w-7 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            You donated blood recently 🩸
                          </h3>
                          <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                            Thank you for your life-saving donation! Your body needs time to fully
                            recover before your next donation. You are not yet eligible to donate again.
                          </p>

                          {/* Countdown cards */}
                          <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                              <p className="text-xs text-orange-600 uppercase tracking-wider mb-1 font-semibold">
                                Days Remaining
                              </p>
                              <p className="text-4xl font-bold text-orange-700">
                                {eligibilityInfo.daysLeft}
                              </p>
                              <p className="text-xs text-orange-500 mt-1">days until eligible</p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                              <p className="text-xs text-green-600 uppercase tracking-wider mb-1 font-semibold">
                                Next Eligible Date
                              </p>
                              <p className="text-base font-bold text-green-700 mt-1">
                                {eligibilityInfo.nextEligibleDate
                                  ? new Date(eligibilityInfo.nextEligibleDate).toLocaleDateString("en-GB", {
                                      day: "numeric", month: "long", year: "numeric"
                                    })
                                  : "—"
                                }
                              </p>
                              <p className="text-xs text-green-500 mt-1">mark your calendar</p>
                            </div>
                          </div>

                          {/* Progress bar */}
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

                          {/* Tips */}
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <p className="text-xs font-bold text-blue-700 mb-2">💡 What you can do now:</p>
                            <ul className="text-xs text-blue-600 space-y-1.5 leading-relaxed">
                              <li>• Your availability has been automatically turned off to protect your health</li>
                              <li>• Eat iron-rich foods and stay hydrated to recover faster</li>
                              <li>• You will be notified when you become eligible again</li>
                              <li>• Check your History tab to see your donation record</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 2. UNAVAILABLE — donor turned off availability */}
                {eligibilityInfo?.status === "unavailable" && (
                  <Card className="border-0 shadow-md">
                    <CardContent className="py-12 text-center">
                      <BellOff className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        You are currently unavailable
                      </h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-5">
                        Toggle your availability to ON using the button at the top of this page
                        to start receiving blood requests again.
                      </p>
                      <Button onClick={handleToggleAvailability}>
                        Turn Availability ON
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* 3. NO PROFILE — profile not set up */}
                {eligibilityInfo?.status === "no_profile" && (
                  <Card className="border-0 shadow-md">
                    <CardContent className="py-12 text-center">
                      <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Complete your profile first
                      </h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto mb-5">
                        Set your blood group and availability to start receiving matching requests.
                      </p>
                      <Button onClick={() => navigate("/donor/profile")}>
                        Complete Profile
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* 4. ELIGIBLE but no requests right now */}
                {(eligibilityInfo?.status === "eligible" || !eligibilityInfo?.status) && (
                  <Card className="border-0 shadow-md">
                    <CardContent className="py-12 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No matching requests right now
                      </h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto">
                        You are eligible and available. New requests will appear here
                        automatically when a matching blood type is needed.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Request cards */}
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
                          <Badge className={match.requestId?.urgency === "Emergency"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                          }>
                            {match.requestId?.urgency}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1.5 ml-1">
                        {match.status === "New" && (
                          <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium mb-1">
                            🔵 New Request
                          </span>
                        )}
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />{match.requestId?.hospitalName}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-gray-400" />Units Required: {match.requestId?.unitsRequired}
                        </p>
                        {match.requestId?.notes && (
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />{match.requestId?.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-3 justify-end">
                      <Button
                        onClick={() => handleRespond(match._id, match.requestId?._id, "Accepted")}
                        className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRespond(match._id, match.requestId?._id, "Declined")}
                        className="flex-1 md:flex-none text-gray-600"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            <CardContent>
              <HistoryTab token={token} />
            </CardContent>
          </Card>
        )}

        {/* ── PROFILE & BADGES TAB ── */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Donor Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{user?.fullName}</h3>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    <Badge className="mt-1 bg-blue-100 text-blue-700 border-blue-200">Donor</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Blood Type</p>
                    <p className="text-xl font-bold text-red-600 mt-1">{bloodType}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Location</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{donorProfile?.locationName || "Not set"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Donations</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{acceptedCount}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Next Eligible</p>
                    <p className={`text-sm font-bold mt-1 ${eligibility.color.split(" ")[0]}`}>{eligibility.label}</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => navigate("/donor/profile")}>
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle>Achievements & Badges</CardTitle></CardHeader>
              <CardContent>
                {badges.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No badges yet</p>
                    <p className="text-gray-400 text-xs mt-1">Accept your first blood request to earn your first badge!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {badges.map((badge, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${badge.color}`}>
                        <badge.icon className="h-8 w-8 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">{badge.title}</p>
                          <p className="text-xs text-gray-500">{badge.description}</p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500 ml-auto flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
                {acceptedCount < 10 && (
                  <div className="mt-4 p-3 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Next Badge</p>
                    {acceptedCount < 1  && <p className="text-sm text-gray-600">Accept your first request to earn <strong>First Drop</strong> badge</p>}
                    {acceptedCount >= 1 && acceptedCount < 3  && <p className="text-sm text-gray-600">Accept {3 - acceptedCount} more to earn <strong>Life Saver</strong> badge</p>}
                    {acceptedCount >= 3 && acceptedCount < 5  && <p className="text-sm text-gray-600">Accept {5 - acceptedCount} more to earn <strong>Regular Donor</strong> badge</p>}
                    {acceptedCount >= 5 && acceptedCount < 10 && <p className="text-sm text-gray-600">Accept {10 - acceptedCount} more to earn <strong>Hero Donor</strong> badge</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── CERTIFICATES TAB ── */}
        {activeTab === "certificates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-red-600" />Your Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {certificates.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No certificates yet</p>
                    <p className="text-gray-400 text-xs mt-1">Accept your first blood request to earn your first certificate!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {certificates.map((cert, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${cert.color}`}>
                        <div className="flex items-center gap-3">
                          <cert.icon className="h-6 w-6 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900">{cert.title}</p>
                            <p className="text-xs text-gray-500">{cert.level}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-200">Earned</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-600" />Progress to Next
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "First Time Donor",    target: 1,  label: "donation"  },
                    { title: "Regular Contributor", target: 5,  label: "donations" },
                    { title: "Life Saver Champion", target: 10, label: "donations" },
                  ].map((item, i) => {
                    const pct  = Math.min((acceptedCount / item.target) * 100, 100);
                    const done = acceptedCount >= item.target;
                    return (
                      <div key={i} className="p-3 border border-gray-200 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                          <Badge variant="outline">{acceptedCount}/{item.target}</Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div
                            className={`h-2 rounded-full transition-all ${done ? "bg-green-500" : "bg-red-600"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {done ? "✅ Completed!" : `${item.target - acceptedCount} more ${item.label} needed`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// HISTORY TAB COMPONENT
// 1. Awaiting Confirmation — donor accepted, patient not yet confirmed
// 2. Confirmed Donations   — patient confirmed, counts as real donation
// ─────────────────────────────────────────────────────────
const HistoryTab = ({ token }) => {
  const [confirmed, setConfirmed] = useState([]);
  const [pending,   setPending]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [confirmedRes, pendingRes] = await Promise.all([
          axios.get(
            "http://localhost:5000/api/matches/my-accepted",
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            "http://localhost:5000/api/matches/pending-confirmation",
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
        setConfirmed(confirmedRes.data.matches || []);
        setPending(pendingRes.data.matches     || []);
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

  if (confirmed.length === 0 && pending.length === 0) return (
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
                              ? new Date(match.respondedAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })
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
                              ? new Date(match.respondedAt).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })
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
                            {date ? new Date(date).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }) : "—"}
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
                          <Badge className={req?.urgency === "Emergency" ? "bg-red-100 text-red-700 border-red-200" : req?.urgency === "Urgent" ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-gray-100 text-gray-700 border-gray-200"}>
                            {req?.urgency || "Normal"}
                          </Badge>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                          <p className="text-xs text-green-600 uppercase tracking-wider mb-1">Confirmed On</p>
                          <p className="font-semibold text-green-800 text-sm flex items-center gap-1.5">
                            <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                            {match.donationConfirmedAt
                              ? new Date(match.donationConfirmedAt).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })
                              : date ? new Date(date).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" }) : "—"
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
    </div>
  );
};

export default DonorDashboard;