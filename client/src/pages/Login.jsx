import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import Navbar from "../components/Navbar";
import { Droplets, Eye, EyeOff, Mail, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  // ── If already logged in, redirect immediately ───────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "null");
    const params   = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (token && user) {
      if (redirect) {
        navigate(redirect, { replace: true });
      } else {
        const role = user.role;
        if      (role === "donor")     navigate("/donor/dashboard", { replace: true });
        else if (role === "admin")     navigate("/admin/dashboard", { replace: true });
        else if (role === "hospital")  navigate("/hospital/dashboard", { replace: true });
        else if (role === "ngo")       navigate("/ngo/dashboard", { replace: true });
        else if (role === "requester") navigate("/patient/dashboard", { replace: true });
        else                           navigate("/", { replace: true });
      }
      return;
    }
  }, []);
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  // ── OTP verification state ───────────────────────────────────────────────
  const [showOTPBox,    setShowOTPBox]    = useState(false); // show OTP input below error
  const [otp,           setOtp]           = useState("");
  const [otpLoading,    setOtpLoading]    = useState(false);
  const [otpError,      setOtpError]      = useState("");
  const [otpSuccess,    setOtpSuccess]    = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowOTPBox(false);
    setOtpError("");
    setOtpSuccess("");
    setResendSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user",  JSON.stringify(response.data.user));

      // Check if there is a redirect URL in query params
      const params   = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");

      if (redirect) {
        navigate(redirect);
        return;
      }

      const role = response.data.user.role;
      if      (role === "donor")     navigate("/donor/dashboard");
      else if (role === "admin")     navigate("/admin/dashboard");
      else if (role === "hospital")  navigate("/hospital/dashboard");
      else if (role === "ngo")       navigate("/ngo/dashboard");
      else if (role === "requester") navigate("/patient/dashboard");
      else                           navigate("/");

    } catch (err) {
      const message = err.response?.data?.message ||
        "Invalid email or password. Please check your credentials.";
      setError(message);

      // If backend says email not verified — show OTP box automatically
      if (err.response?.data?.requiresOTP) {
        setShowOTPBox(true);
      }
    }
    setLoading(false);
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    setResendLoading(true);
    setOtpError("");
    setResendSuccess("");
    try {
      await axios.post("http://localhost:5000/api/auth/resend-otp", { email });
      setResendSuccess("✅ New verification code sent! Check your email inbox.");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to resend. Please try again.");
    }
    setResendLoading(false);
  };

  // ── Verify OTP ─────────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });
      setOtpSuccess("✅ Email verified! You can now click Sign In to login.");
      setShowOTPBox(false);
      setError("");
      setOtp("");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Incorrect code. Please try again.");
    }
    setOtpLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Emergency redirect notice */}
      {new URLSearchParams(window.location.search).get("redirect")?.includes("emergency") && (
        <div className="bg-red-600 text-white text-center py-3 px-4">
          <p className="text-sm font-semibold">
            🚨 Please sign in to accept the emergency blood request
          </p>
        </div>
      )}

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

              {/* Success message after OTP verified */}
              {otpSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                  {otpSuccess}
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                  <span className="text-red-500 flex-shrink-0 mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* ── OTP VERIFICATION BOX — shown automatically if email not verified ── */}
              {showOTPBox && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">

                  <p className="text-sm font-semibold text-yellow-800">
                    📧 Verify your email to continue
                  </p>
                  <p className="text-xs text-yellow-700 leading-relaxed">
                    Your email <strong>{email}</strong> is not verified yet.
                    Click <strong>Resend Code</strong> to get a fresh 6-digit
                    verification code in your inbox, then enter it below.
                  </p>

                  {/* Resend button */}
                  <button
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
                  >
                    {resendLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                        Sending...
                      </span>
                    ) : "📨 Resend Verification Code"}
                  </button>

                  {/* Resend success */}
                  {resendSuccess && (
                    <p className="text-xs text-green-700 font-medium">{resendSuccess}</p>
                  )}

                  {/* OTP input */}
                  <div>
                    <label className="block text-xs font-medium text-yellow-800 mb-1.5">
                      Enter 6-digit verification code:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="w-full border-2 border-yellow-300 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all bg-white"
                    />
                  </div>

                  {/* OTP error */}
                  {otpError && (
                    <p className="text-xs text-red-600 font-medium">⚠️ {otpError}</p>
                  )}

                  {/* Verify button */}
                  <button
                    onClick={handleVerifyOTP}
                    disabled={otpLoading || otp.length !== 6}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                        Verifying...
                      </span>
                    ) : "✅ Verify Email"}
                  </button>

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
                  detect your account type and redirect you to the correct dashboard.
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