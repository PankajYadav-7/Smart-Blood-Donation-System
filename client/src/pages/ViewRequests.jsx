import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ViewRequests() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/requests", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRequests(res.data.requests);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600">
            🩸 Blood Requests
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Back
          </button>
        </div>

        {loading && (
          <p className="text-gray-500">Loading requests...</p>
        )}

        {!loading && requests.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">No open blood requests found</p>
          </div>
        )}

        {requests.map((request) => (
          <div
            key={request._id}
            className="bg-white rounded-xl shadow p-6 mb-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-red-600">
                  {request.bloodGroup}{request.rh} Blood Needed
                </h2>
                <p className="text-gray-600 mt-1">
                  🏥 {request.hospitalName}
                </p>
                <p className="text-gray-600">
                  💉 Units Required: {request.unitsRequired}
                </p>
                {request.notes && (
                  <p className="text-gray-500 mt-1">
                    📝 {request.notes}
                  </p>
                )}
              </div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    request.urgency === "Emergency"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {request.urgency}
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-3">
              Posted: {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewRequests;