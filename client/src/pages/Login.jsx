import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import { Droplets, Eye, EyeOff, User, Building, Users, Shield } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType]         = useState("donor");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const navigate = useNavigate();

  const userTypes = [
    { value: "donor",     label: "Donor",          icon: User,     description: "Individual blood donor"   },
    { value: "requester", label: "Patient/Family",  icon: User,     description: "Need blood for patient"   },
    { value: "hospital",  label: "Hospital",        icon: Building, description: "Medical institution"      },
    { value: "ngo",       label: "NGO",             icon: Users,    description: "Non-profit organization"  },
    { value: "admin",     label: "Admin",           icon: Shield,   description: "Platform administrator"   },
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
      localStorage.setItem("user",  JSON.stringify(response.data.user));

      const role = response.data.user.role;
      if      (role === "donor")                    navigate("/donor/dashboard");
      else if (role === "admin")                    navigate("/admin/dashboard");
      else if (role === "hospital")                 navigate("/hospital/dashboard");
      else if (role === "ngo")                      navigate("/ngo/dashboard");
      else if (role === "requester")                navigate("/patient/dashboard");
      else                                          navigate("/");

    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="medical-shadow border-0 shadow-xl">

            {/* Header */}
            <CardHeader className="text-center pb-2 pt-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg">
                  <Droplets className="h-7 w-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                Sign in to your Jeevan Saarthi account to continue saving lives
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 pb-8 px-8 space-y-5">

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">

                {/* Account Type Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Account Type
                  </label>
                  <div className="relative">
                    <select
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                      className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all cursor-pointer pr-10"
                    >
                      {userTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} — {type.description}
                        </option>
                      ))}
                    </select>
                    {/* Dropdown arrow */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Show selected account type nicely */}
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                    {(() => {
                      const selected = userTypes.find(t => t.value === userType);
                      const Icon = selected?.icon || User;
                      return (
                        <>
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{selected?.label}</p>
                            <p className="text-xs text-gray-500">{selected?.description}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword
                        ? <EyeOff className="h-5 w-5" />
                        : <Eye className="h-5 w-5" />
                      }
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-red-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-base shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Signing In...
                    </span>
                  ) : "Sign In"}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400 uppercase tracking-wider">
                    New to Jeevan Saarthi?
                  </span>
                </div>
              </div>

              {/* Create Account */}
              <Link
                to="/register"
                className="block w-full text-center border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-xl text-sm transition-all duration-200"
              >
                Create New Account
              </Link>

              {/* Email note */}
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 leading-relaxed">
                  📧 <strong className="text-gray-700">First time signing in?</strong><br />
                  Check your email for a confirmation link before logging in.
                </p>
              </div>

              {/* Emergency Access */}
              <div className="text-center pt-2">
                <Link
                  to="/emergency"
                  className="inline-flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded-xl text-sm shadow-lg emergency-glow transition-all duration-200"
                >
                  🚨 Emergency Access
                </Link>
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
