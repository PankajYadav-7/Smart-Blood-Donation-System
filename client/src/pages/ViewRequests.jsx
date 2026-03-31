import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Droplets,
  MapPin,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ArrowLeft,
  Building,
} from "lucide-react";

const ViewRequests = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [filterBlood, setFilterBlood] = useState("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/requests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(res.data.requests);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = filterUrgency === "all" || r.urgency === filterUrgency;
    const matchesBlood = filterBlood === "all" || r.bloodGroup === filterBlood;
    return matchesSearch && matchesUrgency && matchesBlood;
  });

  const bloodGroups = ["all", "A", "B", "AB", "O"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🩸 Blood Requests
            </h1>
            <p className="text-gray-500 mt-1">
              {requests.length} open requests available
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by hospital or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Urgency Filter */}
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="all">All Urgency</option>
                <option value="Normal">Normal</option>
                <option value="Emergency">Emergency</option>
              </select>

              {/* Blood Group Filter */}
              <select
                value={filterBlood}
                onChange={(e) => setFilterBlood(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                {bloodGroups.map(g => (
                  <option key={g} value={g}>
                    {g === "all" ? "All Blood Groups" : `Blood Group ${g}`}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            Showing {filteredRequests.length} of {requests.length} requests
          </p>
          <Button
            size="sm"
            onClick={() => navigate("/create-request")}
          >
            <Droplets className="h-4 w-4 mr-2" />
            Create Request
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-500 mt-3">Loading requests...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRequests.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Droplets className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No requests found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterUrgency !== "all" || filterBlood !== "all"
                  ? "Try changing your search or filters"
                  : "No open blood requests at the moment"
                }
              </p>
              <Button onClick={() => navigate("/create-request")}>
                Create First Request
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card
              key={request._id}
              className={`border-0 shadow-md hover:shadow-lg transition-all ${
                request.urgency === "Emergency"
                  ? "border-l-4 border-l-red-500"
                  : "border-l-4 border-l-blue-400"
              }`}
            >
              <CardContent className="pt-5 pb-5">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Blood Type Circle */}
                    <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-sm">
                        {request.bloodGroup}{request.rh}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {request.bloodGroup}{request.rh} Blood Needed
                        </h3>
                        <Badge
                          variant={request.urgency === "Emergency" ? "destructive" : "secondary"}
                          className={request.urgency === "Emergency"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-gray-100 text-gray-700"
                          }
                        >
                          {request.urgency === "Emergency" && (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {request.urgency}
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          {request.hospitalName}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          {request.unitsRequired} unit{request.unitsRequired > 1 ? "s" : ""} required
                        </p>
                        {request.notes && (
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            {request.notes}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          Posted: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex md:flex-col gap-2 justify-end items-end">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      {request.status}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => navigate("/donor/profile")}
                    >
                      I Can Help
                    </Button>
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

export default ViewRequests;