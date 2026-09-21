import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, ShieldCheck, Calendar, MapPin, Clock, Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const QRModal = ({ registration, onClose }) => {
  const ticketRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  if (!registration) return null;

  const event = registration.event || {};
  const student = registration.student || {};

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(registration.registrationId);
    setCopied(true);
    toast.success('Registration ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    // Find SVG in ticket
    const svgElement = document.getElementById(`qr-svg-${registration.registrationId}`);
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, 400, 400);
        context.drawImage(image, 20, 20, 360, 360);
        
        const png = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = png;
        downloadLink.download = `MUIT-PASS-${registration.registrationId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      image.src = blobURL;
      return;
    }

    if (registration.qrCode) {
      const link = document.createElement('a');
      link.href = registration.qrCode;
      link.download = `MUIT-PASS-${registration.registrationId || 'TICKET'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const eventDate = event.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Upcoming Event';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-muit-900 via-muit-800 to-muit-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="/muit_logo.png" 
              alt="Maharishi University Logo" 
              className="w-12 h-12 rounded-full bg-white p-0.5 shadow-md shrink-0 ring-2 ring-amber-400/70 object-contain" 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-white/20 rounded-full">
                  MUIT Official Event Pass
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-400 text-slate-950 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Maharishi University of Information Technology
              </p>
            </div>
          </div>
          
          <h2 className="text-xl font-display font-extrabold tracking-tight">
            {event.title || 'MUIT Campus Event'}
          </h2>
        </div>

        {/* Pass Body */}
        <div ref={ticketRef} className="p-6 space-y-5">
          
          {/* QR Code Container with High-Contrast Crisp Vector Render */}
          <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-blue-50/50 to-slate-50 rounded-2xl border-2 border-dashed border-muit-200">
            <div className="bg-white p-3.5 rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
              <QRCodeSVG
                id={`qr-svg-${registration.registrationId}`}
                value={registration.registrationId}
                size={190}
                level="H"
                includeMargin={true}
                fgColor="#0f172a"
                bgColor="#ffffff"
              />
            </div>
            
            <div className="mt-3 text-center space-y-1.5 w-full">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-mono font-extrabold tracking-wider text-muit-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                  {registration.registrationId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1.5 text-xs text-slate-500 hover:text-muit-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-sm transition-colors flex items-center gap-1"
                  title="Copy Registration ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px] font-semibold">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                Scan with any QR scanner or enter ID at the event entrance gate
              </p>
            </div>
          </div>

          {/* Student & Event Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            <div>
              <p className="text-slate-400 font-medium">Student Name</p>
              <p className="font-bold text-slate-800 mt-0.5">
                {student.name || 'Student Attendee'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Enrollment No.</p>
              <p className="font-bold text-slate-800 mt-0.5">
                {student.enrollmentNumber || 'MUIT/2026/REG'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Date & Time</p>
              <p className="font-semibold text-slate-800 mt-0.5">
                {eventDate} • {event.startTime || '10:00 AM'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Pass Status</p>
              <p className="mt-0.5 font-bold">
                {registration.status === 'Attended' ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Checked In
                  </span>
                ) : (
                  <span className="text-blue-600">● Confirmed Active</span>
                )}
              </p>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200/80">
              <p className="text-slate-400 font-medium">Venue</p>
              <p className="font-semibold text-slate-800 mt-0.5">
                {event.venue || 'MUIT Campus'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleDownloadQR}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-muit-700 bg-white border border-muit-200 hover:bg-muit-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download QR Pass
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-muit-700 hover:bg-muit-800 transition-colors flex items-center justify-center gap-1.5 shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Ticket
          </button>
        </div>

      </div>
    </div>
  );
};

export default QRModal;
