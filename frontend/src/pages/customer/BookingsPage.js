import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Star, MessageCircle, X } from 'lucide-react';
import { MOCK_BOOKINGS, MOCK_SERVICES } from '../../utils/api';
import { StatusBadge, StarRating, Modal, EmptyState, SectionHeader } from '../../components/common/index';

export const CustomerBookingsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [reviewModal, setReviewModal] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState({});

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filtered = activeTab === 'all' ? MOCK_BOOKINGS : MOCK_BOOKINGS.filter(b => b.status === activeTab);

  const submitReview = () => {
    if (!rating) return;
    setSubmitted({ ...submitted, [reviewModal.id]: true });
    setReviewModal(null);
    setRating(0);
    setReviewText('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title="My Bookings" subtitle="Track and manage all your service requests" />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-white border border-dark-700'
            }`}
          >
            {tab.label}
            {tab.id !== 'all' && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-dark-700 text-dark-400'
              }`}>
                {MOCK_BOOKINGS.filter(b => b.status === tab.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No bookings here"
          description="You don't have any bookings in this category yet."
          action={<Link to="/customer/services" className="btn-primary">Find Services</Link>}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => {
            const service = MOCK_SERVICES.find(s => s.category === booking.service.split(' ')[0]) || MOCK_SERVICES[0];
            return (
              <div key={booking.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-5 hover:border-dark-600 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-dark-700 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                    {service.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h4 className="font-display font-semibold text-white">{booking.service}</h4>
                        <p className="text-dark-400 text-sm">{booking.provider}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1.5 text-sm text-dark-400">
                        <Calendar className="w-4 h-4 text-brand-400" /> {booking.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-dark-400">
                        <Clock className="w-4 h-4 text-blue-400" /> {booking.timeSlot}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700 flex-wrap gap-3">
                  <p className="text-brand-400 font-bold text-lg">₹{booking.price}</p>
                  <div className="flex items-center gap-2">
                    {booking.status === 'completed' && !submitted[booking.id] && (
                      <button
                        onClick={() => setReviewModal(booking)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all text-sm font-medium"
                      >
                        <Star className="w-4 h-4" /> Rate Service
                      </button>
                    )}
                    {booking.status === 'completed' && submitted[booking.id] && (
                      <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                        ✓ Review submitted
                      </span>
                    )}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <>
                        <Link to="/customer/chat" className="flex items-center gap-1.5 btn-secondary py-2 text-sm">
                          <MessageCircle className="w-4 h-4" /> Chat
                        </Link>
                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium">
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Rate & Review" size="sm">
        {reviewModal && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <p className="text-dark-300 text-sm mb-1">How was your experience with</p>
              <p className="font-semibold text-white">{reviewModal.provider}?</p>
            </div>
            <div className="flex justify-center">
              <StarRating rating={rating} size="xl" interactive onChange={setRating} />
            </div>
            <div className="text-center text-sm text-dark-400">
              {['', 'Terrible', 'Bad', 'OK', 'Good', 'Excellent'][rating]}
            </div>
            <textarea
              rows={3}
              placeholder="Share your experience (optional)"
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              className="input-field resize-none text-sm"
            />
            <button onClick={submitReview} disabled={!rating} className="btn-primary w-full disabled:opacity-40">
              Submit Review
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
