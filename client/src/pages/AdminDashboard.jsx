import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Users, Droplets, Activity, Shield, CheckCircle,
  AlertCircle, Building, User, Search, Award,
  ChevronDown, ChevronUp, Mail, Phone, FileText,
  MapPin, Hash,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate    = useNavigate();
  const token       = localStorage.getItem("token");
  const user        = JSON.parse(localStorage.getItem("user") || "null");

  const [users,       setUsers]       = useState([]);
  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState("users");
  const [searchTerm,  setSearchTerm]  = useState("");
  const [expandedOrg, setExpandedOrg] = useState(null); // which org is expanded

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchUsers();
    fetchRequests();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data.users);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/requests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(res.data.requests);
    } catch (err) { console.log(err); }
  };

  const handleSuspend = async (userId, currentStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        { status: currentStatus === "active" ? "suspended" : "active" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch { alert("Failed to update user status"); }
  };

  const handleVerify = async (userId, currentVerified) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/verify`,
        { verified: !currentVerified },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpandedOrg(null);
      fetchUsers();
    } catch { alert("Failed to update verification status"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingVerification = users.filter(
    u => (u.role === "hospital" || u.role === "ngo") && !u.isVerified && u.status === "active"
  );
  const verifiedOrgs = users.filter(
    u => (u.role === "hospital" || u.role === "ngo") && u.isVerified
  );

  const roleColors = {
    donor:     "bg-blue-100 text-blue-700 border-blue-200",
    hospital:  "bg-purple-100 text-purple-700 border-purple-200",
    ngo:       "bg-green-100 text-green-700 border-green-200",
    admin:     "bg-red-100 text-red-700 border-red-200",
    requester: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const tabs = [
    { id: "users",    label: "👥 All Users" },
    { id: "verify",   label: `🏥 Verify Orgs${pendingVerification.length > 0 ? ` (${pendingVerification.length})` : ""}` },
    { id: "requests", label: "🩸 Blood Requests" },
    { id: "overview", label: "📊 Overview" },
  ];

  // ── Org Detail Card (expandable) ──
  const OrgDetailCard = ({ org, isPending }) => {
    const isExpanded = expandedOrg === org._id;

    return (
      <Card className={`border-0 shadow-md ${isPending ? "border-l-4 border-l-orange-400" : "border-l-4 border-l-green-400"}`}>
        <CardContent className="py-5 px-6">

          {/* Header row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                org.role === "hospital" ? "bg-purple-100" : "bg-green-100"
              }`}>
                <Building className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900">{org.fullName}</p>
                  <Badge className={roleColors[org.role]}>{org.role}</Badge>
                  {org.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      <Award className="h-3 w-3" />Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{org.email}</p>
                {isPending && (
                  <p className="text-xs text-orange-600 font-medium mt-0.5">⏳ Awaiting verification</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Toggle expand button */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExpandedOrg(isExpanded ? null : org._id)}
                className="text-gray-600 border-gray-200"
              >
                {isExpanded
                  ? <><ChevronUp className="h-4 w-4 mr-1" />Hide Details</>
                  : <><ChevronDown className="h-4 w-4 mr-1" />View Details</>
                }
              </Button>

              {isPending ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleVerify(org._id, false)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleSuspend(org._id, "active")}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />Reject
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={() => handleVerify(org._id, true)}
                >
                  Remove Verification
                </Button>
              )}
            </div>
          </div>

          {/* Expanded details section */}
          {isExpanded && (
            <div className="mt-5 border-t border-gray-100 pt-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                Organisation Details
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Name */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="h-4 w-4 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {org.role === "hospital" ? "Hospital" : "Organisation"} Name
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{org.fullName}</p>
                </div>

                {/* Email */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{org.email}</p>
                </div>

                {/* Phone */}
                {org.phone && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{org.phone}</p>
                  </div>
                )}

                {/* License / Registration Number */}
                {org.licenseNumber && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {org.role === "hospital" ? "License Number" : "Registration Number"}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{org.licenseNumber}</p>
                  </div>
                )}

                {/* Address */}
                {org.address && (
                  <div className="bg-gray-50 rounded-xl p-3 md:col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{org.address}</p>
                  </div>
                )}

                {/* Description / Mission */}
                {org.orgDescription && (
                  <div className="bg-gray-50 rounded-xl p-3 md:col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {org.role === "hospital" ? "About Hospital" : "Mission Statement"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{org.orgDescription}</p>
                  </div>
                )}

                {/* Registered date */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Registered On</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(org.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </p>
                </div>

                {/* Status */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Status</p>
                  </div>
                  <Badge className={org.status === "active"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-red-100 text-red-700 border-red-200"
                  }>
                    {org.status}
                  </Badge>
                </div>
              </div>

              {/* Documents note */}
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Document Verification:</strong> Contact the organisation at <strong>{org.email}</strong>
                  {org.phone && <> or call <strong>{org.phone}</strong></>} to request
                  and verify their {org.role === "hospital" ? "medical license" : "registration certificate"}
                  before approving.
                </p>
              </div>

              {/* Action buttons at bottom of expanded section */}
              {isPending && (
                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={() => handleVerify(org._id, false)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve — {org.fullName}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleSuspend(org._id, "active")}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🛡️ Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome, {user?.fullName} — manage the entire platform</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users",    value: users.length,                                   icon: Users,    color: "text-blue-600 bg-blue-50"    },
            { label: "Blood Requests", value: requests.length,                                icon: Droplets, color: "text-red-600 bg-red-50"      },
            { label: "Active Users",   value: users.filter(u => u.status === "active").length, icon: Activity, color: "text-green-600 bg-green-50" },
            { label: "Pending Verify", value: pendingVerification.length,                     icon: Shield,   color: "text-orange-600 bg-orange-50" },
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
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-w-fit ${
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

        {/* ── ALL USERS TAB ── */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">All Users ({users.length})</h2>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
                <p className="text-gray-500 mt-3">Loading users...</p>
              </div>
            )}

            <div className="space-y-3">
              {filteredUsers.map((u) => (
                <Card key={u._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="py-4 px-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          u.role === "admin"    ? "bg-red-100"    :
                          u.role === "hospital" ? "bg-purple-100" :
                          u.role === "ngo"      ? "bg-green-100"  : "bg-blue-100"
                        }`}>
                          {u.role === "hospital" || u.role === "ngo"
                            ? <Building className="h-5 w-5 text-gray-600" />
                            : <User className="h-5 w-5 text-gray-600" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">{u.fullName}</p>
                            {u.isVerified && (
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                <Award className="h-3 w-3" />Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={roleColors[u.role] || "bg-gray-100 text-gray-700"}>
                          {u.role}
                        </Badge>
                        <Badge className={u.status === "active"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                        }>
                          {u.status === "active"
                            ? <><CheckCircle className="h-3 w-3 mr-1" />Active</>
                            : <><AlertCircle className="h-3 w-3 mr-1" />Suspended</>
                          }
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspend(u._id, u.status)}
                          className={u.status === "active"
                            ? "text-red-600 border-red-200 hover:bg-red-50"
                            : "text-green-600 border-green-200 hover:bg-green-50"
                          }
                        >
                          {u.status === "active" ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── VERIFY ORGS TAB ── */}
        {activeTab === "verify" && (
          <div className="space-y-6">

            {/* Pending */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Pending Verification ({pendingVerification.length})
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Click <strong>View Details</strong> to see full organisation information before approving or rejecting.
              </p>

              {pendingVerification.length === 0 ? (
                <Card className="border-0 shadow-md">
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">All caught up!</h3>
                    <p className="text-gray-500 text-sm">No organisations are waiting for verification.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingVerification.map(org => (
                    <OrgDetailCard key={org._id} org={org} isPending={true} />
                  ))}
                </div>
              )}
            </div>

            {/* Verified */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Verified Organisations ({verifiedOrgs.length})
              </h2>

              {verifiedOrgs.length === 0 ? (
                <Card className="border-0 shadow-md">
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-500 text-sm">No verified organisations yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {verifiedOrgs.map(org => (
                    <OrgDetailCard key={org._id} org={org} isPending={false} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REQUESTS TAB ── */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Blood Requests ({requests.length})</h2>
            {requests.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <Droplets className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No blood requests found</p>
                </CardContent>
              </Card>
            )}
            {requests.map((r) => (
              <Card key={r._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="py-4 px-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <Droplets className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{r.bloodGroup}{r.rh} — {r.unitsRequired} units</p>
                        <p className="text-sm text-gray-500">🏥 {r.hospitalName}</p>
                        <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={r.urgency === "Emergency" ? "bg-red-100 text-red-700 border-red-200" : "bg-gray-100 text-gray-700 border-gray-200"}>{r.urgency}</Badge>
                      <Badge className={r.status === "Open" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-700 border-gray-200"}>{r.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-red-600" />Users by Role
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["donor", "hospital", "ngo", "requester", "admin"].map((role) => {
                    const count = users.filter(u => u.role === role).length;
                    const pct   = users.length > 0 ? (count / users.length) * 100 : 0;
                    return (
                      <div key={role}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
                          <span className="text-sm text-gray-500">{count} users</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-600" />Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "View All Users",        action: () => setActiveTab("users"),    icon: Users,    color: "bg-blue-50 text-blue-700 hover:bg-blue-100"      },
                    { label: "Verify Organisations",  action: () => setActiveTab("verify"),   icon: Shield,   color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
                    { label: "View All Requests",     action: () => setActiveTab("requests"), icon: Droplets, color: "bg-red-50 text-red-700 hover:bg-red-100"         },
                    { label: "View Requests Page",    action: () => navigate("/view-requests"), icon: Activity, color: "bg-green-50 text-green-700 hover:bg-green-100" },
                  ].map((action, i) => (
                    <button
                      key={i}
                      onClick={action.action}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${action.color}`}
                    >
                      <action.icon className="h-5 w-5" />
                      <span className="font-medium">{action.label}</span>
                    </button>
                  ))}
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

export default AdminDashboard;