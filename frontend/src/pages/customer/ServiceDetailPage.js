import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext"; // Add this line
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Star,
  Shield,
  Clock,
  CheckCircle,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { useEffect } from "react";
import { StarRating, Modal, ReviewList } from "../../components/common/index";
import {
  api,
  fetchServiceCatalog,
  buildCategoryLookup,
  normalizeServiceCategoryFields,
} from "../../utils/api";

const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

const formatReviewDate = (dateValue) => {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / dayMs);

  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;

  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
};

export const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providerReviews, setProviderReviews] = useState([]);

  useEffect(() => {
    const loadService = async () => {
      try {
        const catalog = await fetchServiceCatalog();
        const lookup = buildCategoryLookup(catalog);

        const res = await api.get(`/services/${id}`);
        const normalized = normalizeServiceCategoryFields(res.data, lookup);

        // Capture the raw provider ID directly from the backend response
        normalized.exactProviderId =
          res.data.provider?.id || res.data.providerId || res.data.provider_id;

        // Extract nested provider data with safe fallbacks.
        normalized.providerName = res.data.provider?.name || res.data.providerName || "Service Provider";
        // Read provider id from the DTO shape.
        normalized.providerLocation = res.data.providerLocation || res.data.provider?.location || res.data.location || "Location not specified";
        normalized.completedJobs = res.data.completedJobs || res.data.provider?.completedJobs || 0;
        // Format service area for display.
        normalized.distance = res.data.serviceArea ? `Up to ${res.data.serviceArea} km` : "Local";

        setService(normalized);

        if (normalized.exactProviderId) {
          const reviewsRes = await api.get(
            `/reviews/provider/${normalized.exactProviderId}`,
          );
          setProviderReviews(
            Array.isArray(reviewsRes.data) ? reviewsRes.data : [],
          );
        } else {
          setProviderReviews([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingModal, setBookingModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleBook = () => {
    if (!selectedDate || !selectedSlot) return;
    setBookingModal(true);
  };

  const confirmBooking = async () => {
    try {
      setLoading(true);

      // Send only fields expected by the backend DTO.
      const bookingPayload = {
        serviceId: service.id,
        bookingDate: selectedDate,
        timeSlot: selectedSlot,
      };

      // Endpoint aligns with current controller mapping.
      const res = await api.post("/bookings", bookingPayload);

      const notifications =
        JSON.parse(localStorage.getItem("notifications")) || [];
      await api.post("/notifications/create", {
        userId: service.exactProviderId, // Using the safely extracted ID
        bookingId: res.data.id,
        role: "provider",
        icon: "📅",
        text: `New booking request for ${service.category} from Customer #${user.id}`,
        viewed: false,
        createdAt: Date.now(),
      });
      localStorage.setItem("notifications", JSON.stringify(notifications));

      setConfirmed(true);
      setTimeout(() => {
        navigate("/customer/bookings");
      }, 1500);
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Failed to create booking.");
    } finally {
      setLoading(false);
    }
  };
  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  const computedReviewCount = providerReviews.length;
  const computedAverageRating =
    computedReviewCount > 0
      ? providerReviews.reduce((sum, item) => sum + (item.rating || 0), 0) /
        computedReviewCount
      : Number(service?.rating || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-white text-lg">Loading service...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-20 text-red-400">Service not found.</div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <Link
        to="/customer/services"
        className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Services
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Service Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Card */}
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 bg-dark-700 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
                {service.image || "🔧"}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h1 className="font-display font-bold text-2xl text-white">
                      {service.category}
                    </h1>
                    <p className="text-dark-400 mt-0.5">
                      {service.subcategory}
                    </p>
                  </div>
                  {service.verified && (
                    <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-full text-sm font-medium">
                      <Shield className="w-4 h-4" /> Verified Pro
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <StarRating rating={computedAverageRating} size="md" />
                    <span className="font-bold text-white">
                      {computedAverageRating.toFixed(1)}
                    </span>
                    <span className="text-dark-400 text-sm">
                      ({computedReviewCount || service.reviews || 0} reviews)
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-dark-400 text-sm">
                    <MapPin className="w-4 h-4" /> {service.distance}
                  </span>
                  <span className="flex items-center gap-1 text-dark-400 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />{" "}
                    {service.completedJobs} jobs done
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Provider Info */}
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6">
            <h3 className="font-display font-semibold text-lg text-white mb-4">
              Service Provider
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-500/20 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">
                    {service.providerName}
                  </p>
                  <p className="text-dark-400 text-sm flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {service.providerLocation}
                  </p>
                  <p className="text-dark-500 text-xs mt-0.5">
                    Member since {service.memberSince}
                  </p>
                </div>
              </div>
              <Link
                to={`/customer/chat`}
                state={{
                  contactId: service.exactProviderId,
                  contactName: service.providerName,
                  contactRole: "Provider",
                }}
                className="btn-secondary flex items-center gap-2 py-2 text-sm"
              >
                <MessageCircle className="w-4 h-4" /> Message
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-dark-700">
              {[
                {
                  label: "Response Time",
                  value: "< 1 hr",
                  icon: <Clock className="w-4 h-4 text-blue-400" />,
                },
                {
                  label: "Completed Jobs",
                  value: service.completedJobs,
                  icon: <CheckCircle className="w-4 h-4 text-green-400" />,
                },
                {
                  label: "Rating",
                  value: `${computedAverageRating.toFixed(1)}/5`,
                  icon: (
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center p-3 bg-dark-900/50 rounded-xl"
                >
                  <div className="flex justify-center mb-1">{item.icon}</div>
                  <p className="font-bold text-white">{item.value}</p>
                  <p className="text-dark-500 text-xs">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6">
            <h3 className="font-display font-semibold text-lg text-white mb-4">
              Customer Reviews
            </h3>
            <ReviewList providerId={service.exactProviderId} />
          </div>
        </div>

        {/* Right - Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 sticky top-20">
            <div className="mb-5">
              <p className="text-dark-400 text-sm">Starting price</p>
              <p className="font-display font-bold text-3xl text-brand-400">
                ₹{service.price}
              </p>
              <p className="text-dark-500 text-xs mt-0.5">
                + taxes as applicable
              </p>
            </div>

            {/* Date */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-dark-300 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Select Date
                </label>
                <input
                  type="date"
                  min={today}
                  max={maxDate.toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="text-sm font-medium text-dark-300 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Available Time Slots
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        selectedSlot === slot
                          ? "bg-brand-500 text-white border-brand-500"
                          : "bg-dark-700 text-dark-300 border-dark-600 hover:border-brand-500/50 border"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-dark-300 mb-2 block">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the issue or any special requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field resize-none text-sm"
                />
              </div>

              <button
                onClick={handleBook}
                disabled={!selectedDate || !selectedSlot}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm Booking
              </button>

              <p className="text-xs text-dark-500 text-center flex items-center justify-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Free cancellation up to 24
                hours before
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <Modal
        isOpen={bookingModal}
        onClose={() => !confirmed && setBookingModal(false)}
        title={confirmed ? "Request Status" : "Confirm Your Request"}
        size="md"
      >
        {confirmed ? (
          <div className="text-center py-8 animate-fade-in">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-ping"></div>
              <div className="relative w-20 h-20 bg-brand-500/20 rounded-full flex items-center justify-center border-2 border-brand-500/50">
                <Clock className="w-10 h-10 text-brand-400" /> {/* Make sure to import Clock at the top if not already! */}
              </div>
            </div>
            <h3 className="font-display font-bold text-2xl text-white mb-2">
              Request Sent!
            </h3>
            <p className="text-dark-400 text-sm max-w-xs mx-auto leading-relaxed">
              We've notified <span className="text-white font-medium">{service.providerName}</span>. 
              You will be alerted as soon as they accept your booking.
            </p>
            <p className="text-dark-500 text-xs mt-6">
              Redirecting to your bookings...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ... Keep the existing pre-confirmation UI the same ... */}
            <div className="bg-dark-900/50 rounded-xl p-4 space-y-3">
              {[
                { label: "Service", value: service.category },
                { label: "Provider", value: service.providerName },
                { label: "Date", value: selectedDate },
                { label: "Time", value: selectedSlot },
                { label: "Amount", value: `₹${service.price}` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-dark-400">{item.label}</span>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setBookingModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className="btn-primary flex-1 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
