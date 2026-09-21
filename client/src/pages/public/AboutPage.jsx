import React from 'react';
import { Award, ShieldCheck, QrCode, Users, Sparkles, BookOpen, Target, Heart } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-muit-600 bg-muit-50 px-3 py-1 rounded-full border border-muit-100">
          About MUIT Portal
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
          Empowering Campus Life Through Unified Technology
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          The Maharishi University of Information Technology (MUIT) Event Management System is engineered to streamline, modernize, and celebrate student participation across technical, academic, and cultural arenas.
        </p>
      </div>

      {/* Purpose & Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-muit-50 text-muit-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            To eliminate manual paper logs, queues, and disjointed announcements by offering an integrated platform for students to discover, register, and attend college events seamlessly.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Instant QR Passes</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Every student gets a cryptographically unique digital pass right in their dashboard, allowing swift 1-second check-in at entrance gates without delay.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Verified Credentials</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Attendance immediately qualifies participants for university-certified digital credentials with unique verification IDs ready for resumes and LinkedIn portfolios.
          </p>
        </div>

      </div>

      {/* About Maharishi University of Information Technology */}
      <div className="bg-gradient-to-tr from-muit-900 to-muit-800 text-white rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl flex flex-col md:flex-row items-center gap-8">
        <img
          src="/muit_logo.png"
          alt="Maharishi University Emblem"
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white p-2 shadow-2xl ring-4 ring-amber-400/80 shrink-0 object-contain"
        />
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-300">
            University Legacy
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Maharishi University of Information Technology (MUIT)
          </h2>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            Maharishi University of Information Technology was established under Act No. 31 of 2001 of Uttar Pradesh Government and recognized by UGC. Renowned for pioneering Transcendental Meditation alongside rigorous technical education in Computer Applications (BCA/MCA), Data Science, AI, and Engineering.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-white/90">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              UGC Recognized
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <BookOpen className="w-4 h-4 text-blue-300" />
              Outcome Based Education
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <Users className="w-4 h-4 text-amber-300" />
              Vibrant Student Community
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;
