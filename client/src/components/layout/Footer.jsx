import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Mail, Phone, Award, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/muit_logo.png"
                alt="Maharishi University of Information Technology Official Logo"
                className="w-11 h-11 rounded-full object-contain shadow-md ring-2 ring-amber-400/60 bg-white"
              />
              <span className="text-xl font-display font-bold text-white tracking-tight">
                MUIT <span className="text-muit-400">Events</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Maharishi University of Information Technology Official Event Management Portal. Connecting students, faculty, and innovators through campus events, workshops, and symposiums.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muit-950 text-muit-300 border border-muit-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Accredited & Certified
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">All Campus Events</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About MUIT Events</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Help & Contact Desk</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Portal Login</Link>
              </li>
            </ul>
          </div>

          {/* Event Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Event Categories
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Technical Symposiums & Hackathons</li>
              <li>Hands-on AI & Coding Workshops</li>
              <li>Cultural Fests & Performing Arts</li>
              <li>Annual Athletics & Sports Meet</li>
              <li>Placement Preparation & E-Conclave</li>
            </ul>
          </div>

          {/* Campus Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Campus Headquarters
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muit-400 shrink-0 mt-0.5" />
                <span>Sector 110, Noida Campus / IIM Road, Lucknow Campus, Uttar Pradesh, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muit-400 shrink-0" />
                <span>events@muit.in / info@muit.edu</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muit-400 shrink-0" />
                <span>+91 (0522) 2771000 / +91 98765 43210</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} MUIT Event Management System. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            <span>Tagline:</span>
            <span className="font-semibold text-muit-400">"Plan • Register • Participate • Manage"</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
