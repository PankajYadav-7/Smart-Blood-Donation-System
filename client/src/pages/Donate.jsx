import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Heart,
  Users,
  MapPin,
  Calendar,
  Clock,
  Award,
  CheckCircle,
  Star,
  ArrowRight,
  Droplets,
} from "lucide-react";

const Donate = () => {
  const [selectedBloodType, setSelectedBloodType] = useState("");

  const bloodTypeInfo = [
    { type: "O-", compatibility: "Universal Donor", demand: 95, color: "bg-red-600" },
    { type: "O+", compatibility: "Most Common", demand: 85, color: "bg-red-500" },
    { type: "A-", compatibility: "High Demand", demand: 75, color: "bg-orange-500" },
    { type: "B-", compatibility: "Rare Type", demand: 80, color: "bg-yellow-500" },
    { type: "AB-", compatibility: "Rarest Type", demand: 90, color: "bg-purple-500" },
    { type: "A+", compatibility: "Common", demand: 60, color: "bg-blue-500" },
    { type: "B+", compatibility: "Moderate Demand", demand: 65, color: "bg-green-500" },
    { type: "AB+", compatibility: "Universal Receiver", demand: 70, color: "bg-teal-500" },
  ];

  const donationSteps = [
    { step: 1, title: "Registration", description: "Complete your donor registration with basic health information", duration: "5 min", icon: Users },
    { step: 2, title: "Health Screening", description: "Quick health check including blood pressure and hemoglobin test", duration: "10 min", icon: CheckCircle },
    { step: 3, title: "Donation", description: "Safe and comfortable blood donation with trained professionals", duration: "15 min", icon: Heart },
    { step: 4, title: "Recovery", description: "Rest and enjoy refreshments while your body recovers", duration: "15 min", icon: Star },
  ];

  const upcomingDrives = [
    {
      id: 1,
      title: "Community Center Blood Drive",
      organizer: "Red Cross Society Nepal",
      date: "April 10, 2026",
      time: "9:00 AM - 5:00 PM",
      location: "Kathmandu Community Center",
      address: "Bagbazar, Kathmandu",
      registered: 45,
      capacity: 100,
      incentives: ["Free health checkup", "Refreshments", "Certificate"]
    },
    {
      id: 2,
      title: "New Year Blood Donation Camp",
      organizer: "Bir Hospital",
      date: "April 15, 2026",
      time: "10:00 AM - 4:00 PM",
      location: "Bir Hospital",
      address: "Mahaboudha, Kathmandu",
      registered: 78,
      capacity: 150,
      incentives: ["Blood typing", "Free consultation", "Donor card"]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-red-950 py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-4">Become a Life Saver</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Your blood donation can save up to three lives. Join our community of heroes who regularly donate blood.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-4 rounded-xl hover:scale-105 transition-transform">
              <Link to="/register">
                <Heart className="h-5 w-5 mr-2" />
                Register as Donor
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-4 rounded-xl border-white/30 text-white hover:bg-white/10">
              <Link to="/donor/dashboard">
                View My Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Blood Type Demand */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Blood Type Demand</h2>
          <p className="text-gray-500 text-center mb-10">Click on your blood type to see compatibility information</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bloodTypeInfo.map((blood) => (
              <Card
                key={blood.type}
                className={`cursor-pointer transition-all hover:shadow-lg border-0 shadow-md ${
                  selectedBloodType === blood.type ? "ring-2 ring-red-600 shadow-xl" : ""
                }`}
                onClick={() => setSelectedBloodType(blood.type)}
              >
                <CardContent className="pt-6 text-center pb-6">
                  <div className={`w-14 h-14 rounded-full ${blood.color} flex items-center justify-center mx-auto mb-3 shadow-md`}>
                    <span className="text-white font-bold text-sm">{blood.type}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{blood.compatibility}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Demand</span>
                      <span className="font-bold text-red-600">{blood.demand}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${blood.demand}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Process */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Donation Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {donationSteps.map((step, index) => (
              <div key={step.step} className="relative">
                <Card className="border-0 shadow-md text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 shadow-md">
                      {step.step}
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-7 w-7 text-red-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                    <Badge className="bg-gray-100 text-gray-700 mb-3">{step.duration}</Badge>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
                {index < donationSteps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Blood Drives */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Blood Drives</h2>
          </div>
          <div className="space-y-6">
            {upcomingDrives.map((drive) => (
              <Card key={drive.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{drive.title}</h3>
                      <p className="text-gray-500 text-sm">Organized by {drive.organizer}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200 self-start">
                      {Math.round((drive.registered / drive.capacity) * 100)}% Full
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {drive.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {drive.time}
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{drive.location}</p>
                          <p className="text-xs text-gray-400">{drive.address}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">Registration</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Registered</span>
                          <span>{drive.registered}/{drive.capacity}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${(drive.registered / drive.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">Benefits</h4>
                      <div className="space-y-1">
                        {drive.incentives.map((incentive, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {incentive}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" asChild>
                    <Link to="/register">
                      <Users className="h-4 w-4 mr-2" />
                      Register to Join This Drive
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-red-600 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Award className="h-12 w-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Save Lives?</h2>
          <p className="text-red-100 mb-8 text-lg">
            Join thousands of regular donors who have already made a difference
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 px-8 font-bold rounded-xl" asChild>
              <Link to="/register">
                <Heart className="h-5 w-5 mr-2" />
                Start Donating Today
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-xl" asChild>
              <Link to="/help">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Donate;