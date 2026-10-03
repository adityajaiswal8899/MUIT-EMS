import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Copy, Check, Sparkles, ShieldCheck, Ticket } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const WristbandPass = ({ registration, orientation = 'horizontal', showActions = true }) => {
  const toast = useToast();
  const wristbandRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [currentOrientation, setCurrentOrientation] = useState(orientation);

  if (!registration) return null;

  const event = registration.event || {};
  const student = registration.student || {};

  // Stylized event name for wristband (e.g. "AAGAAZ 2K26")
  const getStylizedTitle = () => {
    const rawTitle = (event.title || 'MUIT FEST 2026').toUpperCase();
    if (rawTitle.includes('AAGAAZ')) return 'AAGAAZ 2K26';
    if (rawTitle.includes('BYTE BASH')) return 'BYTE BASH 2026';
    if (rawTitle.includes('HACKATHON') || rawTitle.includes('SIH')) return 'SIH HACKATHON 2026';
    if (rawTitle.includes('TECH FEST')) return 'TECH FEST 2026';
    if (rawTitle.includes('SPORTS') || rawTitle.includes('BADMINTON') || rawTitle.includes('VOLLEYBALL')) return 'SPORTS MEET 2026';
    if (rawTitle.includes('ALUMNI')) return 'ALUMNI FIESTA 2026';
    // Default fallback: truncate to first 2 words + 2026
    const words = rawTitle.replace(/[^A-Z0-9\s]/g, '').split(/\s+/).slice(0, 3).join(' ');
    return words.length > 18 ? words.substring(0, 18) : words;
  };

  const stylizedTitle = getStylizedTitle();
  const passId = registration.registrationId || 'MUIT-PASS-001';
  const studentName = (student.name || 'Aditya Jaiswal').toUpperCase();
  const enrollmentNo = student.enrollmentNumber || 'MUIT/BCA/2024/089';

  const handleCopyId = () => {
    navigator.clipboard.writeText(passId);
    setCopied(true);
    toast.success(`Pass ID ${passId} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    const element = wristbandRef.current;
    if (!element) return;

    // Use html2canvas if available, or generate from canvas
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: null
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `MUIT-WRISTBAND-${passId}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Wristband pass downloaded successfully!');
      }).catch((err) => {
        console.error('Download error:', err);
        toast.error('Failed to export wristband image');
      });
    }).catch(() => {
      toast.error('Export tool loading, please try again');
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      
      {/* Top Controls: Orientation & Download Actions */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              Wristband Format:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCurrentOrientation('horizontal')}
                className={`px-3 py-1 rounded-md transition-all ${
                  currentOrientation === 'horizontal'
                    ? 'bg-white text-rose-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Horizontal (Wearable)
              </button>
              <button
                type="button"
                onClick={() => setCurrentOrientation('vertical')}
                className={`px-3 py-1 rounded-md transition-all ${
                  currentOrientation === 'vertical'
                    ? 'bg-white text-rose-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vertical (Photo Style)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyId}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-sm"
              title="Copy Pass ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : passId}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPNG}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Wristband</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* WRISTBAND CONTAINER (HORIZONTAL OR VERTICAL)                  */}
      {/* ============================================================== */}
      <div className="overflow-x-auto py-2 flex justify-center">
        {currentOrientation === 'horizontal' ? (
          /* ================= HORIZONTAL WEARABLE BAND ================= */
          <div
            ref={wristbandRef}
            className="wristband-strip relative flex items-stretch h-[110px] w-[860px] min-w-[860px] rounded-lg shadow-xl overflow-hidden border border-rose-900/30 select-none bg-gradient-to-r from-[#e6005c] via-[#f41f7a] to-[#d60050]"
            style={{
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 10px 25px -5px rgba(225, 29, 72, 0.4), 0 8px 10px -6px rgba(225, 29, 72, 0.2)'
            }}
          >
            {/* LEFT END TAB: White adhesive security tab with guilloché loops */}
            <div className="w-[125px] shrink-0 bg-white border-r-2 border-dashed border-rose-300 flex flex-col justify-between p-2 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
                {/* Guilloché circles */}
                <svg viewBox="0 0 100 100" className="w-24 h-24 stroke-rose-900 fill-none stroke-[0.7]">
                  <circle cx="50" cy="50" r="45" />
                  <circle cx="50" cy="50" r="35" />
                  <circle cx="50" cy="50" r="25" />
                  <circle cx="50" cy="50" r="15" />
                  <ellipse cx="50" cy="50" rx="42" ry="20" />
                  <ellipse cx="50" cy="50" rx="20" ry="42" />
                  <ellipse cx="50" cy="50" rx="35" ry="35" transform="rotate(45 50 50)" />
                </svg>
              </div>

              <div className="flex items-center gap-1.5 z-10">
                <img
                  src="/muit_logo.png"
                  alt="MUIT Logo"
                  className="w-7 h-7 rounded-full object-contain p-0.5 border border-amber-400 bg-white shrink-0"
                />
                <div className="leading-none">
                  <p className="text-[9px] font-black text-slate-900 tracking-tight">MUIT LUCKNOW</p>
                  <p className="text-[7px] font-bold text-rose-600 uppercase">Official Pass</p>
                </div>
              </div>

              <div className="z-10 text-center">
                <span className="text-[8px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                  {passId.split('-').slice(-2).join('-')}
                </span>
                <p className="text-[6.5px] font-bold text-slate-400 uppercase mt-0.5">GATE VALIDATED</p>
              </div>

              <div className="z-10 flex items-center justify-between text-[7px] text-slate-400 font-mono border-t border-slate-200 pt-0.5">
                <span>TAMPER-PROOF</span>
                <span>SEC-26</span>
              </div>
            </div>

            {/* MAIN VIBRANT WRISTBAND SECTION */}
            <div className="flex-1 flex items-center justify-between px-6 text-white relative overflow-hidden">
              
              {/* Subtle background security wave overlay */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 0, transparent 8px)'
                }}
              />

              {/* SECTION 1: PASS BADGE & GOLDEN STARBURSTS */}
              <div className="flex items-center gap-3 z-10">
                <div className="flex flex-col items-center">
                  <span className="text-amber-300 font-black tracking-wider text-xl leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                    PASS
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-amber-300 text-xs mt-1 select-none leading-none">
                    <span className="animate-pulse">✳</span>
                    <span>✳</span>
                    <span>✳</span>
                    <span className="animate-pulse">✳</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BOLD STYLIZED EVENT TITLE (AAGAAZ 2K26) */}
              <div className="flex items-center gap-3 z-10 px-2">
                <div className="text-center">
                  <h2 
                    className="text-3xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_3px_5px_rgba(0,0,0,0.5)] transform -skew-x-6"
                    style={{
                      fontFamily: "'Impact', 'Arial Black', sans-serif",
                      letterSpacing: '0.04em'
                    }}
                  >
                    {stylizedTitle}
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-0.5">
                    {/* Cyan / Teal slashes like in the photo */}
                    <span className="text-teal-300 font-black tracking-widest text-sm italic transform -skew-x-12">
                      ///
                    </span>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-pink-100 bg-black/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                      Official Entry Wristband
                    </span>
                    <span className="text-teal-300 font-black tracking-widest text-sm italic transform -skew-x-12">
                      ///
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: STUDENT DETAILS & DATE */}
              <div className="z-10 text-left bg-black/25 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/20 max-w-[210px] space-y-0.5">
                <div className="flex items-center justify-between gap-1 text-[8px] uppercase tracking-wider text-amber-300 font-extrabold">
                  <span>Student Gate Pass</span>
                  <span className="text-white bg-emerald-500/80 px-1 rounded text-[7px]">Verified</span>
                </div>
                <p className="text-xs font-black text-white truncate drop-shadow-sm">
                  {studentName}
                </p>
                <p className="text-[9px] text-pink-100 truncate font-semibold">
                  {enrollmentNo}
                </p>
                <p className="text-[8px] text-pink-200 truncate font-mono">
                  {event.date ? new Date(event.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '02 OCT 2026'} • MUIT CAMPUS
                </p>
              </div>

              {/* SECTION 4: SCANNABLE QR CODE ON WRISTBAND */}
              <div className="z-10 flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-md border border-slate-200">
                <QRCodeSVG
                  value={passId}
                  size={65}
                  level="H"
                  fgColor="#0f172a"
                  bgColor="#ffffff"
                  includeMargin={false}
                />
                <div className="text-slate-900 leading-tight pr-1">
                  <span className="text-[7px] font-bold uppercase text-rose-600 block">SCAN AT GATE</span>
                  <span className="text-[9px] font-mono font-black text-slate-950 block">{passId}</span>
                  <span className="text-[6.5px] font-semibold text-slate-500 block">1-SEC ENTRY</span>
                </div>
              </div>

            </div>

            {/* RIGHT END TAB: Adhesive Peel strip with security barcode / waves */}
            <div className="w-[85px] shrink-0 bg-white border-l-2 border-dashed border-rose-300 flex flex-col justify-between p-2 relative overflow-hidden text-center">
              <span className="text-[7px] font-black text-rose-600 uppercase tracking-tighter">PEEL & STICK</span>
              
              {/* Decorative mini barcode */}
              <div className="flex items-center justify-center gap-0.5 h-9 opacity-70">
                {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 2, 3, 1, 2, 3].map((w, i) => (
                  <div key={i} className="bg-slate-900 h-full" style={{ width: `${w}px` }} />
                ))}
              </div>

              <span className="text-[6.5px] font-mono text-slate-400">DO NOT REMOVE</span>
            </div>
          </div>
        ) : (
          /* ================= VERTICAL WEARABLE BAND (PHOTO STYLE) ================= */
          <div
            ref={wristbandRef}
            className="wristband-strip relative flex flex-col items-stretch w-[115px] min-h-[660px] rounded-2xl shadow-2xl overflow-hidden border border-rose-900/30 select-none bg-gradient-to-b from-[#e6005c] via-[#f41f7a] to-[#d60050]"
            style={{
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 20px 35px -5px rgba(225, 29, 72, 0.45)'
            }}
          >
            {/* TOP WHITE SECURITY TAB */}
            <div className="h-[95px] bg-white border-b-2 border-dashed border-rose-300 flex flex-col items-center justify-center p-2 relative overflow-hidden text-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-16 h-16 stroke-rose-900/30 fill-none stroke-[0.8] absolute">
                <circle cx="50" cy="50" r="40" />
                <circle cx="50" cy="50" r="25" />
                <ellipse cx="50" cy="50" rx="38" ry="18" />
                <ellipse cx="50" cy="50" rx="18" ry="38" />
              </svg>
              <img src="/muit_logo.png" alt="MUIT" className="w-7 h-7 rounded-full object-contain mb-1 z-10 bg-white" />
              <p className="text-[8px] font-black text-slate-900 z-10 leading-none">MUIT LUCKNOW</p>
              <p className="text-[6.5px] font-bold text-rose-600 z-10 uppercase mt-0.5">GATE PASS</p>
            </div>

            {/* PASS BADGE & GOLD STARS */}
            <div className="py-3 flex flex-col items-center justify-center z-10">
              <span className="text-amber-300 font-black tracking-widest text-lg drop-shadow">
                PASS
              </span>
              <div className="grid grid-cols-2 gap-1 text-amber-300 text-xs mt-1 select-none leading-none">
                <span>✳</span>
                <span className="animate-pulse">✳</span>
                <span className="animate-pulse">✳</span>
                <span>✳</span>
              </div>
            </div>

            {/* VERTICAL BOLD EVENT TITLE (AAGAAZ 2K26) */}
            <div className="flex-1 flex flex-col items-center justify-center py-4 z-10">
              <div
                className="transform rotate-90 text-2xl font-black italic tracking-wider text-white whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                style={{ fontFamily: "'Impact', 'Arial Black', sans-serif" }}
              >
                {stylizedTitle}
              </div>
            </div>

            {/* ACCENT SLASHES */}
            <div className="py-2 flex justify-center z-10">
              <span className="text-teal-300 font-black tracking-widest text-sm italic">///</span>
            </div>

            {/* STUDENT & PASS DETAILS */}
            <div className="px-2 py-2 text-center text-white bg-black/25 mx-2 rounded-xl backdrop-blur-sm border border-white/20 z-10 space-y-0.5">
              <p className="text-[9px] font-black truncate">{studentName}</p>
              <p className="text-[7.5px] font-mono text-pink-200 truncate">{passId}</p>
            </div>

            {/* MINI QR CODE */}
            <div className="py-3 flex flex-col items-center justify-center z-10">
              <div className="bg-white p-1 rounded-lg shadow border border-slate-200">
                <QRCodeSVG
                  value={passId}
                  size={58}
                  level="M"
                  fgColor="#0f172a"
                  bgColor="#ffffff"
                  includeMargin={false}
                />
              </div>
              <span className="text-[6.5px] font-mono font-bold text-white mt-1">GATE SCAN</span>
            </div>

            {/* BOTTOM ADHESIVE TAB */}
            <div className="h-[70px] bg-white border-t-2 border-dashed border-rose-300 flex flex-col items-center justify-center p-2 text-center shrink-0">
              <span className="text-[7px] font-black text-rose-600 uppercase leading-none">PEEL TO WEAR</span>
              <div className="flex items-center justify-center gap-0.5 h-5 my-1 opacity-70">
                {[1, 2, 1, 3, 1, 2, 1, 3, 2].map((w, i) => (
                  <div key={i} className="bg-slate-900 h-full" style={{ width: `${w}px` }} />
                ))}
              </div>
              <span className="text-[6px] font-mono text-slate-400">TAMPER SECURE</span>
            </div>
          </div>
        )}
      </div>

      {/* Helpful guidance note */}
      <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-2xl flex items-center justify-between text-xs text-rose-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            <strong>Official MUIT Gate Pass:</strong> Show this wristband pass on your mobile screen or bring a printout for instant 1-second physical wristband exchange and venue entry.
          </span>
        </div>
      </div>

    </div>
  );
};

export default WristbandPass;
