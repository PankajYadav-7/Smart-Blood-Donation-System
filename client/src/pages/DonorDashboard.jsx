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
  Heart,
  Clock,
  MapPin,
  Award,
  CheckCircle,
  User,
  Trophy,
  Medal,
  Star,
  Bell,
  BellOff,
  Activity,
  Calendar,
  AlertCircle,
} from "lucide-react";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("requests");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/matches/my-matches",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMatches(res.data.matches);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRespond = async (matchId, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/matches/${matchId}/respond`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`You have ${status} this request!`);
      fetchMatches();
    } catch (error) {
      alert("Failed to respond");
    }
  };

  const handleSnooze = (hours) => {
    setIsSnoozed(true);
    setTimeout(() => setIsSnoozed(false), hours * 60 * 60 * 1000);
    alert(`Alerts snoozed for ${hours} hours`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const tabs = [
    { id: "requests", label: "🔔 Nearby Requests" },
    { id: "history", label: "📋 History" },
    { id: "profile", label: "👤 Profile & Badges" },
    { id: "certificates", label: "🏆 Certificates" },
  ];

  const donationHistory = [
    { date: "2024-01-15", hospital: "Bir Hospital", recipient: "Emergency Patient", status: "completed" },
    { date: "2023-10-20", hospital: "Patan Hospital", recipient: "Surgery Patient", status: "completed" },
    { date: "2023-07-12", hospital: "Teaching Hospital", recipient: "Accident Victim", status: "completed" },
  ];

  const badges = [
    { title: "Regular Donor", description: "Donated 5+ times", icon: Award, color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    { title: "Life Saver", description: "Saved 10+ lives", icon: Heart, color: "text-red-600 bg-red-50 border-red-200" },
    { title: "Emergency Hero", description: "Responded to emergency", icon: AlertCircle, color: "text-blue-600 bg-blue-50 border-blue-200" },
  ];

  const certificates = [
    { title: "Life Saver Champion", level: "Gold Level", icon: Trophy, color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    { title: "Emergency Hero", level: "Platinum Level", icon: Medal, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { title: "Community Guardian", level: "Silver Level", icon: Star, color: "text-purple-600 bg-purple-50 border-purple-200" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.fullName?.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-500 mt-1">
              You are making a difference — keep saving lives!
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Availability Toggle */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
              <div className={`w-3 h-3 rounded-full ${isAvailable && !isSnoozed ? "bg-green-500" : "bg-gray-400"}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {isSnoozed ? "Snoozed" : isAvailable ? "Available" : "Unavailable"}
              </span>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAvailable && !isSnoozed ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                  isAvailable && !isSnoozed ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/donor/profile")}
            >
              Edit Profile
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Donations", value: "8", icon: Droplets, color: "text-red-600 bg-red-50" },
            { label: "Lives Saved", value: "24", icon: Heart, color: "text-pink-600 bg-pink-50" },
            { label: "Blood Type", value: user?.bloodGroup || "O+", icon: Activity, color: "text-blue-600 bg-blue-50" },
            { label: "Next Eligible", value: "Available", icon: CheckCircle, color: "text-green-600 bg-green-50" },
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

        {/* Tab Content */}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                🔔 Blood Requests Matching You
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSnooze(4)}
                  className="text-gray-600"
                >
                  <BellOff className="h-4 w-4 mr-1" />
                  Snooze 4h
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSnooze(24)}
                  className="text-gray-600"
                >
                  Snooze 24h
                </Button>
              </div>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-gray-500 mt-3">Loading matches...</p>
              </div>
            )}

            {!loading && matches.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No matching requests right now
                  </h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    Make sure your profile is complete and availability is turned ON to receive requests.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate("/donor/profile")}
                  >
                    Complete Profile
                  </Button>
                </CardContent>
              </Card>
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
                          <Badge variant={match.requestId?.urgency === "Emergency" ? "destructive" : "secondary"}>
                            {match.requestId?.urgency}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1.5 ml-15">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {match.requestId?.hospitalName}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-gray-400" />
                          Units Required: {match.requestId?.unitsRequired}
                        </p>
                        {match.requestId?.notes && (
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {match.requestId?.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-3 justify-end">
                      <Button
                        onClick={() => handleRespond(match._id, "Accepted")}
                        className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRespond(match._id, "Declined")}
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

        {/* History Tab */}
        {activeTab === "history" && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {donationHistory.map((donation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Droplets className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{donation.hospital}</p>
                        <p className="text-sm text-gray-500">Helped: {donation.recipient}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">{donation.date}</p>
                      <Badge variant="success" className="mt-1 bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile & Badges Tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Donor Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{user?.fullName}</h3>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    <Badge className="mt-1">Donor</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Blood Type</p>
                    <p className="text-xl font-bold text-red-600 mt-1">O+</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Last Donation</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">Jan 15, 2024</p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate("/donor/profile")}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Achievements & Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {badges.map((badge, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${badge.color}`}
                    >
                      <badge.icon className={`h-8 w-8 ${badge.color.split(" ")[0]}`} />
                      <div>
                        <p className="font-semibold text-gray-900">{badge.title}</p>
                        <p className="text-xs text-gray-500">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === "certificates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earned */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-red-600" />
                  Your Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {certificates.map((cert, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-xl border ${cert.color}`}
                    >
                      <div className="flex items-center gap-3">
                        <cert.icon className={`h-6 w-6 ${cert.color.split(" ")[0]}`} />
                        <div>
                          <p className="font-semibold text-gray-900">{cert.title}</p>
                          <p className="text-xs text-gray-500">{cert.level}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Earned</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  Next Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Veteran Donor", progress: 69, current: 52, total: 75, label: "donations" },
                    { title: "Decade Devotee", progress: 40, current: 4, total: 10, label: "years" },
                    { title: "Speed Responder", progress: 53, current: 8, total: 15, label: "responses" },
                  ].map((item, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                        <Badge variant="outline">{item.current}/{item.total}</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className="bg-red-600 h-2 rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {item.total - item.current} more {item.label} needed
                      </p>
                    </div>
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

export default DonorDashboard;
