import React, { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Toast } from '../common/Toast';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

/**
 * ReportForm  –  Task 1 (Dispute Management)
 *
 * Mirrors ReviewForm.js patterns exactly:
 *   - Same loading state on submit button
 *   - Same inline success state with CheckCircle
 *   - Same Toast notification
 *   - Same inline error display
 *   - Same input-field / btn-primary classes
 *
 * Props:
 *   booking   – { id, service, provider }
 *   onSuccess – () => void
 *   onCancel  – () => void
 */
export const ReportForm = ({ booking, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [reason, setReason]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');
  const [toast, setToast]           = useState(null);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please describe the issue before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/reports', {
        targetType: 'booking',
        targetId:   booking.id,
        reportedBy: user.id,
        reason:     reason.trim(),
      });

      setSubmitted(true);
      setToast({ message: 'Report submitted successfully!', type: 'success' });
      setReason('');

      setTimeout(() => {
        onSuccess && onSuccess();
      }, 1800);

    } catch (err) {
      console.error('Report submission failed:', err);
      const msg =
        err?.response?.data?.message ||
        'Failed to submit report. Please try again.';
      setError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state (mirrors ReviewForm) ──────────────────────────────────
  if (submitted) {
    return (
      <>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div className="flex flex-col items-center justify-center py-6 space-y-3 animate-fade-in">
          <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-400" />
          </div>
          <p className="font-semibold text-white text-lg">Report Submitted</p>
          <p className="text-dark-400 text-sm text-center">
            Your issue with <span className="text-white">{booking.provider}</span> has been reported to our team.
          </p>
        </div>
      </>
    );
  }

  // ── Normal form ──────────────────────────────────────────────────────────
  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-4">
        {/* Context label */}
        <div className="text-center py-2">
          <p className="text-dark-300 text-sm mb-1">Reporting an issue with</p>
          <p className="font-semibold text-white">{booking.provider}</p>
          <p className="text-dark-500 text-xs mt-0.5">Booking #{booking.id} · {booking.service}</p>
        </div>

        {/* Reason textarea */}
        <textarea
          rows={4}
          placeholder="Describe the issue in detail..."
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError('');
          }}
          className="input-field resize-none text-sm"
        />

        {/* Inline error */}
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || submitting}
            className="flex-1 btn-primary disabled:opacity-40"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </span>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </div>
    </>
  );
};
