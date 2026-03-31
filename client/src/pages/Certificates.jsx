import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Award,
  Download,
  Share2,
  Trophy,
  Medal,
  Star,
  Calendar,
  Building,
  Heart,
  Users,
  ArrowLeft,
  Clock,
} from "lucide-react";

const Certificates = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("donor");
  const [selectedCert, setSelectedCert] = useState(null);

  const donorCertificates = [
    { id: 1, type: "Life Saver Champion", level: "Gold", criteria: "50+ blood donations", dateEarned: "2024-01-15", description: "Exceptional contribution to saving lives through consistent blood donation", icon: Trophy, color: "text-yellow-600", bgColor: "bg-yellow-50 border-yellow-200" },
    { id: 2, type: "Emergency Hero", level: "Platinum", criteria: "10+ emergency donations", dateEarned: "2023-12-10", description: "Outstanding response to critical emergency blood requests", icon: Medal, color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
    { id: 3, type: "Community Guardian", level: "Silver", criteria: "25+ donations over 3 years", dateEarned: "2023-08-20", description: "Sustained commitment to community health and blood donation", icon: Star, color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200" },
  ];

  const hospitalCertificates = [
    { id: 1, type: "Excellence in Blood Management", level: "Diamond", criteria: "Outstanding blood bank operations", dateEarned: "2024-02-01", description: "Exemplary blood collection, storage, and distribution practices", icon: Building, color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200" },
    { id: 2, type: "Community Impact Leader", level: "Gold", criteria: "500+ successful blood drives", dateEarned: "2023-11-15", description: "Outstanding community outreach and blood drive organization", icon: Users, color: "text-red-600", bgColor: "bg-red-50 border-red-200" },
    { id: 3, type: "Innovation in Healthcare", level: "Platinum", criteria: "Technology advancement in blood services", dateEarned: "2023-09-30", description: "Implementation of cutting-edge blood management systems", icon: Heart, color: "text-pink-600", bgColor: "bg-pink-50 border-pink-200" },
  ];

  const certificates = activeTab === "donor" ? donorCertificates : hospitalCertificates;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Certificates & Recognition</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Your achievements and contributions to saving lives are recognized with these special certificates
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200 mb-8 w-fit mx-auto">
          {[
            { id: "donor", label: "🩸 Donor Certificates" },
            { id: "hospital", label: "🏥 Hospital Recognition" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {certificates.map((cert) => (
            <Card
              key={cert.id}
              className={`cursor-pointer hover:shadow-xl transition-all border-2 ${cert.bgColor}`}
              onClick={() => setSelectedCert(cert)}
            >
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-md">
                  <cert.icon className={`h-8 w-8 ${cert.color}`} />
                </div>
                <CardTitle className="text-lg">{cert.type}</CardTitle>
                <Badge variant="outline" className={`${cert.color} w-fit mx-auto`}>
                  {cert.level}
                </Badge>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <p className="text-sm text-gray-600">{cert.description}</p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>Earned: {cert.dateEarned}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); alert("Downloading certificate..."); }}>
                    <Download className="h-3 w-3 mr-1" />Download
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); alert("Sharing certificate..."); }}>
                    <Share2 className="h-3 w-3 mr-1" />Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Next Achievements */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-600" />
              Next Achievements
            </CardTitle>
            <CardDescription>You are close to earning these certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Veteran Donor", current: 52, total: 75, label: "donations" },
                { title: "Decade Devotee", current: 4, total: 10, label: "years" },
                { title: "Speed Responder", current: 8, total: 15, label: "responses" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <Badge variant="outline">{item.current}/{item.total}</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${(item.current / item.total) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.total - item.current} more {item.label} needed
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certificate Preview Modal */}
        {selectedCert && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setSelectedCert(null)}>
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className={`w-20 h-20 rounded-full bg-white border-4 border-gray-200 flex items-center justify-center mx-auto mb-4 shadow-lg ${selectedCert.bgColor}`}>
                  <selectedCert.icon className={`h-10 w-10 ${selectedCert.color}`} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCert.type}</h2>
                <Badge className={`mt-2 ${selectedCert.color}`}>{selectedCert.level} Level</Badge>
                <p className="text-gray-500 mt-3">{selectedCert.description}</p>
                <p className="text-sm text-gray-400 mt-2">Earned: {selectedCert.dateEarned}</p>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => alert("Downloading PDF...")}>
                  <Download className="h-4 w-4 mr-2" />Download PDF
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setSelectedCert(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Certificates;