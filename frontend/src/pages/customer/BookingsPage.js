import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Star, MessageCircle, X, Loader2 } from 'lucide-react';
import { MOCK_SERVICES, api } from '../../utils/api';
import { StatusBadge, StarRating, Modal, EmptyState, SectionHeader } from '../../components/common/index';
import { ReviewForm } from '../../components/reviews/ReviewForm';
import { useAuth } from '../../context/AuthContext';

export const CustomerBookingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [reviewModal, setReviewModal] = useState(null);
  const [submitted, setSubmitted] = useState({});
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];
// 🔥 1. Fetch REAL Bookings from Spring Boot (With Auto-Refresh)
  useEffect(() => {
    let isMounted = true; // Prevents memory leaks if the user clicks away fast

    const fetchBookings = async (showLoading = true) => {
      if (!user?.id) return;
      try {
        if (showLoading) setLoading(true); 
        
        const res = await api.get(`/bookings/customer`);
        
        const formatted = await Promise.all(res.data.map(async b => {
            try {
              // Try to fetch the shiny details
              const sRes = await api.get(`/services/${b.serviceId}`);
              return {
                  id: b.id,
                  service: sRes.data.category,
                  provider: sRes.data.providerName,
                  providerId: sRes.data.providerId,
                  date: b.bookingDate,
                  timeSlot: b.timeSlot,
                  status: b.status.toLowerCase(),
                  price: sRes.data.price
              };
            } catch (e) {
              // 🔥 FIX: Provide safe defaults for EVERY field so React doesn't crash
              console.warn(`Could not load service details for booking ${b.id}`);
              return { 
                  id: b.id,
                  service: "Service Unavailable", 
                  provider: "Unknown Provider", 
                  providerId: b.providerId || 0,
                  date: b.bookingDate || "Unknown Date",
                  timeSlot: b.timeSlot || "Unknown Time",
                  status: b.status ? b.status.toLowerCase() : "pending",
                  price: 0 
              };
            }
        }));
        
        // Only update state if the user is still on this page
        if (isMounted) {
            // Sort by newest first!
            formatted.sort((a, b) => new Date(b.date) - new Date(a.date));
            setBookings(formatted);
        }
      } catch (err) {
        console.error("Failed to load customer bookings", err);
      } finally {
        if (isMounted && showLoading) setLoading(false);
      }
    };

    fetchBookings(true); 

    const interval = setInterval(() => {
      fetchBookings(false); 
    }, 5000);

    return () => {
        isMounted = false; // Cleanup
        clearInterval(interval);
    }
  }, [user]);

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);

  const handleReviewSuccess = () => {
    setSubmitted({ ...submitted, [reviewModal.id]: true });
    setReviewModal(null);
  };

  // 🔥 2. Cancel via Spring Boot API
  const cancelBooking = async (id) => {
    try {
      await api.put(`/bookings/${id}/cancel`);
      setBookings(bookings.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking.");
    }
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
          {filtered.map(booking => {
            const serviceIcon = MOCK_SERVICES.find(s => booking.service?.toLowerCase().includes(s.category.toLowerCase()))?.image || "🔧";
            return (
              <div key={booking.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-5 hover:border-dark-600 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-dark-700 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                    {serviceIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h4 className="font-display font-semibold text-white">{booking.service}</h4>
                        <p className="text-dark-400 text-sm">{booking.provider}</p>

                        {booking.status === "pending" && (
                          <p className="text-yellow-400 text-xs mt-1">
                            Your request is pending. Provider will respond within 48 hours.
                          </p>
                        )}
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
                    
                    {/* Review Button */}
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

                    {/* Pending Actions */}
                    {booking.status === "pending" && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    )}

                    {/* Confirmed Actions (THE MISSING PAY BUTTON!) */}
                    {booking.status === "confirmed" && (
                      <>
                        <Link
                          to="/customer/chat"
                          state={{ contactId: booking.providerId, contactName: booking.provider, contactRole: 'Provider' }}
                          className="flex items-center gap-1.5 btn-secondary py-2 text-sm"
                        >
                          <MessageCircle className="w-4 h-4" /> Chat
                        </Link>

                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>

                        <Link
                          to="/customer/payment"
                          state={booking}
                          className="btn-primary py-2 text-sm"
                        >
                          Pay Now
                        </Link>
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
          <ReviewForm
            booking={reviewModal}
            onSuccess={handleReviewSuccess}
            onCancel={() => setReviewModal(null)}
          />
        )}
      </Modal>
    </div>
  );
};