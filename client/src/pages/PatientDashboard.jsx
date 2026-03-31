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
  Clock,
  CheckCircle,
  AlertCircle,
  Heart,
  X,
  Activity,
} from "lucide-react";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleClose = async (requestId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/requests/${requestId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyRequests();
    } catch (error) { alert("Failed to close"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const openRequests = requests.filter(r => r.status === "Open");
  const closedRequests = requests.filter(r => r.status === "Closed");
  const [activeTab, setActiveTab] = useState("active");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👨‍👩‍👧 Patient Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome, {user?.fullName} — manage your blood requests</p>
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
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Requests", value: requests.length, icon: Activity, color: "text-blue-600 bg-blue-50" },
            { label: "Active", value: openRequests.length, icon: AlertCircle, color: "text-red-600 bg-red-50" },
            { label: "Fulfilled", value: closedRequests.length, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">{stat.label}</p>
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
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200 mb-6">
          {[
            { id: "active", label: "🔴 Active Requests" },
            { id: "closed", label: "✅ Fulfilled" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Requests */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              </div>
            )}
            {!loading && openRequests.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-16 text-center">
                  <Heart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No active requests</h3>
                  <p className="text-gray-500 mb-6 text-sm">Create a blood request to find matching donors</p>
                  <Button onClick={() => navigate("/create-request")}>
                    <Plus className="h-4 w-4 mr-2" />Create Blood Request
                  </Button>
                </CardContent>
              </Card>
            )}
            {openRequests.map((request) => (
              <Card key={request._id} className={`border-0 shadow-md ${request.urgency === "Emergency" ? "border-l-4 border-l-red-500" : "border-l-4 border-l-blue-400"}`}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">{request.bloodGroup}{request.rh}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {request.bloodGroup}{request.rh} Blood — {request.unitsRequired} units needed
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={request.urgency === "Emergency" ? "destructive" : "secondary"}>
                            {request.urgency}
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700">{request.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">🏥 {request.hospitalName}</p>
                        {request.notes && <p className="text-sm text-gray-500">📝 {request.notes}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          Posted: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex md:flex-col gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleClose(request._id)} className="text-gray-600">
                        <X className="h-4 w-4 mr-1" />Mark Fulfilled
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
            {closedRequests.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No fulfilled requests yet</p>
                </CardContent>
              </Card>
            ) : (
              closedRequests.map((request) => (
                <Card key={request._id} className="border-0 shadow-md opacity-75">
                  <CardContent className="py-4 px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-700">{request.bloodGroup}{request.rh} — {request.unitsRequired} units</p>
                          <p className="text-sm text-gray-500">{request.hospitalName}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Fulfilled</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PatientDashboard;