import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { attendanceAPI, registrationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Keyboard, 
  Clock, 
  UserCheck, 
  RefreshCw,
  Sparkles,
  Upload,
  Volume2,
  Copy
} from 'lucide-react';

const QRScanner = ({ events = [], onAttendanceMarked }) => {
  const toast = useToast();
  // Default to empty string for Auto-Detect of any event
  const [selectedEventId, setSelectedEventId] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Audio Chime synthesizer using Web Audio API
  const playChime = (isSuccess = true) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        // High upbeat dual-tone chime (880Hz -> 1174Hz)
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        // Warning dual-tone buzz (440Hz -> 311Hz)
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(311.13, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio context might be restricted before first interaction
    }
  };

  // Process and verify QR code data
  const handleProcessCode = async (codeString) => {
    if (!codeString || !codeString.trim()) {
      toast.warning('Please enter or scan a valid QR code');
      return;
    }

    setLoading(true);
    try {
      const res = await attendanceAPI.markAttendance({
        qrData: codeString.trim(),
        eventId: selectedEventId || undefined,
      });

      if (res.data?.success) {
        playChime(true);
        toast.success(res.data.message || 'Attendance Marked Successfully');
        const record = {
          success: true,
          message: res.data.message || 'Attendance Marked Successfully',
          student: res.data.student,
          event: res.data.event,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          id: Date.now()
        };
        setLastResult(record);
        setScanHistory((prev) => [record, ...prev.slice(0, 14)]);
        setManualCode('');

        if (onAttendanceMarked) {
          onAttendanceMarked(res.data);
        }
      }
    } catch (error) {
      console.error('Scan Attendance Error:', error);
      playChime(false);
      const msg = error.response?.data?.message || 'Invalid / Already Used QR Code';
      toast.error(msg);
      const failedRecord = {
        success: false,
        message: msg,
        student: error.response?.data?.student,
        event: error.response?.data?.event,
        alreadyMarked: error.response?.data?.alreadyMarked,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        id: Date.now()
      };
      setLastResult(failedRecord);
      setScanHistory((prev) => [failedRecord, ...prev.slice(0, 14)]);
    } finally {
      setLoading(false);
    }
  };

  // File / Image QR Code scanner
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const html5QrCode = new Html5Qrcode('file-scanner-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      if (decodedText) {
        toast.info(`Decoded QR: ${decodedText}`);
        handleProcessCode(decodedText);
      }
    } catch (err) {
      console.error('Image QR decode error:', err);
      toast.error('Could not detect a valid QR code in the uploaded image');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Toggle Camera Scanner
  const toggleCameraScanner = () => {
    if (scannerActive) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error(err));
      }
      setScannerActive(false);
    } else {
      setScannerActive(true);
      setTimeout(() => {
        try {
          const scanner = new Html5QrcodeScanner('reader', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true
          });

          scanner.render(
            (decodedText) => {
              handleProcessCode(decodedText);
            },
            (errorMessage) => {
              // Frame scan error
            }
          );

          scannerRef.current = scanner;
        } catch (err) {
          console.error('Scanner init error:', err);
          toast.error('Camera access failed. Please ensure camera permissions are allowed.');
          setScannerActive(false);
        }
      }, 300);
    }
  };

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error(err));
      }
    };
  }, []);

  // Quick testing sample tickets
  const sampleTestTickets = [
    { code: 'MUIT-REG-2026-TF001', student: 'Aditya Jaiswal', event: 'Tech Fest 2026' },
    { code: 'MUIT-REG-2026-AI002', student: 'Aditya Jaiswal', event: 'AI Workshop' },
    { code: 'MUIT-REG-2026-TF002', student: 'Priya Sharma', event: 'Tech Fest 2026' },
    { code: 'MUIT-REG-2026-TF003', student: 'Rohan Gupta', event: 'Tech Fest 2026' },
    { code: 'MUIT-REG-2026-TF004', student: 'Ananya Mishra', event: 'Tech Fest 2026' }
  ];

  return (
    <div className="space-y-6">
      <div id="file-scanner-temp" className="hidden" />

      {/* Header & Event Selector */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-muit-50 text-muit-600">
              <QrCode className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              QR Attendance Gate Scanner
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Scan attendee QR passes with camera, upload an image ticket, or verify via Registration ID.
          </p>
        </div>

        {/* Event Select Dropdown (Defaults to Auto-Detect) */}
        <div className="w-full md:w-80">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Target Gate / Event Filter
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-muit-600 focus:bg-white"
          >
            <option value="">-- Any Event / Auto-Detect (Recommended) --</option>
            {events.map((evt) => (
              <option key={evt._id} value={evt._id}>
                {evt.title} ({evt.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Test Passes Toolbar (For instant evaluation & demonstration) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 p-4 rounded-2xl border border-blue-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-muit-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            1-Click Test Passes (Quick Gate Scan Simulation):
          </span>
          <span className="text-[10px] text-muit-600 font-semibold hidden sm:inline">
            Click any pass below to test instant gate check-in & duplicate prevention!
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {sampleTestTickets.map((t) => (
            <button
              key={t.code}
              type="button"
              onClick={() => {
                setManualCode(t.code);
                handleProcessCode(t.code);
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-muit-50 border border-blue-200 hover:border-muit-300 text-xs font-bold text-slate-800 transition-all shadow-sm flex items-center gap-1.5 hover:scale-105"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-muit-600" />
              <span>{t.student} ({t.event})</span>
              <span className="font-mono text-[10px] text-slate-400">[{t.code.slice(-5)}]</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Scanning Box & Manual Input */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Camera Scanner Container */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-muit-600" />
                <span className="text-sm font-bold text-slate-800">
                  Live Camera Scanner
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Upload Image Option */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Scan Image/QR File</span>
                </button>

                <button
                  onClick={toggleCameraScanner}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    scannerActive
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow'
                      : 'bg-muit-700 hover:bg-muit-800 text-white shadow-sm'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{scannerActive ? 'Stop Camera' : 'Start Camera Scanner'}</span>
                </button>
              </div>
            </div>

            {scannerActive ? (
              <div className="p-4 bg-slate-900 rounded-2xl overflow-hidden shadow-inner">
                <div id="reader" className="w-full max-w-sm mx-auto text-white" />
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/80">
                <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Camera Scanner Ready</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Click "Start Camera Scanner" to read attendee passes with your webcam, or use the fast manual ID entry below.
                </p>
              </div>
            )}
          </div>

          {/* Manual Input Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-muit-600" />
              <span className="text-sm font-bold text-slate-800">
                Fast Pass ID / QR Data Entry
              </span>
            </div>
            
            <p className="text-xs text-slate-500">
              Type or paste the Registration Pass ID (e.g. <span className="font-mono font-bold text-slate-700">MUIT-REG-2026-TF001</span>) to mark attendance in real-time.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessCode(manualCode);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                placeholder="e.g. MUIT-REG-2026-TF001"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-muit-600"
              />
              <button
                type="submit"
                disabled={loading || !manualCode.trim()}
                className="py-2.5 px-6 rounded-xl text-sm font-bold text-white bg-muit-700 hover:bg-muit-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Verify & Check In</span>
              </button>
            </form>
          </div>

          {/* Verification Status Result Card */}
          {lastResult && (
            <div
              className={`p-6 rounded-3xl border-2 transition-all animate-in fade-in duration-300 shadow-lg ${
                lastResult.success
                  ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950'
                  : 'bg-rose-50/90 border-rose-500 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-4">
                {lastResult.success ? (
                  <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                ) : (
                  <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-md">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                )}
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold font-display">
                      {lastResult.message}
                    </h3>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/80 border border-current/20">
                      {lastResult.time}
                    </span>
                  </div>

                  {lastResult.student && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-white/90 p-4 rounded-2xl border border-current/15 shadow-sm">
                      <div>
                        <span className="text-slate-400 font-medium">Student Attendee:</span>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{lastResult.student.name}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Enrollment No:</span>
                        <p className="font-bold font-mono text-slate-800 text-sm mt-0.5">{lastResult.student.enrollmentNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Course:</span>
                        <p className="font-bold text-slate-800 mt-0.5">{lastResult.student.course || 'BCA'} ({lastResult.student.semester || '4th'})</p>
                      </div>
                    </div>
                  )}

                  {lastResult.event && (
                    <p className="text-xs font-semibold">
                      Registered Event: <strong className="underline">{lastResult.event.title}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Col: Live Session Scan Activity */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muit-600" />
              <span>Live Gate Check-in Logs</span>
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
              {scanHistory.length} logs
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 space-y-2.5 pr-1">
            {scanHistory.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                <QrCode className="w-8 h-8 mx-auto text-slate-300" />
                <p>No scans recorded in this session yet.</p>
                <p className="text-[10px]">Use the camera or test buttons above to scan student passes.</p>
              </div>
            ) : (
              scanHistory.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl text-xs border ${
                    item.success
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                      : 'bg-rose-50/60 border-rose-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className={item.success ? 'text-emerald-800' : 'text-rose-800'}>
                      {item.student?.name || 'Attendee Pass'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">
                    {item.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default QRScanner;
