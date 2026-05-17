import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Calendar, Clock, MapPin, Building, Phone, Mail, User, Users,
  Droplets, Loader, AlertCircle, CheckCircle, ArrowLeft, Heart, Info,
} from "lucide-react";

const API = "http://localhost:5000/api";

const EventDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const user     = JSON.parse(localStorage.getItem("user") || "null");

  const [event,         setEvent]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [rsvping,       setRsvping]       = useState(false);
  const [error,         setError]         = useState("");
  const [toast,         setToast]         = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/events/${id}`);
      setEvent(res.data.event);
    } catch (err) {
      setError(err.response?.data?.message || "Event not found");
    }
    setLoading(false);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRSVP = async () => {
    if (!token) {
      navigate(`/login?redirect=/events/${id}`);
      return;
    }
    if (user?.role !== "donor") {
      showToast("Only donors can RSVP to events", "error");
      return;
    }
    setRsvping(true);
    try {
      await axios.post(`${API}/events/${id}/rsvp`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("You are registered! Check your email for confirmation.");
      fetchEvent();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to RSVP", "error");
    }
    setRsvping(false);
  };

  const handleCancelRSVP = async () => {
    setRsvping(true);
    try {
      await axios.delete(`${API}/events/${id}/rsvp`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Your RSVP has been cancelled");
      fetchEvent();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to cancel", "error");
    }
    setRsvping(false);
  };

  const handleCancelEvent = async () => {
    if (!window.confirm("Are you sure you want to cancel this event? All registered donors will be notified.")) return;
    try {
      await axios.patch(`${API}/events/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Event cancelled successfully");
      fetchEvent();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to cancel event", "error");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader className="h-10 w-10 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading event details...</p>
        </div>
      </div>
    </div>
  );

  if (error || !event) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => navigate("/events")} className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl">
            Browse All Events
          </button>
        </div>
      </div>
    </div>
  );

  const alreadyRSVPed = event.registeredDonors?.find(
    d => d.donorEmail === user?.email
  );

  const isOrganizer = user && event.organizerId === user?.id;
  const isDonor     = user?.role === "donor";

  const formattedDate = new Date(event.eventDate).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const isFull = event.registeredDonors?.length >= event.targetDonors;
  const isPastEvent = new Date(event.eventDate) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold ${
          toast.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"
        }`}>
          {toast.type === "error" ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-5 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />Back
        </button>

        {/* RSVP Success Banner */}
        {alreadyRSVPed && (
          <div className="bg-green-600 rounded-2xl p-5 text-white text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-1">You're Registered! 🩸</h2>
            <p className="text-green-100 text-sm">Check your email for the confirmation and event details.</p>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white mb-5">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-white/20 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Blood Donation Event
            </span>
            <span className="text-xs font-bold tracking-wider">{event.eventCode}</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
          <div className="flex items-center gap-3 text-sm text-red-100">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
            <span>•</span>
            <Clock className="h-4 w-4" />
            <span>{event.startTime} — {event.endTime}</span>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Info className="h-5 w-5 text-red-600" />About This Event
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Venue */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600" />Venue & Location
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Building className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Venue</p>
                <p className="font-semibold text-gray-900">{event.venueName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Address</p>
                <p className="font-semibold text-gray-900">{event.address}, {event.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blood Types Needed */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Droplets className="h-5 w-5 text-red-600" />Blood Types Needed
          </h2>
          <div className="flex flex-wrap gap-2">
            {event.bloodTypesNeeded?.map((type) => (
              <span key={type} className="bg-red-50 text-red-700 font-bold text-sm px-4 py-2 rounded-xl border border-red-200">
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-blue-50 rounded-2xl p-4 text-center">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-700">{event.registeredDonors?.length || 0}</p>
            <p className="text-xs text-blue-500 uppercase tracking-wider">Registered</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 text-center">
            <Heart className="h-6 w-6 text-red-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-700">{event.targetDonors}</p>
            <p className="text-xs text-red-500 uppercase tracking-wider">Target</p>
          </div>
        </div>

        {/* Organizer */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-red-600" />Organizer
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Building className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{event.organizerName}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{event.organizerType}</p>
              </div>
            </div>
            {event.contactPerson && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Contact Person</p>
                  <p className="font-semibold text-gray-900">{event.contactPerson}</p>
                </div>
              </div>
            )}
            {event.contactPhone && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <a href={`tel:${event.contactPhone}`} className="font-semibold text-green-600 hover:underline">{event.contactPhone}</a>
                </div>
              </div>
            )}
            {event.organizerEmail && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <a href={`mailto:${event.organizerEmail}`} className="font-semibold text-blue-600 hover:underline text-sm">{event.organizerEmail}</a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* What to Bring */}
        {event.whatToBring && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              💡 What to Bring & Prepare
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed">{event.whatToBring}</p>
          </div>
        )}

        {/* ── ORGANIZER VIEW ── */}
        {isOrganizer && (
          <div className="space-y-4">

            {/* Organizer banner */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-1">
                <Building className="h-6 w-6" />
                <h3 className="text-lg font-bold">Organizer View</h3>
              </div>
              <p className="text-purple-100 text-sm">You created this event. You can manage registrations and event details below.</p>
            </div>

            {/* Registered Donors List */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Registered Donors ({event.registeredDonors?.length || 0})
                </h3>
                <span className="text-xs text-gray-400">{event.registeredDonors?.length || 0} / {event.targetDonors} target</span>
              </div>
              {event.registeredDonors?.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No donors registered yet. Donors will appear here when they RSVP.
                </div>
              ) : (
                <div className="space-y-2">
                  {event.registeredDonors.map((donor, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{donor.donorName}</p>
                            <p className="text-xs text-gray-500">
                              Registered {new Date(donor.registeredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          {donor.donorBloodGroup && (
                            <span className="bg-red-50 text-red-700 font-bold px-2 py-1 rounded-full">{donor.donorBloodGroup}</span>
                          )}
                          {donor.donorPhone && (
                            <a href={`tel:${donor.donorPhone}`} className="text-green-600 font-bold hover:underline flex items-center gap-1">
                              <Phone className="h-3 w-3" />{donor.donorPhone}
                            </a>
                          )}
                          {donor.donorEmail && (
                            <a href={`mailto:${donor.donorEmail}`} className="text-blue-600 hover:underline flex items-center gap-1">
                              <Mail className="h-3 w-3" />Email
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Organizer Actions */}
            {!isPastEvent && event.status !== "cancelled" && (
              <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">Event Management</h3>
                <button
                  onClick={handleCancelEvent}
                  className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold py-3 rounded-xl transition-all"
                >
                  ❌ Cancel This Event
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Cancelling will mark the event as cancelled and registered donors will see the status updated.
                </p>
              </div>
            )}

            {event.status === "cancelled" && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                <p className="font-bold text-red-700">This event has been cancelled</p>
              </div>
            )}

            {isPastEvent && event.status !== "cancelled" && (
              <div className="bg-gray-100 rounded-2xl p-4 text-center">
                <p className="font-bold text-gray-700">This event has already taken place</p>
              </div>
            )}

          </div>
        )}

        {/* ── DONOR VIEW ── */}
        {!isOrganizer && !isPastEvent && event.status !== "cancelled" && (
          <>
            {alreadyRSVPed ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-green-800">You are registered for this event</p>
                    <p className="text-xs text-green-600 mt-0.5">Confirmation email sent to {user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleCancelRSVP}
                  disabled={rsvping}
                  className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold py-3 rounded-2xl transition-all disabled:opacity-50"
                >
                  {rsvping ? "Cancelling..." : "Cancel My RSVP"}
                </button>
              </div>
            ) : isFull ? (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
                <p className="font-bold text-orange-800">Event is Full</p>
                <p className="text-xs text-orange-600 mt-1">All slots are taken. Check back if any open up.</p>
              </div>
            ) : (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-3">
                  <p className="text-xs text-yellow-800 font-medium">
                    ⚠️ By registering, your contact details will be shared with the event organizer.
                  </p>
                </div>
                <button
                  onClick={handleRSVP}
                  disabled={rsvping}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl text-base shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {rsvping
                    ? <><Loader className="h-5 w-5 animate-spin" />Registering...</>
                    : <><Heart className="h-5 w-5" />🩸 I Will Attend — Register Now</>
                  }
                </button>
              </>
            )}
          </>
        )}

        {!isOrganizer && isPastEvent && (
          <div className="bg-gray-100 rounded-2xl p-4 text-center">
            <p className="font-bold text-gray-700">This event has already taken place</p>
          </div>
        )}

        {!isOrganizer && event.status === "cancelled" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="font-bold text-red-700">This event has been cancelled</p>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default EventDetail;