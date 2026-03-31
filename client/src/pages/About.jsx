import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Heart,
  Users,
  Shield,
  Award,
  Target,
  Droplets,
  Phone,
  Clock,
  MapPin,
  CheckCircle,
} from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Save Lives",
      description: "Every feature is designed with one goal — saving human lives through faster blood donation"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Donor information is never shared without explicit consent from the donor"
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a trusted community of donors, hospitals and NGOs across Nepal"
    },
    {
      icon: Award,
      title: "Recognition",
      description: "Rewarding donors with badges and certificates for their life-saving contributions"
    },
  ];

  const stats = [
    { number: "7,528", label: "Registered Donors" },
    { number: "3,902", label: "Lives Saved" },
    { number: "500+", label: "Partner Hospitals" },
    { number: "102", label: "Cities Covered" },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Register",
      description: "Sign up as a donor, hospital, or NGO. Verification ensures only trusted organizations post requests."
    },
    {
      step: "2",
      title: "Match",
      description: "Our smart matching engine finds compatible donors based on blood type and location instantly."
    },
    {
      step: "3",
      title: "Save Lives",
      description: "Donors respond to requests, contact is shared only after consent, and lives are saved."
    }
  ];

  const features = [
    { icon: Clock, title: "Real-Time Matching", description: "Donors are matched and notified within seconds of a blood request" },
    { icon: Shield, title: "Verified Organizations", description: "Only verified hospitals and NGOs can post emergency requests" },
    { icon: CheckCircle, title: "Consent-Based Privacy", description: "Donor contact details are revealed only after donor accepts" },
    { icon: MapPin, title: "Location-Based", description: "Find donors closest to the hospital for fastest response" },
    { icon: Phone, title: "Emergency Access", description: "Emergency requests can be submitted without creating an account" },
    { icon: Award, title: "Donor Rewards", description: "Earn badges and certificates for your life-saving contributions" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-red-950 py-24 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Droplets className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            About Jeevan Saarthi
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Jeevan Saarthi means "Life Companion" — a platform dedicated to
            connecting blood donors with patients in need across Nepal
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Target className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            To reduce blood shortage emergencies in Nepal by creating a fast, trusted,
            and privacy-first platform that connects verified donors with patients in
            real time. We believe technology can save lives — and Jeevan Saarthi is
            proof of that.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-red-600">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-4xl font-bold text-white">{stat.number}</p>
                <p className="text-red-100 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How Jeevan Saarthi Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="w-12 h-12 rounded-full bg-red-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card
                key={index}
                className="border-0 shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <CardContent className="pt-8 pb-6">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Platform Features
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to save lives faster and more efficiently
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl hover:bg-red-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Use */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Who Can Use Jeevan Saarthi?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: "🩸",
                title: "Blood Donors",
                description: "Register as a donor, set your blood group and location, and respond to emergency requests near you",
                color: "bg-red-50 border-red-200"
              },
              {
                emoji: "🏥",
                title: "Hospitals",
                description: "Post verified blood requests, find compatible donors instantly, and manage your blood supply",
                color: "bg-blue-50 border-blue-200"
              },
              {
                emoji: "🤝",
                title: "NGOs",
                description: "Coordinate blood donation drives, manage donor networks, and respond to community needs",
                color: "bg-green-50 border-green-200"
              },
              {
                emoji: "👨‍👩‍👧",
                title: "Patients & Family",
                description: "Request blood for your loved ones and get connected with compatible donors immediately",
                color: "bg-purple-50 border-purple-200"
              },
            ].map((item, index) => (
              <Card
                key={index}
                className={`border ${item.color} shadow-md hover:shadow-lg transition-shadow`}
              >
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="text-4xl mb-3">{item.emoji}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Contact Us
          </h2>
          <p className="text-gray-500 mb-10 text-lg">
            Have questions or need help? We are here for you 24/7
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: "Emergency Hotline", value: "Nepal Red Cross: 01-4270650", color: "text-red-600 bg-red-50" },
              { icon: MapPin, title: "Location", value: "Kathmandu, Nepal", color: "text-blue-600 bg-blue-50" },
              { icon: Clock, title: "Availability", value: "24/7 Emergency Support", color: "text-green-600 bg-green-50" },
            ].map((contact, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-2xl">
                <div className={`w-12 h-12 rounded-xl ${contact.color} flex items-center justify-center mx-auto mb-3`}>
                  <contact.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{contact.title}</h3>
                <p className="text-sm text-gray-500">{contact.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-red-600 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Save Lives?
          </h2>
          <p className="text-red-100 mb-8 text-lg">
            Join thousands of donors and hospitals making a difference every day
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 text-base font-bold rounded-xl"
              asChild
            >
              <Link to="/register">Register Now</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-3 text-base font-semibold rounded-xl"
              asChild
            >
              <Link to="/emergency">Emergency Request</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default About;