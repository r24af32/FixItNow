import React, { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { StarRating } from '../common/index';
import { Toast } from '../common/Toast';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

/**
 * ReviewForm  –  Tasks 1 & 2
 *
 * Task 1: Replaced alert() with in-app <Toast> notification
 * Task 2: Added loading state, success state, form reset after submit
 *
 * Props:
 *   booking   – { id, providerId, provider }
 *   onSuccess – () => void
 *   onCancel  – () => void
 */
export const ReviewForm = ({ booking, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [rating, setRating]       = useState(0);
  const [comment, setComment]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);   // Task 2: success state
  const [error, setError]           = useState('');
  const [toast, setToast]           = useState(null);    // Task 1: toast state

  const LABELS = ['', 'Terrible', 'Bad', 'OK', 'Good', 'Excellent'];

  const handleSubmit = async () => {
    if (!rating) {
      setError('Please select a star rating.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/reviews', {
        bookingId:  booking.id,
        providerId: booking.providerId,
        customerId: user.id,
        rating,
        comment: comment.trim(),
      });

      // Task 2: show success state inside form
      setSubmitted(true);

      // Task 1: show in-app toast instead of alert()
      setToast({ message: 'Review submitted successfully!', type: 'success' });

      // Task 2: reset form fields
      setRating(0);
      setComment('');

      // Notify parent after short delay so user sees success state
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 1800);

    } catch (err) {
      console.error('Review submission failed:', err);
      const msg =
        err?.response?.data?.message ||
        'Failed to submit review. Please try again.';
      setError(msg);
      // Task 1: error toast as well
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Task 2: Success state inside modal ──────────────────────────────────
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
          <p className="font-semibold text-white text-lg">Thank you!</p>
          <p className="text-dark-400 text-sm text-center">
            Your review for <span className="text-white">{booking.provider}</span> has been submitted.
          </p>
        </div>
      </>
    );
  }

  // ── Normal form ──────────────────────────────────────────────────────────
  return (
    <>
      {/* Task 1: Toast rendered at top-right, outside modal flow */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-4">
        {/* Provider name */}
        <div className="text-center py-2">
          <p className="text-dark-300 text-sm mb-1">How was your experience with</p>
          <p className="font-semibold text-white">{booking.provider}?</p>
        </div>

        {/* Star picker */}
        <div className="flex justify-center">
          <StarRating
            rating={rating}
            size="xl"
            interactive
            onChange={(val) => {
              setRating(val);
              setError('');
            }}
          />
        </div>

        {/* Verbal label */}
        <div className="text-center text-sm text-dark-400 min-h-[1.25rem]">
          {LABELS[rating]}
        </div>

        {/* Comment */}
        <textarea
          rows={3}
          placeholder="Share your experience (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input-field resize-none text-sm"
        />

        {/* Inline error */}
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* Task 2: Loading state on submit button */}
        <button
          onClick={handleSubmit}
          disabled={!rating || submitting}
          className="btn-primary w-full disabled:opacity-40"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </span>
          ) : (
            'Submit Review'
          )}
        </button>
      </div>
    </>
  );
};