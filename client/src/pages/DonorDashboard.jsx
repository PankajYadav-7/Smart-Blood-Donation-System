import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DonorDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/matches/my-matches",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMatches(res.data.matches);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRespond = async (matchId, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/matches/${matchId}/respond`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`You have ${status} this request!`);
      fetchMatches();
    } catch (error) {
      alert("Failed to respond");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600">
            🩸 Donor Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Welcome */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Welcome, {user?.fullName}! 👋
          </h2>
          <p className="text-gray-500 text-sm">Role: {user?.role}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate("/donor/profile")}
            className="bg-white rounded-xl shadow p-4 text-left hover:shadow-md"
          >
            <h3 className="font-semibold text-red-600">👤 My Profile</h3>
            <p className="text-gray-500 text-sm mt-1">
              Update blood group and availability
            </p>
          </button>

          <button
            onClick={() => navigate("/view-requests")}
            className="bg-white rounded-xl shadow p-4 text-left hover:shadow-md"
          >
            <h3 className="font-semibold text-red-600">📋 All Requests</h3>
            <p className="text-gray-500 text-sm mt-1">
              See all open blood requests
            </p>
          </button>
        </div>

        {/* Blood Request Matches */}
        <h2 className="text-xl font-bold text-gray-700 mb-3">
          🔔 Blood Requests Matching You
        </h2>

        {loading && (
          <p className="text-gray-500">Loading matches...</p>
        )}

        {!loading && matches.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">
              No matching blood requests right now
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Make sure your profile is complete and availability is ON
            </p>
          </div>
        )}

        {matches.map((match) => (
          <div
            key={match._id}
            className="bg-white rounded-xl shadow p-5 mb-4 border-l-4 border-red-500"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-red-600">
                  {match.requestId?.bloodGroup}
                  {match.requestId?.rh} Blood Needed
                </h3>
                <p className="text-gray-600">
                  🏥 {match.requestId?.hospitalName}
                </p>
                <p className="text-gray-600">
                  💉 Units: {match.requestId?.unitsRequired}
                </p>
                {match.requestId?.notes && (
                  <p className="text-gray-500 text-sm mt-1">
                    📝 {match.requestId?.notes}
                  </p>
                )}
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  match.requestId?.urgency === "Emergency"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {match.requestId?.urgency}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleRespond(match._id, "Accepted")}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
              >
                ✅ Accept
              </button>
              <button
                onClick={() => handleRespond(match._id, "Declined")}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-semibold"
              >
                ❌ Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonorDashboard;
