import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventsAPI, registrationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import EventCard from '../../components/common/EventCard';
import QRModal from '../../components/common/QRModal';
import { Search, Filter, Calendar as CalendarIcon, RefreshCw, X } from 'lucide-react';

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');
  const [selectedDate, setSelectedDate] = useState('');
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [activeQRModal, setActiveQRModal] = useState(null);

  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const categories = [
    'All',
    'Technical',
    'Workshop',
    'Cultural',
    'Sports',
    'Seminar',
    'Competition',
    'Career & Placement',
    'Exhibition'
  ];

  const statuses = [
    'All',
    'Registration Open',
    'Upcoming',
    'Ongoing',
    'Completed'
  ];

  useEffect(() => {
    fetchEvents();
    if (isAuthenticated && user?.role === 'student') {
      fetchMyRegistrations();
    }
  }, [selectedCategory, selectedStatus, selectedDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedStatus && selectedStatus !== 'All') params.status = selectedStatus;
      if (selectedDate) params.date = selectedDate;

      const res = await eventsAPI.getEvents(params);
      if (res.data?.success) {
        setEvents(res.data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleRegisterEvent = async (event) => {
    if (!isAuthenticated) {
      toast.info('Please sign in or create an account to register for events');
      window.location.href = '/login';
      return;
    }

    if (user?.role !== 'student') {
      toast.warning('Only student accounts can register for events');
      return;
    }

    try {
      const res = await registrationsAPI.register(event._id);
      if (res.data?.success) {
        toast.success(res.data.message || 'Successfully registered!');
        setActiveQRModal(res.data.registration);
        setRegisteredEventIds((prev) => new Set([...prev, event._id]));
        fetchEvents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedDate('');
    searchParams.delete('category');
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-muit-600 bg-muit-50 px-3 py-1 rounded-full border border-muit-100">
          Campus Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mt-2">
          Explore College Events
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Browse upcoming hackathons, tech workshops, cultural festivals, sports matches, and career placement sessions.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event title, keyword, or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-muit-700 hover:bg-muit-800 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>

        {/* Filters Row: Category, Status, Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-muit-600 bg-slate-50"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Event Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-muit-600 bg-slate-50"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Filter by Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-muit-600 bg-slate-50"
            />
          </div>

        </div>

        {/* Filter Badges & Reset */}
        {(selectedCategory !== 'All' || selectedStatus !== 'All' || selectedDate || search) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-medium">Active filters:</span>
              {selectedCategory !== 'All' && (
                <span className="px-2.5 py-0.5 rounded-full bg-muit-50 text-muit-700 font-bold border border-muit-200">
                  {selectedCategory}
                </span>
              )}
              {selectedStatus !== 'All' && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  {selectedStatus}
                </span>
              )}
              {selectedDate && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                  {selectedDate}
                </span>
              )}
            </div>

            <button
              onClick={resetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}

      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No events matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the category and date filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-muit-700 text-white hover:bg-muit-800 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing <strong className="text-slate-800">{events.length}</strong> college events</span>
          </div>

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
        </div>
      )}

      {/* QR Pass Modal on Successful Registration */}
      {activeQRModal && (
        <QRModal
          registration={activeQRModal}
          onClose={() => setActiveQRModal(null)}
        />
      )}

    </div>
  );
};

export default EventsPage;
