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
import Hospitals from "./pages/Hospitals";
import Settings from "./pages/Settings";
import VerifyPending from "./pages/VerifyPending";
import PartnershipApplication from "./pages/PartnershipApplication";
import RequestDetails from "./pages/RequestDetails";
import NotFound from "./pages/NotFound";
import PatientProfile from "./pages/PatientProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/"                         element={<Home />} />
        <Route path="/login"                    element={<Login />} />
        <Route path="/register"                 element={<Register />} />
        <Route path="/forgot-password"          element={<ForgotPassword />} />
        <Route path="/emergency"                element={<Emergency />} />
        <Route path="/find-blood"               element={<FindBlood />} />
        <Route path="/donate"                   element={<Donate />} />
        <Route path="/hospitals"                element={<Hospitals />} />
        <Route path="/about"                    element={<About />} />
        <Route path="/help"                     element={<Help />} />
        <Route path="/partnership-application"  element={<PartnershipApplication />} />

        {/* Protected — Donor */}
        <Route path="/donor/dashboard"          element={<DonorDashboard />} />
        <Route path="/donor/profile"            element={<DonorProfile />} />

        {/* Protected — Hospital */}
        <Route path="/hospital/dashboard"       element={<HospitalDashboard />} />

        {/* Protected — NGO */}
        <Route path="/ngo/dashboard"            element={<NGODashboard />} />

        {/* Protected — Patient */}
        <Route path="/patient/dashboard"        element={<PatientDashboard />} />

        <Route path="/patient/profile" element={<PatientProfile />} />

        {/* Protected — Admin */}
        <Route path="/admin/dashboard"          element={<AdminDashboard />} />

        {/* Protected — Shared */}
        <Route path="/create-request"           element={<CreateRequest />} />
        <Route path="/view-requests"            element={<ViewRequests />} />
        <Route path="/donor-search"             element={<DonorSearch />} />
        <Route path="/messages"                 element={<Messages />} />
        <Route path="/profile"                  element={<Profile />} />
        <Route path="/settings"                 element={<Settings />} />
        <Route path="/certificates"             element={<Certificates />} />
        <Route path="/verify-pending"           element={<VerifyPending />} />
        <Route path="/request-details/:id"      element={<RequestDetails />} />

        {/* 404 */}
        <Route path="*"                         element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
