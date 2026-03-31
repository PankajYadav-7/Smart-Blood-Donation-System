import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Droplets, Menu, X, Heart, Users, Building,
  LayoutDashboard, User, LogOut, Phone,
} from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user  = JSON.parse(localStorage.getItem("user")  || "null");
  const token = localStorage.getItem("token");

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getDashboardLink = () => {
    const routes = {
      donor:     "/donor/dashboard",
      hospital:  "/hospital/dashboard",
      ngo:       "/ngo/dashboard",
      admin:     "/admin/dashboard",
      requester: "/patient/dashboard",
    };
    return routes[user?.role] || "/";
  };

  const navLinks = [
    { label: "Find Blood", href: "/find-blood" },
    { label: "Donate",     href: "/donate" },
    { label: "Hospitals",  href: "/hospitals" },
    { label: "Help",       href: "/help" },
    { label: "About",      href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-md">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold text-gray-900">Jeevan</span>
              <span className="text-xl font-bold text-red-600">Saarthi</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-red-600 bg-red-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Emergency always visible */}
            <Link
              to="/emergency"
              className="flex items-center px-4 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-all duration-200 emergency-glow-nav"
            >
              🚨 Emergency
            </Link>
          </nav>

          {/* Right side auth */}
          <div className="hidden md:flex items-center space-x-2">
            {token && user ? (
              <>
                <button
                  onClick={() => navigate(getDashboardLink())}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.fullName?.split(" ")[0]}
                  </span>
                </button>
                <button
                  onClick={() => navigate(getDashboardLink())}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Dashboard"
                >
                  <LayoutDashboard className="h-4 w-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Register Free</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl py-4">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-red-600 bg-red-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/emergency"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-bold text-red-600 bg-red-50"
              >
                🚨 Emergency Request
              </Link>

              <div className="border-t border-gray-100 pt-3 mt-2 flex flex-col gap-2">
                {token && user ? (
                  <>
                    <button
                      onClick={() => { navigate(getDashboardLink()); setIsMenuOpen(false); }}
                      className="text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      📊 Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-4">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
