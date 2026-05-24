import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Calendar, Clock, MapPin, Building, Loader, Users, Droplets, Search, ArrowRight } from "lucide-react";

const API = "http://localhost:5000/api";

const Events = () => {
  const navigate    = useNavigate();
  const token       = localStorage.getItem("token");
  const user        = JSON.parse(localStorage.getItem("user") || "null");
  const params      = new URLSearchParams(window.location.search);
  const orgFilter   = params.get("organizer") || "";

  const [events,      setEvents]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filterCity,  setFilterCity]  = useState("All");
  const [filterBlood, setFilterBlood] = useState("All");
  const [donorCoords, setDonorCoords] = useState(null);

  useEffect(() => {
    fetchEvents();
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

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/events/upcoming`);
      setEvents(res.data.events || []);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const cities = ["All", ...new Set(events.map(e => e.city))];

  const filtered = events.filter(e => {
    if (filterCity !== "All" && e.city !== filterCity) return false;
    if (filterBlood !== "All" && !e.bloodTypesNeeded?.includes(filterBlood)) return false;
    if (orgFilter && e.organizerName !== orgFilter) return false;
    return true;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const daysUntil = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 0)   return "Past";
    return `In ${days} days`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {window.history.length > 1 && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />Back
            </button>
          )}
          <div className="text-center">
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Community Blood Drives
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Upcoming Donation Events</h1>
            <p className="text-red-100 text-lg max-w-2xl mx-auto">
              Join community blood drives organized by trusted hospitals and NGOs across Nepal
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Organizer filter banner */}
        {orgFilter && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-blue-800">
              Showing events by: <span className="text-blue-600">{orgFilter}</span>
            </p>
            <button
              onClick={() => navigate("/events")}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Show All Events
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Filter by City</label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
              >
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Filter by Blood Type</label>
              <select
                value={filterBlood}
                onChange={(e) => setFilterBlood(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
              >
                <option>All</option>
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>AB+</option><option>AB-</option>
                <option>O+</option><option>O-</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={fetchEvents} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-700">
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <Loader className="h-10 w-10 text-red-600 animate-spin mx-auto" />
            <p className="text-gray-500 mt-3">Loading events...</p>
          </div>
        )}

        {/* No events */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <Calendar className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No upcoming events</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              {orgFilter
                ? `${orgFilter} has no upcoming events scheduled right now. Check back later.`
                : filterCity !== "All" || filterBlood !== "All"
                ? "No events match your filters. Try changing them or check back later."
                : "There are no upcoming blood donation events right now. Hospitals and NGOs will post events here as they are scheduled."}
            </p>
            <p className="text-xs text-gray-400">
              Are you a hospital or NGO? <a href="/register" className="text-red-600 font-semibold hover:underline">Register</a> to organize events.
            </p>
          </div>
        )}

        {/* Events grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event) => (
              <div
                key={event._id}
                onClick={() => navigate(`/events/${event._id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:border-red-200 transition-all"
              >
                {/* Date header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-black leading-none">
                        {new Date(event.eventDate).getDate()}
                      </p>
                      <p className="text-xs uppercase tracking-wider mt-1 opacity-90">
                        {new Date(event.eventDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {daysUntil(event.eventDate)}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">{event.eventCode}</p>
                    <h3 className="font-bold text-gray-900 text-base leading-snug">{event.title}</h3>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{event.organizerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{event.venueName}, {event.city}</span>
                      {donorCoords && event.locationLat && event.locationLng && (
                        <span className="ml-1 text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                          📍 {haversineKm(donorCoords.lat, donorCoords.lng, event.locationLat, event.locationLng).toFixed(1)} km
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span>{event.startTime} — {event.endTime}</span>
                    </div>
                  </div>

                  {/* Blood types */}
                  <div className="flex flex-wrap gap-1">
                    {event.bloodTypesNeeded?.slice(0, 4).map((type) => (
                      <span key={type} className="bg-red-50 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {type}
                      </span>
                    ))}
                    {event.bloodTypesNeeded?.length > 4 && (
                      <span className="text-xs text-gray-400 px-2 py-0.5">+{event.bloodTypesNeeded.length - 4}</span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {event.registeredDonors?.length || 0} / {event.targetDonors} registered
                    </span>
                    <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                      View Details <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Events;