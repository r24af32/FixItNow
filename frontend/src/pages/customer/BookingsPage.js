import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Star, MessageCircle, X, Loader2 } from 'lucide-react';
import { api, fetchServiceCatalog, buildCategoryLookup, normalizeServiceCategoryFields } from '../../utils/api';
import { StatusBadge, StarRating, Modal, EmptyState, SectionHeader } from '../../components/common/index';
import { useAuth } from '../../context/AuthContext';

export const CustomerBookingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  // ─── 1. FETCH REAL BOOKINGS FROM BACKEND ──────────────────────────────────
  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        // Load catalog for category icons
        const catalog = await fetchServiceCatalog();
        const lookup = buildCategoryLookup(catalog);

        // Fetch customer's bookings
        const res = await api.get(`/bookings/customer/${user.id}`);
        const rawBookings = res.data;

        // Enhance bookings with service details (Price, Provider Name, Icon)
        const enhancedBookings = await Promise.all(
          rawBookings.map(async (booking) => {
            try {
              const serviceRes = await api.get(`/services/${booking.serviceId}`);
              const serviceData = normalizeServiceCategoryFields(serviceRes.data, lookup);

              return {
                id: booking.id,
                serviceId: booking.serviceId,
                service: `${serviceData.category} - ${serviceData.subcategory}`,
                provider: serviceData.providerName || 'Provider',
                date: booking.bookingDate,
                timeSlot: booking.timeSlot,
                status: booking.status.toLowerCase(),
                price: serviceData.price || 0,
                image: serviceData.image || '🔧'
              };
            } catch (err) {
              // Fallback if a service was deleted by the provider
              return {
                id: booking.id,
                service: 'Service Unavailable',
                provider: 'Unknown Provider',
                date: booking.bookingDate,
                timeSlot: booking.timeSlot,
                status: booking.status.toLowerCase(),
                price: 0,
                image: '🔧'
              };
            }
          })
        );

        // Sort by date descending (Newest first)
        enhancedBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
        setBookings(enhancedBookings);
      } catch (err) {
        console.error("Failed to load bookings", err);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user]);

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);

  // ─── 2. HANDLE CANCEL BOOKING ─────────────────────────────────────────────
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      // Call the update endpoint your teammate made
      await api.put(`/bookings/update/${bookingId}?status=cancelled`);
      
      // Update the UI instantly without reloading the page
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      console.error("Failed to cancel booking", err);
      alert("Failed to cancel the booking. Please try again.");
    }
  };

  const submitReview = () => {
    if (!rating) return;
    setSubmitted({ ...submitted, [reviewModal.id]: true });
    setReviewModal(null);
    setRating(0);
    setReviewText('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-3" />
        <p className="text-dark-400">Loading your bookings...</p>
      </div>
    );
  }

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
                {bookings.filter(b => b.status === tab.id).length}
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
          description={`You don't have any ${activeTab !== 'all' ? activeTab : ''} bookings yet.`}
          action={<Link to="/customer/services" className="btn-primary">Find Services</Link>}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => (
            <div key={booking.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-5 hover:border-dark-600 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-dark-700 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  {booking.image}
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
                      <button 
                        onClick={() => handleCancelBooking(booking.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
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
