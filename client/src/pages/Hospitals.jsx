import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Building2, MapPin, Phone, Clock, Users, Heart,
  Shield, Award, CheckCircle, Search, Mail, Calendar,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const API = "https://jeevansaarthi-api.onrender.com/api";

const Hospitals = () => {
  const [searchTerm,  setSearchTerm]  = useState("");
  const [activeTab,   setActiveTab]   = useState("directory");
  const [hospitals,   setHospitals]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [typeFilter,  setTypeFilter]  = useState("all");

  useEffect(() => {
    axios.get(`${API}/auth/hospitals`)
      .then(res => setHospitals(res.data.hospitals || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = hospitals.filter(h => {
    const matchSearch = !searchTerm ||
      h.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === "all" || h.role === typeFilter;
    return matchSearch && matchType;
  });

  const partnerBenefits = [
    { title: "Verified Partnership",   description: "Official verification badge and trusted status on the platform",          icon: Shield      },
    { title: "Priority Support",       description: "24/7 technical support and dedicated assistance for your team",            icon: Users       },
    { title: "Analytics Dashboard",    description: "Real-time donation metrics and insights for your organisation",            icon: Award       },
    { title: "Smart Donor Matching",   description: "Automatic donor matching based on blood type and location",                icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-red-950 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Building2 className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-3">Partner Hospitals & Organisations</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Verified hospitals and NGOs across Nepal participating in the Jeevan Saarthi blood donation network
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200 mb-8 w-fit">
          {[
            { id: "directory",   label: "🏥 Hospital Directory"  },
            { id: "partnership", label: "🤝 Partnership Program" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── DIRECTORY TAB ── */}
        {activeTab === "directory" && (
          <div className="space-y-6">

            {/* Search */}
            <Card className="border-0 shadow-md">
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      placeholder="Search by name or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="all">All Organisations</option>
                    <option value="hospital">🏥 Hospitals Only</option>
                    <option value="ngo">🤝 NGOs Only</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Map */}
            {!loading && hospitals.filter(h => h.locationLat && h.locationLng).length > 0 && (
              <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100 mb-6">
                <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <p className="text-sm font-bold text-gray-900">Verified Organisations on Map</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {hospitals.filter(h => h.locationLat && h.locationLng).length} of {hospitals.length} have verified locations
                  </p>
                </div>
                <MapContainer
                  center={[27.7172, 85.3240]}
                  zoom={12}
                  style={{ height: "340px", width: "100%", zIndex: 0 }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {hospitals.filter(h => h.locationLat && h.locationLng).map((org) => (
                    <Marker key={org._id} position={[org.locationLat, org.locationLng]}>
                      <Popup>
                        <div className="text-center" style={{ minWidth: "160px" }}>
                          <p className="font-bold text-gray-900 text-sm">{org.fullName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {org.role === "hospital" ? "🏥 Hospital" : "🤝 NGO"}
                          </p>
                          {org.address && (
                            <p className="text-xs text-gray-500 mt-1">{org.address}</p>
                          )}
                          <button
                            onClick={() => window.open(
                              "https://www.google.com/maps/dir/?api=1&destination=" +
                              org.locationLat + "," + org.locationLng,
                              "_blank"
                            )}
                            className="mt-2 text-xs text-blue-600 hover:underline font-semibold"
                          >
                            🗺️ Get Directions
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}

            {/* Count */}
            {!loading && hospitals.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 font-medium">
                  {filtered.length} verified organisation{filtered.length !== 1 ? "s" : ""} found
                </p>
                <p className="text-xs text-gray-400">
                  All organisations are verified by our admin team before listing
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
                <p className="text-gray-500 mt-3 text-sm">Loading verified organisations...</p>
              </div>
            )}

            {/* Empty */}
            {!loading && filtered.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-16 text-center">
                  <Building2 className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {hospitals.length === 0 ? "No verified organisations yet" : "No results found"}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    {hospitals.length === 0
                      ? "Hospitals and NGOs will appear here once they register and get verified by our admin team."
                      : "Try a different search term."}
                  </p>
                  <Button asChild className="bg-red-600 hover:bg-red-700">
                    <Link to="/register">Register Your Organisation</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Hospital Cards */}
            {filtered.map((org) => (
              <Card key={org._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 pb-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900">{org.fullName}</h3>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          <CheckCircle className="h-3 w-3 mr-1" />Verified
                        </Badge>
                        <Badge className={org.role === "hospital" ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"}>
                          {org.role === "hospital" ? "🏥 Hospital" : "🤝 NGO"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {org.address && (
                          <span className="flex items-center gap-1 flex-wrap">
                            <MapPin className="h-4 w-4 text-gray-400" />{org.address}
                            {org.locationLat && org.locationLng && (
                              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium ml-1">
                                📍 Location verified
                              </span>
                            )}
                          </span>
                        )}
                        {!org.address && org.fullName && (
                          <span className="flex items-center gap-1 text-gray-400 text-sm italic">
                            <MapPin className="h-4 w-4 text-gray-300" />Address not provided
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          Member since {new Date(org.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {org.orgDescription && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <p className="text-sm text-gray-600 leading-relaxed">{org.orgDescription}</p>
                    </div>
                  )}

                  {/* What they can do */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Capabilities</h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-700">Post Blood Requests</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-700">Organize Blood Drives</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-700">Receive Emergency Alerts</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Contact</h4>
                      <div className="space-y-1.5">
                        {org.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <a href={`mailto:${org.email}`} className="text-blue-600 hover:underline truncate">{org.email}</a>
                          </div>
                        )}
                        {org.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <a href={`tel:${org.phone}`} className="text-green-600 hover:underline font-semibold">{org.phone}</a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Network Status</h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-gray-700">Active on Jeevan Saarthi</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-700">Admin Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row gap-3 flex-wrap">
                    {(() => {
                      const t    = localStorage.getItem("token");
                      const role = JSON.parse(localStorage.getItem("user") || "null")?.role;

                      if (!t) {
                        return (
                          <Button className="flex-1 bg-red-600 hover:bg-red-700" asChild>
                            <Link to="/login">
                              <Heart className="h-4 w-4 mr-2" />Request Blood
                            </Link>
                          </Button>
                        );
                      }
                      if (role === "donor") {
                        return (
                          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" asChild>
                            <Link to="/donor/dashboard">
                              <Heart className="h-4 w-4 mr-2" />Respond to Requests
                            </Link>
                          </Button>
                        );
                      }
                      if (role === "hospital" || role === "ngo") {
                        return (
                          <Button className="flex-1 bg-red-600 hover:bg-red-700" asChild>
                            <Link to="/create-request">
                              <Heart className="h-4 w-4 mr-2" />Create Blood Request
                            </Link>
                          </Button>
                        );
                      }
                      if (role === "requester") {
                        return (
                          <Button className="flex-1 bg-red-600 hover:bg-red-700" asChild>
                            <Link to="/create-request">
                              <Heart className="h-4 w-4 mr-2" />Request Blood
                            </Link>
                          </Button>
                        );
                      }
                      return null;
                    })()}
                    <Button variant="outline" asChild>
                      <Link to={"/events?organizer=" + encodeURIComponent(org.fullName)}>
                        <Calendar className="h-4 w-4 mr-2" />View Their Events
                      </Link>
                    </Button>
                    {org.locationLat && org.locationLng ? (
                      <Button
                        variant="outline"
                        onClick={() => window.open(
                          "https://www.google.com/maps/dir/?api=1&destination=" +
                          org.locationLat + "," + org.locationLng,
                          "_blank"
                        )}
                      >
                        <MapPin className="h-4 w-4 mr-2" />Get Directions
                      </Button>
                    ) : (org.address || org.fullName) ? (
                      <Button
                        variant="outline"
                        onClick={() => window.open(
                          "https://www.google.com/maps/search/?api=1&query=" +
                          encodeURIComponent((org.address || org.fullName) + " Nepal"),
                          "_blank"
                        )}
                      >
                        <MapPin className="h-4 w-4 mr-2" />Find on Map
                      </Button>
                    ) : null}
                    {org.phone && !org.email && (
                      <Button variant="outline" asChild>
                        <a href={`tel:${org.phone}`}>
                          <Phone className="h-4 w-4 mr-2" />{org.phone}
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

          </div>
        )}

        {/* ── PARTNERSHIP TAB ── */}
        {activeTab === "partnership" && (
          <div className="space-y-8">
            <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-gray-50">
              <CardContent className="pt-8 pb-8">
                <div className="text-center max-w-3xl mx-auto">
                  <Building2 className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Hospital Network</h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Partner with Jeevan Saarthi to streamline blood donation processes, improve patient outcomes,
                    and connect with committed donors across Nepal.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild>
                      <Link to="/partnership-application">
                        <Building2 className="h-5 w-5 mr-2" />Learn About Partnership
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/register">
                        <Phone className="h-5 w-5 mr-2" />Register Organisation
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Partnership Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {partnerBenefits.map((benefit, idx) => (
                  <Card key={idx} className="border-0 shadow-md text-center hover:shadow-lg transition-shadow">
                    <CardContent className="pt-8 pb-6">
                      <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <benefit.icon className="h-7 w-7 text-red-600" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl text-center">How Partnership Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  {[
                    { step: "1", title: "Apply & Verify",  desc: "Register on Jeevan Saarthi as a Hospital or NGO and submit your details for admin verification." },
                    { step: "2", title: "Setup Profile",   desc: "Once verified, configure your organisation profile, add contact details and start posting blood requests." },
                    { step: "3", title: "Start Receiving", desc: "Begin receiving matched donors, organize blood drives and receive emergency alerts across Nepal." },
                  ].map((item) => (
                    <div key={item.step}>
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-red-600">{item.step}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
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

export default Hospitals;
