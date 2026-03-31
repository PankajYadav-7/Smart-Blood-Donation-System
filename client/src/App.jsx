import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import DonorProfile from "./pages/DonorProfile";
import HospitalDashboard from "./pages/HospitalDashboard";
import NGODashboard from "./pages/NGODashboard";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateRequest from "./pages/CreateRequest";
import ViewRequests from "./pages/ViewRequests";
import FindBlood from "./pages/FindBlood";
import Donate from "./pages/Donate";
import Emergency from "./pages/Emergency";
import About from "./pages/About";
import Help from "./pages/Help";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Certificates from "./pages/Certificates";
import DonorSearch from "./pages/DonorSearch";
import NotFound from "./pages/NotFound";
import Hospitals from "./pages/Hospitals";
import Settings from "./pages/Settings";

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
        <Route path="/ngo/dashboard" element={<NGODashboard />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/create-request" element={<CreateRequest />} />
        <Route path="/view-requests" element={<ViewRequests />} />
        <Route path="/find-blood" element={<FindBlood />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/donor-search" element={<DonorSearch />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;