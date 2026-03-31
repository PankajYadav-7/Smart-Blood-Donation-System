import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Building2, ArrowLeft, Upload, Shield, Users,
  Award, CheckCircle, FileText, Phone, Mail, MapPin,
} from "lucide-react";

const PartnershipApplication = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    hospitalName: "", hospitalType: "", licenseNumber: "",
    contactPerson: "", contactEmail: "", contactPhone: "",
    address: "", city: "", state: "", zipCode: "",
    website: "", description: "", operatingHours: "",
    expectedDonations: "", hasBloodBank: false,
    hasEmergencyServices: false, agreesToTerms: false,
    servicesOffered: [],
  });

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const toggleService = (service) => {
    setFormData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter(s => s !== service)
        : [...prev.servicesOffered, service],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const benefits = [
    { icon: Shield,      title: "Verified Partnership",  desc: "Official verification badge and trusted status on the platform" },
    { icon: Users,       title: "Priority Support",      desc: "24/7 technical support and dedicated assistance" },
    { icon: Award,       title: "Analytics Dashboard",   desc: "Real-time donation metrics and insights" },
    { icon: CheckCircle, title: "Smart Matching",        desc: "Automatic donor matching based on blood type and location" },
  ];

  const services = [
    "Emergency Care","Blood Bank","Surgery","ICU",
    "Cardiology","Oncology","Pediatrics","Orthopedics",
    "General Medicine","Laboratory Services",
  ];

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
          <p className="text-gray-500 mb-8 text-lg">
            Thank you for applying to partner with Jeevan Saarthi. Our team will review your
            application within 2–3 business days and contact you via email.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Application received and logged</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Document verification by our team</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Email notification with decision</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Account activation and onboarding</li>
            </ul>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/hospitals")}>View Hospitals</Button>
            <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <Link to="/hospitals" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Hospitals
        </Link>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Hospital Partnership Application</h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Join our network of verified hospitals and medical centers to streamline blood donation
            and help save lives in your community.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar benefits */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md sticky top-20">
              <CardHeader>
                <CardTitle>Partnership Benefits</CardTitle>
                <CardDescription>What you will get as a verified partner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                      <b.icon className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">{b.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                ))}

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                  <p className="text-xs text-red-700">
                    All applications are reviewed within <strong>2–3 business days</strong>.
                    You will receive an email confirmation once approved.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Hospital Information */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-5 w-5 text-red-600" />Hospital Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Hospital Name *</label>
                      <input className={inputCls} placeholder="Enter hospital name" value={formData.hospitalName} onChange={e => set("hospitalName", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Hospital Type *</label>
                      <select className={inputCls} value={formData.hospitalType} onChange={e => set("hospitalType", e.target.value)} required>
                        <option value="">Select type</option>
                        <option value="general">General Hospital</option>
                        <option value="medical-center">Medical Center</option>
                        <option value="private">Private Hospital</option>
                        <option value="specialty">Specialty Hospital</option>
                        <option value="ngo">NGO / Non-profit</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Medical License Number *</label>
                      <input className={inputCls} placeholder="Enter license number" value={formData.licenseNumber} onChange={e => set("licenseNumber", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Website</label>
                      <input className={inputCls} type="url" placeholder="https://hospital.com" value={formData.website} onChange={e => set("website", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Hospital Description</label>
                    <textarea className={inputCls} rows={3} placeholder="Brief description of your hospital and its services..." value={formData.description} onChange={e => set("description", e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5 text-red-600" />Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Contact Person *</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input className={inputCls + " pl-10"} placeholder="Full name" value={formData.contactPerson} onChange={e => set("contactPerson", e.target.value)} required />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input className={inputCls + " pl-10"} type="email" placeholder="contact@hospital.com" value={formData.contactEmail} onChange={e => set("contactEmail", e.target.value)} required />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input className={inputCls + " pl-10"} type="tel" placeholder="+977-98XXXXXXXX" value={formData.contactPhone} onChange={e => set("contactPhone", e.target.value)} required />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-5 w-5 text-red-600" />Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className={labelCls}>Street Address *</label>
                    <input className={inputCls} placeholder="123 Healthcare Avenue" value={formData.address} onChange={e => set("address", e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>City *</label>
                      <input className={inputCls} placeholder="Kathmandu" value={formData.city} onChange={e => set("city", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Province *</label>
                      <input className={inputCls} placeholder="Bagmati" value={formData.state} onChange={e => set("state", e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>PIN Code *</label>
                      <input className={inputCls} placeholder="44600" value={formData.zipCode} onChange={e => set("zipCode", e.target.value)} required />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services & Capabilities */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Award className="h-5 w-5 text-red-600" />Services & Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <label className={labelCls}>Services Offered</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {services.map(service => (
                        <label key={service} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.servicesOffered.includes(service)}
                            onChange={() => toggleService(service)}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" checked={formData.hasBloodBank} onChange={e => set("hasBloodBank", e.target.checked)} className="w-4 h-4 text-red-600 rounded" />
                      <span className="text-sm font-medium text-gray-700">Has Blood Bank Facility</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" checked={formData.hasEmergencyServices} onChange={e => set("hasEmergencyServices", e.target.checked)} className="w-4 h-4 text-red-600 rounded" />
                      <span className="text-sm font-medium text-gray-700">24/7 Emergency Services</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Operating Hours</label>
                      <input className={inputCls} placeholder="e.g. 24/7 or 8:00 AM – 6:00 PM" value={formData.operatingHours} onChange={e => set("operatingHours", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Expected Monthly Donations</label>
                      <select className={inputCls} value={formData.expectedDonations} onChange={e => set("expectedDonations", e.target.value)}>
                        <option value="">Select range</option>
                        <option value="1-50">1–50 donations</option>
                        <option value="51-100">51–100 donations</option>
                        <option value="101-250">101–250 donations</option>
                        <option value="251-500">251–500 donations</option>
                        <option value="500+">500+ donations</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Upload */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-5 w-5 text-red-600" />Required Documents
                  </CardTitle>
                  <CardDescription>Upload required verification documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["Medical License", "Hospital Registration Certificate"].map((doc) => (
                      <div key={doc}>
                        <label className={labelCls}>{doc}</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-300 hover:bg-red-50 transition-colors cursor-pointer">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Click to upload {doc}</p>
                          <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG up to 5MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Terms & Submit */}
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6 space-y-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreesToTerms}
                      onChange={e => set("agreesToTerms", e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded mt-0.5 flex-shrink-0"
                      required
                    />
                    <span className="text-sm text-gray-600 leading-relaxed">
                      I agree to the{" "}
                      <span className="text-red-600 hover:underline cursor-pointer">Terms of Service</span>
                      {" "}and{" "}
                      <span className="text-red-600 hover:underline cursor-pointer">Privacy Policy</span>.
                      I confirm that all information provided is accurate and that our organisation
                      meets the requirements for partnership with Jeevan Saarthi.
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="submit" size="lg" className="flex-1" disabled={!formData.agreesToTerms}>
                      <Building2 className="h-5 w-5 mr-2" />
                      Submit Application
                    </Button>
                    <Button type="button" size="lg" variant="outline" onClick={() => navigate("/help")}>
                      <Phone className="h-5 w-5 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PartnershipApplication;
