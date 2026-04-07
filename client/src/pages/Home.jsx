import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroImage from "../assets/hero-blood-donation.jpg";
import joinDonorImage from "../assets/join-donor-illustration.png";
import {
  Droplets, Heart, Users, Building, Shield, Clock,
  MapPin, CheckCircle, ArrowRight, Phone, Calendar,
  Building2, UserCheck, ToggleLeft, Award, Star, Quote,
} from "lucide-react";

const Home = () => {

  // ── Live stats from database ──
  const [stats, setStats] = useState([
    { number: "...", label: "Donors Registered"   },
    { number: "3",   label: "Lives Saved Per Donation" },
    { number: "...", label: "Verified Organisations" },
    { number: "...", label: "Requests Need Help Now" },
  ]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/stats")
      .then(res => {
        setStats([
          { number: res.data.donors,        label: "Donors Registered"        },
          { number: "3",                    label: "Lives Saved Per Donation"  },
          { number: res.data.organisations, label: "Verified Organisations"   },
          { number: res.data.openRequests,  label: "Requests Need Help Now"   },
        ]);
      })
      .catch(() => {});
  }, []);

  const features = [
    { icon: Clock,      title: "Real-time Matching",            description: "Instant donor matching based on blood type and location" },
    { icon: Shield,     title: "Verified Requests",             description: "Only verified hospitals and NGOs can post emergency requests" },
    { icon: UserCheck,  title: "Consent-First Contact Sharing", description: "Donor contact shared only after consent is given" },
    { icon: ToggleLeft, title: "Donor Availability Control",    description: "Toggle availability and control when you can donate" },
    { icon: Award,      title: "Donor Badges & Impact Stats",   description: "Track your donations and earn recognition badges" },
    { icon: Heart,      title: "Privacy First",                 description: "Complete privacy protection for all users" },
  ];

  const howItWorks = [
    { icon: Droplets, title: "Request Blood",       description: "Post your blood requirement with patient details and get matched with compatible donors instantly." },
    { icon: Clock,    title: "Get Instant Alerts",  description: "Verified donors receive instant notifications and can respond to urgent requests immediately." },
    { icon: MapPin,   title: "Find a Donor Nearby", description: "Connect with verified donors in your area who match your blood type requirements." },
  ];

  const upcomingEvents = [
    {
      id: 1, title: "Community Blood Drive", organizer: "Bir Hospital",
      date: "Kathmandu", time: "9:00 AM - 4:00 PM",
      location: "Kathmandu Community Center", address: "Bagbazar, Kathmandu",
      bloodTypes: ["A+", "O+", "B+", "AB+"], icon: Building2, status: "Open",
    },
    {
      id: 2, title: "Emergency Blood Collection", organizer: "Nepal Red Cross",
      date: "Lalitpur", time: "10:00 AM - 6:00 PM",
      location: "Patan Hospital", address: "Lagankhel, Lalitpur",
      bloodTypes: ["O-", "A-", "B-"], icon: Heart, status: "Urgent",
    },
    {
      id: 3, title: "Campus Blood Campaign", organizer: "Hope Medical NGO",
      date: "Kirtipur", time: "8:00 AM - 5:00 PM",
      location: "Tribhuvan University Campus", address: "Kirtipur, Kathmandu",
      bloodTypes: ["All Types"], icon: Users, status: "Upcoming",
    },
  ];

  const bloodCompatibility = [
    { type: "O-",  canDonateTo: ["O-","O+","A-","A+","B-","B+","AB-","AB+"], canReceiveFrom: ["O-"],                                label: "Universal Donor",    color: "bg-red-600"    },
    { type: "O+",  canDonateTo: ["O+","A+","B+","AB+"],                       canReceiveFrom: ["O-","O+"],                           label: "Most Common",        color: "bg-red-500"    },
    { type: "A-",  canDonateTo: ["A-","A+","AB-","AB+"],                      canReceiveFrom: ["O-","A-"],                           label: "High Demand",        color: "bg-blue-600"   },
    { type: "A+",  canDonateTo: ["A+","AB+"],                                  canReceiveFrom: ["O-","O+","A-","A+"],                 label: "Common",             color: "bg-blue-500"   },
    { type: "B-",  canDonateTo: ["B-","B+","AB-","AB+"],                      canReceiveFrom: ["O-","B-"],                           label: "Rare Type",          color: "bg-green-600"  },
    { type: "B+",  canDonateTo: ["B+","AB+"],                                  canReceiveFrom: ["O-","O+","B-","B+"],                 label: "Moderate Demand",    color: "bg-green-500"  },
    { type: "AB-", canDonateTo: ["AB-","AB+"],                                 canReceiveFrom: ["O-","A-","B-","AB-"],                label: "Rare",               color: "bg-purple-600" },
    { type: "AB+", canDonateTo: ["AB+"],                                       canReceiveFrom: ["O-","O+","A-","A+","B-","B+","AB-","AB+"], label: "Universal Receiver", color: "bg-purple-500" },
  ];

  const testimonials = [
    {
      name: "Emergency Department",
      role: "Hospital Staff",
      hospital: "Kathmandu, Nepal",
      message: "Finding compatible blood donors manually during emergencies takes hours. A platform that instantly matches donors by blood type and notifies them automatically would drastically cut response time and save more lives.",
      rating: 5, avatar: "ED", color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Voluntary Blood Donor",
      role: "Regular Donor",
      hospital: "Lalitpur, Nepal",
      message: "What matters most as a donor is control over my own information. Knowing that my contact details are only shared after I personally agree to help makes me feel safe and encourages me to stay registered and available.",
      rating: 5, avatar: "VD", color: "bg-green-100 text-green-700",
    },
    {
      name: "Blood Drive Coordinator",
      role: "NGO Programme Staff",
      hospital: "Kathmandu, Nepal",
      message: "Organising blood donation drives manually using phone calls and spreadsheets is slow and unreliable. A centralised system that posts requests and automatically matches donors would make every campaign far more effective.",
      rating: 5, avatar: "BC", color: "bg-red-100 text-red-700",
    },
  ];

  const nepalStats = [
    { number: "40%",     label: "Blood Shortage",       description: "Nepal faces up to 40% blood shortage every year during emergencies",           icon: Droplets, color: "text-red-600 bg-red-50"    },
    { number: "2 hrs",   label: "Average Wait Time",    description: "Average time families spend searching for blood donors manually in Nepal",      icon: Clock,    color: "text-orange-600 bg-orange-50" },
    { number: "180,000", label: "Annual Blood Demand",  description: "Units of blood needed annually across Nepal's hospitals and medical facilities", icon: Heart,    color: "text-pink-600 bg-pink-50"     },
    { number: "67%",     label: "Replacement Donation", description: "Of Nepal's blood supply comes from replacement donation rather than voluntary",  icon: Users,    color: "text-blue-600 bg-blue-50"     },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ── */}
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
                Connecting Donors, Patients and Hospitals Across Nepal
              </Badge>

              {/* ── NEW HEADLINE ── */}
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-tight">
                <span className="text-white">Someone Is Already Looking For</span>
                <span className="block hero-highlight mt-2">Your Blood Type Right Now</span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg md:text-xl text-white/90 leading-relaxed">
                Connect patients in urgent need with compatible donors, hospitals, and NGOs in real time.
                Our platform ensures faster response times and trusted, verified requests.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/create-request" className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-lg font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 btn-glow">
                  <Heart className="h-5 w-5" />Find Blood Now
                </Link>
                <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-lg font-bold px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 btn-glow">
                  <Users className="h-5 w-5" />Become a Donor
                </Link>
              </div>
              <div className="pt-2">
                <Link to="/emergency" className="inline-flex items-center justify-center gap-2 bg-red-700/90 hover:bg-red-700 text-white text-lg font-bold px-12 py-4 rounded-xl border border-white/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 emergency-glow">
                  <Phone className="h-5 w-5" />Emergency Request
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE STATS ── */}
      <section className="py-12 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{background: 'linear-gradient(145deg, #b91c1c 0%, #991b1b 100%)'}}>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
              <svg className="h-full w-full" viewBox="0 0 200 100" preserveAspectRatio="xMaxYMid slice">
                <circle cx="150" cy="50" r="60" fill="white" opacity="0.2" />
                <circle cx="180" cy="30" r="30" fill="white" opacity="0.15" />
              </svg>
            </div>
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className={`py-10 px-6 text-center ${index !== stats.length - 1 ? "border-r border-white/10" : ""}`}>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">{stat.number}</div>
                  <div className="text-sm md:text-base text-white font-medium tracking-wide uppercase opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NEPAL BLOOD CRISIS ── */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs><pattern id="grid2" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white"/></pattern></defs>
            <rect width="100" height="100" fill="url(#grid2)"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <span className="text-red-400 font-semibold text-sm tracking-wider uppercase">The Nepal Blood Crisis</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">Why Jeevan Saarthi Matters</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Nepal faces a critical blood shortage crisis every year. These numbers show exactly why a real-time digital platform is urgently needed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nepalStats.map((stat, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 text-center group">
                <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-7 w-7" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-red-400 font-semibold text-sm mb-3 uppercase tracking-wide">{stat.label}</div>
                <p className="text-gray-400 text-xs leading-relaxed">{stat.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-gray-500 text-xs">
              Sources: WHO Blood Safety Report 2023 · Nepal Health Research Council · Ministry of Health Nepal
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Why Choose Jeevan Saarthi?</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Our platform combines cutting-edge technology with life-saving purpose</p>
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

      {/* ── BLOOD COMPATIBILITY CHART ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">Medical Reference</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Blood Type Compatibility Guide</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Understanding blood type compatibility is the core of our matching algorithm.
              Our system automatically checks these rules for every single request.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { title: "O- is the Universal Donor",  desc: "O Negative can donate to ALL blood types — the most critical type in emergencies. Always in highest demand.", color: "bg-red-50 border-red-200 text-red-700" },
              { title: "AB+ is Universal Receiver",   desc: "AB Positive can receive blood from ALL types — but can only donate to AB+. Rarest in donation value.",       color: "bg-purple-50 border-purple-200 text-purple-700" },
              { title: "Rh Factor is Critical",       desc: "Rh Negative patients CANNOT receive Rh Positive blood. Our system checks this automatically for every match.", color: "bg-blue-50 border-blue-200 text-blue-700" },
            ].map((fact, i) => (
              <div key={i} className={`border-2 rounded-2xl p-5 ${fact.color}`}>
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />{fact.title}
                </h4>
                <p className="text-sm leading-relaxed opacity-85">{fact.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {bloodCompatibility.map((blood, index) => (
              <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className={`${blood.color} py-5 text-center`}>
                  <div className="text-3xl font-bold text-white">{blood.type}</div>
                  <div className="text-white/80 text-xs mt-1 font-medium">{blood.label}</div>
                </div>
                <div className="p-4 bg-white">
                  <div className="mb-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Can Donate To</p>
                    <div className="flex flex-wrap gap-1">
                      {blood.canDonateTo.map((t, i) => (
                        <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Can Receive From</p>
                    <div className="flex flex-wrap gap-1">
                      {blood.canReceiveFrom.map((t, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-6 bg-gray-50 border border-gray-200 rounded-2xl px-8 py-4">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-green-500 inline-block" />
                <span className="text-sm text-gray-600">Can donate to (green)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-500 inline-block" />
                <span className="text-sm text-gray-600">Can receive from (blue)</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-red-600" />
                <span className="text-sm text-gray-600">All checks are automatic in our system</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">Upcoming Drives</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Blood Donation Events</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Join community blood drives organised by trusted hospitals and NGOs near you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="enhanced-card overflow-hidden group border-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 group-hover:bg-red-600 transition-all duration-300">
                        <event.icon className="h-6 w-6 text-red-600 group-hover:text-white transition-all duration-300" />
                      </div>
                      <Badge className={
                        event.status === "Urgent"   ? "bg-red-100 text-red-700 border-red-200" :
                        event.status === "Open"     ? "bg-blue-100 text-blue-700 border-blue-200" :
                        "bg-gray-100 text-gray-700 border-gray-200"
                      }>{event.status}</Badge>
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 leading-tight mb-4">{event.title}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <Building className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <span className="font-medium">{event.organizer}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mt-0.5 text-red-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-700">{event.location}</div>
                        <div className="text-xs text-gray-400">{event.address}</div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 mb-6">
                    <p className="text-sm font-semibold mb-2 text-gray-700">Blood Types Needed:</p>
                    <div className="flex flex-wrap gap-2">
                      {event.bloodTypes.map((type, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-medium border-red-200 text-red-600">{type}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 border-t border-gray-100 pt-4">
                    <Link to="/register" className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200">
                      <Heart className="h-4 w-4" />Join Event
                    </Link>
                    <Link to="/help" className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Learn More
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-16">
            <Link to="/donate" className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white font-bold px-10 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
              View All Events<ArrowRight className="h-5 w-5" />
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
              <div key={index} className="relative bg-white rounded-2xl p-8 text-center shadow-card hover:shadow-card-hover premium-transition border border-gray-100 group">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center shadow-lg">{index + 1}</div>
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

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">Trusted By Many</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">What People Are Saying</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Donors, hospitals and NGOs across Nepal share their experience with Jeevan Saarthi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((t, index) => (
              <div key={index} className="bg-gray-50 border border-gray-100 rounded-2xl p-7 hover:shadow-lg transition-all duration-300 relative group">
                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote className="h-12 w-12 text-red-600" />
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm italic">"{t.message}"</p>
                <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
                  <div className={`w-11 h-11 rounded-full ${t.color} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                    <p className="text-xs text-red-600 font-medium">{t.hospital}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield,      label: "Verified Platform",     desc: "All organisations verified by admin before posting requests" },
              { icon: UserCheck,   label: "Consent-First Privacy", desc: "Your contact is shared only with your explicit consent" },
              { icon: Award,       label: "WHO Guidelines",        desc: "Built following WHO blood safety and donation guidelines" },
              { icon: CheckCircle, label: "100% Free Service",     desc: "No charges for donors, patients or hospitals ever" },
            ].map((badge, i) => (
              <div key={i} className="text-center p-5 bg-red-50 border border-red-100 rounded-2xl hover:bg-red-100 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center mx-auto mb-3">
                  <badge.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{badge.label}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN AS DONOR ── */}
      <section className="relative py-28 lg:py-36 overflow-hidden bg-gradient-to-br from-white via-gray-50/30 to-red-50/20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-green-600/5 rounded-full blur-2xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
            <div className="flex-1 space-y-8 text-center lg:text-left max-w-xl">
              <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">Make a Difference</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gray-400 italic font-light">Your</span>{" "}
                <span className="text-gray-900 font-bold">Contribution,</span>
                <br />
                <span className="text-gray-400 italic font-light">Someone's</span>{" "}
                <span className="text-red-600 font-bold">Lifeline</span>
              </h2>
              <p className="text-xl md:text-2xl font-medium text-gray-500">Become a Blood Donor Today</p>
              <Link to="/register" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-lg font-bold px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 btn-glow">
                <Heart className="h-5 w-5" />Join as a Donor
              </Link>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end relative">
              <img
                src={joinDonorImage}
                alt="Blood donation illustration"
                className="relative z-10 max-w-full h-auto w-full max-w-lg lg:max-w-xl object-contain"
                style={{ filter: "drop-shadow(0 8px 30px rgba(185, 28, 28, 0.1))", mixBlendMode: "multiply" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900/95 to-gray-900 shadow-2xl">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs><pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
                <rect width="100" height="100" fill="url(#dots)" />
              </svg>
            </div>
            <div className="relative z-10 p-12 md:p-16 lg:p-20 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">Ready to Save Lives?</h2>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of donors and hospitals making a difference every day
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-100 font-bold px-12 py-4 rounded-xl shadow-xl hover:shadow-2xl text-lg transition-all duration-300">
                  Get Started<ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/help" className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-10 py-4 rounded-xl text-lg transition-all duration-300">
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