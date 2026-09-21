import axios from 'axios';

// Create central Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if stored
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('muit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Global error handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired / unauthorized
    if (error.response && error.response.status === 401) {
      // If we are not already on login page and token exists, clear and notify
      if (localStorage.getItem('muit_token') && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('muit_token');
        localStorage.removeItem('muit_user');
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

/* ================= AUTH API ================= */
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post('/auth/reset-password', { token, password }),
};

/* ================= EVENTS API ================= */
export const eventsAPI = {
  getEvents: (params) => API.get('/events', { params }),
  getEventById: (id) => API.get(`/events/${id}`),
  createEvent: (eventData) => API.post('/events', eventData),
  updateEvent: (id, eventData) => API.put(`/events/${id}`, eventData),
  deleteEvent: (id) => API.delete(`/events/${id}`),
  getOrganizerEvents: () => API.get('/events/organizer/my'),
};

/* ================= REGISTRATIONS API ================= */
export const registrationsAPI = {
  register: (eventId) => API.post('/registrations', { eventId }),
  getMyRegistrations: () => API.get('/registrations/my'),
  getEventRegistrations: (eventId) => API.get(`/registrations/event/${eventId}`),
  cancelRegistration: (id) => API.delete(`/registrations/${id}`),
};

/* ================= ATTENDANCE API ================= */
export const attendanceAPI = {
  markAttendance: (payload) => API.post('/attendance/scan', payload),
  getEventAttendance: (eventId) => API.get(`/attendance/event/${eventId}`),
  getMyAttendance: () => API.get('/attendance/my'),
};

/* ================= CERTIFICATES API ================= */
export const certificatesAPI = {
  generateCertificate: (studentId, eventId) => API.post('/certificates', { studentId, eventId }),
  batchGenerate: (eventId) => API.post(`/certificates/batch/${eventId}`),
  getMyCertificates: () => API.get('/certificates/my'),
  verifyCertificate: (certificateId) => API.get(`/certificates/verify/${certificateId}`),
};

/* ================= FEEDBACK API ================= */
export const feedbackAPI = {
  submitFeedback: (data) => API.post('/feedback', data),
  getEventFeedback: (eventId) => API.get(`/feedback/event/${eventId}`),
  getMyFeedbacks: () => API.get('/feedback/my'),
};

/* ================= ADMIN API ================= */
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getAllRegistrations: () => API.get('/admin/registrations'),
  getAllAttendance: () => API.get('/admin/attendance'),
  getAllCertificates: () => API.get('/admin/certificates'),
  getAllFeedbacks: () => API.get('/admin/feedbacks'),
};

export default API;
