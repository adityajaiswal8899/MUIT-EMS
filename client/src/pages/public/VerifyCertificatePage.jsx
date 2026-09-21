import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificatesAPI } from '../../services/api';
import CertificateView from '../../components/common/CertificateView';
import { Award, ShieldCheck, Search, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const VerifyCertificatePage = () => {
  const { certificateId } = useParams();
  const [searchId, setSearchId] = useState(certificateId || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewModal, setPreviewModal] = useState(false);

  useEffect(() => {
    if (certificateId) {
      handleVerify(certificateId);
    }
  }, [certificateId]);

  const handleVerify = async (idToVerify) => {
    const query = idToVerify || searchId;
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setCertificate(null);

    try {
      const res = await certificatesAPI.verifyCertificate(query.trim());
      if (res.data?.success && res.data.certificate) {
        setCertificate(res.data.certificate);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Certificate ID not found in MUIT Records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <img
          src="/muit_logo.png"
          alt="Official MUIT University Emblem"
          className="w-20 h-20 rounded-full object-contain mx-auto shadow-md ring-4 ring-amber-400/60 bg-white mb-2"
        />
        <h1 className="text-3xl font-display font-extrabold text-slate-900">
          Verify MUIT Digital Certificate
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Enter the official Certificate ID to cryptographically verify event participation and student credentials.
        </p>
      </div>

      {/* Verification Input Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm max-w-xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            placeholder="e.g. MUIT-CERT-2026-PL981"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-muit-600 uppercase"
          />
          <button
            type="submit"
            disabled={loading || !searchId.trim()}
            className="px-6 py-3 rounded-xl bg-muit-700 hover:bg-muit-800 disabled:opacity-50 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Verifying...' : 'Verify Now'}</span>
          </button>
        </form>
      </div>

      {/* Verification Results */}
      {error && (
        <div className="max-w-xl mx-auto p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-sm">Verification Failed</h4>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {certificate && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border-2 border-emerald-500/80 p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span className="text-base font-extrabold text-emerald-950">
                Official Authenticated Credential
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
              {certificate.certificateId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 font-medium">Recipient Student:</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{certificate.student?.name}</p>
              <p className="text-[11px] text-slate-500">{certificate.student?.enrollmentNumber} ({certificate.student?.course})</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 font-medium">Event Name:</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{certificate.event?.title}</p>
              <p className="text-[11px] text-slate-500">{certificate.event?.category}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 font-medium">Issue Date:</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {new Date(certificate.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 font-medium">Issuing Authority:</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{certificate.event?.organizerName || 'MUIT Council'}</p>
            </div>
          </div>

          <button
            onClick={() => setPreviewModal(true)}
            className="w-full py-3 rounded-2xl bg-muit-700 hover:bg-muit-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>View Full Official Certificate Document</span>
          </button>
        </div>
      )}

      {/* Modal view */}
      {previewModal && certificate && (
        <CertificateView
          certificate={certificate}
          onClose={() => setPreviewModal(false)}
        />
      )}

    </div>
  );
};

export default VerifyCertificatePage;
