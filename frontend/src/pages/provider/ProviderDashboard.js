import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  DollarSign,
  ChevronRight,
  Users,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import { StatusBadge, SectionHeader } from "../../components/common/index";

const StatCard = ({ icon, label, value, sub, trend, color = "brand" }) => {
  const colorMap = {
    brand: "text-brand-400 bg-brand-500/10",
    green: "text-green-400 bg-green-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
  };
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>{icon}</div>
        {trend && (
          <span
            className={`text-xs font-medium ${trend > 0 ? "text-green-400" : "text-red-400"}`}
          >
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="font-display font-bold text-2xl text-white">{value}</p>
      <p className="text-dark-400 text-sm mt-0.5">{label}</p>
      {sub && <p className="text-dark-500 text-xs mt-1">{sub}</p>}
    </div>
  );
};

export const ProviderDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const buildLocalIsoDate = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        const bookingsRes = await api.get("/bookings/provider");
        const rawBookings = Array.isArray(bookingsRes.data)
          ? bookingsRes.data
          : [];

        const enrichedBookings = await Promise.all(
          rawBookings.map(async (booking) => {
            let servicePrice = 0;

            if (booking.serviceId) {
              try {
                const serviceRes = await api.get(
                  `/services/${booking.serviceId}`,
                );
                servicePrice = Number(serviceRes.data?.price || 0);
              } catch {
                servicePrice = 0;
              }
            }

            return {
              id: booking.id,
              customer:
                booking.customerName || `Customer #${booking.customerId}`,
              service: [booking.serviceCategory, booking.serviceSubcategory]
                .filter(Boolean)
                .join(" - "),
              date: booking.bookingDate,
              timeSlot: booking.timeSlot,
              status: (booking.status || "").toLowerCase(),
              price: servicePrice,
              address: booking.customerLocation || "Location unavailable",
            };
          }),
        );

        const reviewsRes = await api.get(`/reviews/provider/${user.id}`);
        setBookings(enrichedBookings);
        setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
      } catch (err) {
        console.error("Failed to load provider dashboard data", err);
        setBookings([]);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const completedThisMonth = bookings.filter((booking) => {
      if (booking.status !== "completed" || !booking.date) return false;
      const bookingDate = new Date(booking.date);
      return (
        !Number.isNaN(bookingDate.getTime()) &&
        bookingDate.getMonth() === currentMonth &&
        bookingDate.getFullYear() === currentYear
      );
    });

    const monthlyEarnings = completedThisMonth.reduce(
      (sum, booking) => sum + Number(booking.price || 0),
      0,
    );

    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce(
              (sum, review) => sum + Number(review.rating || 0),
              0,
            ) / reviews.length
          ).toFixed(1)
        : "--";

    return {
      monthlyEarnings,
      completedThisMonth: completedThisMonth.length,
      newRequests: bookings.filter((booking) => booking.status === "pending")
        .length,
      avgRating,
      reviewCount: reviews.length,
      todayBookings: bookings.filter(
        (booking) =>
          booking.date === buildLocalIsoDate(now) &&
          booking.status !== "cancelled",
      ),
    };
  }, [bookings, reviews]);

  if (loading) {
    return (
      <div className="text-dark-300 py-10 text-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome + Availability Toggle */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-dark-400 text-sm">{today}</p>
          <h1 className="font-display font-bold text-2xl text-white mt-1">
            Good day, {user?.name?.split(" ")[0] || "Provider"}! 👋
          </h1>
          <p className="text-dark-400 mt-1">Here's your service overview</p>
        </div>
        <div className="flex items-center gap-3 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3">
          <div>
            <p className="text-xs text-dark-400">Availability</p>
            <p className="text-sm font-semibold text-green-400">Active</p>
          </div>
          <div className="relative w-12 h-6 bg-green-500 rounded-full cursor-pointer">
            <span className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Earnings"
          value={`₹${stats.monthlyEarnings.toLocaleString("en-IN")}`}
          sub="This month"
          color="green"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Jobs Completed"
          value={String(stats.completedThisMonth)}
          sub="This month"
          color="brand"
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label="Rating"
          value={stats.avgRating}
          sub={`From ${stats.reviewCount} reviews`}
          color="yellow"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="New Requests"
          value={String(stats.newRequests)}
          sub="Needs attention"
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "New Booking",
            emoji: "📅",
            path: "/provider/bookings",
            color: "border-brand-500/50 bg-brand-500/10 hover:bg-brand-500/20",
          },
          {
            label: "Add Service",
            emoji: "➕",
            path: "/provider/services/new",
            color: "border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20",
          },
          {
            label: "View Messages",
            emoji: "💬",
            path: "/provider/chat",
            color: "border-green-500/50 bg-green-500/10 hover:bg-green-500/20",
          },
          {
            label: "My Profile",
            emoji: "👤",
            path: "/provider/settings",
            color:
              "border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20",
          },
        ].map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${item.color} transition-all text-center card-hover`}
          >
            <span className="text-2xl">{item.emoji}</span>
            <p className="text-sm font-medium text-white">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* Today's Schedule */}
      <div>
        <SectionHeader
          title="Today's Bookings"
          subtitle={`${stats.todayBookings.length} scheduled for today`}
          action={
            <Link
              to="/provider/bookings"
              className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-sm font-medium"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          }
        />
        <div className="space-y-3">
          {stats.todayBookings.length === 0 ? (
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 text-dark-400 text-sm">
              No bookings scheduled for today.
            </div>
          ) : (
            stats.todayBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-dark-800 border border-dark-700 rounded-xl p-4 hover:border-dark-600 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-0.5 min-w-[60px]">
                    <p className="text-xs text-dark-400">Time</p>
                    <p className="text-sm font-bold text-white">
                      {booking.timeSlot.split(" ")[0]}
                    </p>
                    <p className="text-xs text-dark-500">
                      {booking.timeSlot.split(" ")[1]}
                    </p>
                  </div>
                  <div className="w-px h-10 bg-dark-700" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-semibold text-white">
                          {booking.customer}
                        </p>
                        <p className="text-dark-400 text-sm">
                          {booking.service}
                        </p>
                        <p className="text-dark-500 text-xs mt-0.5">
                          📍 {booking.address}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={booking.status} />
                        <p className="text-brand-400 font-bold">
                          ₹{booking.price}
                        </p>
                      </div>
                    </div>
                    {booking.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all text-sm font-medium">
                          ✓ Accept
                        </button>
                        <button className="flex-1 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium">
                          ✗ Decline
                        </button>
                      </div>
                    )}
                    {booking.status === "confirmed" && (
                      <button className="mt-3 w-full py-1.5 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500/30 transition-all text-sm font-medium">
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <SectionHeader title="This Month Summary" />
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 grid grid-cols-2 gap-4">
          <div className="bg-dark-900/50 rounded-xl p-4">
            <p className="text-dark-400 text-xs">Revenue</p>
            <p className="text-brand-400 font-bold text-xl">
              ₹{stats.monthlyEarnings.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-dark-900/50 rounded-xl p-4">
            <p className="text-dark-400 text-xs">Completed Jobs</p>
            <p className="text-white font-bold text-xl">
              {stats.completedThisMonth}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
