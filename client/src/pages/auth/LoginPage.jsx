import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Calendar, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  UserCheck,
  UserCog,
  GraduationCap
} from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);

      // Role-based routing
      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (user.role === 'organizer') {
        navigate('/dashboard/organizer');
      } else {
        navigate('/dashboard/student');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill for instant evaluation
  const setDemoCredentials = (role) => {
    if (role === 'student') {
      setEmail('student@muit.edu');
      setPassword('Password123!');
      toast.info('Autofilled Student demo credentials');
    } else if (role === 'organizer') {
      setEmail('organizer@muit.edu');
      setPassword('Password123!');
      toast.info('Autofilled Organizer demo credentials');
    } else if (role === 'admin') {
      setEmail('admin@muit.edu');
      setPassword('Password123!');
      toast.info('Autofilled Admin demo credentials');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        
        {/* Top University Branding */}
        <div className="text-center space-y-2">
          <img
            src="/muit_logo.png"
            alt="Maharishi University of Information Technology Official Emblem"
            className="w-16 h-16 rounded-full object-contain mx-auto shadow-md ring-2 ring-amber-400/60 bg-white"
          />
          <h1 className="text-2xl font-display font-extrabold text-slate-900">
            Sign In to MUIT Events
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Maharishi University of Information Technology
          </p>
        </div>

        {/* Quick Demo Credentials Panel */}
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-muit-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              One-Click Demo Evaluator Access:
            </span>
            <span className="text-[10px] text-muit-700 bg-white px-2 py-0.5 rounded-md font-mono border border-blue-200">
              Pass: Password123!
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('student')}
              className="py-1.5 px-2 rounded-xl bg-white hover:bg-blue-100/50 border border-blue-200 text-[11px] font-bold text-slate-700 hover:text-muit-800 transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('organizer')}
              className="py-1.5 px-2 rounded-xl bg-white hover:bg-blue-100/50 border border-blue-200 text-[11px] font-bold text-slate-700 hover:text-muit-800 transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Organizer</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin')}
              className="py-1.5 px-2 rounded-xl bg-white hover:bg-blue-100/50 border border-blue-200 text-[11px] font-bold text-slate-700 hover:text-muit-800 transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <UserCog className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xl space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="student@muit.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-muit-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-muit-700 to-muit-600 hover:from-muit-800 hover:to-muit-700 text-white font-bold text-sm shadow-md shadow-muit-700/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom Register Redirect */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            New MUIT student?{' '}
            <Link to="/register" className="font-bold text-muit-700 hover:underline">
              Create student account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
