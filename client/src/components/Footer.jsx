import { Link } from "react-router-dom";
import { Droplets, Heart, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Jeevan</span>
                <span className="text-xl font-bold text-red-400">Saarthi</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connecting blood donors with patients in need. Every drop counts, every life matters.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: "Find Blood", href: "/view-requests" },
                { label: "Become a Donor", href: "/register" },
                { label: "Emergency Request", href: "/emergency" },
                { label: "About Us", href: "/about" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Organizations */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Organizations</h3>
            <ul className="space-y-2">
              {[
                { label: "Hospital Registration", href: "/register" },
                { label: "NGO Partnership", href: "/register" },
                { label: "Create Request", href: "/create-request" },
                { label: "Help Center", href: "/help" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-red-400" />
                <span>+977-1-4XXXXXX</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-red-400" />
                <span>info@jeevansaarthi.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-red-400" />
                <span>Kathmandu, Nepal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2026 Jeevan Saarthi. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500" /> to save lives in Nepal
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;