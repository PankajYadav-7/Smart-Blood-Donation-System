import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateRequest() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    bloodGroup: "A",
    rh: "+",
    unitsRequired: 1,
    urgency: "Normal",
    hospitalName: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await axios.post(
        "http://localhost:5000/api/requests",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Blood request created successfully!");
      setTimeout(() => {
        navigate("/donor/dashboard");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create request");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-red-50 p-6">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-2">
          🩸 Create Blood Request
        </h1>
        <p className="text-gray-500 mb-6">
          Fill in the details to request blood
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

          {/* Units Required */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-semibold">
              Units Required
            </label>
            <input
              type="number"
              name="unitsRequired"
              min="1"
              value={formData.unitsRequired}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Urgency */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-semibold">
              Urgency Level
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-red-500"
            >
              <option value="Normal">Normal</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          {/* Hospital Name */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-semibold">
              Hospital / Location Name
            </label>
            <input
              type="text"
              name="hospitalName"
              placeholder="e.g. Bir Hospital, Kathmandu"
              value={formData.hospitalName}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-1 font-semibold">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
          >
            {loading ? "Creating..." : "Create Blood Request"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-semibold"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateRequest;