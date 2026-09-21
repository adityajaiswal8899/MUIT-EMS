import React, { useRef } from 'react';
import { Award, Download, Printer, ShieldCheck, X } from 'lucide-react';

const CertificateView = ({ certificate, onClose }) => {
  const certRef = useRef(null);

  if (!certificate) return null;

  const student = certificate.student || {};
  const event = certificate.event || {};

  const formattedEventDate = event.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : '2026';

  const formattedIssueDate = certificate.issueDate
    ? new Date(certificate.issueDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : new Date().toLocaleDateString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold tracking-wide">
              Official Digital Certificate
            </span>
            <span className="text-xs bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-400/30">
              ID: {certificate.certificateId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-muit-600 hover:bg-muit-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Template */}
        <div className="p-6 md:p-10 bg-slate-100 flex items-center justify-center">
          <div
            id="printable-certificate"
            ref={certRef}
            className="w-full bg-[#fdfbf7] p-8 md:p-12 rounded-2xl border-8 border-double border-amber-700/80 shadow-2xl relative text-center text-slate-900 overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(#d97706 0.5px, transparent 0.5px)',
              backgroundSize: '24px 24px'
            }}
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-3 left-3 w-12 h-12 border-t-4 border-l-4 border-amber-600 rounded-tl-lg pointer-events-none" />
            <div className="absolute top-3 right-3 w-12 h-12 border-t-4 border-r-4 border-amber-600 rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-12 h-12 border-b-4 border-l-4 border-amber-600 rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-12 h-12 border-b-4 border-r-4 border-amber-600 rounded-br-lg pointer-events-none" />

            {/* University Seal / Header */}
            <div className="space-y-1 mb-6">
              <img
                src="/muit_logo.png"
                alt="Official MUIT University Seal"
                className="w-20 h-20 rounded-full object-contain mx-auto shadow-lg ring-4 ring-amber-300/80 mb-2 bg-white"
              />
              <h1 className="text-2xl md:text-3xl font-certificate font-extrabold tracking-widest text-slate-900 uppercase">
                Maharishi University
              </h1>
              <p className="text-sm md:text-base font-semibold text-amber-800 tracking-wider uppercase">
                Of Information Technology
              </p>
              <p className="text-[11px] text-slate-500 tracking-widest uppercase">
                Established under UGC Act 1956 • Uttar Pradesh, India
              </p>
            </div>

            {/* Title */}
            <div className="my-6">
              <span className="text-xs font-bold tracking-widest uppercase text-slate-500 border-b-2 border-amber-600/40 pb-1 px-4">
                Certificate of Participation & Excellence
              </span>
              <p className="text-sm italic font-serif text-slate-600 mt-4">
                This is proudly presented and certified to
              </p>
              <h2 className="text-3xl md:text-4xl font-certificate font-bold text-muit-900 tracking-wide mt-2 border-b-2 border-amber-500/50 pb-2 inline-block max-w-xl">
                {student.name || 'Participant Name'}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Enrollment No: <span className="font-bold text-slate-800">{student.enrollmentNumber || 'MUIT/2026/001'}</span> • Course: <span className="font-bold text-slate-800">{student.course || 'BCA'}</span>
              </p>
            </div>

            {/* Description */}
            <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-700 leading-relaxed font-sans mt-4">
              For distinguished enthusiasm, active participation, and successful attendance in the event{' '}
              <strong className="text-slate-950 font-bold">"{event.title || 'MUIT Campus Event'}"</strong>{' '}
              organized by the {event.organizerName || 'MUIT Event Committee'} held on{' '}
              <span className="font-semibold text-slate-900">{formattedEventDate}</span> at Maharishi University of Information Technology.
            </p>

            {/* Signatures & Seal Grid */}
            <div className="mt-12 pt-6 border-t border-slate-300/80 grid grid-cols-3 items-end text-center">
              
              {/* Coordinator Sign */}
              <div>
                <div className="font-serif italic text-lg text-slate-800 font-semibold tracking-wider">
                  Prof. Rajesh Sharma
                </div>
                <div className="w-36 h-0.5 bg-slate-400 mx-auto mt-1" />
                <p className="text-xs font-bold text-slate-700 mt-1 uppercase tracking-wider">
                  Event Coordinator
                </p>
                <p className="text-[10px] text-slate-500">MUIT Tech Council</p>
              </div>

              {/* Official Gold Hologram Seal */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-600 bg-amber-50 flex flex-col items-center justify-center p-2 shadow-inner">
                  <ShieldCheck className="w-6 h-6 text-amber-600 mb-0.5" />
                  <span className="text-[8px] font-extrabold uppercase tracking-tighter text-amber-800">
                    Official Seal
                  </span>
                  <span className="text-[7px] text-slate-500 font-mono">
                    VERIFIED
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-600 mt-1.5 font-bold">
                  {certificate.certificateId}
                </span>
                <span className="text-[9px] text-slate-500">
                  Issued: {formattedIssueDate}
                </span>
              </div>

              {/* Dean Sign */}
              <div>
                <div className="font-serif italic text-lg text-slate-800 font-semibold tracking-wider">
                  Dr. B. K. Srivastava
                </div>
                <div className="w-36 h-0.5 bg-slate-400 mx-auto mt-1" />
                <p className="text-xs font-bold text-slate-700 mt-1 uppercase tracking-wider">
                  Dean / Academic Director
                </p>
                <p className="text-[10px] text-slate-500">MUIT University</p>
              </div>

            </div>

            {/* Verification Footer Note */}
            <div className="mt-8 text-[10px] text-slate-500">
              This digital certificate is cryptographically recorded in the MUIT Event Management System database and is verifiable at /verify/{certificate.certificateId}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CertificateView;
