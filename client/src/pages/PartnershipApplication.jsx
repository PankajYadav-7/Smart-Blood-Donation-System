import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Building2, ArrowLeft, Shield, Users, Award,
  CheckCircle, ArrowRight, Heart, Star, Zap,
} from "lucide-react";

const PartnershipApplication = () => {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "null");

  const benefits = [
    {
      icon: Shield,
      title: "Official Verified Badge",
      desc: "Get a verified partner badge displayed on your organisation profile visible to all donors and patients across Nepal.",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Zap,
      title: "Priority Emergency Alerts",
      desc: "Your organisation receives emergency blood request alerts before general notifications — ensuring fastest possible response.",
      color: "bg-red-50 text-red-600",
    },
    {
      icon: Star,
      title: "Featured on Events Page",
      desc: "Your blood donation drives get featured placement on the public Events page and Home page — maximum donor visibility.",
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      icon: Users,
      title: "Donor Network Access",
      desc: "Access aggregate donor availability data for your city — know how many compatible donors are available before posting requests.",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: Award,
      title: "Impact Analytics",
      desc: "Get a dedicated analytics dashboard showing total donors matched, events organised, units collected and lives impacted.",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: Heart,
      title: "Partnership Certificate",
      desc: "Receive an official Jeevan Saarthi Partnership Certificate you can display on your website and premises.",
      color: "bg-pink-50 text-pink-600",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Register Your Organisation",
      desc: "Create your hospital or NGO account on Jeevan Saarthi. Fill in your organisation details, contact information and address.",
    },
    {
      step: "2",
      title: "Admin Verification",
      desc: "Our admin team reviews your registration within 24-48 hours. Once approved you become a verified organisation on the platform.",
    },
    {
      step: "3",
      title: "Apply for Partnership",
      desc: "From your verified dashboard, apply for Partner status. Our team reviews your application and activates partner benefits.",
    },
    {
      step: "4",
      title: "Partner Benefits Active",
      desc: "Your gold partner badge goes live. You get priority alerts, featured placement, analytics dashboard and all partner benefits.",
    },
  ];

  const difference = [
    {
      feature: "Verified Badge",
      registered: "✅ Basic",
      partner: "⭐ Gold Partner Badge",
    },
    {
      feature: "Emergency Alerts",
      registered: "Standard notifications",
      partner: "Priority — first to know",
    },
    {
      feature: "Blood Drive Events",
      registered: "Listed on Events page",
      partner: "Featured on Home page",
    },
    {
      feature: "Analytics",
      registered: "Basic dashboard stats",
      partner: "Full impact analytics",
    },
    {
      feature: "Donor Visibility",
      registered: "Standard listing",
      partner: "Top of Hospitals page",
    },
    {
      feature: "Support",
      registered: "Standard support",
      partner: "Priority 24/7 support",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-red-950 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
            <Star className="h-3.5 w-3.5" />Partner Programme
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Become a Jeevan Saarthi Partner
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Partner hospitals and NGOs get priority features, gold verification badge,
            featured placement and full analytics — helping more lives across Nepal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!token ? (
              <Link to="/register"
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl transition-all text-base">
                <Building2 className="h-5 w-5" />Register Your Organisation
              </Link>
            ) : user?.role === "hospital" || user?.role === "ngo" ? (
              <Link to={user.role === "hospital" ? "/hospital/dashboard" : "/ngo/dashboard"}
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl transition-all text-base">
                <Building2 className="h-5 w-5" />Go to My Dashboard
              </Link>
            ) : (
              <Link to="/register"
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl transition-all text-base">
                <Building2 className="h-5 w-5" />Register Your Organisation
              </Link>
            )}
            <Link to="/hospitals"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 font-bold px-8 py-4 rounded-xl transition-all text-base">
              View Current Partners
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Back link */}
        <Link to="/hospitals" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 text-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Hospitals
        </Link>

        {/* Benefits Grid */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">Exclusive Benefits</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">What Partner Organisations Get</h2>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
              Partner status gives your organisation exclusive features that go far beyond standard registration
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-2xl ${b.color} flex items-center justify-center mb-4`}>
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">Comparison</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Registered vs Partner</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
              <div className="p-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Feature</div>
              <div className="p-4 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-l border-gray-100">
                Registered
              </div>
              <div className="p-4 text-sm font-bold text-yellow-700 uppercase tracking-wider text-center border-l border-gray-100 bg-yellow-50">
                ⭐ Partner
              </div>
            </div>
            {difference.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 border-b border-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                <div className="p-4 text-sm font-semibold text-gray-700">{row.feature}</div>
                <div className="p-4 text-sm text-gray-500 text-center border-l border-gray-100">{row.registered}</div>
                <div className="p-4 text-sm text-yellow-700 font-semibold text-center border-l border-gray-100 bg-yellow-50/50">{row.partner}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">Process</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">How to Become a Partner</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="w-14 h-14 rounded-full bg-red-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {step.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-3 top-5 h-6 w-6 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-10 text-center text-white">
          <Star className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3">Ready to Partner with Us?</h2>
          <p className="text-red-100 text-lg mb-8 max-w-2xl mx-auto">
            Start by registering your organisation. Once verified by our admin team
            you can apply for partner status directly from your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-red-600 hover:bg-gray-100 font-bold px-10 py-4 rounded-xl transition-all text-base shadow-xl">
              <Building2 className="h-5 w-5" />Register as Hospital/NGO
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/hospitals"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 font-bold px-8 py-4 rounded-xl transition-all text-base">
              View Current Partners
            </Link>
          </div>
          <p className="text-red-200 text-xs mt-6">
            Already registered? Log in to your dashboard and apply for partnership from there.
          </p>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default PartnershipApplication;
