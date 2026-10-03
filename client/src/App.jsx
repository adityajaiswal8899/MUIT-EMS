import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import HomePage from './pages/public/HomePage';
import EventsPage from './pages/public/EventsPage';
import EventDetailsPage from './pages/public/EventDetailsPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import VerifyCertificatePage from './pages/public/VerifyCertificatePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Role Dashboards
import StudentDashboard from './pages/dashboard/StudentDashboard';
import OrganizerDashboard from './pages/dashboard/OrganizerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-muit-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their own dashboard
    if (user?.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    if (user?.role === 'organizer') return <Navigate to="/dashboard/organizer" replace />;
    return <Navigate to="/dashboard/student" replace />;
  }

  return children;
};

// Main Layout Wrapper
const AppLayout = ({ children, hideFooter = false }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900">
      <Navbar />
      <div className="flex-1">{children}</div>
      {!hideFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            
            {/* Public Pages */}
            <Route
              path="/"
              element={
                <AppLayout>
                  <HomePage />
                </AppLayout>
              }
            />
            <Route
              path="/events"
              element={
                <AppLayout>
                  <EventsPage />
                </AppLayout>
              }
            />
            <Route
              path="/events/:id"
              element={
                <AppLayout>
                  <EventDetailsPage />
                </AppLayout>
              }
            />
            <Route
              path="/about"
              element={
                <AppLayout>
                  <AboutPage />
                </AppLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <AppLayout>
                  <ContactPage />
                </AppLayout>
              }
            />
            <Route
              path="/verify"
              element={
                <AppLayout>
                  <VerifyCertificatePage />
                </AppLayout>
              }
            />
            <Route
              path="/verify/:certificateId"
              element={
                <AppLayout>
                  <VerifyCertificatePage />
                </AppLayout>
              }
            />

            {/* Auth Pages */}
            <Route
              path="/login"
              element={
                <AppLayout>
                  <LoginPage />
                </AppLayout>
              }
            />
            <Route
              path="/register"
              element={
                <AppLayout>
                  <RegisterPage />
                </AppLayout>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <AppLayout>
                  <ForgotPasswordPage />
                </AppLayout>
              }
            />

            {/* Protected Dashboards */}
            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AppLayout hideFooter>
                    <StudentDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Direct Shortcuts to Student QR Event Passes */}
            <Route
              path="/my-passes"
              element={<Navigate to="/dashboard/student?tab=my-qr" replace />}
            />
            <Route
              path="/passes"
              element={<Navigate to="/dashboard/student?tab=my-qr" replace />}
            />
            <Route
              path="/my-qr"
              element={<Navigate to="/dashboard/student?tab=my-qr" replace />}
            />

            <Route
              path="/dashboard/organizer"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                  <AppLayout hideFooter>
                    <OrganizerDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppLayout hideFooter>
                    <AdminDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
