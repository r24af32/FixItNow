import React, { useState, useEffect } from 'react';
import { StarRating } from '../common/index';
import { api } from '../../utils/api';

/**
 * ReviewList
 *
 * Props:
 *   providerId – number  (service.exactProviderId or service.providerId)
 *
 * Drop this component anywhere a provider's reviews need to be shown.
 * It owns its own fetch, so the parent page stays unchanged except for
 * removing the hardcoded REVIEWS array and swapping in this component.
 *
 * Renders using the exact same card pattern already used in ServiceDetailPage.
 */
export const ReviewList = ({ providerId }) => {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  useEffect(() => {
    if (!providerId) return;

    let cancelled = false;

    const fetchReviews = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await api.get(`/reviews/provider/${providerId}`);
        if (!cancelled) setReviews(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load reviews:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReviews();
    return () => { cancelled = true; };
  }, [providerId]);

  /* ── helpers ── */
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getInitial = (name = '') => (name.trim()[0] || '?').toUpperCase();

  /* ── loading skeleton – same pattern used in SkeletonCard ── */
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="pb-4 border-b border-dark-700 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="skeleton w-8 h-8 rounded-full" />
              <div className="space-y-1">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-2 w-16" />
              </div>
            </div>
            <div className="skeleton h-3 w-full mt-2" />
            <div className="skeleton h-3 w-3/4 mt-1" />
          </div>
        ))}
      </div>
    );
  }

  /* ── error state ── */
  if (error) {
    return (
      <p className="text-dark-400 text-sm text-center py-4">
        Could not load reviews right now.
      </p>
    );
  }

  /* ── empty state ── */
  if (reviews.length === 0) {
    return (
      <p className="text-dark-400 text-sm text-center py-4">
        No reviews yet. Be the first to review!
      </p>
    );
  }

  /* ── review cards – identical markup to what ServiceDetailPage used ── */
  return (
    <div className="space-y-4">
      {reviews.map((rev) => (
        <div
          key={rev.id}
          className="pb-4 border-b border-dark-700 last:border-0 last:pb-0"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {/* Avatar initial bubble */}
              <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center text-sm font-bold text-brand-400">
                {getInitial(rev.customerName || rev.reviewerName || 'U')}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {rev.customerName || rev.reviewerName || 'Anonymous'}
                </p>
                <p className="text-xs text-dark-500">
                  {formatDate(rev.createdAt)}
                </p>
              </div>
            </div>
            {/* Display-only star rating */}
            <StarRating rating={rev.rating} size="sm" />
          </div>

          {rev.comment && (
            <p className="text-dark-300 text-sm leading-relaxed">
              {rev.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};