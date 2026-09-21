import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Mail, Lock, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Request, 2: Reset
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email);
      if (res.data?.success) {
        toast.success('Password reset token generated successfully');
        if (res.data.resetToken) {
          setToken(res.data.resetToken);
        }
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error requesting reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token || !newPassword) return;

    setLoading(true);
    try {
      const res = await authAPI.resetPassword(token, newPassword);
      if (res.data?.success) {
        toast.success('Password updated successfully! Please login with your new password.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <img
            src="/muit_logo.png"
            alt="Maharishi University of Information Technology Official Emblem"
            className="w-16 h-16 rounded-full object-contain mx-auto shadow-md ring-2 ring-amber-400/60 bg-white"
          />
          <h2 className="text-2xl font-display font-extrabold text-slate-900">
            {step === 1 ? 'Forgot Your Password?' : 'Set New Password'}
          </h2>
          <p className="text-xs text-slate-500">
            {step === 1
              ? 'Enter your registered MUIT email address to receive reset instructions.'
              : 'Enter the verification token and your new password.'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Registered Email Address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-muit-700 hover:bg-muit-800 text-white font-bold text-sm shadow transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Processing...' : 'Send Reset Link / Token'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Reset Token
              </label>
              <input
                type="text"
                required
                placeholder="Paste token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-muit-600"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-muit-700 hover:bg-muit-800 text-white font-bold text-sm shadow transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Updating...' : 'Save New Password'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Remember your password?{' '}
          <Link to="/login" className="font-bold text-muit-700 hover:underline">
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
