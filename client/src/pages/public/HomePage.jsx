import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventsAPI, registrationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import EventCard from '../../components/common/EventCard';
import QRModal from '../../components/common/QRModal';
import { 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Search, 
  Users, 
  Award, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  FileBadge,
  LayoutDashboard
} from 'lucide-react';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [activeQRModal, setActiveQRModal] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedEvents();
    if (isAuthenticated && user?.role === 'student') {
      fetchMyRegistrations();
    }
  }, [isAuthenticated, user]);

  const fetchFeaturedEvents = async () => {
    try {
      setLoading(true);
      const res = await eventsAPI.getEvents({ limit: 6, status: 'Registration Open' });
      if (res.data?.success) {
        setEvents(res.data.events);
      }
    } catch (error) {
      console.error('Error fetching home events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const res = await registrationsAPI.getMyRegistrations();
      if (res.data?.success) {
        const ids = new Set(
          res.data.registrations
            .filter((r) => r.status !== 'Cancelled')
            .map((r) => r.event?._id)
        );
        setRegisteredEventIds(ids);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterEvent = async (event) => {
    if (!isAuthenticated) {
      toast.info('Please sign in or create an account to register for events');
      navigate('/login');
      return;
    }

    if (user?.role !== 'student') {
      toast.warning('Only students can register for events. Please switch to a student account.');
      return;
    }

    try {
      const res = await registrationsAPI.register(event._id);
      if (res.data?.success) {
        toast.success(res.data.message || 'Successfully registered!');
        setActiveQRModal(res.data.registration);
        setRegisteredEventIds((prev) => new Set([...prev, event._id]));
        fetchFeaturedEvents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const categories = [
    { name: 'Technical', icon: '💻', count: 'Hackathons & Tech Fest', color: 'from-blue-600 to-cyan-600' },
    { name: 'Workshop', icon: '⚡', count: 'AI, ML & Web Masterclasses', color: 'from-purple-600 to-indigo-600' },
    { name: 'Competition', icon: '🏆', count: 'Coding & Algorithmic Clashes', color: 'from-amber-500 to-orange-600' },
    { name: 'Cultural', icon: '🎭', count: 'Tarang Annual Arts & Music', color: 'from-rose-500 to-pink-600' },
    { name: 'Sports', icon: '⚽', count: 'Spardha Athletics & Leagues', color: 'from-emerald-500 to-teal-600' },
    { name: 'Career & Placement', icon: '🚀', count: 'Placement Drives & Bootcamps', color: 'from-sky-600 to-blue-700' },
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION (Official MUIT Campus Gate Design) */}
      <section className="relative w-full bg-slate-950 overflow-hidden">
        {/* Campus Gate Hero Banner Image */}
        <div className="relative w-full aspect-[1024/439] min-h-[380px] sm:min-h-[480px] lg:min-h-[560px] max-h-[85vh]">
          <img
            src="/muit_hero_section.png"
            alt="Maharishi University of Information Technology Event Management System"
            className="w-full h-full object-cover object-center pointer-events-none"
            style={{ imageRendering: '-webkit-optimize-contrast' }}
          />

          {/* Interactive Hotspots Overlay */}
          <div className="absolute inset-0">
            
            {/* 'Explore Events' Button Link */}
            <Link
              to="/events"
              title="Explore Campus Events"
              className="hero-cta-glow animate-shimmer group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-display flex items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 border border-white/35 hover:border-white/70 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none"
              style={{
                position: 'absolute',
                left: '24.2%',
                top: '50.8%',
                width: '11.8%',
                height: '7.8%'
              }}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 group-hover:rotate-12 group-hover:scale-125 transition-transform duration-300 shrink-0 drop-shadow" />
              <span className="text-[11px] sm:text-xs lg:text-[13.5px] font-extrabold tracking-wide whitespace-nowrap drop-shadow-sm">
                Explore Events
              </span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-100 group-hover:translate-x-1.5 group-hover:scale-110 group-hover:text-white transition-all duration-300 shrink-0 drop-shadow" />
            </Link>

            {/* 'My Dashboard' Button Link */}
            <Link
              to={
                user?.role === 'admin'
                  ? '/dashboard/admin'
                  : user?.role === 'organizer'
                  ? '/dashboard/organizer'
                  : isAuthenticated
                  ? '/dashboard/student'
                  : '/login'
              }
              title="Go to Dashboard"
              className="group relative overflow-hidden rounded-full bg-slate-900/80 hover:bg-slate-900/95 backdrop-blur-md text-white font-display flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-white/25 hover:border-white/60 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none"
              style={{
                position: 'absolute',
                left: '37.0%',
                top: '50.8%',
                width: '11.8%',
                height: '7.8%'
              }}
            >
              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-300 group-hover:rotate-6 transition-transform duration-300 shrink-0" />
              <span className="text-[11px] sm:text-xs lg:text-[13.5px] font-bold tracking-wide whitespace-nowrap">
                My Dashboard
              </span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 group-hover:translate-x-1 group-hover:text-white transition-transform duration-300 shrink-0" />
            </Link>

            {/* Card 1: 10+ Active Events */}
            <Link
              to="/events"
              title="View Active Events"
              className="hero-stat-card group rounded-2xl flex items-center justify-center gap-2.5 sm:gap-3 lg:gap-3.5 px-2.5 sm:px-3 lg:px-4 py-2 sm:py-3 cursor-pointer select-none"
              style={{
                position: 'absolute',
                left: '21.8%',
                top: '65.8%',
                width: '13.4%',
                height: '15.6%'
              }}
            >
              <div className="shrink-0 animate-subtle-float flex items-center justify-center">
                <div className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                  <Calendar className="w-7 h-7 sm:w-8 sm:h-8 lg:w-[38px] lg:h-[38px] text-blue-400 drop-shadow-[0_2px_10px_rgba(96,165,250,0.5)]" />
                </div>
              </div>
              <div className="flex flex-col justify-center text-left min-w-0">
                <span className="font-extrabold text-base sm:text-xl lg:text-2xl xl:text-3xl tracking-tight text-white leading-none">
                  10+
                </span>
                <span className="text-[7.5px] sm:text-[9px] lg:text-[10.5px] font-bold tracking-wider text-slate-300 uppercase mt-1 leading-tight whitespace-nowrap">
                  ACTIVE EVENTS
                </span>
              </div>
            </Link>

            {/* Card 2: 2,500+ Student Registrations */}
            <Link
              to={isAuthenticated ? '/dashboard/student?tab=my-events' : '/register'}
              title="Student Registrations"
              className="hero-stat-card group rounded-2xl flex items-center justify-center gap-2.5 sm:gap-3 lg:gap-3.5 px-2.5 sm:px-3 lg:px-4 py-2 sm:py-3 cursor-pointer select-none"
              style={{
                position: 'absolute',
                left: '35.9%',
                top: '65.8%',
                width: '13.6%',
                height: '15.6%'
              }}
            >
              <div className="shrink-0 animate-subtle-float-d1 flex items-center justify-center">
                <div className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                  <Users className="w-7 h-7 sm:w-8 sm:h-8 lg:w-[38px] lg:h-[38px] text-sky-200 drop-shadow-[0_2px_10px_rgba(186,230,253,0.5)]" />
                </div>
              </div>
              <div className="flex flex-col justify-center text-left min-w-0">
                <span className="font-extrabold text-base sm:text-xl lg:text-2xl xl:text-3xl tracking-tight text-white leading-none">
                  2,500+
                </span>
                <span className="text-[7.5px] sm:text-[9px] lg:text-[10.5px] font-bold tracking-wider text-slate-300 uppercase mt-1 leading-tight whitespace-nowrap">
                  STUDENT REGISTRATIONS
                </span>
              </div>
            </Link>

            {/* Card 3: 100% QR Digital Check-in */}
            <Link
              to={isAuthenticated ? '/dashboard/student?tab=my-qr' : '/login'}
              title="QR Digital Passes"
              className="hero-stat-card group rounded-2xl flex items-center justify-center gap-2.5 sm:gap-3 lg:gap-3.5 px-2.5 sm:px-3 lg:px-4 py-2 sm:py-3 cursor-pointer select-none"
              style={{
                position: 'absolute',
                left: '50.1%',
                top: '65.8%',
                width: '13.6%',
                height: '15.6%'
              }}
            >
              <div className="shrink-0 animate-subtle-float-d2 flex items-center justify-center">
                <div className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                  <QrCode className="w-7 h-7 sm:w-8 sm:h-8 lg:w-[38px] lg:h-[38px] text-cyan-400 drop-shadow-[0_2px_10px_rgba(34,211,238,0.5)]" />
                </div>
              </div>
              <div className="flex flex-col justify-center text-left min-w-0">
                <span className="font-extrabold text-base sm:text-xl lg:text-2xl xl:text-3xl tracking-tight text-white leading-none">
                  100%
                </span>
                <span className="text-[7.5px] sm:text-[9px] lg:text-[10.5px] font-bold tracking-wider text-slate-300 uppercase mt-1 leading-tight whitespace-nowrap">
                  QR DIGITAL CHECK-IN
                </span>
              </div>
            </Link>

            {/* Card 4: Digital Verified Certificates */}
            <Link
              to="/verify"
              title="Verify Official Digital Certificates"
              className="hero-stat-card group rounded-2xl flex items-center justify-center gap-2.5 sm:gap-3 lg:gap-3.5 px-2.5 sm:px-3 lg:px-4 py-2 sm:py-3 cursor-pointer select-none"
              style={{
                position: 'absolute',
                left: '64.3%',
                top: '65.8%',
                width: '13.6%',
                height: '15.6%'
              }}
            >
              <div className="shrink-0 animate-subtle-float-d3 flex items-center justify-center">
                <div className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                  <FileBadge className="w-7 h-7 sm:w-8 sm:h-8 lg:w-[38px] lg:h-[38px] text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]" />
                </div>
              </div>
              <div className="flex flex-col justify-center text-left min-w-0">
                <span className="font-extrabold text-base sm:text-xl lg:text-2xl xl:text-3xl tracking-tight text-amber-400 leading-none">
                  Digital
                </span>
                <span className="text-[7.5px] sm:text-[9px] lg:text-[10.5px] font-bold tracking-wider text-slate-300 uppercase mt-1 leading-tight whitespace-nowrap">
                  VERIFIED CERTIFICATES
                </span>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* 2. UPCOMING & FEATURED EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-muit-600 bg-muit-50 px-3 py-1 rounded-full border border-muit-100">
              Campus Highlights
            </span>
            <h2 className="text-3xl font-display font-extrabold text-slate-900 mt-2">
              Featured & Upcoming Events
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Hand-picked symposiums, workshops, and competitions taking place across MUIT.
            </p>
          </div>

          <Link
            to="/events"
            className="text-sm font-bold text-muit-700 hover:text-muit-800 flex items-center gap-1 group"
          >
            <span>View All Events</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onRegister={handleRegisterEvent}
                isRegistered={registeredEventIds.has(event._id)}
                userRole={user?.role}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. EVENT CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-muit-600 bg-muit-50 px-3 py-1 rounded-full border border-muit-100">
            Diverse Interests
          </span>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 mt-2">
            Explore by Categories
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Choose from a rich spectrum of technical, cultural, career, and athletic extracurricular activities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/events?category=${encodeURIComponent(cat.name)}`}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-card-hover hover:border-muit-200 transition-all flex items-center gap-4 group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform shrink-0`}>
                {cat.icon}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-muit-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {cat.count}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS (Application Flow) */}
      <section className="bg-gradient-to-b from-slate-100/70 to-slate-50 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-muit-600 bg-white px-3 py-1 rounded-full border border-slate-200">
              End-to-End Workflow
            </span>
            <h2 className="text-3xl font-display font-extrabold text-slate-900 mt-2">
              How MUIT Event System Works
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Seamless end-to-end digital lifecycle from discovery to certificate verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-muit-50 text-muit-700 font-bold flex items-center justify-center text-sm border border-muit-200">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Browse & Select</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log in as a student, search campus events by department or date, and review venue and speaker details.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-muit-50 text-muit-700 font-bold flex items-center justify-center text-sm border border-muit-200">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Instant QR Pass</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                1-click registration creates a tamper-proof QR code stored in MongoDB and available under "My QR Pass".
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-muit-50 text-muit-700 font-bold flex items-center justify-center text-sm border border-muit-200">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">QR Gate Scan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Organizers scan the student QR ticket at the entrance using the portal scanner to mark real-time attendance.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-muit-50 text-muit-700 font-bold flex items-center justify-center text-sm border border-muit-200">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900">Digital Certificate</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upon event completion, verified attendees receive a gold-sealed certificate with download and verification ID.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-muit-900 via-muit-800 to-blue-900 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold">
              Ready to Showcase Your Talent?
            </h2>
            <p className="text-sm text-blue-200 leading-relaxed">
              Join thousands of MUIT students in the upcoming Tech Fest, Hackathons, Cultural celebrations, and Placement bootcamps.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-white text-muit-900 font-bold text-sm shadow-md hover:bg-blue-50 transition-colors"
              >
                Register as Student
              </Link>
              <Link
                to="/events"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-colors"
              >
                View Full Calendar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QR Modal when student registers directly from Home Page */}
      {activeQRModal && (
        <QRModal
          registration={activeQRModal}
          onClose={() => setActiveQRModal(null)}
        />
      )}

    </div>
  );
};

export default HomePage;
