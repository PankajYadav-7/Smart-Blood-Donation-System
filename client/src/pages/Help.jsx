import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MessageCircle,
  Droplets,
  User,
  Building,
  Shield,
} from "lucide-react";

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "How do I register as a blood donor?",
      answer: "Click Register on the homepage, select Donor as your role, fill in your details, and complete your donor profile with your blood group and location. You will then start receiving matching blood requests."
    },
    {
      question: "How does the blood matching system work?",
      answer: "When a hospital or patient posts a blood request, our system automatically finds donors with compatible blood types within a certain radius. Compatible donors receive instant notifications and can choose to accept or decline."
    },
    {
      question: "Is my personal information safe?",
      answer: "Yes. We use a consent-first privacy model. Your contact details are NEVER shared with anyone without your explicit approval. You must accept a request before your contact is revealed to the hospital."
    },
    {
      question: "How often can I donate blood?",
      answer: "The standard recommendation is every 56 days (about 3 months) for whole blood. Our system automatically tracks your last donation date and shows your eligibility status on your dashboard."
    },
    {
      question: "What is an Emergency Request?",
      answer: "Emergency requests are urgent blood needs marked as high priority. All available matching donors are immediately notified. You can submit an emergency request without an account using the Emergency Access button."
    },
    {
      question: "How do hospitals get verified?",
      answer: "Hospitals and NGOs must apply for verification through the Admin panel. Our admin team reviews their credentials and approves legitimate organizations. Only verified organizations can post emergency requests."
    },
    {
      question: "Can I turn off notifications temporarily?",
      answer: "Yes! On your Donor Dashboard you can toggle your availability ON or OFF. You can also snooze notifications for 4 hours or 24 hours when you are busy or unavailable."
    },
    {
      question: "What blood types are compatible?",
      answer: "Blood group O can donate to anyone (universal donor). AB can receive from anyone (universal recipient). Same blood groups are always compatible. Rh Negative (-) cannot receive Rh Positive (+) blood."
    },
  ];

  const guides = [
    {
      icon: User,
      title: "For Donors",
      color: "text-blue-600 bg-blue-50",
      steps: [
        "Register with role: Donor",
        "Complete your donor profile (blood group, location)",
        "Turn ON availability",
        "Wait for matching blood requests",
        "Accept or decline requests",
        "Earn badges for your contributions"
      ]
    },
    {
      icon: Building,
      title: "For Hospitals / NGOs",
      color: "text-purple-600 bg-purple-50",
      steps: [
        "Register with role: Hospital or NGO",
        "Apply for verification through admin",
        "Once verified, create blood requests",
        "Click Find Donors to notify matching donors",
        "Track donor responses on your dashboard",
        "Close request when fulfilled"
      ]
    },
    {
      icon: Droplets,
      title: "For Patients / Family",
      color: "text-red-600 bg-red-50",
      steps: [
        "Register with role: Patient/Family",
        "Go to Create Request",
        "Fill in blood group and hospital details",
        "Set urgency level",
        "Monitor responses on your dashboard",
        "Mark fulfilled when blood is received"
      ]
    },
    {
      icon: Shield,
      title: "Emergency (No Account)",
      color: "text-orange-600 bg-orange-50",
      steps: [
        "Click Emergency on the navigation bar",
        "Fill in blood group needed",
        "Enter hospital location",
        "Submit emergency request",
        "Donors will be notified immediately",
        "Also call Nepal Red Cross: 01-4270650"
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-red-950 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <HelpCircle className="h-12 w-12 text-white mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-3">Help Center</h1>
          <p className="text-xl text-gray-300">
            Everything you need to know about using Jeevan Saarthi
          </p>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="py-8 bg-red-600">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white">
            <p className="font-semibold text-lg">Need immediate help?</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">Nepal Red Cross: 01-4270650</span>
              </div>
              <Button
                className="bg-white text-red-600 hover:bg-gray-100"
                asChild
              >
                <Link to="/emergency">Emergency Request</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How To Use Guides */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How To Use Jeevan Saarthi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${guide.color} flex items-center justify-center`}>
                      <guide.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {guide.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {stepIndex + 1}
                        </span>
                        <span className="text-sm text-gray-600">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blood Type Guide */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Blood Type Compatibility Guide
          </h2>
          <p className="text-gray-500 text-center mb-10">
            Understanding which blood types can donate to which
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: "O-", canDonateTo: "Everyone", isUniversal: true, color: "bg-red-600" },
              { type: "O+", canDonateTo: "O+, A+, B+, AB+", isUniversal: false, color: "bg-red-500" },
              { type: "A-", canDonateTo: "A-, A+, AB-, AB+", isUniversal: false, color: "bg-blue-600" },
              { type: "A+", canDonateTo: "A+, AB+", isUniversal: false, color: "bg-blue-500" },
              { type: "B-", canDonateTo: "B-, B+, AB-, AB+", isUniversal: false, color: "bg-green-600" },
              { type: "B+", canDonateTo: "B+, AB+", isUniversal: false, color: "bg-green-500" },
              { type: "AB-", canDonateTo: "AB-, AB+", isUniversal: false, color: "bg-purple-600" },
              { type: "AB+", canDonateTo: "AB+ only", isUniversal: false, color: "bg-purple-500" },
            ].map((blood, index) => (
              <Card key={index} className="border-0 shadow-md text-center">
                <CardContent className="pt-4 pb-4">
                  <div className={`w-14 h-14 rounded-full ${blood.color} flex items-center justify-center mx-auto mb-3 shadow-md`}>
                    <span className="text-white font-bold text-sm">{blood.type}</span>
                  </div>
                  {blood.isUniversal && (
                    <Badge className="bg-yellow-100 text-yellow-700 mb-2 text-xs">Universal Donor</Badge>
                  )}
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Can donate to: <span className="font-medium text-gray-700">{blood.canDonateTo}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <CardContent className="py-4 px-6">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                      {faq.question}
                    </h3>
                    {openFaq === index
                      ? <ChevronUp className="h-5 w-5 text-red-600 flex-shrink-0" />
                      : <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    }
                  </div>
                  {openFaq === index && (
                    <p className="text-sm text-gray-600 mt-3 leading-relaxed border-t border-gray-100 pt-3">
                      {faq.answer}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <MessageCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
          <p className="text-gray-500 mb-8">Our support team is available 24/7 for emergencies</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <Phone className="h-8 w-8 text-red-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Emergency Hotline</h3>
              <p className="text-red-600 font-semibold">Nepal Red Cross: 01-4270650</p>
              <p className="text-xs text-gray-400 mt-1">Available 24/7</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Email Support</h3>
              <p className="text-blue-600 font-semibold">info@jeevansaarthi.com</p>
              <p className="text-xs text-gray-400 mt-1">Response within 24 hours</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Help;