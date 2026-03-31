import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { 
  Droplets, 
  Menu, 
  X, 
  Bell,
  User,
  LogOut,
  LayoutDashboard
} from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    const routes = {
      donor: "/donor/dashboard",
      hospital: "/hospital/dashboard",
      ngo: "/hospital/dashboard",
      admin: "/admin/dashboard",
      requester: "/",
    };
    return routes[user.role] || "/";
  };

  const navLinks = [
    { label: "Find Blood", href: "/view-requests" },
    { label: "Donate", href: "/donor/profile" },
    { label: "Emergency", href: "/emergency", className: "text-red-600 font-bold" },
    { label: "About", href: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Jeevan</span>
              <span className="text-xl font-bold text-red-600">Saarthi</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-red-600 ${
                  location.pathname === link.href 
                    ? "text-red-600" 
                    : "text-gray-600"
                } ${link.className || ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {token && user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(getDashboardLink())}
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.fullName?.split(" ")[0]}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-red-600 px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {token && user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="text-sm font-medium text-gray-600 px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-sm font-medium text-red-600 px-2 py-1"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;