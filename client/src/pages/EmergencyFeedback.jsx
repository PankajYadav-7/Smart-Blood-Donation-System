import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircle, AlertCircle, Heart, Loader } from "lucide-react";

const API = "http://localhost:5000/api";

const EmergencyFeedback = () => {
  const { emergencyId, donorEntryId } = useParams();
  const [searchParams]                = useSearchParams();
  const action                        = searchParams.get("action"); // "thanks" or "issue"

  const [screen,    setScreen]    = useState(action === "issue" ? "issue" : "thanks");
  const [message,   setMessage]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState("");

  const handleThankYou = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/emergency/${emergencyId}/thank-donor/${donorEntryId}`, {
        message: message || "Thank you for saving my life!",
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send. Please try again.");
    }
    setLoading(false);
  };

  const handleReportIssue = async () => {
    if (!message.trim()) { setError("Please describe the issue."); return; }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/emergency/${emergencyId}/report-issue/${donorEntryId}`, {
        complaintText: message,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit. Please try again.");
    }
    setLoading(false);
  };

  if (submitted) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {screen === "thanks" ? "Thank You Sent! 💙" : "Issue Reported"}
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          {screen === "thanks"
            ? "Your gratitude has been sent to the donor. They will see your message in their dashboard. Small acts of kindness inspire more people to donate blood."
            : "Your concern has been recorded. Our team will review it and take appropriate action. Thank you for letting us know."
          }
        </p>
        <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-red-700 mb-1">Nepal Red Cross</p>
          <a href="tel:014270650" className="text-xl font-bold text-red-600 hover:underline">
            01-4270650
          </a>
          <p className="text-xs text-red-400 mt-1">Available 24/7</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-10">

        {screen === "thanks" ? (
          <>
            {/* Thank You Screen */}
            <div className="bg-green-600 rounded-2xl p-6 text-white text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-1">Send a Thank You 💙</h1>
              <p className="text-green-100 text-sm">
                A donor confirmed they helped with your blood emergency.
                Your gratitude means everything to them.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                ⚠️ {error}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your message (optional)
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Thank you so much for saving my life. I am truly grateful..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave blank to send a default thank you message.
              </p>
            </div>

            <button
              onClick={handleThankYou}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
            >
              {loading
                ? <><Loader className="h-4 w-4 animate-spin" />Sending...</>
                : <>💙 Send Thank You</>
              }
            </button>

            <button
              onClick={() => setScreen("issue")}
              className="w-full border border-gray-300 text-gray-500 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-all"
            >
              ⚠️ Something went wrong instead
            </button>
          </>
        ) : (
          <>
            {/* Report Issue Screen */}
            <div className="bg-orange-500 rounded-2xl p-6 text-white text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-1">Report an Issue</h1>
              <p className="text-orange-100 text-sm">
                We are sorry something went wrong. Please describe what happened
                and our team will review it.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                ⚠️ {error}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Describe what went wrong *
              </label>
              <textarea
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Please describe what happened. For example: the donor never showed up, wrong blood type, or any other issue..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <button
              onClick={handleReportIssue}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
            >
              {loading
                ? <><Loader className="h-4 w-4 animate-spin" />Submitting...</>
                : <>⚠️ Submit Report</>
              }
            </button>

            <button
              onClick={() => setScreen("thanks")}
              className="w-full border border-gray-300 text-gray-500 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-all"
            >
              💙 Actually, send a thank you instead
            </button>
          </>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default EmergencyFeedback;