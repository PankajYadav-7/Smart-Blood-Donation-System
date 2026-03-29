import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function HospitalDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/requests/my",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(res.data.requests);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
const handleFindDonors = async (requestId) => {
  try {
    const res = await axios.post(
      `http://localhost:5000/api/matches/find/${requestId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(res.data.message);
  } catch (error) {
    alert("Failed to find donors");
  }
};
  const handleClose = async (requestId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/requests/${requestId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Request closed successfully!");
      fetchMyRequests();
    } catch (error) {
      alert("Failed to close request");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600">
            🏥 Hospital Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Welcome */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <p className="text-gray-700 font-semibold">
            Welcome, {user?.fullName} 👋
          </p>
          <p className="text-gray-500 text-sm">Role: {user?.role}</p>
        </div>

        {/* Create Request Button */}
        <button
          onClick={() => navigate("/create-request")}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 mb-6"
        >
          🆘 Create New Blood Request
        </button>

        {/* My Requests */}
        <h2 className="text-xl font-bold text-gray-700 mb-3">
          My Blood Requests
        </h2>

        {loading && (
          <p className="text-gray-500">Loading requests...</p>
        )}

        {!loading && requests.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">
              No requests yet. Create your first blood request!
            </p>
          </div>
        )}

        {requests.map((request) => (
          <div
            key={request._id}
            className="bg-white rounded-xl shadow p-5 mb-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-red-600">
                  {request.bloodGroup}{request.rh} Blood —{" "}
                  {request.unitsRequired} units
                </h3>
                <p className="text-gray-600 mt-1">
                  🏥 {request.hospitalName}
                </p>
                {request.notes && (
                  <p className="text-gray-500 text-sm mt-1">
                    📝 {request.notes}
                  </p>
                )}
                <p className="text-gray-400 text-sm mt-2">
                  Posted: {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    request.urgency === "Emergency"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {request.urgency}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    request.status === "Open"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {request.status}
                </span>
{request.status === "Open" && (
  <div className="flex flex-col gap-2">
    <button
      onClick={() => handleFindDonors(request._id)}
      className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-200 font-semibold"
    >
      🔍 Find Donors
    </button>
    <button
      onClick={() => handleClose(request._id)}
      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200"
    >
      Close Request
    </button>
  </div>
)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HospitalDashboard;