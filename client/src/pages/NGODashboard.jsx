import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Droplets,
  Plus,
  Users,
  Activity,
  CheckCircle,
  AlertCircle,
  Search,
  Heart,
  X,
} from "lucide-react";

const NGODashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("requests");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/requests/my",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(res.data.requests);
    } catch (error) { console.log(error); }
    setLoading(false);
  };

  const handleFindDonors = async (requestId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/matches/find/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
    } catch (error) { alert("Failed to find donors"); }
  };

  const handleClose = async (requestId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/requests/${requestId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyRequests();
    } catch (error) { alert("Failed to close request"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const openRequests = requests.filter(r => r.status === "Open");
  const closedRequests = requests.filter(r => r.status === "Closed");

  const tabs = [
    { id: "requests", label: "📋 Active Requests" },
    { id: "closed", label: "✅ Closed" },
    { id: "drives", label: "❤️ Blood Drives" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🤝 NGO Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome, {user?.fullName} — coordinate blood donation drives</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/create-request")}>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
            <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Requests", value: requests.length, icon: Activity, color: "text-blue-600 bg-blue-50" },
            { label: "Active Requests", value: openRequests.length, icon: AlertCircle, color: "text-red-600 bg-red-50" },
            { label: "Fulfilled", value: closedRequests.length, icon: CheckCircle, color: "text-green-600 bg-green-50" },
            { label: "Lives Impacted", value: requests.length * 3, icon: Heart, color: "text-pink-600 bg-pink-50" },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-md">
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
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Requests */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Active Blood Requests ({openRequests.length})</h2>
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              </div>
            )}
            {!loading && openRequests.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <Droplets className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No active requests</p>
                  <Button onClick={() => navigate("/create-request")}>Create Request</Button>
                </CardContent>
              </Card>
            )}
            {openRequests.map((request) => (
              <Card key={request._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-5 pb-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                        <Droplets className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {request.bloodGroup}{request.rh} — {request.unitsRequired} units
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={request.urgency === "Emergency" ? "destructive" : "secondary"}>
                            {request.urgency}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700">{request.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">🏥 {request.hospitalName}</p>
                        {request.notes && <p className="text-sm text-gray-500">📝 {request.notes}</p>}
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-2">
                      <Button size="sm" onClick={() => handleFindDonors(request._id)} className="bg-blue-600 hover:bg-blue-700">
                        <Search className="h-4 w-4 mr-1" />Find Donors
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleClose(request._id)}>
                        <X className="h-4 w-4 mr-1" />Close
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Closed */}
        {activeTab === "closed" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Closed Requests ({closedRequests.length})</h2>
            {closedRequests.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No closed requests yet</p>
                </CardContent>
              </Card>
            ) : (
              closedRequests.map((request) => (
                <Card key={request._id} className="border-0 shadow-md opacity-75">
                  <CardContent className="py-4 px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Droplets className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-700">{request.bloodGroup}{request.rh} — {request.unitsRequired} units</p>
                          <p className="text-sm text-gray-500">{request.hospitalName}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />Closed
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Blood Drives */}
        {activeTab === "drives" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Blood Donation Drives</h2>
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Blood Drive Management</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Organize and manage community blood donation drives
                </p>
                <Button onClick={() => navigate("/create-request")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Blood Drive Request
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default NGODashboard;