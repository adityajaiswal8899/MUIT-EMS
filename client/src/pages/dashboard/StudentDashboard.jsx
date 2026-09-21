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
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

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
        eventsAPI.getEvents({ limit: 4 })
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

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1 col-span-2 md:col-span-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Active Passes</span>
                  <Clock className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-extrabold text-indigo-600 font-display">
                  {activeRegistrations.length}
                </div>
                <p className="text-[10px] text-slate-500">QR active passes</p>
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
                          className="px-4 py-2 rounded-xl bg-muit-700 hover:bg-muit-800 text-white font-bold text-xs shadow transition-all shrink-0 flex items-center gap-1.5"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Show QR Pass</span>
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
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My QR Event Passes</h1>
              <p className="text-xs text-slate-500">Show these dynamic QR passes at the entrance gate for instant check-in.</p>
            </div>

            {activeRegistrations.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Active Passes Available</h3>
                <p className="text-xs text-slate-500">Register for an upcoming event to generate your digital gate pass.</p>
                <Link to="/events" className="inline-block px-4 py-2 rounded-xl bg-muit-700 text-white text-xs font-bold">
                  Explore Events
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRegistrations.map((reg) => (
                  <div
                    key={reg._id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 text-center space-y-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="bg-muit-900 text-white p-3 rounded-2xl">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
                        {reg.event?.category}
                      </span>
                      <h3 className="text-sm font-bold line-clamp-1 mt-0.5">{reg.event?.title}</h3>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center">
                      <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200">
                        <QRCodeSVG
                          value={reg.registrationId}
                          size={150}
                          level="H"
                          includeMargin={true}
                          fgColor="#0f172a"
                          bgColor="#ffffff"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded border border-slate-200 shadow-sm">
                          {reg.registrationId}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(reg.registrationId);
                            toast.success(`Pass ID ${reg.registrationId} copied!`);
                          }}
                          className="p-1 text-slate-400 hover:text-muit-700 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                          title="Copy Pass ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 space-y-0.5">
                      <p className="font-semibold text-slate-800">{new Date(reg.event?.date).toLocaleDateString()}</p>
                      <p className="truncate">{reg.event?.venue}</p>
                    </div>

                    <button
                      onClick={() => setSelectedPass(reg)}
                      className="w-full py-2.5 rounded-xl bg-muit-700 hover:bg-muit-800 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Full Screen Pass & Download</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
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
