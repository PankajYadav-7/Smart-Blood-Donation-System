import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DonorDashboard from "./pages/DonorDashboard";
import DonorProfile from "./pages/DonorProfile";
import CreateRequest from "./pages/CreateRequest";
import ViewRequests from "./pages/ViewRequests";
import AdminDashboard from "./pages/AdminDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/donor/dashboard" element={<DonorDashboard />} />
        <Route path="/donor/profile" element={<DonorProfile />} />
        <Route path="/create-request" element={<CreateRequest />} />
        <Route path="/view-requests" element={<ViewRequests />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;