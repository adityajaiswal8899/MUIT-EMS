import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminAPI, eventsAPI } from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import {
  Users,
  ShieldCheck,
  Calendar,
  Ticket,
  CheckCircle2,
  Award,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Trash2,
  Edit,
  Search,
  RefreshCw,
  FileSpreadsheet,
  ShieldAlert,
  FolderKanban
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);

  // Data lists
  const [usersList, setUsersList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [registrationsList, setRegistrationsList] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [certificatesList, setCertificatesList] = useState([]);
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  const fetchAdminOverview = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getStats();
      if (res.data?.success) {
        setStats(res.data.stats);
        setCategoryStats(res.data.categoryStats || []);
        setTopEvents(res.data.topEvents || []);
        setMonthlyStats(res.data.monthlyRegistrations || []);
      }
    } catch (err) {
      console.error('Admin stats error:', err);
      toast.error('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tabId) => {
    try {
      if (tabId === 'students') {
        const res = await adminAPI.getUsers({ role: 'student', search: userSearch });
        if (res.data?.success) setUsersList(res.data.users);
      } else if (tabId === 'organizers') {
        const res = await adminAPI.getUsers({ role: 'organizer' });
        if (res.data?.success) setUsersList(res.data.users);
      } else if (tabId === 'events') {
        const res = await eventsAPI.getEvents({ limit: 100 });
        if (res.data?.success) setEventsList(res.data.events);
      } else if (tabId === 'registrations') {
        const res = await adminAPI.getAllRegistrations();
        if (res.data?.success) setRegistrationsList(res.data.registrations);
      } else if (tabId === 'attendance') {
        const res = await adminAPI.getAllAttendance();
        if (res.data?.success) setAttendanceList(res.data.attendances);
      } else if (tabId === 'certificates') {
        const res = await adminAPI.getAllCertificates();
        if (res.data?.success) setCertificatesList(res.data.certificates);
      } else if (tabId === 'feedbacks') {
        const res = await adminAPI.getAllFeedbacks();
        if (res.data?.success) setFeedbacksList(res.data.feedbacks);
      }
    } catch (err) {
      console.error(`Error loading tab ${tabId}:`, err);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    loadTabData(tabId);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await adminAPI.deleteUser(userId);
      if (res.data?.success) {
        toast.success('User deleted successfully');
        loadTabData(activeTab);
        fetchAdminOverview();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handlePromoteUser = async (userId, newRole) => {
    try {
      const res = await adminAPI.updateUser(userId, { role: newRole });
      if (res.data?.success) {
        toast.success(`User role updated to ${newRole}`);
        loadTabData(activeTab);
        fetchAdminOverview();
      }
    } catch (err) {
      toast.error('Failed to change role');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-slate-50">
      
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={handleTabChange} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-6xl">
        
        {/* ================= TAB: ADMIN DASHBOARD OVERVIEW ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-muit-950 to-blue-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold tracking-wider bg-white/20 px-3 py-1 rounded-full uppercase">
                  Central Academic Administration
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold">
                  System Overview & Intelligence
                </h1>
                <p className="text-xs text-slate-300">
                  Real-time metrics, event participation, attendance verification rate, and student demographics.
                </p>
              </div>

              <button
                onClick={fetchAdminOverview}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* 6 Key Stat Cards (Required by Prompt) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase">Students</span>
                  <Users className="w-4 h-4 text-muit-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 font-display">
                  {stats?.totalStudents || 0}
                </div>
                <p className="text-[10px] text-slate-500">Registered</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase">Organizers</span>
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-extrabold text-purple-600 font-display">
                  {stats?.totalOrganizers || 0}
                </div>
                <p className="text-[10px] text-slate-500">Faculty coordinators</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase">Events</span>
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-extrabold text-blue-600 font-display">
                  {stats?.totalEvents || 0}
                </div>
                <p className="text-[10px] text-slate-500">Symposia & fests</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase">Registrations</span>
                  <Ticket className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-extrabold text-indigo-600 font-display">
                  {stats?.totalRegistrations || 0}
                </div>
                <p className="text-[10px] text-slate-500">Enrolled passes</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase">Attendance</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 font-display">
                  {stats?.totalAttendance || 0}
                </div>
                <p className="text-[10px] text-slate-500">Verified check-ins</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase">Certificates</span>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-extrabold text-amber-600 font-display">
                  {stats?.totalCertificates || 0}
                </div>
                <p className="text-[10px] text-slate-500">Credentials issued</p>
              </div>

            </div>

            {/* Visual Analytics Grid (Required by prompt) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Event Category Statistics */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-muit-600" />
                    <span>Event Category Distribution</span>
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">{categoryStats.length} Categories</span>
                </div>

                <div className="space-y-3">
                  {categoryStats.map((cat) => {
                    const pct = Math.min(100, (cat.count / (stats?.totalEvents || 1)) * 100);
                    return (
                      <div key={cat._id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">{cat._id}</span>
                          <span className="text-slate-500 font-semibold">{cat.count} Events ({cat.totalRegistered} Enrolled)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-muit-600 to-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event Participation Leaderboard */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Top Participated Events</span>
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">By Registrations</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {topEvents.map((evt) => (
                    <div key={evt._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-slate-800 truncate">{evt.title}</h4>
                        <span className="text-[10px] text-slate-400">{evt.category}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-muit-700">{evt.registeredCount}</span>
                        <span className="text-slate-400"> / {evt.capacity} seats</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Attendance & Completion Insights */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Attendance Conversion Rate</h3>
                <p className="text-xs text-slate-500">Percentage of registered students who verified their QR pass at event gates.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-emerald-600 font-display">
                    {stats?.attendanceRate || 0}%
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Turnout Rate</span>
                </div>
                <div className="w-32 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${stats?.attendanceRate || 0}%` }}
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB: MANAGE STUDENTS ================= */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Manage Students</h1>
                <p className="text-xs text-slate-500">View enrolled students, update enrollment details, or promote to organizer.</p>
              </div>

              <div className="w-full sm:w-64 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') loadTabData('students');
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-muit-600"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Enrollment No.</th>
                    <th className="py-3.5 px-4">Course & Semester</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((st) => (
                    <tr key={st._id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{st.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{st.email}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{st.enrollmentNumber || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{st.course} • {st.semester}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePromoteUser(st._id, 'organizer')}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-[10px]"
                            title="Promote to Organizer"
                          >
                            Make Organizer
                          </button>
                          <button
                            onClick={() => handleDeleteUser(st._id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: MANAGE ORGANIZERS ================= */}
        {activeTab === 'organizers' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Faculty Event Organizers</h1>
              <p className="text-xs text-slate-500">Coordinators authorized to publish events and scan attendance.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Organizer Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((org) => (
                    <tr key={org._id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{org.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{org.email}</td>
                      <td className="py-3.5 px-4 text-slate-600">{org.course || 'Faculty'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{org.phone || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handlePromoteUser(org._id, 'student')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[10px]"
                        >
                          Demote to Student
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: ALL EVENTS ================= */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Campus Events Master</h1>
              <p className="text-xs text-slate-500">Full institutional event repository.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Registrations</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventsList.map((evt) => (
                    <tr key={evt._id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{evt.title}</td>
                      <td className="py-3.5 px-4">{evt.category}</td>
                      <td className="py-3.5 px-4 text-slate-600">{new Date(evt.date).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{evt.registeredCount} / {evt.capacity}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold">
                          {evt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: ALL REGISTRATIONS ================= */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Global Registrations Log</h1>
              <p className="text-xs text-slate-500">Every event ticket booked across MUIT.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Event</th>
                    <th className="py-3.5 px-4">Pass ID</th>
                    <th className="py-3.5 px-4">Booked On</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrationsList.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{r.student?.name}</td>
                      <td className="py-3.5 px-4 text-slate-800">{r.event?.title}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{r.registrationId}</td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: ATTENDANCE LOGS ================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Live Attendance Audit Logs</h1>
              <p className="text-xs text-slate-500">All entrance verification scans.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Event</th>
                    <th className="py-3.5 px-4">Check-in Timestamp</th>
                    <th className="py-3.5 px-4">Marked By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceList.map((att) => (
                    <tr key={att._id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{att.student?.name}</td>
                      <td className="py-3.5 px-4 text-slate-800">{att.event?.title}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{new Date(att.checkInTime).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-slate-600">{att.markedBy?.name || 'Gate Scanner'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: CERTIFICATES MASTER ================= */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Issued Certificates Directory</h1>
              <p className="text-xs text-slate-500">Official digital credentials granted to students.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Certificate ID</th>
                    <th className="py-3.5 px-4">Recipient Student</th>
                    <th className="py-3.5 px-4">Event</th>
                    <th className="py-3.5 px-4">Issue Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificatesList.map((cert) => (
                    <tr key={cert._id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700">{cert.certificateId}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{cert.student?.name}</td>
                      <td className="py-3.5 px-4 text-slate-800">{cert.event?.title}</td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(cert.issueDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: FEEDBACKS ================= */}
        {activeTab === 'feedbacks' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Student Feedback Repository</h1>
              <p className="text-xs text-slate-500">Ratings and written suggestions submitted by attendees.</p>
            </div>

            <div className="space-y-3">
              {feedbacksList.map((fb) => (
                <div key={fb._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{fb.event?.title}</span>
                      <p className="text-slate-400">By {fb.student?.name} ({fb.student?.course})</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold">
                      ⭐ {fb.rating} / 5
                    </span>
                  </div>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl italic">"{fb.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default AdminDashboard;
