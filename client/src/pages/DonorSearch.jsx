import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Search,
  MapPin,
  Filter,
  Clock,
  Droplets,
  Phone,
  Mail,
  Award,
  ArrowLeft,
  User,
} from "lucide-react";

const DonorSearch = () => {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState({
    bloodType: "",
    location: "",
    availability: "all"
  });

  const donors = [
    { id: 1, name: "John Smith", bloodType: "O+", location: "Kathmandu, Nepal", lastDonation: "2024-01-15", totalDonations: 8, distance: "2.3 km", availability: "Available", badges: ["Regular Donor", "Emergency Hero"] },
    { id: 2, name: "Sarah Johnson", bloodType: "O+", location: "Lalitpur, Nepal", lastDonation: "2024-02-10", totalDonations: 12, distance: "4.1 km", availability: "Available", badges: ["Life Saver", "Gold Donor"] },
    { id: 3, name: "Mike Chen", bloodType: "A+", location: "Bhaktapur, Nepal", lastDonation: "2023-12-20", totalDonations: 15, distance: "6.8 km", availability: "Snoozed", badges: ["Champion", "Regular Donor"] },
  ];

  const filteredDonors = donors.filter(donor => {
    if (searchFilters.bloodType && donor.bloodType !== searchFilters.bloodType) return false;
    if (searchFilters.availability === "available" && donor.availability !== "Available") return false;
    return true;
  });

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Donor Search</h1>
          <p className="text-gray-500 mt-1">Find and connect with blood donors in your area</p>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-red-600" />
              Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                <select
                  value={searchFilters.bloodType}
                  onChange={(e) => setSearchFilters({ ...searchFilters, bloodType: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value="">All Blood Types</option>
                  {bloodTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter city or area"
                    value={searchFilters.location}
                    onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  value={searchFilters.availability}
                  onChange={(e) => setSearchFilters({ ...searchFilters, availability: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value="all">All Donors</option>
                  <option value="available">Available Only</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">Found {filteredDonors.length} donors</p>
              <Button>
                <Search className="h-4 w-4 mr-2" />Search Donors
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {filteredDonors.map((donor) => (
            <Card key={donor.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-5 pb-5">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{donor.name}</h3>
                        <Badge className="bg-red-100 text-red-700">{donor.bloodType}</Badge>
                        <Badge className={donor.availability === "Available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                          {donor.availability}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {donor.location} • {donor.distance}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          Last donation: {donor.lastDonation}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Award className="h-4 w-4 text-gray-400" />
                          {donor.totalDonations} total donations
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {donor.badges.map((badge, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{badge}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2 justify-end">
                    <Button size="sm" disabled={donor.availability !== "Available"}>
                      <Mail className="h-4 w-4 mr-1" />Contact
                    </Button>
                    <Button size="sm" variant="outline">View Profile</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DonorSearch;