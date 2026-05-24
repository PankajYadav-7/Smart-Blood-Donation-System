import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Search, MapPin, Filter, Clock, Droplets,
  Award, ArrowLeft, User, Shield, CheckCircle,
  Heart,
} from "lucide-react";

import API from "../config";

const DonorSearch = () => {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const user     = JSON.parse(localStorage.getItem("user") || "null");

  const [donors,      setDonors]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [bloodGroup,  setBloodGroup]  = useState("");
  const [rh,          setRh]          = useState("");
  const [location,    setLocation]    = useState("");
  const [availability,setAvailability]= useState("all");
  const [userCoords,  setUserCoords]  = useState(null);

  const bloodTypes = ["A", "B", "AB", "O"];

  useEffect(() => {
    fetchDonors();
    // Get logged-in donor's coordinates from profile
    if (token) {
      axios.get(`${API}/donor/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        const p = res.data.profile;
        if (p?.locationLat && p?.locationLng) {
          setUserCoords({ lat: p.locationLat, lng: p.locationLng });
        }
      }).catch(() => {});
    }
  }, []);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (bloodGroup)                  params.bloodGroup   = bloodGroup;
      if (rh)                          params.rh           = rh;
      if (location)                    params.location     = location;
      if (availability === "available") params.availability = "available";
      // availability filter already correct — backend converts to boolean

      const res = await axios.get(`${API}/donor/search`, { params });
      setDonors(res.data.donors || []);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const certBadge = (level) => {
    if (!level) return null;
    const map = {
      bronze: { label: "🥉 Bronze", color: "bg-orange-100 text-orange-700 border-orange-200" },
      silver: { label: "🥈 Silver", color: "bg-gray-100 text-gray-700 border-gray-200" },
      gold:   { label: "🥇 Gold",   color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    };
    const b = map[level];
    return b ? <Badge className={`${b.color} text-xs`}>{b.label}</Badge> : null;
  };

  const timeAgo = (date) => {
    if (!date) return "No donations yet";
    const days = Math.floor((new Date() - new Date(date)) / 86400000);
    if (days === 0) return "Today";
    if (days < 30)  return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? "s" : ""} ago`;
  };

  const canDonate = (lastDate) => {
    if (!lastDate) return true;
    return Math.floor((new Date() - new Date(lastDate)) / 86400000) >= 56;
  };

  const haversineKm = (lat1, lng1, lat2, lng2) => {
    const R    = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a    =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI/180) *
      Math.cos(lat2 * Math.PI/180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />Back
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Donor Search</h1>
          <p className="text-gray-500 mt-1">Find registered blood donors in Nepal</p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Privacy Protected</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Donor contact details are never shown publicly. To contact a donor you must
              post a blood request — donors will be matched and can choose to accept.
              This protects every donor's privacy.
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-red-600" />
              <h3 className="font-semibold text-gray-900">Search Filters</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Blood Group</label>
                <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                  <option value="">All Groups</option>
                  {bloodTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rh Factor</label>
                <select value={rh} onChange={e => setRh(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                  <option value="">+ and −</option>
                  <option value="+">Positive (+)</option>
                  <option value="-">Negative (−)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input type="text" placeholder="City or area"
                    value={location} onChange={e => setLocation(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Availability</label>
                <select value={availability} onChange={e => setAvailability(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                  <option value="all">All Donors</option>
                  <option value="available">Available Only</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500 font-medium">
                {loading ? "Searching..." : `${donors.length} donor${donors.length !== 1 ? "s" : ""} found`}
              </p>
              <Button onClick={fetchDonors} className="bg-red-600 hover:bg-red-700">
                <Search className="h-4 w-4 mr-2" />Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
            <p className="text-gray-500 mt-3 text-sm">Loading donors...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && donors.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Droplets className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No donors found</h3>
              <p className="text-gray-500 text-sm mb-6">
                Try changing your filters or check back later as more donors register.
              </p>
              <Button onClick={() => navigate("/emergency")} className="bg-red-600 hover:bg-red-700">
                Submit Emergency Request
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Donor Cards */}
        <div className="space-y-4">
          {donors.map((donor) => (
            <Card key={donor._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-5 pb-5">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{donor.name}</h3>
                        <Badge className="bg-red-100 text-red-700 border-red-200 font-bold">
                          {donor.bloodGroup}{donor.rh}
                        </Badge>
                        <Badge className={
                          donor.availability === true
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }>
                          {donor.availability === true ? "✅ Available" : "⏸ Unavailable"}
                        </Badge>
                        {certBadge(donor.certLevel)}
                      </div>
                      <div className="space-y-1">
                        {donor.locationName && (
                          <p className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {donor.locationName}
                            {userCoords && donor.locationLat && donor.locationLng && (
                              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                📍 {haversineKm(userCoords.lat, userCoords.lng, donor.locationLat, donor.locationLng)} km away
                              </span>
                            )}
                          </p>
                        )}
                        {donor.donationCount > 0 && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            Last donated: {timeAgo(donor.lastDonationDate)}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Heart className="h-4 w-4 text-gray-400" />
                          {donor.donationCount || 0} donation{donor.donationCount !== 1 ? "s" : ""} completed
                        </p>
                        {donor.lastDonationDate && (
                          <p className={`text-xs font-medium flex items-center gap-1 ${
                            canDonate(donor.lastDonationDate) ? "text-green-600" : "text-orange-500"
                          }`}>
                            <CheckCircle className="h-3 w-3" />
                            {canDonate(donor.lastDonationDate)
                              ? "Eligible to donate now"
                              : "In recovery period (56 days)"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 justify-end flex-shrink-0">
                    {token && (user?.role === "hospital" || user?.role === "ngo" || user?.role === "requester") ? (
                      <Button size="sm" onClick={() => navigate("/create-request")}
                        className="bg-red-600 hover:bg-red-700 text-white">
                        <Heart className="h-4 w-4 mr-1" />Request Blood
                      </Button>
                    ) : token && user?.role === "donor" ? (
                      <p className="text-xs text-gray-400 text-center max-w-[120px]">
                        Donors cannot contact other donors
                      </p>
                    ) : (
                      <Button size="sm" onClick={() => navigate("/register")}
                        className="bg-red-600 hover:bg-red-700 text-white">
                        Register to Help
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        {!token && donors.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white text-center">
            <h3 className="text-xl font-bold mb-2">Want to Contact a Donor?</h3>
            <p className="text-red-100 text-sm mb-4">
              Register as a patient or hospital to post blood requests. Compatible donors
              will be notified and can choose to respond — protecting everyone's privacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/register")}
                className="bg-white text-red-600 hover:bg-gray-100 font-bold">
                Register Now
              </Button>
              <Button onClick={() => navigate("/login")} variant="outline"
                className="border-white/40 text-white hover:bg-white/10 font-bold">
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

export default DonorSearch;
