import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { MapPin, Mail, Phone, Send, CheckCircle2, Clock } from 'lucide-react';

const ContactPage = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science & IT',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success('Your message has been sent to the MUIT Event Committee!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: 'Computer Science & IT',
        subject: '',
        message: ''
      });
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muit-600 bg-muit-50 px-3 py-1 rounded-full border border-muit-100">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          Contact Event Support Desk
        </h1>
        <p className="text-sm text-slate-500">
          Have questions about organizing an event, student passes, or attendance verification? We're here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Side Card */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-8 shadow-xl">
          <div>
            <h2 className="text-xl font-bold font-display">Campus Headquarters</h2>
            <p className="text-xs text-slate-400 mt-1">
              Visit our student council and tech fest coordination centers.
            </p>
          </div>

          <div className="space-y-5 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muit-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Noida Campus:</p>
                <p>Sector 110, Noida, Expressway, Gautam Buddha Nagar, Uttar Pradesh 201304</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muit-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Lucknow Main Campus:</p>
                <p>Sitapur Road, P.O. Maharishi Vidya Mandir, Lucknow, UP 226013</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muit-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Official Email:</p>
                <p>events@muit.in / registrar@muit.edu</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muit-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Helpdesk Hotline:</p>
                <p>+91 (0522) 2771000 / +91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muit-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Operating Hours:</p>
                <p>Monday – Saturday: 9:00 AM – 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm">
          {submitted ? (
            <div className="text-center py-16 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-2xl font-bold text-slate-800">Message Received!</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Thank you for contacting the MUIT Event Committee. A faculty coordinator will review your query and get back to you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 rounded-xl bg-muit-700 text-white font-bold text-xs shadow hover:bg-muit-800 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditya Jaiswal"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@muit.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600 bg-slate-50"
                  >
                    <option value="Computer Science & IT">Computer Science & IT (BCA/MCA)</option>
                    <option value="Engineering & Tech">Engineering & Tech (B.Tech)</option>
                    <option value="Management & Commerce">Management & Commerce (BBA/MBA)</option>
                    <option value="Cultural Committee">Cultural Committee</option>
                    <option value="Sports Council">Sports Council</option>
                  </select>
                </div>

              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inquiry regarding MUIT Hackathon team registration"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message / Details *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your query or feedback in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-muit-600"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-muit-700 hover:bg-muit-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Transmitting...' : 'Send Inquiry'}</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};

export default ContactPage;
