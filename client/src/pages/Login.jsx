import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import Navbar from "../components/Navbar";
import { Droplets, Eye, EyeOff, Mail, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

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
      if      (role === "donor")     navigate("/donor/dashboard");
      else if (role === "admin")     navigate("/admin/dashboard");
      else if (role === "hospital")  navigate("/hospital/dashboard");
      else if (role === "ngo")       navigate("/ngo/dashboard");
      else if (role === "requester") navigate("/patient/dashboard");
      else                           navigate("/");

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid email or password. Please check your credentials."
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">

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

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <span className="text-red-500 flex-shrink-0 mt-0.5">⚠️</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-10 pr-4 border border-gray-300 rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-red-600 hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-10 pr-12 border border-gray-300 rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-base shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Signing In...
                    </span>
                  ) : "Sign In"}
                </button>
              </form>

              {/* How it works info */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs text-blue-700 font-semibold mb-2">
                  🔐 How login works
                </p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  Enter your email and password. The system will automatically
                  detect your account type and
                  redirect you to the correct dashboard.
                </p>
              </div>

              {/* Divider */}
              <div className="relative">
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

              {/* Emergency Access */}
              <div className="text-center pt-2">
                <Link
                  to="/emergency"
                  className="inline-flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded-xl text-sm shadow-lg emergency-glow transition-all duration-200"
                >
                  🚨 Emergency Access
                </Link>
                <p className="text-xs text-gray-400 mt-2">
                  For immediate blood requests without an account
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
