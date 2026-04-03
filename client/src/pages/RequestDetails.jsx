import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Droplets, MapPin, Clock, Building, User, Users,
  Phone, Mail, MessageCircle, Calendar, AlertCircle,
  CheckCircle, Heart, ArrowLeft, Edit, Eye,
  ThumbsUp, ThumbsDown, Loader, Hash,
} from "lucide-react";

const API = "http://localhost:5000/api";

const RequestDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const user     = JSON.parse(localStorage.getItem("user") || "null");

  const [request,      setRequest]      = useState(null);
  const [matches,      setMatches]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("accepted");
  const [toast,        setToast]        = useState(null);
  const [isEditing,    setIsEditing]    = useState(false);
  const [editData,     setEditData]     = useState({});
  const [expandedDonor, setExpandedDonor] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const [reqRes, matchRes] = await Promise.all([
        axios.get(`${API}/requests/my`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/matches/request/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const found = reqRes.data.requests?.find(r => r._id === id);
      setRequest(found || null);
      setMatches(matchRes.data.matches || []);
      if (found) {
        setEditData({
          bloodGroup:    found.bloodGroup,
          rh:            found.rh,
          unitsRequired: found.unitsRequired,
          urgency:       found.urgency,
          hospitalName:  found.hospitalName,
          notes:         found.notes || "",
        });
      }
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const handleMarkFulfilled = async () => {
    try {
      await axios.patch(
        `${API}/requests/${id}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Request marked as fulfilled!");
      fetchDetails();
    } catch { showToast("Failed to close request", "error"); }
  };

  const handleSaveEdit = async () => {
    try {
      await axios.patch(
        `${API}/requests/${id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Request updated successfully!");
      setIsEditing(false);
      fetchDetails();
    } catch { showToast("Failed to update request", "error"); }
  };

  const getRequestId = (req) => {
    if (!req) return "—";
    const date  = new Date(req.createdAt);
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const short = req._id.slice(-4).toUpperCase();
    return `REQ-${year}${month}-${short}`;
  };

  const acceptedMatches = matches.filter(m => m.status === "Accepted" || m.status === "Donated");
  const declinedMatches = matches.filter(m => m.status === "Declined");
  const donatedMatches  = matches.filter(m => m.status === "Donated");
  const allMatches      = matches.filter(m => m.status !== "Declined");

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader className="h-10 w-10 text-red-600 animate-spin" />
    </div>
  );

  // ── Not found ──
  if (!request) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Droplets className="h-16 w-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Request Not Found</h2>
        <p className="text-gray-500 mb-6">This blood request does not exist or you do not have access.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
      <Footer />
    </div>
  );

  // ────────────────────────────────────────────────────
  // CLOSED REQUEST — Simple clean summary view
  // ────────────────────────────────────────────────────
  if (request.status === "Closed") {
    const donatedCount  = donatedMatches.length;
    const acceptedCount = acceptedMatches.length;

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium mb-6"
          >
            <ArrowLeft className="h-4 w-4" />Back to Dashboard
          </button>

          {/* Fulfilled banner */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-green-800">Request Fulfilled</h2>
              <p className="text-sm text-green-600 mt-0.5">
                {getRequestId(request)} · Closed successfully
              </p>
            </div>
          </div>

          {/* Request summary */}
          <Card className="border-0 shadow-md mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Droplets className="h-4 w-4 text-red-600" />Request Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Blood Type</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {request.bloodGroup}{request.rh}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Units Needed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{request.unitsRequired}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Urgency</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{request.urgency}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Posted</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {new Date(request.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Hospital</p>
                  <p className="font-semibold text-gray-900 text-sm">{request.hospitalName}</p>
                </div>
              </div>

              {request.notes && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs text-blue-500 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-blue-800">{request.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Donor outcome summary */}
          <Card className="border-0 shadow-md mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-red-600" />Donor Outcome
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Counts */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center bg-blue-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-blue-600">{matches.length}</p>
                  <p className="text-xs text-blue-600 mt-1 font-medium">Matched</p>
                </div>
                <div className="text-center bg-green-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
                  <p className="text-xs text-green-600 mt-1 font-medium">Accepted</p>
                </div>
                <div className="text-center bg-purple-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-purple-600">{donatedCount}</p>
                  <p className="text-xs text-purple-600 mt-1 font-medium">Confirmed</p>
                </div>
              </div>

              {/* Donor list */}
              {acceptedMatches.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Donors Who Responded
                  </p>
                  {acceptedMatches.map((match, i) => (
                    <div key={match._id || i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          match.status === "Donated" ? "bg-green-100" : "bg-blue-100"
                        }`}>
                          <User className={`h-4 w-4 ${
                            match.status === "Donated" ? "text-green-600" : "text-blue-600"
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {match.contactRevealed && match.donorUserId?.fullName
                              ? match.donorUserId.fullName
                              : `Donor #${i + 1}`
                            }
                          </p>
                          {match.contactRevealed && match.donorUserId?.email && (
                            <p className="text-xs text-gray-400">{match.donorUserId.email}</p>
                          )}
                          {match.respondedAt && (
                            <p className="text-xs text-gray-400">
                              {new Date(match.respondedAt).toLocaleDateString("en-GB", {
                                day: "numeric", month: "short", year: "numeric"
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className={
                        match.status === "Donated"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-blue-100 text-blue-700 border-blue-200"
                      }>
                        {match.status === "Donated" ? "🎉 Confirmed" : "Accepted"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No donors responded to this request</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />Back to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // ────────────────────────────────────────────────────
  // OPEN REQUEST — Full detail view
  // ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold ${
          toast.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"
        }`}>
          {toast.type === "error"
            ? <AlertCircle className="h-5 w-5" />
            : <CheckCircle className="h-5 w-5" />
          }
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <Hash className="h-3.5 w-3.5" />
                {getRequestId(request)}
              </p>
            </div>
          </div>

          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4 mr-1" />Edit Request
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="h-4 w-4 mr-1" />Save Changes
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <Card className="border-0 shadow-md mb-6 border-l-4 border-l-blue-400">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />Edit Blood Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
                  <select className={inputCls} value={editData.bloodGroup}
                    onChange={e => setEditData({...editData, bloodGroup: e.target.value})}>
                    {["A","B","AB","O"].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Rh Factor</label>
                  <select className={inputCls} value={editData.rh}
                    onChange={e => setEditData({...editData, rh: e.target.value})}>
                    <option value="+">Positive (+)</option>
                    <option value="-">Negative (−)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Units Required</label>
                  <input type="number" min="1" max="10" className={inputCls}
                    value={editData.unitsRequired}
                    onChange={e => setEditData({...editData, unitsRequired: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Urgency</label>
                  <select className={inputCls} value={editData.urgency}
                    onChange={e => setEditData({...editData, urgency: e.target.value})}>
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Hospital Name</label>
                  <input type="text" className={inputCls} value={editData.hospitalName}
                    onChange={e => setEditData({...editData, hospitalName: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes</label>
                  <textarea rows={2} className={inputCls} value={editData.notes}
                    onChange={e => setEditData({...editData, notes: e.target.value})}
                    placeholder="Any additional information..." />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Units Needed",        value: request.unitsRequired,  color: "text-red-600 bg-red-50"      },
            { label: "Donors Matched",      value: allMatches.length,      color: "text-blue-600 bg-blue-50"    },
            { label: "Donors Accepted",     value: acceptedMatches.length, color: "text-green-600 bg-green-50"  },
            { label: "Donations Confirmed", value: donatedMatches.length,  color: "text-purple-600 bg-purple-50"},
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-2xl p-4 text-center`}>
              <div className={`text-3xl font-bold ${s.color.split(" ")[0]}`}>{s.value}</div>
              <div className="text-xs font-medium mt-1 opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="pt-5 pb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Request Progress</span>
              <span className="font-bold text-red-600">
                {acceptedMatches.length} of {request.unitsRequired} units secured
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((acceptedMatches.length / request.unitsRequired) * 100, 100)}%` }}
              />
            </div>
            {donatedMatches.length > 0 && (
              <p className="text-xs text-green-600 font-medium mt-2">
                🎉 {donatedMatches.length} donation{donatedMatches.length > 1 ? "s" : ""} confirmed by recipient
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Request Information */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-red-600" />Request Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {[
                    { label: "Blood Type",     value: `${request.bloodGroup}${request.rh}` },
                    { label: "Units Required", value: `${request.unitsRequired} unit${request.unitsRequired > 1 ? "s" : ""}` },
                    { label: "Urgency",        value: request.urgency },
                    { label: "Status",         value: request.status },
                    { label: "Request ID",     value: getRequestId(request) },
                    { label: "Posted",         value: new Date(request.createdAt).toLocaleDateString("en-GB") },
                  ].map((field, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">{field.label}</p>
                      <p className="font-bold text-gray-900 mt-1 text-sm">{field.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Hospital / Location</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    {request.hospitalName}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5 ml-6">Kathmandu, Nepal</p>
                </div>

                {request.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Additional Notes</p>
                    <p className="text-sm text-blue-900">{request.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Donor Responses */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-red-600" />
                  Donor Responses ({matches.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-4 w-fit">
                  {[
                    { id: "accepted", label: `Accepted (${acceptedMatches.length})` },
                    { id: "all",      label: `All (${matches.length})` },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id ? "bg-white shadow-sm text-red-600" : "text-gray-500"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {(activeTab === "accepted" ? acceptedMatches : matches).map((match, i) => {
                    const isExpanded = expandedDonor === (match._id || i);
                    const donorName  = match.contactRevealed && match.donorUserId?.fullName
                      ? match.donorUserId.fullName
                      : `Donor #${i + 1}`;
                    return (
                      <div key={match._id || i}
                        className={`border rounded-xl transition-all duration-200 ${
                          isExpanded ? "border-red-300 shadow-md" : "border-gray-200 hover:border-red-200"
                        }`}
                      >
                        {/* Donor row — clickable */}
                        <button
                          className="w-full p-4 text-left"
                          onClick={() => setExpandedDonor(isExpanded ? null : (match._id || i))}
                        >
                          <div className="flex justify-between items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                match.status === "Donated"  ? "bg-green-100" :
                                match.status === "Accepted" ? "bg-blue-100"  :
                                match.status === "Declined" ? "bg-red-100"   : "bg-gray-100"
                              }`}>
                                <User className={`h-5 w-5 ${
                                  match.status === "Donated"  ? "text-green-600" :
                                  match.status === "Accepted" ? "text-blue-600"  :
                                  match.status === "Declined" ? "text-red-500"   : "text-gray-400"
                                }`} />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{donorName}</p>
                                <p className="text-xs text-gray-400">
                                  {match.respondedAt
                                    ? new Date(match.respondedAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })
                                    : "—"
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={
                                match.status === "Donated"  ? "bg-green-100 text-green-700 border-green-200" :
                                match.status === "Accepted" ? "bg-blue-100 text-blue-700 border-blue-200"   :
                                match.status === "Declined" ? "bg-red-100 text-red-700 border-red-200"      :
                                "bg-gray-100 text-gray-700"
                              }>
                                {match.status === "Donated" ? "🎉 Confirmed" : match.status}
                              </Badge>
                              <span className="text-xs text-gray-400">{isExpanded ? "▲" : "▼"}</span>
                            </div>
                          </div>
                        </button>

                        {/* Expanded donor details */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-xl space-y-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                              Donor Details
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                              <div className="bg-white rounded-xl p-3 border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                                <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5 text-gray-400" />
                                  {match.contactRevealed && match.donorUserId?.fullName
                                    ? match.donorUserId.fullName
                                    : "Contact not yet shared"
                                  }
                                </p>
                              </div>

                              <div className="bg-white rounded-xl p-3 border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                                <p className="font-semibold text-sm flex items-center gap-1.5">
                                  <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                  {match.contactRevealed && match.donorUserId?.email
                                    ? <a href={`mailto:${match.donorUserId.email}`} className="text-blue-600 hover:underline">{match.donorUserId.email}</a>
                                    : <span className="text-gray-400">Not available</span>
                                  }
                                </p>
                              </div>

                              <div className="bg-white rounded-xl p-3 border border-gray-100">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Response Time</p>
                                <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                                  {match.respondedAt ? new Date(match.respondedAt).toLocaleString() : "—"}
                                </p>
                              </div>

                              {match.status === "Donated" && (
                                <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                                  <p className="text-xs text-green-600 uppercase tracking-wider mb-1">Donation Confirmed</p>
                                  <p className="font-semibold text-green-800 text-sm flex items-center gap-1.5">
                                    <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                                    {match.donationConfirmedAt
                                      ? new Date(match.donationConfirmedAt).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })
                                      : "Confirmed"
                                    }
                                  </p>
                                </div>
                              )}

                              <div className={`rounded-xl p-3 border ${
                                match.contactRevealed ? "bg-blue-50 border-blue-200" : "bg-yellow-50 border-yellow-200"
                              }`}>
                                <p className="text-xs uppercase tracking-wider mb-1 text-gray-500">Contact Status</p>
                                <p className={`font-semibold text-sm flex items-center gap-1.5 ${
                                  match.contactRevealed ? "text-blue-700" : "text-yellow-700"
                                }`}>
                                  {match.contactRevealed
                                    ? <><CheckCircle className="h-3.5 w-3.5" />Contact shared after consent</>
                                    : <><Clock className="h-3.5 w-3.5" />Awaiting donor consent</>
                                  }
                                </p>
                              </div>
                            </div>

                            {match.contactRevealed && (
                              <div className="flex gap-2 pt-2">
                                <Link
                                  to="/messages"
                                  className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-all"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />Message Donor
                                </Link>
                                {match.donorUserId?.email && (
                                  <a
                                    href={`mailto:${match.donorUserId.email}`}
                                    className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold py-2.5 px-4 rounded-lg transition-all"
                                  >
                                    <Mail className="h-3.5 w-3.5" />Send Email
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {(activeTab === "accepted" ? acceptedMatches : matches).length === 0 && (
                    <div className="text-center py-10">
                      <Users className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No responses yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="h-4 w-4 text-red-600" />Organisation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">{request.hospitalName}</p>
                  <p className="text-sm text-gray-500 flex items-start gap-1 mt-1">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />Kathmandu, Nepal
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Request Created By</p>
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Request Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { event: "Blood request created", desc: "Request posted by organisation",        time: new Date(request.createdAt).toLocaleTimeString(), status: "completed"   },
                    { event: "Donors notified",       desc: `${matches.length} compatible donors alerted`,                                                   time: "", status: matches.length > 0 ? "completed" : "pending" },
                    { event: "Donor responses",       desc: `${acceptedMatches.length} donor${acceptedMatches.length !== 1 ? "s" : ""} accepted`,             time: "", status: acceptedMatches.length > 0 ? "completed" : "in_progress" },
                    { event: "Donations confirmed",   desc: `${donatedMatches.length} confirmed by recipient`,                                               time: "", status: donatedMatches.length > 0 ? "completed" : "pending" },
                  ].map((event, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${
                        event.status === "completed"   ? "bg-green-100 text-green-600" :
                        event.status === "in_progress" ? "bg-blue-100 text-blue-600"  :
                        "bg-gray-100 text-gray-400"
                      }`}>
                        {event.status === "completed"
                          ? <CheckCircle className="h-3.5 w-3.5" />
                          : event.status === "in_progress"
                          ? <Clock className="h-3.5 w-3.5" />
                          : <div className="h-2 w-2 rounded-full bg-gray-300" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{event.event}</p>
                        <p className="text-xs text-gray-500">{event.desc}</p>
                        {event.time && <p className="text-xs text-gray-400 mt-0.5">{event.time}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isEditing && (
                  <Button className="w-full" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />Edit Request
                  </Button>
                )}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleMarkFulfilled}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />Mark as Fulfilled
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/messages">
                    <MessageCircle className="mr-2 h-4 w-4" />Message Donors
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RequestDetails;