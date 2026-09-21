import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventsAPI, registrationsAPI, feedbackAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import QRModal from '../../components/common/QRModal';
import FeedbackModal from '../../components/common/FeedbackModal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  ShieldCheck,
  Star,
  ChevronLeft,
  Share2,
  Ticket,
  AlertCircle,
  MessageSquarePlus,
  Send,
  Timer,
  Maximize2,
  X
} from 'lucide-react';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [myRegistration, setMyRegistration] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    fetchEventFeedbacks();
    if (isAuthenticated && user?.role === 'student') {
      checkMyRegistration();
    }
  }, [id, isAuthenticated, user]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await eventsAPI.getEventById(id);
      if (res.data?.success) {
        setEvent(res.data.event);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Event not found or failed to load');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventFeedbacks = async () => {
    try {
      const res = await feedbackAPI.getEventFeedback(id);
      if (res.data?.success) {
        setFeedbacks(res.data.feedbacks);
        setAverageRating(res.data.averageRating);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const checkMyRegistration = async () => {
    try {
      const res = await registrationsAPI.getMyRegistrations();
      if (res.data?.success) {
        const found = res.data.registrations.find(
          (r) => r.event?._id === id && r.status !== 'Cancelled'
        );
        if (found) {
          setMyRegistration(found);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in as a student to register for this event');
      navigate('/login');
      return;
    }

    if (user?.role !== 'student') {
      toast.warning('Only student accounts can register for campus events');
      return;
    }

    setRegistering(true);
    try {
      const res = await registrationsAPI.register(id);
      if (res.data?.success) {
        toast.success(res.data.message || 'Successfully registered for event!');
        setMyRegistration(res.data.registration);
        setShowQRModal(true);
        fetchEventDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-muit-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 font-medium">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Event Not Found</h2>
        <p className="text-slate-500 text-sm">The event you are looking for does not exist or may have been deleted.</p>
        <Link to="/events" className="inline-block px-5 py-2.5 rounded-xl bg-muit-700 text-white text-xs font-bold">
          Back to Events
        </Link>
      </div>
    );
  }

  const isFull = event.registeredCount >= event.capacity;
  const deadlinePassed = new Date(event.registrationDeadline) <= new Date();
  const canRegister = event.status === 'Registration Open' && !isFull && !deadlinePassed;

  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const deadlineDate = new Date(event.registrationDeadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const capacityPercent = Math.min(
    100,
    Math.round(((event.registeredCount || 0) / (event.capacity || 100)) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button & Category */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-muit-50 text-muit-700 border border-muit-200">
            {event.category}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            event.status === 'Registration Open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'
          }`}>
            {event.status}
          </span>
        </div>
      </div>

      {/* Main Grid: Details + Registration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Hero Image, Title, Description, Itinerary, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Banner Image & Poster Overlay */}
          <div className="relative h-80 sm:h-[400px] w-full rounded-3xl overflow-hidden shadow-md border border-slate-200 group">
            <img
              src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'}
              alt={event.title}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            
            {/* View Full Poster Button */}
            <button
              onClick={() => setShowPosterModal(true)}
              className="absolute top-4 right-4 px-3.5 py-2 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md border border-white/25 shadow-xl flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
              title="Click to view full event flyer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>View Official Poster</span>
            </button>

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-xs font-mono font-bold tracking-wider bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
                MUIT Official Event
              </span>
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight mt-2 text-white">
                {event.title}
              </h1>
            </div>
          </div>

          {/* Quick Info Bar with Duration */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Calendar className="w-4 h-4 text-muit-600" />
                <span>Date</span>
              </div>
              <p className="font-bold text-slate-800">{eventDate}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Clock className="w-4 h-4 text-muit-600" />
                <span>Timing</span>
              </div>
              <p className="font-bold text-slate-800">{event.startTime} - {event.endTime}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Timer className="w-4 h-4 text-amber-500" />
                <span>Duration</span>
              </div>
              <p className="font-bold text-slate-800">{event.duration || 'Scheduled Event'}</p>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <MapPin className="w-4 h-4 text-muit-600" />
                <span>Venue</span>
              </div>
              <p className="font-bold text-slate-800 truncate">{event.venue}</p>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">About This Event</h2>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3 whitespace-pre-line">
              {event.description}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Official MUIT Attendance Verification
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Certified Completion Credential
              </span>
            </div>
          </div>

          {/* Student Reviews & Feedback Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Student Reviews & Feedback</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(averageRating)
                            ? 'fill-amber-400'
                            : 'fill-slate-100 text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {averageRating > 0 ? averageRating : 'No ratings yet'}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({feedbacks.length} review{feedbacks.length === 1 ? '' : 's'})
                  </span>
                </div>
              </div>

              {myRegistration && (
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="px-4 py-2 rounded-xl bg-muit-50 hover:bg-muit-100 text-muit-700 border border-muit-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Leave Review</span>
                </button>
              )}
            </div>

            {feedbacks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No reviews submitted for this event yet. Verified attendees can submit feedback after attending.
              </p>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((f) => (
                  <div key={f._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-muit-600 text-white font-bold text-xs flex items-center justify-center">
                          {f.student?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{f.student?.name}</p>
                          <p className="text-[10px] text-slate-400">{f.student?.course || 'Student'}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= f.rating ? 'fill-amber-400' : 'fill-slate-200 text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Registration Card & Organizer Info */}
        <div className="space-y-6">
          
          {/* Registration Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-lg space-y-6 sticky top-28">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Participation Pass
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">Free Pass</span>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  MUIT Student Special
                </span>
              </div>
            </div>

            {/* Capacity Progress */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Seats Filled:</span>
                <span className="font-bold text-slate-800">{event.registeredCount} / {event.capacity}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    capacityPercent >= 90 ? 'bg-rose-500' : capacityPercent >= 70 ? 'bg-amber-500' : 'bg-muit-600'
                  }`}
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {event.capacity - event.registeredCount} seats remaining
              </p>
            </div>

            {/* Deadline */}
            <div className="space-y-1 text-xs">
              <p className="text-slate-400 font-medium">Registration Deadline</p>
              <p className="font-bold text-slate-800">{deadlineDate}</p>
              {deadlinePassed && (
                <p className="text-xs font-semibold text-rose-600">Registrations for this event have closed.</p>
              )}
            </div>

            {/* Register Action Button */}
            <div>
              {myRegistration ? (
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                    <p className="text-xs font-bold text-emerald-800">
                      ✓ You are registered for this event!
                    </p>
                    <p className="text-[11px] font-mono text-emerald-600 mt-0.5">
                      Pass ID: {myRegistration.registrationId}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="w-full py-3 rounded-2xl bg-muit-700 hover:bg-muit-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>View / Download QR Pass</span>
                  </button>
                </div>
              ) : canRegister ? (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-muit-700 to-muit-600 hover:from-muit-800 hover:to-muit-700 text-white font-bold text-sm shadow-lg shadow-muit-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{registering ? 'Securing Pass...' : 'Register for Event'}</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 rounded-2xl bg-slate-200 text-slate-500 font-bold text-sm cursor-not-allowed"
                >
                  {isFull ? 'Event Full / Sold Out' : deadlinePassed ? 'Deadline Passed' : 'Registration Closed'}
                </button>
              )}
            </div>

            {/* Organizer Card */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Organized By
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muit-100 text-muit-800 font-bold flex items-center justify-center text-sm">
                  {event.organizerName?.charAt(0) || 'M'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{event.organizerName || 'MUIT Council'}</p>
                  <p className="text-[10px] text-slate-500">{event.organizer?.email || 'events@muit.edu'}</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* QR Code Pass Modal */}
      {showQRModal && myRegistration && (
        <QRModal
          registration={myRegistration}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          event={event}
          onClose={() => setShowFeedbackModal(false)}
          onSuccess={() => {
            fetchEventFeedbacks();
          }}
        />
      )}

      {/* Full Poster Modal Lightbox */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-xl max-h-[94vh] w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col">
            <div className="p-3.5 px-5 border-b border-white/10 flex items-center justify-between text-white bg-slate-950/70">
              <div>
                <span className="font-bold text-sm tracking-wide block">
                  Official MUIT Event Poster
                </span>
                <span className="text-[11px] text-slate-400">
                  {event.title}
                </span>
              </div>
              <button
                onClick={() => setShowPosterModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950">
              <img
                src={event.image}
                alt={event.title}
                className="max-h-[78vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventDetailsPage;
