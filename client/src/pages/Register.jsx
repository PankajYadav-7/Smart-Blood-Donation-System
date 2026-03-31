import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import {
  Droplets, User, Building, Users, Eye, EyeOff,
  Upload, CheckCircle,
} from "lucide-react";

const Register = () => {
  const navigate  = useNavigate();
  const [userType, setUserType]     = useState("donor");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", confirmPassword: "",
    bloodType: "", age: "", location: "", lastDonation: "",
    hospitalName: "", license: "", address: "",
    orgName: "", registration: "", mission: "",
  });

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const tabs = [
    { value: "donor",     label: "Donor",    icon: User },
    { value: "requester", label: "Patient",  icon: User },
    { value: "hospital",  label: "Hospital", icon: Building },
    { value: "ngo",       label: "NGO",      icon: Users },
  ];

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) { setError("Please accept the Terms of Service to continue."); return; }
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match."); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    setError("");

    const fullName = (userType === "hospital")  ? formData.hospitalName
                   : (userType === "ngo")        ? formData.orgName
                   : `${formData.firstName} ${formData.lastName}`.trim();

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        fullName, email: formData.email, password: formData.password, role: userType,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user",  JSON.stringify(response.data.user));

      const role = response.data.user.role;
      if      (role === "donor")     navigate("/donor/dashboard");
      else if (role === "hospital")  navigate("/hospital/dashboard");
      else if (role === "ngo")       navigate("/ngo/dashboard");
      else if (role === "requester") navigate("/patient/dashboard");
      else                           navigate("/");

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <Card className="medical-shadow border-0 shadow-xl">

            {/* Header */}
            <CardHeader className="text-center pb-2 pt-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg">
                  <Droplets className="h-7 w-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Join Jeevan Saarthi
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                Create your account and start saving lives today
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 pb-8 px-8">

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Role Tabs */}
                <div>
                  <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-xl p-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setUserType(tab.value)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          userType === tab.value
                            ? "bg-white text-red-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <tab.icon className="h-3.5 w-3.5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donor / Patient Form */}
                {(userType === "donor" || userType === "requester") && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>First Name *</label>
                        <input className={inputCls} placeholder="Pankaj" value={formData.firstName} onChange={e => set("firstName", e.target.value)} required />
                      </div>
                      <div>
                        <label className={labelCls}>Last Name *</label>
                        <input className={inputCls} placeholder="Yadav" value={formData.lastName} onChange={e => set("lastName", e.target.value)} required />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Email *</label>
                      <input className={inputCls} type="email" placeholder="your@email.com" value={formData.email} onChange={e => set("email", e.target.value)} required />
                    </div>

                    <div>
                      <label className={labelCls}>Phone Number *</label>
                      <input className={inputCls} type="tel" placeholder="+977-98XXXXXXXX" value={formData.phone} onChange={e => set("phone", e.target.value)} required />
                    </div>

                    {userType === "donor" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Blood Type</label>
                          <select className={inputCls} value={formData.bloodType} onChange={e => set("bloodType", e.target.value)}>
                            <option value="">Select blood type</option>
                            {bloodTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Age *</label>
                          <input className={inputCls} type="number" placeholder="25" min="18" max="65" value={formData.age} onChange={e => set("age", e.target.value)} required />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className={labelCls}>Location *</label>
                      <input className={inputCls} placeholder="Kathmandu, Nepal" value={formData.location} onChange={e => set("location", e.target.value)} required />
                    </div>

                    {userType === "donor" && (
                      <div>
                        <label className={labelCls}>Last Donation Date <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input className={inputCls} type="date" value={formData.lastDonation} onChange={e => set("lastDonation", e.target.value)} />
                      </div>
                    )}
                  </div>
                )}

                {/* Hospital Form */}
                {userType === "hospital" && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Hospital Name *</label>
                      <input className={inputCls} placeholder="Bir Hospital" value={formData.hospitalName} onChange={e => set("hospitalName", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Official Email *</label>
                      <input className={inputCls} type="email" placeholder="contact@hospital.com" value={formData.email} onChange={e => set("email", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number *</label>
                      <input className={inputCls} type="tel" placeholder="+977-01-XXXXXXX" value={formData.phone} onChange={e => set("phone", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Medical License Number *</label>
                      <input className={inputCls} placeholder="License #12345" value={formData.license} onChange={e => set("license", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Hospital Address *</label>
                      <textarea className={inputCls} rows={2} placeholder="Full hospital address" value={formData.address} onChange={e => set("address", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Upload Verification Documents</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer">
                        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Upload medical license, registration certificate</p>
                        <button type="button" className="mt-2 text-xs border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50">Choose Files</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* NGO Form */}
                {userType === "ngo" && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Organisation Name *</label>
                      <input className={inputCls} placeholder="Nepal Red Cross" value={formData.orgName} onChange={e => set("orgName", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Official Email *</label>
                      <input className={inputCls} type="email" placeholder="contact@ngo.org" value={formData.email} onChange={e => set("email", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number *</label>
                      <input className={inputCls} type="tel" placeholder="+977-98XXXXXXXX" value={formData.phone} onChange={e => set("phone", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Registration Number *</label>
                      <input className={inputCls} placeholder="NGO Registration #" value={formData.registration} onChange={e => set("registration", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Mission Statement</label>
                      <textarea className={inputCls} rows={3} placeholder="Describe your organisation's mission" value={formData.mission} onChange={e => set("mission", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Upload Verification Documents</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer">
                        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Upload registration certificate, tax exemption documents</p>
                        <button type="button" className="mt-2 text-xs border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50">Choose Files</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Password *</label>
                    <div className="relative">
                      <input
                        className={inputCls + " pr-10"}
                        type={showPass ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={e => set("password", e.target.value)}
                        required
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Confirm Password *</label>
                    <div className="relative">
                      <input
                        className={inputCls + " pr-10"}
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repeat password"
                        value={formData.confirmPassword}
                        onChange={e => set("confirmPassword", e.target.value)}
                        required
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={e => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <span className="text-red-600 hover:underline cursor-pointer">Terms of Service</span>
                    {" "}and{" "}
                    <span className="text-red-600 hover:underline cursor-pointer">Privacy Policy</span>
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-base shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Creating Account...
                    </span>
                  ) : "Create Account"}
                </button>
              </form>

              {/* Login link */}
              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-red-600 hover:underline font-semibold">
                  Sign in
                </Link>
              </p>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
