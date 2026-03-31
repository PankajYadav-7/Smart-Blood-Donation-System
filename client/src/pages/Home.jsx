import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Droplets,
  Heart,
  Users,
  Shield,
  Clock,
  MapPin,
  CheckCircle,
  ArrowRight,
  Phone,
  UserCheck,
  ToggleLeft,
  Award,
  Building2,
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Clock,
      title: "Real-time Matching",
      description: "Instant donor matching based on blood type and location"
    },
    {
      icon: Shield,
      title: "Verified Requests",
      description: "Only verified hospitals and NGOs can post emergency requests"
    },
    {
      icon: UserCheck,
      title: "Consent-First Privacy",
      description: "Donor contact shared only after consent is given"
    },
    {
      icon: ToggleLeft,
      title: "Availability Control",
      description: "Toggle availability and control when you can donate"
    },
    {
      icon: Award,
      title: "Badges & Impact",
      description: "Track your donations and earn recognition badges"
    },
    {
      icon: Heart,
      title: "Privacy First",
      description: "Complete privacy protection for all users"
    }
  ];

  const stats = [
    { number: "7,528", label: "Total Donors" },
    { number: "3,902", label: "Lives Saved" },
    { number: "9,282", label: "Requests Fulfilled" },
    { number: "102", label: "Cities Covered" }
  ];

  const howItWorks = [
    {
      icon: Droplets,
      title: "Request Blood",
      description: "Post your blood requirement and get matched with compatible donors instantly."
    },
    {
      icon: Clock,
      title: "Get Instant Alerts",
      description: "Verified donors receive instant notifications for urgent requests."
    },
    {
      icon: MapPin,
      title: "Find a Donor Nearby",
      description: "Connect with verified donors in your area who match your blood type."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 min-h-[85vh] flex items-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-700 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
          <div className="mx-auto max-w-4xl space-y-8">
            <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 text-sm backdrop-blur-sm">
              Trusted by 500+ Hospitals in Nepal
            </Badge>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl leading-tight text-white">
              Save Lives Through
              <span className="block text-red-400 mt-2">Blood Donation</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg md:text-xl text-gray-300 leading-relaxed">
              Connect patients in urgent need with compatible donors, hospitals, and NGOs in real time.
              Faster response times and trusted, verified requests.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="text-lg px-10 py-6 rounded-xl shadow-xl hover:scale-105 transition-transform">
                <Link to="/create-request">
                  <Heart className="mr-2 h-5 w-5" />
                  Find Blood Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-10 py-6 rounded-xl border-white/30 text-white hover:bg-white/10">
                <Link to="/register">
                  <Users className="mr-2 h-5 w-5" />
                  Become a Donor
                </Link>
              </Button>
            </div>

            <div className="pt-2">
              <Button size="lg" asChild className="bg-red-700 hover:bg-red-800 text-white text-lg px-12 py-6 rounded-xl shadow-xl hover:scale-105 transition-transform">
                <Link to="/emergency">
                  <Phone className="mr-2 h-5 w-5" />
                  🚨 Emergency Request
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-white">{stat.number}</p>
                <p className="text-red-100 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">
              Why Choose Us
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">
              Everything You Need to Save Lives
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-red-600 font-semibold text-sm tracking-wider uppercase">
              Simple Process
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">
              How Jeevan Saarthi Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center shadow-lg">
                  {index + 1}
                </div>
                <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of donors and hospitals making a difference every day
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-12 py-6 rounded-xl shadow-xl hover:scale-105 transition-transform">
              <Link to="/register">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-10 py-6 rounded-xl border-white/30 text-white hover:bg-white/10">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;