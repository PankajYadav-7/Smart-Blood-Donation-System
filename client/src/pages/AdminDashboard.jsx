import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUsers();
    fetchRequests();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data.users);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/requests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(res.data.requests);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSuspend = async (userId, currentStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        { status: currentStatus === "active" ? "suspended" : "active" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      alert("Failed to update user status");
    }
  };

  const handleCloseRequest = async (requestId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/requests/${requestId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests();
      alert("Request closed successfully");
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
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600">
            🩸 Admin Dashboard
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
            Welcome, {user?.fullName} — Admin Panel
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <h3 className="text-3xl font-bold text-red-600">
              {users.length}
            </h3>
            <p className="text-gray-500">Total Users</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <h3 className="text-3xl font-bold text-red-600">
              {requests.length}
            </h3>
            <p className="text-gray-500">Open Requests</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === "users"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === "requests"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            📋 Requests
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            {loading && <p className="text-gray-500">Loading users...</p>}
            {users.map((u) => (
              <div
                key={u._id}
                className="bg-white rounded-xl shadow p-4 mb-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-700">{u.fullName}</p>
                  <p className="text-gray-500 text-sm">{u.email}</p>
                  <p className="text-gray-500 text-sm">Role: {u.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      u.status === "active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {u.status}
                  </span>
                  <button
                    onClick={() => handleSuspend(u._id, u.status)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                      u.status === "active"
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-green-100 text-green-600 hover:bg-green-200"
                    }`}
                  >
                    {u.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div>
            {requests.length === 0 && (
              <p className="text-gray-500">No open requests</p>
            )}
            {requests.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-xl shadow p-4 mb-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-red-600">
                    {r.bloodGroup}{r.rh} — {r.unitsRequired} units
                  </p>
                  <p className="text-gray-500 text-sm">
                    🏥 {r.hospitalName}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Status: {r.status}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    r.urgency === "Emergency"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {r.urgency}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;