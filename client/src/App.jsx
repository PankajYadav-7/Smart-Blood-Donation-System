import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import DonorProfile from "./pages/DonorProfile";
import HospitalDashboard from "./pages/HospitalDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateRequest from "./pages/CreateRequest";
import ViewRequests from "./pages/ViewRequests";
import Emergency from "./pages/Emergency";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/donor/dashboard" element={<DonorDashboard />} />
        <Route path="/donor/profile" element={<DonorProfile />} />
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/create-request" element={<CreateRequest />} />
        <Route path="/view-requests" element={<ViewRequests />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;