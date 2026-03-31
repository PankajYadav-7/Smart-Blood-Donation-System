import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Users,
  Droplets,
  Activity,
  Shield,
  CheckCircle,
  AlertCircle,
  Building,
  User,
  Search,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
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
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/requests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(res.data.requests);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSuspend = async (userId, currentStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        { status: currentStatus === "active" ? "suspended" : "active" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      alert("Failed to update user status");
    }
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

  const roleColors = {
    donor: "bg-blue-100 text-blue-700 border-blue-200",
    hospital: "bg-purple-100 text-purple-700 border-purple-200",
    ngo: "bg-green-100 text-green-700 border-green-200",
    admin: "bg-red-100 text-red-700 border-red-200",
    requester: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const tabs = [
    { id: "users", label: "👥 All Users" },
    { id: "requests", label: "🩸 Blood Requests" },
    { id: "overview", label: "📊 Overview" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🛡️ Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome, {user?.fullName} — manage the entire platform
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: users.length, icon: Users, color: "text-blue-600 bg-blue-50" },
            { label: "Blood Requests", value: requests.length, icon: Droplets, color: "text-red-600 bg-red-50" },
            { label: "Active Users", value: users.filter(u => u.status === "active").length, icon: Activity, color: "text-green-600 bg-green-50" },
            { label: "Suspended", value: users.filter(u => u.status === "suspended").length, icon: Shield, color: "text-orange-600 bg-orange-50" },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
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

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                All Users ({users.length})
              </h2>
              {/* Search */}
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-gray-500 mt-3">Loading users...</p>
              </div>
            )}

            <div className="space-y-3">
              {filteredUsers.map((u) => (
                <Card key={u._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="py-4 px-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          u.role === "admin" ? "bg-red-100" :
                          u.role === "hospital" ? "bg-purple-100" :
                          u.role === "ngo" ? "bg-green-100" : "bg-blue-100"
                        }`}>
                          {u.role === "hospital" || u.role === "ngo"
                            ? <Building className="h-5 w-5 text-gray-600" />
                            : <User className="h-5 w-5 text-gray-600" />
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.fullName}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={roleColors[u.role] || "bg-gray-100 text-gray-700"}>
                          {u.role}
                        </Badge>
                        <Badge variant={u.status === "active" ? "success" : "destructive"}
                          className={u.status === "active"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-700 border-red-200"
                          }
                        >
                          {u.status === "active" ? (
                            <><CheckCircle className="h-3 w-3 mr-1" />Active</>
                          ) : (
                            <><AlertCircle className="h-3 w-3 mr-1" />Suspended</>
                          )}
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

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Blood Requests ({requests.length})
            </h2>

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
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <Droplets className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {r.bloodGroup}{r.rh} — {r.unitsRequired} units
                        </p>
                        <p className="text-sm text-gray-500">🏥 {r.hospitalName}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.urgency === "Emergency" ? "destructive" : "secondary"}>
                        {r.urgency}
                      </Badge>
                      <Badge className={r.status === "Open"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                      }>
                        {r.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Users by Role */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-red-600" />
                  Users by Role
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["donor", "hospital", "ngo", "requester", "admin"].map((role) => {
                    const count = users.filter(u => u.role === role).length;
                    const percentage = users.length > 0 ? (count / users.length) * 100 : 0;
                    return (
                      <div key={role}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
                          <span className="text-sm text-gray-500">{count} users</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "View All Users", action: () => setActiveTab("users"), icon: Users, color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
                    { label: "View All Requests", action: () => setActiveTab("requests"), icon: Droplets, color: "bg-red-50 text-red-700 hover:bg-red-100" },
                    { label: "View Requests Page", action: () => navigate("/view-requests"), icon: Activity, color: "bg-green-50 text-green-700 hover:bg-green-100" },
                  ].map((action, index) => (
                    <button
                      key={index}
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
