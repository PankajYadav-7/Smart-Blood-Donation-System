import { Link } from "react-router-dom";
import { Droplets, Phone, Mail, MapPin, Heart, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, hsl(0 70% 35%) 0%, hsl(350 75% 28%) 50%, hsl(355 80% 22%) 100%)",
      }}
    >
      {/* Decorative SVG shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMaxYMid slice">
            <circle cx="300" cy="100" r="80"  fill="white" opacity="0.1" />
            <circle cx="350" cy="250" r="60"  fill="white" opacity="0.08" />
            <circle cx="200" cy="350" r="100" fill="white" opacity="0.05" />
            <path d="M320 180 Q330 200 340 180 Q350 160 340 140 Q330 120 320 140 Q310 160 320 180Z" fill="white" opacity="0.15" />
            <path d="M380 300 Q388 316 396 300 Q404 284 396 268 Q388 252 380 268 Q372 284 380 300Z" fill="white" opacity="0.12" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-1/4 w-96 h-48 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-5 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/20 shadow-lg">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Jeevan Saarthi</span>
            </div>
            <p className="text-white/80 leading-relaxed text-sm">
              Connecting patients in urgent need with compatible donors, hospitals, and NGOs in real
              time. Every drop counts, every life matters.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Heart className="h-4 w-4 text-white/60" />
              <span className="text-sm text-white/60">Saving lives since 2024</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <span className="w-8 h-0.5 bg-white/40 rounded-full" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Find Blood",        href: "/find-blood" },
                { label: "Become a Donor",    href: "/donate" },
                { label: "Emergency Request", href: "/emergency" },
                { label: "Hospitals",         href: "/hospitals" },
                { label: "Help Center",       href: "/help" },
                { label: "About Us",          href: "/about" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/75 hover:text-white inline-flex items-center gap-2 transition-all duration-300 group text-sm hover:translate-x-1"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Organizations */}
          <div className="space-y-5">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <span className="w-8 h-0.5 bg-white/40 rounded-full" />
              Organizations
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Hospital Registration",    href: "/register" },
                { label: "NGO Partnership",          href: "/register" },
                { label: "Create Blood Request",     href: "/create-request" },
                { label: "Partnership Application",  href: "/partnership-application" },
                { label: "Donor Search",             href: "/donor-search" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/75 hover:text-white inline-flex items-center gap-2 transition-all duration-300 group text-sm hover:translate-x-1"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <span className="w-8 h-0.5 bg-white/40 rounded-full" />
              Emergency Contact
            </h3>
            <ul className="space-y-4">
              {[
                { icon: Phone, text: "Nepal Red Cross: 01-4270650" },
                { icon: Mail,  text: "info@jeevansaarthi.com" },
                { icon: MapPin,text: "Kathmandu, Nepal" },
              ].map((item, i) => (
                <li key={i} className="flex items-center space-x-3 group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 group-hover:bg-white/25 transition-colors duration-300 flex-shrink-0">
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white/90 text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/70 text-sm">
            © 2026 Jeevan Saarthi. All rights reserved.
          </p>
          <p className="text-white/50 text-sm flex items-center gap-2">
            <Heart className="h-4 w-4 text-white/60" />
            Saving lives through technology in Nepal
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
