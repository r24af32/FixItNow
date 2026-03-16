import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { StarRating } from '../common/index';
import { api } from '../../utils/api';

/**
 * ReviewForm
 *
 * Props:
 *   booking   – { id, providerId, provider }   (from CustomerBookingsPage)
 *   onSuccess – () => void  called after a successful submission
 *   onCancel  – () => void  called when the user dismisses without submitting
 *
 * The parent (BookingsPage) already wraps this inside <Modal>, so this
 * component renders only the inner content – no extra containers needed.
 */
export const ReviewForm = ({ booking, onSuccess, onCancel }) => {
  const [rating, setRating]       = useState(0);
  const [comment, setComment]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

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
        rating,
        comment: comment.trim(),
      });

      onSuccess && onSuccess();
    } catch (err) {
      console.error('Review submission failed:', err);
      // Show backend message if available, otherwise a generic fallback
      setError(
        err?.response?.data?.message ||
        'Failed to submit review. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Provider name banner */}
      <div className="text-center py-2">
        <p className="text-dark-300 text-sm mb-1">How was your experience with</p>
        <p className="font-semibold text-white">{booking.provider}?</p>
      </div>

      {/* Interactive star picker – reuses existing StarRating component */}
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

      {/* Verbal label under the stars */}
      <div className="text-center text-sm text-dark-400 min-h-[1.25rem]">
        {LABELS[rating]}
      </div>

      {/* Comment textarea – same input-field class used everywhere */}
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

      {/* Submit – same btn-primary used everywhere */}
      <button
        onClick={handleSubmit}
        disabled={!rating || submitting}
        className="btn-primary w-full disabled:opacity-40"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Star className="w-4 h-4 animate-pulse" /> Submitting...
          </span>
        ) : (
          'Submit Review'
        )}
      </button>
    </div>
  );
};