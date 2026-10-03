import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  registrationsAPI, 
  attendanceAPI, 
  certificatesAPI, 
  feedbackAPI, 
  authAPI,
  eventsAPI
} from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import QRModal from '../../components/common/QRModal';
import CertificateView from '../../components/common/CertificateView';
import FeedbackModal from '../../components/common/FeedbackModal';
import EventCard from '../../components/common/EventCard';
import { QRCodeSVG } from 'qrcode.react';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  CheckCircle2,
  Award,
  MessageSquare,
  User,
  Clock,
  MapPin,
  Download,
  Printer,
  Trash2,
  ExternalLink,
  Save,
  Star,
  RefreshCw,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, updateUserProfile } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab state from URL or default to 'dashboard'
  const getNormalizedTab = (t) => {
    if (t === 'qr' || t === 'passes' || t === 'my-qr') return 'my-qr';
    return t || 'dashboard';
  };
  const [activeTab, setActiveTab] = useState(() => getNormalizedTab(searchParams.get('tab')));
  const [passFilter, setPassFilter] = useState('all'); // 'all', 'active', 'attended'

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(getNormalizedTab(tabParam));
    }
  }, [searchParams]);

  // Data states
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);

  // Modals
  const [selectedPass, setSelectedPass] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedFeedbackEvent, setSelectedFeedbackEvent] = useState(null);

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    enrollmentNumber: user?.enrollmentNumber || '',
    course: user?.course || 'BCA',
    semester: user?.semester || '4th Semester'
  });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [regRes, attRes, certRes, fbRes, evRes] = await Promise.allSettled([
        registrationsAPI.getMyRegistrations(),
        attendanceAPI.getMyAttendance(),
        certificatesAPI.getMyCertificates(),
        feedbackAPI.getMyFeedbacks(),
        eventsAPI.getEvents({ limit: 6 })
      ]);

      if (regRes.status === 'fulfilled' && regRes.value.data?.success) {
        setRegistrations(regRes.value.data.registrations);
      }
      if (attRes.status === 'fulfilled' && attRes.value.data?.success) {
        setAttendances(attRes.value.data.attendances);
      }
      if (certRes.status === 'fulfilled' && certRes.value.data?.success) {
        setCertificates(certRes.value.data.certificates);
      }
      if (fbRes.status === 'fulfilled' && fbRes.value.data?.success) {
        setFeedbacks(fbRes.value.data.feedbacks);
      }
      if (evRes.status === 'fulfilled' && evRes.value.data?.success) {
        setRecentEvents(evRes.value.data.events);
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleCancelRegistration = async (regId) => {
    if (!window.confirm('Are you sure you want to cancel this event registration?')) return;

    try {
      const res = await registrationsAPI.cancelRegistration(regId);
      if (res.data?.success) {
        toast.success(res.data.message || 'Registration cancelled successfully');
        fetchStudentData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel registration');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await authAPI.updateProfile(profileData);
      if (res.data?.success) {
        updateUserProfile(res.data.user);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Metrics computation
  const activeRegistrations = registrations.filter((r) => r.status === 'Registered');
  const attendedRegistrations = registrations.filter((r) => r.status === 'Attended');
  const upcomingEventsCount = activeRegistrations.filter(
    (r) => r.event && new Date(r.event.date) >= new Date()
  ).length;
  const registeredEventIds = new Set(
    registrations.filter((r) => r.status !== 'Cancelled').map((r) => r.event?._id)
  );

  const handleRegisterEvent = async (event) => {
    try {
      const res = await registrationsAPI.register(event._id);
      if (res.data?.success) {
        toast.success(res.data.message || 'Successfully registered!');
        if (res.data.registration) {
          setSelectedPass(res.data.registration);
        }
        fetchStudentData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleDownloadSingleQR = (reg) => {
    const svgElement = document.getElementById(`qr-svg-card-${reg.registrationId}`);
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, 400, 400);
        context.drawImage(image, 20, 20, 360, 360);

        const png = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = png;
        downloadLink.download = `MUIT-PASS-${reg.registrationId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success(`Pass ${reg.registrationId} downloaded!`);
      };
      image.src = blobURL;
    } else if (reg.qrCode) {
      const link = document.createElement('a');
      link.href = reg.qrCode;
      link.download = `MUIT-PASS-${reg.registrationId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Pass ${reg.registrationId} downloaded!`);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-slate-50">
      
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={handleTabChange} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-6xl">
        
        {/* ================= TAB: DASHBOARD OVERVIEW ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Header banner */}
            <div className="bg-gradient-to-r from-muit-900 to-muit-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="max-w-xl space-y-2">
                <span className="text-xs font-mono font-bold tracking-wider bg-white/20 px-3 py-1 rounded-full uppercase">
                  Student Portal
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-xs sm:text-sm text-blue-100">
                  Enrollment No: <strong className="text-white">{user?.enrollmentNumber || 'MUIT/BCA/2024'}</strong> • Course: <strong className="text-white">{user?.course || 'BCA'}</strong> ({user?.semester})
                </p>
              </div>
            </div>

            {/* Metric Cards (Required by prompt: Total Registered, Upcoming, Attended, Certificates, Pending) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Registered</span>
                  <Ticket className="w-4 h-4 text-muit-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 font-display">
                  {registrations.length}
                </div>
                <p className="text-[10px] text-slate-500">All-time passes</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Upcoming</span>
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-extrabold text-blue-600 font-display">
                  {upcomingEventsCount}
                </div>
                <p className="text-[10px] text-slate-500">Events lined up</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Attended</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 font-display">
                  {attendedRegistrations.length}
                </div>
                <p className="text-[10px] text-slate-500">Verified at entrance</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Certificates</span>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-extrabold text-amber-600 font-display">
                  {certificates.length}
                </div>
                <p className="text-[10px] text-slate-500">Ready to download</p>
              </div>

              <div 
                onClick={() => handleTabChange('my-qr')}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1 col-span-2 md:col-span-1 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <span className="text-xs font-bold uppercase">Active Passes</span>
                  <Ticket className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-extrabold text-indigo-600 font-display">
                  {activeRegistrations.length}
                </div>
                <p className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>QR gate passes</span>
                  <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">View →</span>
                </p>
              </div>

            </div>

            {/* Quick Actions & Recent Passes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Active QR Passes ready for entry */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-muit-600" />
                    <span>My Upcoming QR Passes</span>
                  </h2>
                  <button
                    onClick={() => handleTabChange('my-qr')}
                    className="text-xs font-bold text-muit-700 hover:underline"
                  >
                    View All
                  </button>
                </div>

                {activeRegistrations.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs space-y-2">
                    <Ticket className="w-8 h-8 mx-auto text-slate-300" />
                    <p>No active registrations right now.</p>
                    <Link
                      to="/events"
                      className="inline-block px-4 py-2 rounded-xl bg-muit-700 text-white font-bold text-xs"
                    >
                      Browse Campus Events
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeRegistrations.slice(0, 3).map((reg) => (
                      <div
                        key={reg._id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {reg.event?.category || 'Event'}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                            {reg.event?.title}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {new Date(reg.event?.date).toLocaleDateString()} • {reg.event?.venue}
                          </p>
                        </div>

                        <button
                          onClick={() => setSelectedPass(reg)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs shadow-sm transition-all shrink-0 flex items-center gap-1.5"
                        >
                          <Ticket className="w-3.5 h-3.5 text-amber-300" />
                          <span>Wristband & Pass</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Earned Certificates Mini Panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>My Certificates</span>
                  </h2>
                  <button
                    onClick={() => handleTabChange('certificates')}
                    className="text-xs font-bold text-muit-700 hover:underline"
                  >
                    View All
                  </button>
                </div>

                {certificates.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    No certificates issued yet. Complete an event and verify attendance to earn certificates!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {certificates.slice(0, 2).map((cert) => (
                      <div
                        key={cert._id}
                        className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2"
                      >
                        <span className="text-[10px] font-mono font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                          {cert.certificateId}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {cert.event?.title}
                        </h4>
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>View & Print Certificate</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Featured & Upcoming Events Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muit-600 bg-muit-50 px-3 py-1 rounded-full border border-muit-100">
                    Campus Highlights
                  </span>
                  <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 mt-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muit-600" />
                    <span>Featured & Upcoming Events</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Discover upcoming competitions, workshops, and hackathons open for student registration.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTabChange('browse-events')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    View in Portal
                  </button>
                  <Link
                    to="/events"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-muit-700 hover:bg-muit-800 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Full Directory</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {recentEvents.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs space-y-2">
                  <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                  <p>No featured events scheduled right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentEvents.slice(0, 3).map((event) => (
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
            </div>

          </div>
        )}

        {/* ================= TAB: BROWSE EVENTS ================= */}
        {activeTab === 'browse-events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Browse College Events</h1>
                <p className="text-xs text-slate-500">Discover all active and upcoming activities across MUIT.</p>
              </div>
              <Link
                to="/events"
                className="px-4 py-2 rounded-xl bg-muit-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <span>Full Directory Filter</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentEvents.map((evt) => (
                <div key={evt._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-muit-50 text-muit-700">
                      {evt.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {evt.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{evt.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{evt.description}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>{new Date(evt.date).toLocaleDateString()}</span>
                    <Link
                      to={`/events/${evt._id}`}
                      className="font-bold text-muit-700 hover:underline"
                    >
                      View & Register →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: MY EVENTS ================= */}
        {activeTab === 'my-events' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Registered Events</h1>
              <p className="text-xs text-slate-500">Track your registration status, event dates, and access your entry tickets.</p>
            </div>

            {registrations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Registrations Yet</h3>
                <p className="text-xs text-slate-500">You haven't registered for any college events yet.</p>
                <Link to="/events" className="inline-block px-4 py-2 rounded-xl bg-muit-700 text-white text-xs font-bold">
                  Browse Campus Events
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-3.5 px-4">Event</th>
                        <th className="py-3.5 px-4">Pass ID</th>
                        <th className="py-3.5 px-4">Date & Time</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {registrations.map((reg) => (
                        <tr key={reg._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-900">
                            <div>
                              <p>{reg.event?.title}</p>
                              <span className="text-[10px] text-slate-400 font-normal">{reg.event?.venue}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono font-semibold text-slate-700">
                            {reg.registrationId}
                          </td>
                          <td className="py-4 px-4 text-slate-600">
                            {new Date(reg.event?.date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                reg.status === 'Attended'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : reg.status === 'Cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {reg.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {reg.status !== 'Cancelled' && (
                                <button
                                  onClick={() => setSelectedPass(reg)}
                                  className="px-3 py-1.5 bg-muit-50 hover:bg-muit-100 text-muit-700 border border-muit-200 rounded-lg font-bold text-[11px] flex items-center gap-1"
                                >
                                  <Ticket className="w-3 h-3" />
                                  QR Pass
                                </button>
                              )}
                              {reg.status === 'Registered' && (
                                <button
                                  onClick={() => handleCancelRegistration(reg._id)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Cancel Registration"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: MY QR PASS ================= */}
        {activeTab === 'my-qr' && (
          <div className="space-y-6">
            
            {/* Header & Controls */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                      Digital Gate Access
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Total Passes: {registrations.filter(r => r.status !== 'Cancelled').length}
                    </span>
                  </div>
                  <h1 className="text-2xl font-display font-extrabold text-slate-900 mt-2">
                    My QR Event Passes
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Show these official dynamic QR passes at the entrance gate for instant 1-second check-in verification.
                  </p>
                </div>

                <Link
                  to="/events"
                  className="px-4 py-2.5 rounded-xl bg-muit-700 hover:bg-muit-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Browse More Events</span>
                </Link>
              </div>

              {/* Pass Filter Tabs */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setPassFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    passFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Passes ({registrations.filter(r => r.status !== 'Cancelled').length})
                </button>
                <button
                  type="button"
                  onClick={() => setPassFilter('active')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    passFilter === 'active'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Active / Upcoming ({activeRegistrations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPassFilter('attended')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    passFilter === 'attended'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Attended / Past ({attendedRegistrations.length})
                </button>
              </div>
            </div>

            {/* Passes Content */}
            {(() => {
              const displayedPasses = registrations.filter((r) => {
                if (r.status === 'Cancelled') return false;
                if (passFilter === 'active') return r.status === 'Registered';
                if (passFilter === 'attended') return r.status === 'Attended';
                return true;
              });

              if (displayedPasses.length === 0) {
                return (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                    <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">
                      {passFilter === 'active'
                        ? 'No Active Upcoming Passes'
                        : passFilter === 'attended'
                        ? 'No Attended Passes Recorded Yet'
                        : 'No Event Passes Found'}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {passFilter === 'active'
                        ? 'Register for an upcoming campus event to generate your dynamic QR gate pass.'
                        : passFilter === 'attended'
                        ? 'When organizers scan your QR pass at event gates, your passes will be archived here.'
                        : 'Explore campus events and claim your free digital passes.'}
                    </p>
                    <Link
                      to="/events"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-muit-700 hover:bg-muit-800 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Explore Campus Events</span>
                    </Link>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedPasses.map((reg) => {
                    const isAttended = reg.status === 'Attended';
                    return (
                      <div
                        key={reg._id}
                        className={`bg-white rounded-3xl border shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between ${
                          isAttended ? 'border-slate-200 opacity-95' : 'border-emerald-200/80 ring-1 ring-emerald-500/20'
                        }`}
                      >
                        {/* Ticket Top Ribbon / Mini Wristband Header */}
                        <div className={`p-3.5 text-white relative overflow-hidden ${
                          isAttended ? 'bg-gradient-to-r from-slate-800 to-slate-700' : 'bg-gradient-to-r from-[#e6005c] via-[#f41f7a] to-[#d60050]'
                        }`}>
                          {/* Decorative Guilloché Watermark */}
                          <div className="absolute right-0 top-0 bottom-0 w-24 opacity-15 pointer-events-none flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-20 h-20 stroke-white fill-none stroke-[1]">
                              <circle cx="50" cy="50" r="40" />
                              <circle cx="50" cy="50" r="25" />
                              <ellipse cx="50" cy="50" rx="38" ry="18" />
                            </svg>
                          </div>

                          <div className="flex items-center justify-between gap-2 mb-1 z-10 relative">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                                PASS ✳✳
                              </span>
                              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/25 text-pink-100">
                                {reg.event?.category || 'MUIT Event'}
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              isAttended ? 'bg-emerald-400 text-slate-950' : 'bg-white/20 text-white'
                            }`}>
                              {isAttended ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Checked In</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>Gate Entry Band</span>
                                </>
                              )}
                            </span>
                          </div>

                          <h3 className="text-sm font-black italic tracking-tight line-clamp-1 leading-snug z-10 relative">
                            {reg.event?.title?.toUpperCase().includes('AAGAAZ') ? 'AAGAAZ 2K26' : reg.event?.title || 'Campus Event'}
                          </h3>
                        </div>

                        {/* Ticket QR Section */}
                        <div className="p-6 text-center space-y-4">
                          <div className="p-4 bg-gradient-to-b from-slate-50 to-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center">
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                              <QRCodeSVG
                                id={`qr-svg-card-${reg.registrationId}`}
                                value={reg.registrationId}
                                size={150}
                                level="H"
                                includeMargin={true}
                                fgColor="#0f172a"
                                bgColor="#ffffff"
                              />
                            </div>

                            {/* Pass ID with Copy Button */}
                            <div className="flex items-center gap-1.5 mt-3">
                              <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-sm">
                                {reg.registrationId}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(reg.registrationId);
                                  toast.success(`Pass ID ${reg.registrationId} copied!`);
                                }}
                                className="p-1 text-slate-400 hover:text-muit-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                                title="Copy Pass ID"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Event Metadata */}
                          <div className="text-xs text-slate-500 space-y-1 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
                              <Calendar className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              <span>{reg.event?.date ? new Date(reg.event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Upcoming'} • {reg.event?.startTime || '10:00 AM'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600 truncate">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{reg.event?.venue || 'MUIT Campus'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-4 pt-0 space-y-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPass(reg)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Ticket className="w-3.5 h-3.5 text-amber-300" />
                            <span>View Wristband Entry Pass</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDownloadSingleQR(reg)}
                            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Pass PNG</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ================= TAB: ATTENDANCE ================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Attendance Records</h1>
              <p className="text-xs text-slate-500">Verified check-in timestamps recorded at campus gates.</p>
            </div>

            {attendances.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Attendance Logged Yet</h3>
                <p className="text-xs text-slate-500">When organizers scan your QR pass at event gates, your check-in will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-3.5 px-4">Event Name</th>
                      <th className="py-3.5 px-4">Event Date</th>
                      <th className="py-3.5 px-4">Check-in Timestamp</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendances.map((att) => (
                      <tr key={att._id} className="hover:bg-slate-50/70">
                        <td className="py-4 px-4 font-bold text-slate-900">{att.event?.title}</td>
                        <td className="py-4 px-4 text-slate-600">{new Date(att.event?.date).toLocaleDateString()}</td>
                        <td className="py-4 px-4 font-mono text-slate-700">
                          {new Date(att.checkInTime).toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            ✓ {att.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: CERTIFICATES ================= */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Certificates</h1>
              <p className="text-xs text-slate-500">Official digital participation credentials with verifiable IDs.</p>
            </div>

            {certificates.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <Award className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Certificates Issued Yet</h3>
                <p className="text-xs text-slate-500">Certificates are automatically generated by organizers after verified event attendance.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <div
                    key={cert._id}
                    className="bg-white rounded-3xl border-2 border-amber-300/80 shadow-md p-6 space-y-4 hover:shadow-xl transition-all relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                        {cert.certificateId}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Issued: {new Date(cert.issueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{cert.event?.title}</h3>
                      <p className="text-xs text-slate-500">{cert.event?.organizerName || 'MUIT Council'}</p>
                    </div>

                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-4 h-4" />
                      <span>View Official Certificate & Print</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: FEEDBACK ================= */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Event Reviews & Feedback</h1>
              <p className="text-xs text-slate-500">Rate events you have attended and help enhance future editions.</p>
            </div>

            {/* List of attended events that can receive feedback */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Registered Events to Review
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {registrations.map((reg) => (
                  <div key={reg._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-slate-900">{reg.event?.title}</h3>
                    <p className="text-xs text-slate-500">{new Date(reg.event?.date).toLocaleDateString()}</p>
                    <button
                      onClick={() => setSelectedFeedbackEvent(reg.event)}
                      className="w-full py-2 rounded-xl bg-muit-50 hover:bg-muit-100 text-muit-700 border border-muit-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>Rate & Review This Event</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Past reviews submitted */}
            {feedbacks.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-slate-200">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Reviews You Submitted ({feedbacks.length})
                </h2>
                <div className="space-y-3">
                  {feedbacks.map((f) => (
                    <div key={f._id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{f.event?.title}</span>
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= f.rating ? 'fill-amber-400' : 'fill-slate-200 text-slate-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 italic">"{f.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: PROFILE ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Student Profile Settings</h1>
              <p className="text-xs text-slate-500">Manage your enrollment credentials and contact details.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl space-y-6">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Enrollment No.</label>
                    <input
                      type="text"
                      value={profileData.enrollmentNumber}
                      onChange={(e) => setProfileData({ ...profileData, enrollmentNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-muit-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Course</label>
                    <input
                      type="text"
                      value={profileData.course}
                      onChange={(e) => setProfileData({ ...profileData, course: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-muit-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                    <input
                      type="text"
                      value={profileData.semester}
                      onChange={(e) => setProfileData({ ...profileData, semester: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-muit-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-2.5 rounded-xl bg-muit-700 hover:bg-muit-800 text-white font-bold text-xs shadow transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* QR Modal */}
      {selectedPass && (
        <QRModal
          registration={selectedPass}
          onClose={() => setSelectedPass(null)}
        />
      )}

      {/* Certificate View Modal */}
      {selectedCert && (
        <CertificateView
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}

      {/* Feedback Modal */}
      {selectedFeedbackEvent && (
        <FeedbackModal
          event={selectedFeedbackEvent}
          onClose={() => setSelectedFeedbackEvent(null)}
          onSuccess={() => {
            fetchStudentData();
          }}
        />
      )}

    </div>
  );
};

export default StudentDashboard;
