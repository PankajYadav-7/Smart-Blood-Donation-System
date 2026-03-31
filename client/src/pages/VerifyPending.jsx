import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Clock, CheckCircle, AlertCircle, Upload, FileText,
  Building, Mail, Phone, RefreshCw, Shield,
} from "lucide-react";

const VerifyPending = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [verificationStatus] = useState({
    status: "pending",
    submittedAt: "2026-03-15 10:30 AM",
    estimatedCompletion: "2026-03-17",
    documentsRequired: 4,
    lastUpdate: "2026-03-16 2:15 PM",
  });

  const verificationSteps = [
    { step: 1, title: "Application Submitted",   description: "Your verification request has been received",          status: "completed", completedAt: "Mar 15, 10:30 AM" },
    { step: 2, title: "Document Review",          description: "Our team is reviewing your submitted documents",       status: "in_progress", completedAt: null },
    { step: 3, title: "Identity Verification",    description: "Verifying your organisation's credentials",            status: "pending",      completedAt: null },
    { step: 4, title: "Final Approval",           description: "Final review and account activation",                  status: "pending",      completedAt: null },
  ];

  const submittedDocuments = [
    { name: "Hospital Registration Certificate", type: "PDF", size: "2.4 MB", status: "approved",      uploadedAt: "Mar 15" },
    { name: "Medical License",                   type: "PDF", size: "1.8 MB", status: "approved",      uploadedAt: "Mar 15" },
    { name: "Director ID Proof",                 type: "PDF", size: "0.9 MB", status: "under_review",  uploadedAt: "Mar 15" },
  ];

  const missingDocuments = [
    { name: "Tax Exemption Certificate", description: "Required for NGO verification", required: true },
  ];

  const getProgressPercentage = () => {
    const completed    = verificationSteps.filter(s => s.status === "completed").length;
    const inProgress   = verificationSteps.filter(s => s.status === "in_progress").length;
    return ((completed + inProgress * 0.5) / verificationSteps.length) * 100;
  };

  const getDocStatusColor = (status) => {
    switch (status) {
      case "approved":      return "bg-green-100 text-green-700 border-green-200";
      case "under_review":  return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected":      return "bg-red-100 text-red-700 border-red-200";
      default:              return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verification Status</h1>
          <p className="text-gray-500 mt-1">Track your account verification progress</p>
        </div>

        {/* Status Overview */}
        <Card className="border-0 shadow-md mb-6">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-red-600" />
                  {user?.role === "ngo" ? "NGO" : "Hospital"} Verification Request
                </CardTitle>
                <CardDescription>Submitted on {verificationStatus.submittedAt}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                  <Clock className="w-3 h-3 mr-1" />
                  PENDING REVIEW
                </Badge>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Verification Progress</span>
                <span className="font-semibold text-red-600">{Math.round(getProgressPercentage())}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm bg-gray-50 rounded-xl p-3">
              <span className="text-gray-500">Estimated completion:</span>
              <span className="font-semibold text-gray-900">{verificationStatus.estimatedCompletion}</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Your verification is currently under review. Our team typically processes applications
                within <strong>2–3 business days</strong>. You will receive an email notification once
                your status changes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Verification Steps */}
        <Card className="border-0 shadow-md mb-6">
          <CardHeader>
            <CardTitle>Verification Process</CardTitle>
            <CardDescription>Track each step of your verification journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {verificationSteps.map((step, index) => (
                <div key={step.step} className="flex items-start gap-4">
                  <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${
                    step.status === "completed"   ? "bg-green-100 text-green-600" :
                    step.status === "in_progress" ? "bg-blue-100 text-blue-600"  :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {step.status === "completed"   ? <CheckCircle className="h-4 w-4" /> :
                     step.status === "in_progress" ? <Clock className="h-4 w-4 animate-spin" /> :
                     <span className="text-xs font-bold">{step.step}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold text-sm ${
                        step.status === "completed"   ? "text-green-800" :
                        step.status === "in_progress" ? "text-blue-800"  :
                        "text-gray-400"
                      }`}>{step.title}</h4>
                      {step.completedAt && (
                        <span className="text-xs text-gray-400">{step.completedAt}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Submitted Documents */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-red-600" />
                Submitted Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {submittedDocuments.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-400">{doc.type} · {doc.size} · {doc.uploadedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getDocStatusColor(doc.status)}`}>
                        {doc.status.replace("_", " ")}
                      </Badge>
                      {doc.status !== "approved" && (
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          <Upload className="h-3 w-3 mr-1" />
                          Re-upload
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Missing / Required Documents */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Required Documents
              </CardTitle>
              <CardDescription>Additional documents needed to complete verification</CardDescription>
            </CardHeader>
            <CardContent>
              {missingDocuments.length > 0 ? (
                <div className="space-y-3">
                  {missingDocuments.map((doc, i) => (
                    <div key={i} className="p-4 border-2 border-orange-200 bg-orange-50 rounded-xl">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm text-orange-900">{doc.name}</p>
                          <p className="text-xs text-orange-700 mt-0.5">{doc.description}</p>
                        </div>
                        <Button size="sm" className="flex-shrink-0">
                          <Upload className="h-3 w-3 mr-1" />Upload
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <p className="text-xs text-yellow-800">
                      Please upload the missing documents to proceed. Your application will remain
                      on hold until all required documents are submitted.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                  <h3 className="font-semibold text-green-900">All Documents Submitted</h3>
                  <p className="text-sm text-green-700 mt-1">We are reviewing your application.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Need Help?</CardTitle>
            <CardDescription>Contact our verification team if you have questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1">
                <Mail className="mr-2 h-4 w-4" />
                Email Support
              </Button>
              <Button variant="outline" className="flex-1">
                <Phone className="mr-2 h-4 w-4" />
                Call Verification Team
              </Button>
              <Button className="flex-1" onClick={() => navigate(
                user?.role === "hospital" ? "/hospital/dashboard" : "/ngo/dashboard"
              )}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyPending;
