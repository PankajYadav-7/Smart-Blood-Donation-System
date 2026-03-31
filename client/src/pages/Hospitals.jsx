import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Building2, MapPin, Phone, Clock, Star, Users, Heart,
  Shield, Award, CheckCircle, AlertCircle, Search,
} from "lucide-react";

const Hospitals = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [activeTab, setActiveTab] = useState("directory");

  const hospitals = [
    {
      id: 1, name: "Bir Hospital", type: "Government Hospital",
      location: "Mahaboudha, Kathmandu", address: "Mahaboudha, Kathmandu 44600",
      distance: "2.3 km", phone: "01-4221119", rating: 4.8, verified: true,
      bloodBank: true, emergencyServices: true, operatingHours: "24/7",
      specialties: ["Emergency Care", "Blood Bank", "Surgery", "ICU"],
      bloodTypes: ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"],
      totalDonations: 1240, status: "accepting",
    },
    {
      id: 2, name: "Patan Hospital", type: "Medical Center",
      location: "Lagankhel, Lalitpur", address: "Lagankhel, Lalitpur 44700",
      distance: "4.1 km", phone: "01-5522295", rating: 4.6, verified: true,
      bloodBank: true, emergencyServices: true, operatingHours: "24/7",
      specialties: ["Cardiology", "Blood Bank", "Oncology", "Pediatrics"],
      bloodTypes: ["A+", "B+", "O+", "AB+", "O-"],
      totalDonations: 890, status: "accepting",
    },
    {
      id: 3, name: "Teaching Hospital", type: "Teaching Hospital",
      location: "Maharajgunj, Kathmandu", address: "Maharajgunj, Kathmandu",
      distance: "5.7 km", phone: "01-4412404", rating: 4.9, verified: true,
      bloodBank: true, emergencyServices: false, operatingHours: "8:00 AM - 6:00 PM",
      specialties: ["General Medicine", "Blood Bank", "Orthopedics"],
      bloodTypes: ["A+", "B+", "O+", "AB+"],
      totalDonations: 650, status: "limited",
    },
    {
      id: 4, name: "Kanti Children Hospital", type: "Specialty Hospital",
      location: "Maharajgunj, Kathmandu", address: "Maharajgunj, Kathmandu",
      distance: "3.2 km", phone: "01-4412798", rating: 4.7, verified: true,
      bloodBank: false, emergencyServices: true, operatingHours: "24/7",
      specialties: ["Pediatrics", "Neonatal Care", "Pediatric Surgery"],
      bloodTypes: ["O+", "O-", "A+", "B+"],
      totalDonations: 420, status: "accepting",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "accepting": return "bg-green-100 text-green-700 border-green-200";
      case "limited": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "full": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "accepting": return "Accepting Donations";
      case "limited": return "Limited Capacity";
      case "full": return "At Capacity";
      default: return "Unknown";
    }
  };

  const partnerBenefits = [
    { title: "Verified Partnership", description: "Official verification badge and trusted status on the platform", icon: Shield },
    { title: "Priority Support", description: "24/7 technical support and dedicated assistance", icon: Users },
    { title: "Analytics Dashboard", description: "Real-time donation metrics and insights for your hospital", icon: Award },
    { title: "Smart Matching", description: "Automatic donor matching based on blood type and location", icon: CheckCircle },
  ];

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
    h.location.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-red-950 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Building2 className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-3">Partner Hospitals & Medical Centers</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover verified hospitals and medical centers in Nepal that participate in our blood donation network
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200 mb-8 w-fit">
          {[
            { id: "directory", label: "🏥 Hospital Directory" },
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

        {/* Directory Tab */}
        {activeTab === "directory" && (
          <div className="space-y-6">
            {/* Search */}
            <Card className="border-0 shadow-md">
              <CardContent className="pt-4 pb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    placeholder="Search hospitals by name or location..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hospital Cards */}
            {filtered.map((hospital) => (
              <Card key={hospital.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 pb-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{hospital.name}</h3>
                        {hospital.verified && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            <CheckCircle className="h-3 w-3 mr-1" />Verified
                          </Badge>
                        )}
                        <Badge className={getStatusColor(hospital.status)}>
                          {getStatusText(hospital.status)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />{hospital.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />{hospital.distance}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />{hospital.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Services</h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm">
                          {hospital.bloodBank ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-gray-400" />}
                          <span className={hospital.bloodBank ? "text-gray-700" : "text-gray-400"}>Blood Bank</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {hospital.emergencyServices ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-gray-400" />}
                          <span className={hospital.emergencyServices ? "text-gray-700" : "text-gray-400"}>Emergency Services</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-700">{hospital.operatingHours}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-1">
                        {hospital.specialties.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Blood Types Available</h4>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {hospital.bloodTypes.map((t, i) => (
                          <Badge key={i} className="bg-red-100 text-red-700 text-xs">{t}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Heart className="h-3 w-3" />{hospital.totalDonations} total donations
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1" asChild>
                      <Link to="/create-request">
                        <Heart className="h-4 w-4 mr-2" />Request Blood
                      </Link>
                    </Button>
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-2" />{hospital.phone}
                    </Button>
                    <Button variant="outline">
                      <MapPin className="h-4 w-4 mr-2" />Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Partnership Tab */}
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
                      <Link to="/register">
                        <Building2 className="h-5 w-5 mr-2" />Apply for Partnership
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/help">
                        <Phone className="h-5 w-5 mr-2" />Contact Us
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
                    { step: "1", title: "Apply & Verify", desc: "Submit application with required documentation for verification" },
                    { step: "2", title: "Setup Profile", desc: "Configure your hospital profile and integrate with our platform" },
                    { step: "3", title: "Start Receiving", desc: "Begin receiving donors and blood requests through our network" },
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
