import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroImage from "../assets/hero-blood-donation.jpg";
import joinDonorImage from "../assets/join-donor-illustration.png";
import {
  Droplets, Heart, Users, Building, Shield, Clock,
  MapPin, CheckCircle, ArrowRight, Phone, Calendar,
  Building2, UserCheck, ToggleLeft, Award,
} from "lucide-react";

const Home = () => {
  const features = [
    { icon: Clock,      title: "Real-time Matching",              description: "Instant donor matching based on blood type and location" },
    { icon: Shield,     title: "Verified Requests",               description: "Only verified hospitals and NGOs can post emergency requests" },
    { icon: UserCheck,  title: "Consent-First Contact Sharing",   description: "Donor contact shared only after consent is given" },
    { icon: ToggleLeft, title: "Donor Availability Control",      description: "Toggle availability and control when you can donate" },
    { icon: Award,      title: "Donor Badges & Impact Stats",     description: "Track your donations and earn recognition badges" },
    { icon: Heart,      title: "Privacy First",                   description: "Complete privacy protection for all users" },
  ];

  const stats = [
    { number: "7,528", label: "Total Donors" },
    { number: "3,902", label: "Lives Saved" },
    { number: "9,282", label: "Requests Fulfilled" },
    { number: "102",   label: "Cities Covered" },
  ];

  const howItWorks = [
    { icon: Droplets, title: "Request Blood",        description: "Post your blood requirement with patient details and get matched with compatible donors instantly." },
    { icon: Clock,    title: "Get Instant Alerts",   description: "Verified donors receive instant notifications and can respond to urgent requests immediately." },
    { icon: MapPin,   title: "Find a Donor Nearby",  description: "Connect with verified donors in your area who match your blood type requirements." },
  ];

  const upcomingEvents = [
    {
      id: 1, title: "Community Blood Drive", organizer: "Bir Hospital",
      date: "April 10, 2026", time: "9:00 AM - 4:00 PM",
      location: "Kathmandu Community Center", address: "Bagbazar, Kathmandu",
      type: "Public Drive", bloodTypes: ["A+", "O+", "B+", "AB+"],
      icon: Building2, status: "Open",
    },
    {
      id: 2, title: "Emergency Blood Collection", organizer: "Nepal Red Cross",
      date: "April 15, 2026", time: "10:00 AM - 6:00 PM",
      location: "Patan Hospital", address: "Lagankhel, Lalitpur",
      type: "Emergency Drive", bloodTypes: ["O-", "A-", "B-"],
      icon: Heart, status: "Urgent",
    },
    {
      id: 3, title: "New Year Blood Campaign", organizer: "Hope Medical NGO",
      date: "April 20, 2026", time: "8:00 AM - 5:00 PM",
      location: "Tribhuvan University Campus", address: "Kirtipur, Kathmandu",
      type: "Campaign", bloodTypes: ["All Types"],
      icon: Users, status: "Upcoming",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden">
        <div
          className="relative bg-cover bg-center bg-no-repeat min-h-[85vh] flex items-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-gray-900/70 to-gray-900/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10 w-full">
            <div className="mx-auto max-w-4xl space-y-8">
              <Badge className="mb-4 bg-white/20 text-white backdrop-blur-sm border-white/30 px-4 py-2 text-sm font-medium">
                Trusted by 500+ Hospitals Worldwide
              </Badge>

              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl leading-tight">
                <span className="text-white">Save Lives Through</span>
                <span className="block hero-highlight mt-2">Blood Donation</span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg md:text-xl text-white/90 leading-relaxed">
                Connect patients in urgent need with compatible donors, hospitals, and NGOs in real time.
                Our platform ensures faster response times and trusted, verified requests.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  to="/create-request"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-lg font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 btn-glow"
                >
                  <Heart className="h-5 w-5" />
                  Find Blood Now
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-lg font-bold px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 btn-glow"
                >
                  <Users className="h-5 w-5" />
                  Become a Donor
                </Link>
              </div>

              <div className="pt-2">
                <Link
                  to="/emergency"
                  className="inline-flex items-center justify-center gap-2 bg-red-700/90 hover:bg-red-700 text-white text-lg font-bold px-12 py-4 rounded-xl border border-white/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 emergency-glow"
                >
                  <Phone className="h-5 w-5" />
                  Emergency Request
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="py-12 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{background: 'linear-gradient(145deg, #b91c1c 0%, #991b1b 100%)'}}>
            {/* Decorative circles */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
              <svg className="h-full w-full" viewBox="0 0 200 100" preserveAspectRatio="xMaxYMid slice">
                <circle cx="150" cy="50" r="60" fill="white" opacity="0.2" />
                <circle cx="180" cy="30" r="30" fill="white" opacity="0.15" />
              </svg>
            </div>
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`py-10 px-6 text-center ${index !== stats.length - 1 ? "border-r border-white/10" : ""}`}
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">{stat.number}</div>
                    <div className="text-sm md:text-base text-white font-medium tracking-wide uppercase opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Why Choose Jeevan Saarthi?</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with life-saving purpose
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="feature-card group">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 group-hover:bg-red-600 transition-all duration-300 flex-shrink-0">
                    <feature.icon className="h-7 w-7 text-red-600 group-hover:text-white transition-all duration-300" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-900">{feature.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING BLOOD DONATION EVENTS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">Upcoming Drives</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Blood Donation Events</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Join community blood drives organized by trusted hospitals and NGOs near you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="enhanced-card overflow-hidden group border-0">
                <CardContent className="p-6">
                  {/* Event Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 group-hover:bg-red-600 transition-all duration-300">
                        <event.icon className="h-6 w-6 text-red-600 group-hover:text-white transition-all duration-300" />
                      </div>
                      <Badge
                        className={
                          event.status === "Urgent"   ? "bg-red-100 text-red-700 border-red-200" :
                          event.status === "Open"     ? "bg-blue-100 text-blue-700 border-blue-200" :
                          "bg-gray-100 text-gray-700 border-gray-200"
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-xl text-gray-900 leading-tight">{event.title}</h3>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <Building className="h-4 w-4 text-red-400 flex-shrink-0" />
                        <span className="font-medium">{event.organizer}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 text-red-400 flex-shrink-0" />
                        <span>{event.date} · {event.time}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mt-0.5 text-red-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-700">{event.location}</div>
                          <div className="text-xs text-gray-400">{event.address}</div>
                        </div>
                      </div>
                    </div>

                    {/* Blood types needed */}
                    <div className="pt-2">
                      <p className="text-sm font-semibold mb-2 text-gray-700">Blood Types Needed:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.bloodTypes.map((type, i) => (
                          <Badge key={i} variant="outline" className="text-xs font-medium border-red-200 text-red-600">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
                    <Link
                      to="/register"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Heart className="h-4 w-4" />
                      Join Event
                    </Link>
                    <Link
                      to="/help"
                      className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white font-bold px-10 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              View All Events
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-gradient-to-b from-gray-50 via-gray-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">How Jeevan Saarthi Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div
                key={index}
                className="relative bg-white rounded-2xl p-8 text-center shadow-card hover:shadow-card-hover premium-transition border border-gray-100 group"
              >
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 premium-transition">
                  <step.icon className="h-10 w-10 text-white" />
                </div>

                <h3 className="font-bold text-xl mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN AS DONOR — with illustration image ── */}
      <section className="relative py-28 lg:py-36 overflow-hidden bg-gradient-to-br from-white via-gray-50/30 to-red-50/20">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-green-600/5 rounded-full blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">

            {/* Left text */}
            <div className="flex-1 space-y-8 text-center lg:text-left max-w-xl">
              <div className="space-y-4">
                <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">Make a Difference</span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-gray-400 italic font-light">Your</span>{" "}
                  <span className="text-gray-900 font-bold">Contribution,</span>
                  <br />
                  <span className="text-gray-400 italic font-light">Someone's</span>{" "}
                  <span className="text-red-600 font-bold">Lifeline</span>
                </h2>
              </div>

              <p className="text-xl md:text-2xl font-medium text-gray-500">
                Become a Blood Donor Today
              </p>

              <div className="pt-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-lg font-bold px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 btn-glow"
                >
                  <Heart className="h-5 w-5" />
                  Join as a Donor
                </Link>
              </div>
            </div>

            {/* Right illustration */}
            <div className="flex-1 flex justify-center lg:justify-end relative">
              <img
                src={joinDonorImage}
                alt="Blood donation illustration showing doctor and donor connecting"
                className="relative z-10 max-w-full h-auto w-full max-w-lg lg:max-w-xl object-contain"
                style={{
                  filter: "drop-shadow(0 8px 30px rgba(185, 28, 28, 0.1))",
                  mixBlendMode: "multiply",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900/95 to-gray-900 shadow-2xl">
            {/* Dot pattern overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#dots)" />
              </svg>
            </div>

            <div className="relative z-10 p-12 md:p-16 lg:p-20 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                Ready to Save Lives?
              </h2>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of donors and hospitals making a difference every day
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-100 font-bold px-12 py-4 rounded-xl shadow-xl hover:shadow-2xl text-lg transition-all duration-300"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/help"
                  className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-10 py-4 rounded-xl text-lg transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
