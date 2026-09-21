import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const EventCard = ({ event, onRegister, isRegistered = false, userRole = null }) => {
  const isRegistrationOpen =
    event.status === 'Registration Open' &&
    new Date(event.registrationDeadline) > new Date() &&
    event.registeredCount < event.capacity;

  const isFull = event.registeredCount >= event.capacity;
  const isDeadlinePassed = new Date(event.registrationDeadline) <= new Date();

  // Format date
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate capacity percentage
  const capacityPercent = Math.min(
    100,
    Math.round(((event.registeredCount || 0) / (event.capacity || 100)) * 100)
  );

  const getStatusBadge = () => {
    switch (event.status) {
      case 'Registration Open':
        return isFull ? (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-500 text-white shadow-sm">
            Sold Out / Full
          </span>
        ) : isDeadlinePassed ? (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500 text-white shadow-sm">
            Deadline Closed
          </span>
        ) : (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500 text-white shadow-sm">
            Registration Open
          </span>
        );
      case 'Upcoming':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500 text-white shadow-sm">
            Upcoming
          </span>
        );
      case 'Ongoing':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-600 text-white animate-pulse shadow-sm">
            Live Now
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-600 text-white shadow-sm">
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-600 text-white shadow-sm">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-500 text-white shadow-sm">
            {event.status}
          </span>
        );
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden">
      {/* Event Banner Image & Badges */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
          alt={event.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-white/90 text-slate-900 backdrop-blur-md shadow">
            {event.category}
          </span>
          {getStatusBadge()}
        </div>

        {/* Date & Duration on image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-1 text-xs font-medium text-white/95">
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-muit-300 shrink-0" />
            <span>{eventDate}</span>
            <span className="mx-1">•</span>
            <Clock className="w-3.5 h-3.5 text-muit-300 shrink-0" />
            <span>{event.startTime}</span>
          </div>
          {event.duration && (
            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 border border-white/20">
              ⏱ {event.duration}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-muit-600 transition-colors">
            {event.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Venue & Timing Details */}
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-muit-500 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{event.startTime} - {event.endTime} {event.duration ? `(${event.duration})` : ''}</span>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Registered: {event.registeredCount || 0}/{event.capacity}</span>
            </span>
            <span className="font-semibold text-slate-700">{capacityPercent}% full</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacityPercent >= 90
                  ? 'bg-rose-500'
                  : capacityPercent >= 70
                  ? 'bg-amber-500'
                  : 'bg-muit-600'
              }`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <Link
            to={`/events/${event._id}`}
            className="flex-1 py-2 px-3 text-center rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-center gap-1"
          >
            <span>View Details</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          {isRegistered ? (
            <span className="flex items-center justify-center gap-1 py-2 px-3.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" />
              Registered
            </span>
          ) : isRegistrationOpen && onRegister ? (
            <button
              onClick={() => onRegister(event)}
              className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-muit-700 hover:bg-muit-800 shadow-sm transition-all"
            >
              Register Now
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
