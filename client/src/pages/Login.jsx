import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import Navbar from "../components/Navbar";
import {
  Droplets,
  Eye,
  EyeOff,
  User,
  Building,
  Users,
  Shield,
  Phone,
} from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const userTypes = [
    { value: "donor", label: "Donor", icon: User, description: "Individual blood donor" },
    { value: "requester", label: "Patient/Family", icon: User, description: "Need blood for patient" },
    { value: "hospital", label: "Hospital", icon: Building, description: "Medical institution" },
    { value: "ngo", label: "NGO", icon: Users, description: "Non-profit organization" },
    { value: "admin", label: "Admin", icon: Shield, description: "Platform administrator" }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const role = response.data.user.role;
      if (role === "donor") navigate("/donor/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
      else if (role === "hospital" || role === "ngo") navigate("/hospital/dashboard");
      else navigate("/");

    } catch (error) {
      setError(error.response?.data?.message || "Invalid email or password");
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
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500 mt-1 text-sm">
                Sign in to your Jeevan Saarthi account
              </p>
            </CardHeader>

            <CardContent className="pt-6 pb-8 px-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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

                {/* Forgot Password */}
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-red-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                {/* Login Button */}
                <Button type="submit" className="w-full py-3" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400 uppercase tracking-wider">
                    New to Jeevan Saarthi?
                  </span>
                </div>
              </div>

              {/* Register Link */}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/register">Create New Account</Link>
              </Button>

              {/* Emergency Access */}
              <div className="text-center mt-6 pt-6 border-t border-gray-100">
                <Button
                  variant="destructive"
                  className="w-full bg-red-700 hover:bg-red-800"
                  asChild
                >
                  <Link to="/emergency">
                    <Phone className="mr-2 h-4 w-4" />
                    Emergency Access — No Account Needed
                  </Link>
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  For immediate blood requests without account
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;