import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import Navbar from "../components/Navbar";
import { Droplets, Mail, ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";

const API = "http://localhost:5000/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Step 1 — enter email
  // Step 2 — enter OTP code
  // Step 3 — enter new password
  // Step 4 — success
  const [step, setStep] = useState(1);

  const [email,       setEmail]       = useState("");
  const [otp,         setOtp]         = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white";

  // ── STEP 1 — Send reset code ───────────────────────────────────────────
  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setStep(2);
      // Start 60 second resend timer
      setResendTimer(60);
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code. Please try again.");
    }
    setLoading(false);
  };

  // ── STEP 2 — Verify OTP ───────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setError("Please enter the complete 6-digit code."); return; }
    setLoading(true);
    setError("");
    // Just validate OTP length and move to step 3
    // Actual OTP validation happens on final reset
    setStep(3);
    setLoading(false);
  };

  // ── STEP 2 — Resend code ──────────────────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setResendTimer(60);
      const interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError("Failed to resend. Please try again.");
    }
    setLoading(false);
  };

  // ── STEP 3 — Reset password ───────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPass) { setError("Passwords do not match."); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
      // If OTP is wrong go back to step 2
      if (err.response?.data?.message?.includes("Incorrect") ||
          err.response?.data?.message?.includes("expired")) {
        setStep(2);
        setOtp("");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">

            {/* ── STEP 1 — Enter Email ── */}
            {step === 1 && (
              <>
                <CardHeader className="text-center pb-0 pt-8">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg">
                      <Droplets className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    Enter your registered email — we will send you a 6-digit reset code
                  </p>
                </CardHeader>
                <CardContent className="pt-6 pb-8 px-8 space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      ⚠️ {error}
                    </div>
                  )}
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="Enter your registered email"
                          required
                          className="w-full pl-10 pr-4 border border-gray-300 rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Sending Reset Code...
                        </span>
                      ) : "Send Reset Code"}
                    </button>
                  </form>
                  <div className="text-center">
                    <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors">
                      <ArrowLeft className="h-4 w-4" />Back to Login
                    </Link>
                  </div>
                </CardContent>
              </>
            )}

            {/* ── STEP 2 — Enter OTP ── */}
            {step === 2 && (
              <>
                <CardHeader className="text-center pb-0 pt-8">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    We sent a 6-digit reset code to:
                  </p>
                  <p className="text-red-600 font-semibold text-sm mt-1 break-all">{email}</p>
                </CardHeader>
                <CardContent className="pt-6 pb-8 px-8 space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      ⚠️ {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Reset Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-center text-3xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Code expires in 15 minutes. Check spam folder if you don't see it.
                    </p>
                  </div>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Verifying..." : "Continue →"}
                  </button>
                  <p className="text-sm text-gray-500 text-center">
                    Did not receive the code?{" "}
                    <button
                      onClick={handleResend}
                      disabled={resendTimer > 0}
                      className={`font-semibold transition-all ${
                        resendTimer > 0 ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:underline cursor-pointer"
                      }`}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                    </button>
                  </p>
                  <button
                    onClick={() => { setStep(1); setOtp(""); setError(""); }}
                    className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />Wrong email? Go back
                  </button>
                </CardContent>
              </>
            )}

            {/* ── STEP 3 — New Password ── */}
            {step === 3 && (
              <>
                <CardHeader className="text-center pb-0 pt-8">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    Choose a strong new password for your account
                  </p>
                </CardHeader>
                <CardContent className="pt-6 pb-8 px-8 space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      ⚠️ {error}
                    </div>
                  )}
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showPass ? "text" : "password"}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          required
                          className="w-full pl-10 pr-12 border border-gray-300 rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPass}
                          onChange={e => setConfirmPass(e.target.value)}
                          placeholder="Repeat new password"
                          required
                          className="w-full pl-10 pr-12 border border-gray-300 rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Password strength indicator */}
                    {newPassword && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                              newPassword.length >= i * 3
                                ? i <= 1 ? "bg-red-400"
                                : i <= 2 ? "bg-yellow-400"
                                : i <= 3 ? "bg-blue-400"
                                : "bg-green-500"
                                : "bg-gray-200"
                            }`} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">
                          {newPassword.length < 6 ? "Too short" :
                           newPassword.length < 8 ? "Weak" :
                           newPassword.length < 10 ? "Good" : "Strong"} password
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Resetting Password...
                        </span>
                      ) : "Reset Password"}
                    </button>
                  </form>
                </CardContent>
              </>
            )}

            {/* ── STEP 4 — Success ── */}
            {step === 4 && (
              <>
                <CardHeader className="text-center pb-0 pt-8">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Password Reset!</h2>
                  <p className="text-gray-500 mt-1 text-sm">
                    Your password has been reset successfully.
                    You can now log in with your new password.
                  </p>
                </CardHeader>
                <CardContent className="pt-6 pb-8 px-8">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition-all"
                  >
                    Go to Login
                  </button>
                </CardContent>
              </>
            )}

          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
