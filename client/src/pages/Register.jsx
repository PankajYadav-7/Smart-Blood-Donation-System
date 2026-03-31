import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Navbar from "../components/Navbar";
import {
  Droplets,
  Eye,
  EyeOff,
  User,
  Building,
  Users,
  Shield,
  CheckCircle,
} from "lucide-react";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "donor",
  });
  const navigate = useNavigate();

  const userTypes = [
    { value: "donor", label: "Donor", icon: User, description: "I want to donate blood" },
    { value: "requester", label: "Patient/Family", icon: User, description: "I need blood for a patient" },
    { value: "hospital", label: "Hospital", icon: Building, description: "Medical institution" },
    { value: "ngo", label: "NGO", icon: Users, description: "Non-profit organization" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const role = response.data.user.role;
      if (role === "donor") navigate("/donor/dashboard");
      else if (role === "hospital" || role === "ngo") navigate("/hospital/dashboard");
      else navigate("/");

    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-0 pt-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg">
                  <Droplets className="h-7 w-7 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-500 mt-1 text-sm">
                Join Jeevan Saarthi and start saving lives
              </p>
            </CardHeader>

            <CardContent className="pt-6 pb-8 px-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am registering as
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {userTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: type.value })}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center ${
                          formData.role === type.value
                            ? "border-red-600 bg-red-50 text-red-600"
                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                        }`}
                      >
                        <type.icon className="h-5 w-5 mb-1" />
                        <span className="text-xs font-semibold">{type.label}</span>
                        <span className="text-xs text-gray-400 mt-0.5">{type.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Register Button */}
                <Button type="submit" className="w-full py-3 mt-2" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              {/* Benefits */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Why join Jeevan Saarthi?
                </p>
                <div className="space-y-1.5">
                  {[
                    "Save lives with your blood donation",
                    "Get matched instantly with patients",
                    "Earn badges and certificates",
                    "100% privacy protected"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                      <span className="text-xs text-gray-600">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Login Link */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400">
                    Already have an account?
                  </span>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">Sign In Instead</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
