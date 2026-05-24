import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Droplets, MapPin, Clock, AlertCircle, Search,
  Building, Heart, Users, CheckCircle, ArrowRight,
} from "lucide-react";

import API from "../config";

const FindBlood = () => {
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");
  const user      = JSON.parse(localStorage.getItem("user") || "null");

  const [requests,           setRequests]           = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [searchTerm,         setSearchTerm]         = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("all");
  const [selectedRh,         setSelectedRh]         = useState("all");
  const [selectedUrgency,    setSelectedUrgency]    = useState("all");
  const [selectedCity,       setSelectedCity]       = useState("all");
  const [donorCoords,        setDonorCoords]        = useState(null);

  useEffect(() => {
    fetchRequests();
    if (token && user?.role === "donor") fetchDonorCoords();
  }, []);

  const fetchDonorCoords = async () => {
    try {
      const res = await axios.get(`${API}/donor/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const p = res.data.profile;
      if (p?.locationLat && p?.locationLng) {
        setDonorCoords({ lat: p.locationLat, lng: p.locationLng });
      }
    } catch (err) { console.log(err); }
  };

  const haversineKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/requests/open-public`);
      setRequests(res.data.requests || []);
    } catch (error) {
      // Fallback to main requests endpoint
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res2 = await axios.get(`${API}/requests`, { headers });
        const allRequests = res2.data.requests || [];
        setRequests(allRequests.filter(r => r.status === "Open"));
      } catch (err) {
        console.log(err);
      }
    }
    setLoading(false);
  };

  const cities = ["all", ...new Set(requests.map(r => r.hospitalCity).filter(Boolean))];

  const filtered = requests.filter(r => {
    const matchSearch  = !searchTerm || r.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBlood   = selectedBloodGroup === "all" || r.bloodGroup === selectedBloodGroup;
    const matchRh      = selectedRh === "all" || r.rh === selectedRh;
    const matchUrgency = selectedUrgency === "all" || r.urgency === selectedUrgency;
    const matchCity    = selectedCity === "all" || r.hospitalCity === selectedCity;
    return matchSearch && matchBlood && matchRh && matchUrgency && matchCity;
  });

  const timeAgo = (date) => {
    const hrs = Math.floor((new Date() - new Date(date)) / 3600000);
    if (hrs < 1)  return "Just now";
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-red-950 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Droplets className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-3">Find Blood</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Browse all open blood requests across Nepal. Register as a donor to respond and save lives.
          </p>
          {!token && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/register")} className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3">
                <Heart className="h-4 w-4 mr-2" />Register as Donor
              </Button>
              <Button onClick={() => navigate("/login")} variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold px-8 py-3">
                Sign In to Help
              </Button>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Privacy Protected</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Patient contact details are never shown publicly. Details are shared only with donors who accept a request — protecting everyone's privacy.
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by hospital name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <select value={selectedBloodGroup} onChange={(e) => setSelectedBloodGroup(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                <option value="all">All Blood Groups</option>
                {["A", "B", "AB", "O"].map(g => <option key={g} value={g}>Group {g}</option>)}
              </select>
              <select value={selectedRh} onChange={(e) => setSelectedRh(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                <option value="all">+ and −</option>
                <option value="+">Positive (+)</option>
                <option value="-">Negative (−)</option>
              </select>
              <select value={selectedUrgency} onChange={(e) => setSelectedUrgency(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                <option value="all">All Urgency</option>
                <option value="Emergency">🚨 Emergency</option>
                <option value="Normal">Normal</option>
              </select>
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                {cities.map(c => (
                  <option key={c} value={c}>{c === "all" ? "All Cities" : c}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 font-medium">
            {loading ? "Loading..." : `${filtered.length} open request${filtered.length !== 1 ? "s" : ""} found`}
          </p>
          <Button size="sm" onClick={() => navigate("/emergency")} className="bg-red-700 hover:bg-red-800">
            <AlertCircle className="h-4 w-4 mr-2" />Emergency Request
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
            <p className="text-gray-500 mt-3">Loading blood requests...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Droplets className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No requests found</h3>
              <p className="text-gray-500 mb-6 text-sm">
                {requests.length === 0
                  ? "There are no open blood requests right now. Check back later or submit an emergency request."
                  : "Try changing your search filters to see more results."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/emergency")} className="bg-red-600 hover:bg-red-700">
                  <AlertCircle className="h-4 w-4 mr-2" />Submit Emergency Request
                </Button>
                {!token && (
                  <Button variant="outline" onClick={() => navigate("/register")}>
                    Register as Donor
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {filtered.map((request) => (
            <Card key={request._id} className={`border-0 shadow-md hover:shadow-lg transition-all ${
              request.urgency === "Emergency" ? "border-l-4 border-l-red-500" : "border-l-4 border-l-blue-400"
            }`}>
              <CardContent className="pt-5 pb-5">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-md flex-shrink-0">
                      <span className="text-white font-bold text-sm">{request.bloodGroup}{request.rh}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {request.bloodGroup}{request.rh} Blood Needed
                        </h3>
                        <Badge className={request.urgency === "Emergency" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}>
                          {request.urgency === "Emergency" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {request.urgency}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />{request.hospitalName}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{request.hospitalCity || ""}</span>
                          {donorCoords && request.hospitalLat && request.hospitalLng && (
                            <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                              {(() => {
                                const km = haversineKm(donorCoords.lat, donorCoords.lng, request.hospitalLat, request.hospitalLng);
                                return "📍 " + (km < 1 ? "< 1" : km.toFixed(1)) + " km away";
                              })()}
                            </span>
                          )}
                          {request.hospitalLat && request.hospitalLng && (
                            <button
                              onClick={() => window.open("https://www.google.com/maps/dir/?api=1&destination=" + request.hospitalLat + "," + request.hospitalLng, "_blank")}
                              className="text-xs text-blue-600 hover:underline font-semibold flex-shrink-0"
                            >
                              🗺️ Directions
                            </button>
                          )}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-gray-400" />
                          {request.unitsRequired} unit{request.unitsRequired > 1 ? "s" : ""} needed
                        </p>
                        <p className="text-xs text-gray-400">Posted {timeAgo(request.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-end gap-2 flex-shrink-0">
                    <Badge className="bg-green-100 text-green-700">Open</Badge>
                    {token && user?.role === "donor" ? (
                      <Button size="sm" onClick={() => navigate("/donor/dashboard")} className="bg-red-600 hover:bg-red-700 text-white">
                        <Heart className="h-4 w-4 mr-1" />I Can Help
                      </Button>
                    ) : token ? (
                      <span className="text-xs text-gray-400 text-right max-w-[120px]">Only donors can respond to requests</span>
                    ) : (
                      <Button size="sm" onClick={() => navigate("/register")} className="bg-red-600 hover:bg-red-700 text-white">
                        Register to Help
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA for non-logged in */}
        {!token && filtered.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white text-center">
            <h3 className="text-xl font-bold mb-2">You Can Save Lives Today</h3>
            <p className="text-red-100 text-sm mb-4">
              Register as a blood donor and respond to these requests. Your blood type may be exactly what someone needs right now.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/register")} className="bg-white text-red-600 hover:bg-gray-100 font-bold">
                <Users className="h-4 w-4 mr-2" />Become a Donor
              </Button>
              <Button onClick={() => navigate("/login")} variant="outline" className="border-white/40 text-white hover:bg-white/10 font-bold">
                Sign In
              </Button>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default FindBlood;
