import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Droplets, Plus, CheckCircle, AlertCircle,
  Building, Activity, Search, X, Users, Eye,
  Phone, MapPin, Clock, Loader, Heart,
} from "lucide-react";

const API = "http://localhost:5000/api";

const HospitalDashboard = () => {
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");
  const user      = JSON.parse(localStorage.getItem("user") || "null");

  const [requests,   setRequests]   = useState([]);
  const [matchData,  setMatchData]  = useState({});
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("requests");

  // Emergency state
  const [emergencies,      setEmergencies]      = useState([]);
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchMyRequests();
  }, []);

  useEffect(() => {
    if (activeTab === "emergency") fetchEmergencies();
  }, [activeTab]);

  const fetchMyRequests = async () => {
    try {
      const res = await axios.get(`${API}/requests/my`, { headers: { Authorization: `Bearer ${token}` } });
      const reqs = res.data.requests || [];
      setRequests(reqs);
      await fetchAllMatchCounts(reqs);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const fetchAllMatchCounts = async (reqs) => {
    const counts = {};
    await Promise.all(
      reqs.map(async (req) => {
        try {
          const res = await axios.get(`${API}/matches/request/${req._id}`, { headers: { Authorization: `Bearer ${token}` } });
          const matches = res.data.matches || [];
          counts[req._id] = {
            total:    matches.length,
            accepted: matches.filter(m => m.status === "Accepted").length,
            declined: matches.filter(m => m.status === "Declined").length,
            notified: matches.filter(m => m.status === "Notified").length,
          };
        } catch {
          counts[req._id] = { total: 0, accepted: 0, declined: 0, notified: 0 };
        }
      })
    );
    setMatchData(counts);
  };

  const fetchEmergencies = async () => {
    setEmergencyLoading(true);
    try {
      const res = await axios.get(`${API}/emergency/active`, { headers: { Authorization: `Bearer ${token}` } });
      setEmergencies(res.data.emergencies || []);
    } catch (err) { console.log(err); }
    setEmergencyLoading(false);
  };

  const handleFindDonors = async (requestId) => {
    try {
      const res = await axios.post(`${API}/matches/find/${requestId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message);
      await fetchMyRequests();
    } catch { alert("Failed to find donors"); }
  };

  const handleClose = async (requestId) => {
    if (!window.confirm("Are you sure you want to close this request?")) return;
    try {
      await axios.patch(`${API}/requests/${requestId}/close`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchMyRequests();
    } catch { alert("Failed to close request"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const openRequests   = requests.filter(r => r.status === "Open");
  const closedRequests = requests.filter(r => r.status === "Closed");

  const tabs = [
    { id: "requests",  label: "📋 My Requests"      },
    { id: "emergency", label: "🚨 Emergency Alerts"  },
    { id: "closed",    label: "✅ Closed Requests"   },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏥 Hospital Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome, {user?.fullName} — manage your blood requests</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/create-request")}>
              <Plus className="h-4 w-4 mr-2" />New Blood Request
            </Button>
            <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Requests",  value: requests.length,       icon: Activity,     color: "text-blue-600 bg-blue-50"    },
            { label: "Open Requests",   value: openRequests.length,   icon: AlertCircle,  color: "text-red-600 bg-red-50"      },
            { label: "Closed Requests", value: closedRequests.length, icon: CheckCircle,  color: "text-green-600 bg-green-50"  },
            { label: "Organization",    value: user?.role?.toUpperCase(), icon: Building, color: "text-purple-600 bg-purple-50" },
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
                    ? tab.id === "emergency" ? "bg-red-600 text-white shadow-sm" : "bg-red-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── EMERGENCY ALERTS TAB ── */}
        {activeTab === "emergency" && (
          <div className="space-y-4">

            <div className="bg-red-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-6 w-6" />
                <h2 className="text-xl font-bold">🚨 Community Emergency Alerts</h2>
              </div>
              <p className="text-red-100 text-sm">
                These are emergency blood requests submitted directly by the public — no hospital account needed.
                As a verified hospital, you can see all active emergencies and coordinate with donors if needed.
              </p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">{emergencies.length} active emergency request{emergencies.length !== 1 ? "s" : ""}</p>
              <button onClick={fetchEmergencies} className="text-sm text-red-600 hover:underline font-medium">
                Refresh
              </button>
            </div>

            {emergencyLoading && (
              <div className="text-center py-12">
                <Loader className="h-8 w-8 text-red-600 animate-spin mx-auto" />
              </div>
            )}

            {!emergencyLoading && emergencies.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No active emergencies right now</p>
                </CardContent>
              </Card>
            )}

            {emergencies.map((emergency) => (
              <Card key={emergency._id} className="border-0 shadow-md border-l-4 border-l-red-500">
                <CardContent className="pt-5 pb-4">

                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {emergency.bloodGroup}{emergency.rh}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900">
                            {emergency.bloodGroup}{emergency.rh} — {emergency.unitsRequired} unit{emergency.unitsRequired > 1 ? "s" : ""}
                          </h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getUrgencyColor(emergency.urgencyLevel)}`}>
                            {emergency.urgencyLevel}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">🏥 {emergency.hospitalName}</p>
                        <p className="text-xs text-gray-400">{timeAgo(emergency.createdAt)} · {emergency.trackingCode}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-green-600">
                        {emergency.donorsNotified} donors notified
                      </p>
                      <p className="text-xs text-blue-600">
                        {emergency.acceptedDonors?.length || 0} accepted
                      </p>
                    </div>
                  </div>

                  {/* Requester contact */}
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3 space-y-1.5">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Requester Contact</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold">{emergency.requesterName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${emergency.requesterPhone}`} className="text-red-600 font-bold hover:underline">
                        {emergency.requesterPhone}
                      </a>
                    </div>
                    {emergency.medicalCondition && (
                      <div className="flex items-start gap-2 text-sm">
                        <Heart className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-600">{emergency.medicalCondition}</span>
                      </div>
                    )}
                  </div>

                  {/* Accepted donors */}
                  {emergency.acceptedDonors?.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-xs font-bold text-green-700 mb-2">✅ Donors who accepted:</p>
                      {emergency.acceptedDonors.map((donor, i) => (
                        <div key={i} className="flex items-center justify-between py-1">
                          <span className="text-sm font-semibold text-gray-900">{donor.donorName}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-red-600 font-bold">{donor.donorBloodGroup}</span>
                            {donor.donorPhone && (
                              <a href={`tel:${donor.donorPhone}`} className="text-xs text-green-600 font-bold hover:underline">
                                {donor.donorPhone}
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Track link */}
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => navigate(`/emergency/track/${emergency.trackingCode}`)}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      View Full Tracking Page →
                    </button>
                  </div>

                </CardContent>
              </Card>
            ))}

          </div>
        )}

        {/* ── OPEN REQUESTS TAB ── */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Open Blood Requests ({openRequests.length})</h2>
              <Button variant="outline" size="sm" onClick={() => navigate("/view-requests")}>View All Requests</Button>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
              </div>
            )}

            {!loading && openRequests.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <Droplets className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No open requests</h3>
                  <p className="text-gray-500 text-sm mb-4">Create a blood request to find matching donors</p>
                  <Button onClick={() => navigate("/create-request")}><Plus className="h-4 w-4 mr-2" />Create Request</Button>
                </CardContent>
              </Card>
            )}

            {openRequests.map((request) => {
              const counts = matchData[request._id] || { total: 0, accepted: 0, declined: 0, notified: 0 };
              return (
                <Card key={request._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 pb-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                            <Droplets className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 hover:text-red-600 cursor-pointer transition-colors"
                              onClick={() => navigate(`/request-details/${request._id}`)}>
                              {request.bloodGroup}{request.rh} Blood — {request.unitsRequired} units
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={request.urgency === "Emergency" ? "bg-red-100 text-red-700 border-red-200" : "bg-gray-100 text-gray-700 border-gray-200"}>{request.urgency}</Badge>
                              <Badge variant="outline" className="text-blue-600 border-blue-200">{request.status}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1 ml-1 mb-4">
                          <p className="text-sm text-gray-600">🏥 {request.hospitalName}</p>
                          {request.notes && <p className="text-sm text-gray-500">📝 {request.notes}</p>}
                          <p className="text-xs text-gray-400">Posted: {new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                        {counts.total > 0 ? (
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Users className="h-3.5 w-3.5" />Donor Responses
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-xs font-semibold text-blue-700">{counts.notified} Notified</span>
                              </div>
                              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                <span className="text-xs font-semibold text-green-700">{counts.accepted} Accepted</span>
                              </div>
                              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                <X className="h-3.5 w-3.5 text-red-500" />
                                <span className="text-xs font-semibold text-red-700">{counts.declined} Declined</span>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Units secured</span>
                                <span className="font-semibold">{counts.accepted} of {request.unitsRequired} units</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min((counts.accepted / request.unitsRequired) * 100, 100)}%` }} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                            <p className="text-xs text-yellow-700 font-medium">⚠️ No donors notified yet — click Find Donors</p>
                          </div>
                        )}
                      </div>
                      <div className="flex md:flex-col gap-2 justify-end items-end md:items-stretch">
                        <Button size="sm" onClick={() => handleFindDonors(request._id)} className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Search className="h-4 w-4 mr-1" />Find Donors
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/request-details/${request._id}`)} className="text-gray-600">
                          <Eye className="h-4 w-4 mr-1" />View Details
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleClose(request._id)} className="text-red-600 border-red-200 hover:bg-red-50">
                          <X className="h-4 w-4 mr-1" />Close
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── CLOSED REQUESTS TAB ── */}
        {activeTab === "closed" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Closed Requests ({closedRequests.length})</h2>
            {closedRequests.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No closed requests yet</p>
                </CardContent>
              </Card>
            )}
            {closedRequests.map((request) => (
              <Card key={request._id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(`/request-details/${request._id}`)}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-700 group-hover:text-red-600 transition-colors">
                          {request.bloodGroup}{request.rh} — {request.unitsRequired} units
                        </h3>
                        <p className="text-sm text-gray-500">{request.hospitalName}</p>
                        <p className="text-xs text-gray-400">{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />Fulfilled
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default HospitalDashboard;