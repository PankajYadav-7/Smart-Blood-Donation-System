import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  CheckCircle,
  Droplets,
  Award,
  Calendar,
  ArrowLeft,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    location: "Kathmandu, Nepal",
  });

  const handleSave = () => {
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const getDashboardLink = () => {
    const routes = {
      donor: "/donor/dashboard",
      hospital: "/hospital/dashboard",
      ngo: "/hospital/dashboard",
      admin: "/admin/dashboard",
    };
    return routes[user?.role] || "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <button
          onClick={() => navigate(getDashboardLink())}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Profile updated successfully!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card className="border-0 shadow-md text-center">
              <CardContent className="pt-8 pb-6">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user?.fullName}</h2>
                <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                <Badge className="mt-3 capitalize">{user?.role}</Badge>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <Droplets className="h-5 w-5 text-red-600" />
                    <div className="text-left">
                      <p className="text-xs text-gray-500">Blood Group</p>
                      <p className="font-bold text-red-600">O+</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <p className="text-xs text-gray-500">Member Since</p>
                      <p className="font-semibold text-gray-900">2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <div className="text-left">
                      <p className="text-xs text-gray-500">Total Donations</p>
                      <p className="font-bold text-gray-900">8</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Profile */}
          <div className="md:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Profile Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Full Name", key: "fullName", icon: User, type: "text" },
                  { label: "Email Address", key: "email", icon: Mail, type: "email" },
                  { label: "Phone Number", key: "phone", icon: Phone, type: "tel", placeholder: "+977-98XXXXXXXX" },
                  { label: "Location", key: "location", icon: MapPin, type: "text" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <div className="relative">
                      <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={field.type}
                        value={formData[field.key]}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={field.placeholder || ""}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-all ${
                          isEditing
                            ? "border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                            : "border-transparent bg-gray-50 text-gray-700 cursor-default"
                        }`}
                      />
                    </div>
                  </div>
                ))}

                {isEditing && (
                  <Button className="w-full mt-2" onClick={handleSave}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-0 shadow-md mt-4 border border-red-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-600 text-base">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full text-left justify-start text-gray-700"
                  onClick={() => navigate("/forgot-password")}
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-left justify-start text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                  }}
                >
                  Logout from Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;