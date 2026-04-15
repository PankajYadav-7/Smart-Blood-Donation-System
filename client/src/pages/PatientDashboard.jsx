import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Droplets, Plus, CheckCircle, AlertCircle,
  User, MapPin, Clock, Phone, Mail,
  ThumbsUp, ThumbsDown, Loader, Calendar,
} from "lucide-react";

const API = "http://localhost:5000/api";

const PatientDashboard = () => {
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");
  const user      = JSON.parse(localStorage.getItem("user") || "null");

  const [requests,   setRequests]   = useState([]);
  const [matchData,  setMatchData]  = useState({});
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("active");
  const [expanded,   setExpanded]   = useState(null);
  const [toast,      setToast]      = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${API}/requests/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const reqs = res.data.requests || [];
      setRequests(reqs);
      await fetchAllMatchData(reqs);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const fetchAllMatchData = async (reqs) => {
    const data = {};
    await Promise.all(
      reqs.map(async (req) => {
        try {
          const res = await axios.get(
            `${API}/matches/accepted-donors/${req._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          data[req._id] = res.data.matches || [];
        } catch { data[req._id] = []; }
      })
    );
    setMatchData(data);
  };

  const handleConfirmDonation = async (matchId, requestId) => {
    try {
      await axios.patch(
        `${API}/matches/${matchId}/confirm-donation`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Donation confirmed! Thank you for updating the record.");
      fetchRequests();
    } catch { showToast("Failed to confirm donation", "error"); }
  };

  const handleNoShow = async (matchId) => {
    try {
      await axios.patch(
        `${API}/matches/${matchId}/no-show`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Marked as did not come. We will help find another donor.");
      fetchRequests();
    } catch { showToast("Failed to update", "error"); }
  };

  const handleFulfill = async (requestId) => {
    try {
      await axios.patch(
        `${API}/requests/${requestId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Request marked as fulfilled successfully!");
      fetchRequests();
    } catch { showToast("Failed to close request", "error"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const activeRequests    = requests.filter(r => r.status === "Open");
  const fulfilledRequests = requests.filter(r => r.status === "Closed");

  const tabs = [
    { id: "active",    label: "🔴 Active Requests" },
    { id: "fulfilled", label: "✅ Fulfilled" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":  return "bg-blue-100 text-blue-700 border-blue-200";
      case "Donated":   return "bg-green-100 text-green-700 border-green-200";
      case "NoShow":    return "bg-red-100 text-red-700 border-red-200";
      case "Declined":  return "bg-gray-100 text-gray-500 border-gray-200";
      default:          return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Accepted": return "✅ Accepted — Awaiting donation";
      case "Donated":  return "🎉 Donation Confirmed";
      case "NoShow":   return "❌ Did Not Come";
      case "Declined": return "Declined";
      default:         return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Toast Notification ── */}
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
            <h1 className="text-3xl font-bold text-gray-900">👨‍👩‍👧 Patient Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome, {user?.fullName} — manage your blood requests</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/create-request")}>
              <Plus className="h-4 w-4 mr-2" />New Request
            </Button>
            <Button variant="outline" onClick={() => navigate("/patient/profile")}
              className="text-blue-600 border-blue-200 hover:bg-blue-50">
              <User className="h-4 w-4 mr-2" />Edit Profile
            </Button>
            <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Requests",  value: requests.length,          icon: Droplets,     color: "text-blue-600 bg-blue-50"   },
            { label: "Active",          value: activeRequests.length,    icon: AlertCircle,  color: "text-red-600 bg-red-50"     },
            { label: "Fulfilled",       value: fulfilledRequests.length, icon: CheckCircle,  color: "text-green-600 bg-green-50" },
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

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
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

        {/* ── ACTIVE REQUESTS ── */}
        {activeTab === "active" && (
          <div className="space-y-6">
            {loading && (
              <div className="text-center py-12">
                <Loader className="h-8 w-8 text-red-600 animate-spin mx-auto" />
              </div>
            )}

            {!loading && activeRequests.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <Droplets className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No active requests</h3>
                  <p className="text-gray-500 text-sm mb-4">Create a blood request to find matching donors</p>
                  <Button onClick={() => navigate("/create-request")}>
                    <Plus className="h-4 w-4 mr-2" />Create Blood Request
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeRequests.map((request) => {
              const donors   = matchData[request._id] || [];
              const accepted = donors.filter(m => m.status === "Accepted");
              const donated  = donors.filter(m => m.status === "Donated");
              const noshow   = donors.filter(m => m.status === "NoShow");
              const isOpen   = expanded === request._id;

              return (
                <Card key={request._id} className="border-0 shadow-md">
                  <CardContent className="pt-6 pb-5">

                    {/* Request header */}
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {request.bloodGroup}{request.rh}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {request.bloodGroup}{request.rh} Blood — {request.unitsRequired} units needed
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap mt-1">
                            <Badge className={request.urgency === "Emergency"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                            }>{request.urgency}</Badge>
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              {request.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">🏥 {request.hospitalName}</p>
                        {request.notes && <p className="text-xs text-gray-400 mt-0.5">📝 {request.notes}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          Posted: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Donor response summary */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-gray-700">Donor Responses</p>
                        <button
                          onClick={() => setExpanded(isOpen ? null : request._id)}
                          className="text-xs text-red-600 hover:underline font-medium"
                        >
                          {isOpen ? "Hide donors ▲" : `View donors (${donors.length}) ▼`}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-semibold text-blue-700">{accepted.length} Accepted</span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-semibold text-green-700">{donated.length} Donation Confirmed</span>
                        </div>
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          <ThumbsDown className="h-4 w-4 text-red-500" />
                          <span className="text-xs font-semibold text-red-700">{noshow.length} Did Not Come</span>
                        </div>
                      </div>

                      {accepted.length > 0 && (
                        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                          <p className="text-xs text-blue-800 font-medium">
                            ✅ {accepted.length} donor{accepted.length > 1 ? "s have" : " has"} accepted your request.
                            Please confirm once they donate blood so their contribution is recorded.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Expanded donor details */}
                    {isOpen && donors.length > 0 && (
                      <div className="space-y-3 mb-4">
                        <p className="text-sm font-bold text-gray-700">Donor Details:</p>
                        {donors.map((match, i) => (
                          <div key={match._id || i} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-4 flex-wrap">

                              {/* Donor info */}
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                  <User className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {match.contactRevealed
                                      ? match.donorUserId?.fullName || "Anonymous Donor"
                                      : `Donor #${i + 1}`
                                    }
                                  </p>
                                  {match.contactRevealed && match.donorUserId?.email && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {match.donorUserId.email}
                                    </p>
                                  )}
                                  {match.donorProfileId?.bloodGroup && (
                                    <p className="text-xs text-red-600 font-medium">
                                      Blood Type: {match.donorProfileId.bloodGroup}{match.donorProfileId.rh}
                                    </p>
                                  )}
                                  {match.donorProfileId?.locationName && (
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {match.donorProfileId.locationName}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Status and actions */}
                              <div className="flex flex-col gap-2 items-end">
                                <Badge className={getStatusColor(match.status)}>
                                  {getStatusLabel(match.status)}
                                </Badge>

                                {/* Confirm/NoShow buttons — only for Accepted status */}
                                {match.status === "Accepted" && (
                                  <div className="flex gap-2 flex-wrap justify-end">
                                    <Button
                                      size="sm"
                                      onClick={() => handleConfirmDonation(match._id, request._id)}
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                    >
                                      <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                                      Confirm Donation
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleNoShow(match._id)}
                                      className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                                    >
                                      <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                                      Did Not Come
                                    </Button>
                                  </div>
                                )}

                                {match.status === "Donated" && (
                                  <p className="text-xs text-green-600 font-medium">
                                    Confirmed on {match.donationConfirmedAt
                                      ? new Date(match.donationConfirmedAt).toLocaleDateString()
                                      : "—"}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isOpen && donors.length === 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                        <p className="text-xs text-yellow-800">
                          No donors have responded yet. Compatible donors will see your request
                          and can accept it from their dashboard.
                        </p>
                      </div>
                    )}

                    {/* Mark fulfilled button */}
                    <div className="flex gap-3 pt-2 border-t border-gray-100 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpanded(isOpen ? null : request._id)}
                        className="text-gray-600"
                      >
                        {isOpen ? "Hide Details" : "View Donor Details"}
                      </Button>
                      {donated.length > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleFulfill(request._id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Request Fulfilled
                        </Button>
                      )}
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── FULFILLED REQUESTS ── */}
        {activeTab === "fulfilled" && (
          <div className="space-y-4">
            {fulfilledRequests.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No fulfilled requests yet</p>
                </CardContent>
              </Card>
            )}

            {fulfilledRequests.map((request) => {
              const donors  = matchData[request._id] || [];
              const donated = donors.filter(m => m.status === "Donated");
              const accepted = donors.filter(m => m.status === "Accepted" || m.status === "Donated");
              return (
                <Card
                  key={request._id}
                  className="border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={() => navigate(`/request-details/${request._id}`)}
                >
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                            {request.bloodGroup}{request.rh} — {request.unitsRequired} units needed
                          </p>
                          <p className="text-sm text-gray-500">🏥 {request.hospitalName}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {accepted.length > 0 && (
                              <p className="text-xs text-gray-400">{accepted.length} donor{accepted.length > 1 ? "s" : ""} responded</p>
                            )}
                            {donated.length > 0 && (
                              <p className="text-xs text-green-600 font-medium">
                                · {donated.length} donation{donated.length > 1 ? "s" : ""} confirmed
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              · {new Date(request.createdAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />Fulfilled
                        </Badge>
                        <span className="text-xs text-gray-400 group-hover:text-red-500 transition-colors">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PatientDashboard;