import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  eventsAPI, 
  registrationsAPI, 
  attendanceAPI, 
  certificatesAPI, 
  authAPI 
} from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import QRScanner from '../../components/common/QRScanner';
import CertificateView from '../../components/common/CertificateView';
import {
  Calendar,
  CalendarPlus,
  Users,
  Ticket,
  CheckCircle2,
  Award,
  Edit,
  Trash2,
  Plus,
  Save,
  Clock,
  MapPin,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';

const OrganizerDashboard = () => {
  const { user, updateUserProfile } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [activeCertificateView, setActiveCertificateView] = useState(null);

  // Event Creation & Edit Form State
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    image: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    venue: '',
    capacity: 100,
    registrationDeadline: '',
    status: 'Registration Open'
  });
  const [savingEvent, setSavingEvent] = useState(false);

  // Profile
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    course: user?.course || 'Faculty of CS & IT',
    semester: user?.semester || 'Faculty'
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const fetchOrganizerData = async () => {
    try {
      setLoading(true);
      const res = await eventsAPI.getOrganizerEvents();
      if (res.data?.success) {
        setEvents(res.data.events);
        if (res.data.events.length > 0 && !selectedEventForRegistrations) {
          setSelectedEventForRegistrations(res.data.events[0]._id);
          fetchRegistrationsForEvent(res.data.events[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching organizer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationsForEvent = async (eventId) => {
    try {
      const res = await registrationsAPI.getEventRegistrations(eventId);
      if (res.data?.success) {
        setRegistrations(res.data.registrations);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setEventFormData({
      title: '',
      description: '',
      category: 'Technical',
      image: '',
      date: '',
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      duration: '',
      venue: '',
      capacity: 100,
      registrationDeadline: '',
      status: 'Registration Open'
    });
  };

  const handleEditClick = (evt) => {
    setEditingEventId(evt._id);
    setEventFormData({
      title: evt.title,
      description: evt.description,
      category: evt.category,
      image: evt.image,
      date: evt.date ? new Date(evt.date).toISOString().split('T')[0] : '',
      startTime: evt.startTime,
      endTime: evt.endTime,
      duration: evt.duration || '',
      venue: evt.venue,
      capacity: evt.capacity,
      registrationDeadline: evt.registrationDeadline
        ? new Date(evt.registrationDeadline).toISOString().split('T')[0]
        : '',
      status: evt.status
    });
    setActiveTab('create-event');
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setSavingEvent(true);
    try {
      if (editingEventId) {
        const res = await eventsAPI.updateEvent(editingEventId, eventFormData);
        if (res.data?.success) {
          toast.success('Event updated successfully');
          fetchOrganizerData();
          setActiveTab('manage-events');
          resetEventForm();
        }
      } else {
        const res = await eventsAPI.createEvent(eventFormData);
        if (res.data?.success) {
          toast.success('New event published successfully!');
          fetchOrganizerData();
          setActiveTab('manage-events');
          resetEventForm();
        }
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.response?.data?.message || 'Failed to save event');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to permanently delete this event and its registration records?')) {
      return;
    }

    try {
      const res = await eventsAPI.deleteEvent(eventId);
      if (res.data?.success) {
        toast.success(res.data.message || 'Event deleted successfully');
        fetchOrganizerData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleBatchGenerateCertificates = async (eventId) => {
    try {
      const res = await certificatesAPI.batchGenerate(eventId);
      if (res.data?.success) {
        toast.success(res.data.message || 'Certificates generated for all attendees!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Batch certificate generation failed');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile(profileData);
      if (res.data?.success) {
        updateUserProfile(res.data.user);
        toast.success('Profile details saved successfully');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Metrics
  const totalRegistrations = events.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0);
  const activeEventsCount = events.filter((e) => e.status === 'Registration Open' || e.status === 'Upcoming').length;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-slate-50">
      
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={handleTabChange} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-6xl">
        
        {/* ================= TAB: OVERVIEW DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-muit-900 via-muit-800 to-indigo-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold tracking-wider bg-white/20 px-3 py-1 rounded-full uppercase">
                  Faculty & Organizer Console
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold">
                  {user?.name}
                </h1>
                <p className="text-xs text-blue-200">
                  Manage college events, live QR attendance gates, and attendee digital credentials.
                </p>
              </div>

              <button
                onClick={() => {
                  resetEventForm();
                  setActiveTab('create-event');
                }}
                className="px-5 py-3 rounded-2xl bg-white text-muit-900 hover:bg-blue-50 font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Event</span>
              </button>
            </div>

            {/* Metrics (Total Events, Total Registrations, Total Participants, Attendance Count) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Total Events</span>
                  <Calendar className="w-4 h-4 text-muit-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 font-display">
                  {events.length}
                </div>
                <p className="text-[10px] text-slate-500">{activeEventsCount} active / upcoming</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Registrations</span>
                  <Ticket className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-extrabold text-blue-600 font-display">
                  {totalRegistrations}
                </div>
                <p className="text-[10px] text-slate-500">Total enrolled students</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Gate Scanner</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 font-display">
                  Live
                </div>
                <p className="text-[10px] text-slate-500">Camera QR ready</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase">Certificates</span>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-extrabold text-amber-600 font-display">
                  Automated
                </div>
                <p className="text-[10px] text-slate-500">Batch issuance ready</p>
              </div>

            </div>

            {/* Events Summary Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Your Managed Events</h2>
                <button
                  onClick={() => handleTabChange('manage-events')}
                  className="text-xs font-bold text-muit-700 hover:underline"
                >
                  Manage All Events →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {events.slice(0, 5).map((evt) => (
                  <div key={evt._id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{evt.title}</h4>
                      <p className="text-slate-400">{new Date(evt.date).toLocaleDateString()} • {evt.venue}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-700">
                        {evt.registeredCount} / {evt.capacity} students
                      </span>
                      <button
                        onClick={() => handleEditClick(evt)}
                        className="px-3 py-1 bg-muit-50 hover:bg-muit-100 text-muit-700 rounded-lg font-bold"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB: CREATE / EDIT EVENT ================= */}
        {activeTab === 'create-event' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {editingEventId ? 'Edit Event Details' : 'Create & Publish New Event'}
                </h1>
                <p className="text-xs text-slate-500">
                  Fill in all event credentials to open registrations for students.
                </p>
              </div>
              {editingEventId && (
                <button
                  onClick={resetEventForm}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-3xl">
              <form onSubmit={handleSaveEvent} className="space-y-5">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MUIT Hackathon 2026 / AI Masterclass"
                    value={eventFormData.title}
                    onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description & Objectives *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Detailed itinerary, rules, eligibility, and what students will learn..."
                    value={eventFormData.description}
                    onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={eventFormData.category}
                      onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-muit-600 bg-slate-50"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Competition">Competition</option>
                      <option value="Career & Placement">Career & Placement</option>
                      <option value="Exhibition">Exhibition</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status *</label>
                    <select
                      value={eventFormData.status}
                      onChange={(e) => setEventFormData({ ...eventFormData, status: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-muit-600 bg-slate-50"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Registration Open">Registration Open</option>
                      <option value="Registration Closed">Registration Closed</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={eventFormData.date}
                      onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-muit-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Start Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:00 AM"
                      value={eventFormData.startTime}
                      onChange={(e) => setEventFormData({ ...eventFormData, startTime: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-muit-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">End Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 04:30 PM"
                      value={eventFormData.endTime}
                      onChange={(e) => setEventFormData({ ...eventFormData, endTime: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-muit-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 3 Hours 30 Mins"
                      value={eventFormData.duration}
                      onChange={(e) => setEventFormData({ ...eventFormData, duration: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-muit-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Venue Location *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Central Auditorium / Lab Block B"
                      value={eventFormData.venue}
                      onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-muit-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Capacity *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 250"
                      value={eventFormData.capacity}
                      onChange={(e) => setEventFormData({ ...eventFormData, capacity: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-muit-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Registration Deadline *</label>
                    <input
                      type="date"
                      required
                      value={eventFormData.registrationDeadline}
                      onChange={(e) => setEventFormData({ ...eventFormData, registrationDeadline: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-muit-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Banner Image URL / Local Path</label>
                    <input
                      type="text"
                      placeholder="/images/byte-bash.jpeg or https://..."
                      value={eventFormData.image}
                      onChange={(e) => setEventFormData({ ...eventFormData, image: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-muit-600 font-mono"
                    />
                    
                    {/* Quick Preset Buttons for Uploaded Posters */}
                    <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] font-bold text-slate-400">Quick Posters:</span>
                      {[
                        { label: '🎯 Byte Bash', path: '/images/byte-bash.jpeg' },
                        { label: '💡 SIH 2026', path: '/images/sih-2026.jpeg' },
                        { label: '🚀 MIIF Fund', path: '/images/miif-seed-fund.jpeg' },
                        { label: '🏆 Sports Day', path: '/images/sports-day-2026.jpeg' },
                        { label: '💻 Tech-Sutra', path: '/images/tech-sutra.jpeg' },
                      ].map((poster, pidx) => (
                        <button
                          key={pidx}
                          type="button"
                          onClick={() => setEventFormData({ ...eventFormData, image: poster.path })}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border transition-all ${
                            eventFormData.image === poster.path
                              ? 'bg-muit-700 text-white border-muit-700 shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                        >
                          {poster.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingEvent}
                  className="px-8 py-3 rounded-2xl bg-muit-700 hover:bg-muit-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingEvent ? 'Saving...' : editingEventId ? 'Update Event' : 'Publish Event'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB: MANAGE EVENTS ================= */}
        {activeTab === 'manage-events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Manage Campus Events</h1>
                <p className="text-xs text-slate-500">Edit, update status, track capacity, or delete college events.</p>
              </div>
              <button
                onClick={() => {
                  resetEventForm();
                  setActiveTab('create-event');
                }}
                className="px-4 py-2 rounded-xl bg-muit-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Event</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-3.5 px-4">Event Title</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Enrolled / Capacity</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map((evt) => (
                      <tr key={evt._id} className="hover:bg-slate-50/70">
                        <td className="py-4 px-4 font-bold text-slate-900">
                          <div>
                            <p className="line-clamp-1">{evt.title}</p>
                            <span className="text-[10px] text-slate-400 font-normal">{evt.venue}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                            {evt.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          {new Date(evt.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-800">
                          {evt.registeredCount || 0} / {evt.capacity}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800">
                            {evt.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(evt)}
                              className="p-1.5 text-muit-700 hover:bg-muit-50 rounded-lg"
                              title="Edit Event"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(evt._id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                              title="Delete Event"
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
          </div>
        )}

        {/* ================= TAB: QR ATTENDANCE SCANNER ================= */}
        {activeTab === 'qr-scanner' && (
          <QRScanner
            events={events}
            onAttendanceMarked={(data) => {
              fetchOrganizerData();
            }}
          />
        )}

        {/* ================= TAB: REGISTRATIONS & PARTICIPANTS ================= */}
        {(activeTab === 'registrations' || activeTab === 'participants') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Registered Participants</h1>
                <p className="text-xs text-slate-500">Filter students enrolled in your events and review their check-in status.</p>
              </div>

              <div className="w-full sm:w-72">
                <select
                  value={selectedEventForRegistrations || ''}
                  onChange={(e) => {
                    setSelectedEventForRegistrations(e.target.value);
                    fetchRegistrationsForEvent(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white"
                >
                  {events.map((evt) => (
                    <option key={evt._id} value={evt._id}>
                      {evt.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Enrollment No.</th>
                    <th className="py-3.5 px-4">Course & Sem</th>
                    <th className="py-3.5 px-4">Pass ID</th>
                    <th className="py-3.5 px-4">Check-in Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        No registrations recorded for this event yet.
                      </td>
                    </tr>
                  ) : (
                    registrations.map((reg) => (
                      <tr key={reg._id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>
                            <p>{reg.student?.name}</p>
                            <span className="text-[10px] text-slate-400 font-normal">{reg.student?.email}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {reg.student?.enrollmentNumber || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {reg.student?.course || 'BCA'} ({reg.student?.semester || '4th'})
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {reg.registrationId}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              reg.attended || reg.status === 'Attended'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {reg.attended || reg.status === 'Attended' ? '✓ Checked In' : 'Pending Entry'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: CERTIFICATES ISSUANCE ================= */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Issue Digital Certificates</h1>
              <p className="text-xs text-slate-500">
                Grant authenticated certificates to students who attended your events.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((evt) => (
                <div key={evt._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-muit-50 text-muit-700">
                      {evt.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {new Date(evt.date).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{evt.title}</h3>
                  <p className="text-xs text-slate-500">{evt.venue}</p>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Enrolled:</span>
                      <span className="font-bold">{evt.registeredCount} students</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBatchGenerateCertificates(evt._id)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>Issue Certificates to All Attendees</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: PROFILE ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Organizer Profile</h1>
              <p className="text-xs text-slate-500">Manage faculty and departmental credentials.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-xl space-y-5">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Coordinator Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email (Official)</label>
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department / Committee</label>
                  <input
                    type="text"
                    value={profileData.course}
                    onChange={(e) => setProfileData({ ...profileData, course: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-muit-700 hover:bg-muit-800 text-white font-bold text-xs shadow flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* Certificate Modal */}
      {activeCertificateView && (
        <CertificateView
          certificate={activeCertificateView}
          onClose={() => setActiveCertificateView(null)}
        />
      )}

    </div>
  );
};

export default OrganizerDashboard;
