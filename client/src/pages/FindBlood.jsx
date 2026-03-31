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
  Building,
  Filter,
} from "lucide-react";

const FindBlood = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get("http://localhost:5000/api/requests", { headers });
      setRequests(res.data.requests);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const filtered = requests.filter(r => {
    const matchSearch = r.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBlood = selectedBloodGroup === "all" || r.bloodGroup === selectedBloodGroup;
    const matchUrgency = selectedUrgency === "all" || r.urgency === selectedUrgency;
    return matchSearch && matchBlood && matchUrgency;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-red-950 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Droplets className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-3">Find Blood</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Browse all open blood requests and help save lives in your community
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
              <select
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="all">All Blood Groups</option>
                {["A", "B", "AB", "O"].map(g => (
                  <option key={g} value={g}>Blood Group {g}</option>
                ))}
              </select>
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="all">All Urgency</option>
                <option value="Emergency">Emergency</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {filtered.length} requests found
          </p>
          <Button size="sm" onClick={() => navigate("/emergency")} className="bg-red-700 hover:bg-red-800">
            <AlertCircle className="h-4 w-4 mr-2" />
            Emergency Request
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-500 mt-3">Loading blood requests...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Droplets className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No requests found</h3>
              <p className="text-gray-500 mb-6">Try changing your search filters</p>
            </CardContent>
          </Card>
        )}

        {/* Requests */}
        <div className="space-y-4">
          {filtered.map((request) => (
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
                    <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-md flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {request.bloodGroup}{request.rh}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {request.bloodGroup}{request.rh} Blood Needed
                        </h3>
                        <Badge
                          className={request.urgency === "Emergency"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                          }
                        >
                          {request.urgency === "Emergency" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {request.urgency}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          {request.hospitalName}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-gray-400" />
                          {request.unitsRequired} unit{request.unitsRequired > 1 ? "s" : ""} needed
                        </p>
                        {request.notes && (
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {request.notes}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          Posted: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col items-end gap-2">
                    <Badge className="bg-blue-100 text-blue-700">{request.status}</Badge>
                    {token ? (
                      <Button size="sm" onClick={() => navigate("/donor/profile")}>
                        I Can Help
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => navigate("/register")}>
                        Register to Help
                      </Button>
                    )}
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

export default FindBlood;