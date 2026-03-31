import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Droplets, MapPin, Clock, Building, User, Users,
  Phone, Mail, MessageCircle, Calendar, AlertCircle,
  CheckCircle, Heart, ArrowLeft,
} from "lucide-react";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [request, setRequest]   = useState(null);
  const [matches,  setMatches]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState("accepted");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const [reqRes, matchRes] = await Promise.all([
        axios.get("http://localhost:5000/api/requests",           { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/matches/request/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const found = reqRes.data.requests?.find(r => r._id === id);
      setRequest(found || null);
      setMatches(matchRes.data.matches || []);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleMarkFulfilled = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/requests/${id}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Request marked as fulfilled!");
      navigate(-1);
    } catch { alert("Failed to close request"); }
  };

  const acceptedMatches  = matches.filter(m => m.status === "Accepted");
  const declinedMatches  = matches.filter(m => m.status === "Declined");

  const timeline = [
    { time: request?.createdAt ? new Date(request.createdAt).toLocaleTimeString() : "", event: "Blood request created",        description: "Request posted by organisation",              status: "completed" },
    { time: "",                                                                           event: "Donors notified",             description: `${matches.length} compatible donors alerted`,  status: matches.length > 0 ? "completed" : "pending" },
    { time: "",                                                                           event: "Donor responses",             description: `${acceptedMatches.length} donors accepted`,    status: acceptedMatches.length > 0 ? "completed" : "in_progress" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
    </div>
  );

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Request Details</h1>
            <p className="text-gray-500">Blood Request ID: {request._id?.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {/* Status Overview */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="pt-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: "Units Needed",     value: request.unitsRequired,   color: "text-red-600" },
                { label: "Donors Matched",   value: matches.length,           color: "text-blue-600" },
                { label: "Donors Accepted",  value: acceptedMatches.length,   color: "text-green-600" },
                { label: "Status",           value: request.status,           color: "text-gray-900" },
              ].map((s, i) => (
                <div key={i}>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Request Progress</span>
                <span className="font-semibold">{acceptedMatches.length} of {request.unitsRequired} units secured</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((acceptedMatches.length / request.unitsRequired) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Request Information */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-red-600" />
                    Request Information
                  </CardTitle>
                  <Badge className={request.urgency === "Emergency"
                    ? "bg-red-100 text-red-700 border-red-200"
                    : "bg-gray-100 text-gray-700"
                  }>
                    {request.urgency === "Emergency" && <AlertCircle className="h-3 w-3 mr-1" />}
                    {request.urgency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Blood Type",       value: `${request.bloodGroup}${request.rh}` },
                    { label: "Units Required",   value: `${request.unitsRequired} unit${request.unitsRequired > 1 ? "s" : ""}` },
                    { label: "Status",           value: request.status },
                  ].map((field, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{field.label}</p>
                      <p className="font-bold text-gray-900 mt-1">{field.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hospital / Location</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    {request.hospitalName}
                  </p>
                </div>

                {request.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs text-blue-700 uppercase tracking-wider mb-1">Additional Notes</p>
                    <p className="text-sm text-blue-900">{request.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  Posted: {new Date(request.createdAt).toLocaleString()}
                </div>
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
                {/* Tab selector */}
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
                  {(activeTab === "accepted" ? acceptedMatches : matches).map((match, i) => (
                    <div key={match._id || i} className="p-4 border border-gray-200 rounded-xl hover:border-red-200 transition-colors">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-red-600" />
                            </div>
                            <span className="font-semibold text-gray-900">Anonymous Donor #{i + 1}</span>
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              {match.requestId?.bloodGroup}{match.requestId?.rh}
                            </Badge>
                            <Badge className={
                              match.status === "Accepted"  ? "bg-green-100 text-green-700" :
                              match.status === "Declined"  ? "bg-red-100 text-red-700"     :
                              "bg-gray-100 text-gray-700"
                            }>
                              {match.status}
                            </Badge>
                          </div>
                          {match.respondedAt && (
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Responded: {new Date(match.respondedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        {match.status === "Accepted" && (
                          <div className="flex flex-col gap-2">
                            {match.contactRevealed ? (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />Contact Shared
                              </Badge>
                            ) : (
                              <Button size="sm" variant="outline" className="text-xs">
                                Reveal Contact
                              </Button>
                            )}
                            <Button size="sm" variant="outline" asChild className="text-xs">
                              <Link to="/messages">Message</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {(activeTab === "accepted" ? acceptedMatches : matches).length === 0 && (
                    <div className="text-center py-10">
                      <Users className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500">No {activeTab === "accepted" ? "accepted" : ""} responses yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hospital Details */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building className="h-4 w-4 text-red-600" />Hospital Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">{request.hospitalName}</p>
                  <p className="text-sm text-gray-500 flex items-start gap-1 mt-1">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    {request.hospitalName}, Nepal
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Request Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((event, i) => (
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
                          : <div className="h-2 w-2 rounded-full bg-current" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{event.event}</p>
                        <p className="text-xs text-gray-500">{event.description}</p>
                        {event.time && <p className="text-xs text-gray-400 mt-0.5">{event.time}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {request.status === "Open" && (
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleMarkFulfilled}>
                    <CheckCircle className="mr-2 h-4 w-4" />Mark as Fulfilled
                  </Button>
                )}
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
