import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DonorProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    bloodGroup: "A",
    rh: "+",
    locationName: "",
    locationLat: "",
    locationLng: "",
    radiusKm: 10,
    availability: true,
    lastDonationDate: "",
  });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    // Load existing profile if any
    axios
      .get("http://localhost:5000/api/donor/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const p = res.data.profile;
        setFormData({
          bloodGroup: p.bloodGroup || "A",
          rh: p.rh || "+",
          locationName: p.locationName || "",
          locationLat: p.locationLat || "",
          locationLng: p.locationLng || "",
          radiusKm: p.radiusKm || 10,
          availability: p.availability,
          lastDonationDate: p.lastDonationDate
            ? p.lastDonationDate.split("T")[0]
            : "",
        });
      })
      .catch(() => {
        // No profile yet - that is fine
      });
  }, []);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await axios.post(
        "http://localhost:5000/api/donor/profile",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Profile saved successfully!");
      setTimeout(() => {
        navigate("/donor/dashboard");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save profile");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-red-50 p-6">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-2">
          🩸 Donor Profile
        </h1>
        <p className="text-gray-500 mb-6">
          Welcome, {user?.fullName}. Please complete your donor profile.
        </p>

        {message && (
          <div className="bg-green-100 text-green-600 p-3 rounded mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Blood Group */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-semibold">
              Blood Group
            </label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-red-500"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
          </div>

          {/* Rh Factor */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-semibold">
              Rh Factor
            </label>
            <select
              name="rh"
              value={formData.rh}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-red-500"
            >
              <option value="+">Positive (+)</option>
              <option value="-">Negative (-)</option>
            </select>
          </div>

          {/* Location Name */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-semibold">
              Your Location (City/Area)
            </label>
            <input
              type="text"
              name="locationName"
              placeholder="e.g. Kathmandu, Lalitpur"
              value={formData.locationName}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Radius */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-semibold">
              Preferred Radius (km)
            </label>
            <input
              type="number"
              name="radiusKm"
              placeholder="10"
              value={formData.radiusKm}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Last Donation Date */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-semibold">
              Last Donation Date
            </label>
            <input
              type="date"
              name="lastDonationDate"
              value={formData.lastDonationDate}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Availability Toggle */}
          <div className="mb-6 flex items-center gap-3">
            <input
              type="checkbox"
              name="availability"
              checked={formData.availability}
              onChange={handleChange}
              className="w-5 h-5 accent-red-600"
            />
            <label className="text-gray-700 font-semibold">
              I am available to donate blood
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/donor/dashboard")}
            className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-semibold"
          >
            Back to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

export default DonorProfile;