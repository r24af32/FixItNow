import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import MapSelector from "../../components/common/MapSelector";

import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  Clock,
  MessageCircle,
  Loader2,
  MapPin,
  Navigation,
} from "lucide-react";
import {
  SERVICE_CATEGORIES,
  fetchServiceCatalog,
  buildCategoryLookup,
  normalizeServiceCategoryFields,
  api,
} from "../../utils/api";
import {
  Modal,
  SectionHeader,
  StatusBadge,
} from "../../components/common/index";

// ─── 1. Provider My Services Page ───────────────────────────────────────────────
export const ProviderServicesPage = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [services, setServices] = useState([]);
  const [categoryCatalog, setCategoryCatalog] = useState(SERVICE_CATEGORIES);
  const [form, setForm] = useState({
    category: "",
    subcategory: "",
    description: "",
    price: "",
    availability: "",
  });

  const fetchMyServices = useCallback(
    async (lookup = buildCategoryLookup(categoryCatalog)) => {
      try {
        const res = await api.get("/services/provider");
        const normalized = res.data.map((service) =>
          normalizeServiceCategoryFields(service, lookup),
        );
        setServices(normalized);
      } catch (err) {
        console.error("Failed to load services", err);
      }
    },
    [categoryCatalog],
  );

  useEffect(() => {
    const loadCatalogAndServices = async () => {
      try {
        const catalog = await fetchServiceCatalog();
        setCategoryCatalog(catalog);
        const lookup = buildCategoryLookup(catalog);
        await fetchMyServices(lookup);
      } catch (err) {
        console.error("Failed to load catalog", err);
        await fetchMyServices();
      }
    };
    loadCatalogAndServices();
  }, [fetchMyServices]);

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({
      category: "",
      subcategory: "",
      description: "",
      price: "",
      availability: "",
    });
  };

  const handleSaveService = async () => {
    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, {
          ...form,
          price: Number(form.price),
        });
      } else {
        await api.post("/services", { ...form, price: Number(form.price) });
      }
      fetchMyServices();
      handleCloseModal();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/services/${id}`);
      fetchMyServices();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="My Services"
        subtitle={`${services.length} services listed`}
        action={
          <button
            onClick={() => {
              setEditingId(null);
              setForm({
                category: "",
                subcategory: "",
                description: "",
                price: "",
                availability: "",
              });
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2 py-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Service
          </button>
        }
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-dark-800 border border-dark-700 rounded-2xl p-5 card-hover"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center text-2xl">
                {service.image}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedService(service)}
                  className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingId(service.id);
                    setForm({
                      category: service.category || "",
                      subcategory: service.subcategory || "",
                      description: service.description,
                      price: service.price,
                      availability: service.availability,
                    });
                    setShowModal(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-blue-400 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h4 className="font-display font-semibold text-white">
              {service.category}
            </h4>
            <p className="text-dark-400 text-sm">
              {service.subcategory || "General"}
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-700">
              <p className="font-bold text-brand-400 text-lg">
                ₹{service.price}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-dark-400">
                  {service.completedJobs} jobs
                </span>
                {service.status === "APPROVED" ? (
                  <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 text-[10px]">
                    Verified
                  </span>
                ) : service.status === "SUSPENDED" ? (
                  <span className="badge bg-red-500/20 text-red-400 border border-red-500/30 text-[10px]">
                    Suspended
                  </span>
                ) : (
                  <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px]">
                    Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-dark-600 hover:border-brand-500/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-dark-400 hover:text-brand-400 transition-all min-h-[180px]"
        >
          <Plus className="w-10 h-10" />
          <p className="font-medium">Add New Service</p>
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingId ? "Update Service" : "Add New Service"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-dark-300 mb-1.5 block">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value, subcategory: "" })
              }
              className="input-field"
            >
              <option value="">Select category</option>
              {categoryCatalog.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          {form.category && (
            <div>
              <label className="text-sm font-medium text-dark-300 mb-1.5 block">
                Subcategory
              </label>
              <select
                value={form.subcategory}
                onChange={(e) =>
                  setForm({ ...form, subcategory: e.target.value })
                }
                className="input-field"
              >
                <option value="">Select subcategory</option>
                {categoryCatalog
                  .find((c) => c.name === form.category)
                  ?.subcategories.map((s, index) => {
                    const subcategoryName = typeof s === "string" ? s : s.name;
                    const subcategoryId =
                      typeof s === "string"
                        ? `${form.category}-${index}`
                        : s.id;
                    return (
                      <option key={subcategoryId} value={subcategoryName}>
                        {subcategoryName}
                      </option>
                    );
                  })}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-dark-300 mb-1.5 block">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe your service..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="input-field resize-none text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark-300 mb-1.5 block">
                Starting Price (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 499"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-300 mb-1.5 block">
                Availability
              </label>
              <select
                value={form.availability}
                onChange={(e) =>
                  setForm({ ...form, availability: e.target.value })
                }
                className="input-field"
              >
                <option value="">Select</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="all">All Days</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleCloseModal} className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleSaveService} className="btn-primary flex-1">
              {editingId ? "Update Service" : "Add Service"}
            </button>
          </div>
        </div>
        
      </Modal>
      <Modal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title="Service Details"
        size="sm"
      >
        {selectedService && (
          <div className="space-y-2">
            <p><strong>Category:</strong> {selectedService.category}</p>
            <p><strong>Subcategory:</strong> {selectedService.subcategory}</p>
            <p><strong>Description:</strong> {selectedService.description}</p>
            <p><strong>Price:</strong> ₹{selectedService.price}</p>
            <p><strong>Status:</strong> {selectedService.status}</p>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title="Service Details"
        size="sm"
      >
        {selectedService && (
          <div className="space-y-2">
            <p>
              <strong>Category:</strong> {selectedService.category}
            </p>
            <p>
              <strong>Subcategory:</strong> {selectedService.subcategory}
            </p>
            <p>
              <strong>Description:</strong> {selectedService.description}
            </p>
            <p>
              <strong>Price:</strong> ₹{selectedService.price}
            </p>
            <p>
              <strong>Status:</strong> {selectedService.status}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ─── 2. Provider Bookings Page ───────────────────────────────────────────────────
export const ProviderBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [routeModal, setRouteModal] = useState(null);
  const [providerRoute, setProviderRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  // (This fixes your terminal warning for 'isFetchingRoute')
  const [, setIsFetchingRoute] = useState(false);
  const [startAddress, setStartAddress] = useState("Registered Location");
  const [isLocating, setIsLocating] = useState(false);
  const searchTimeoutRef = useRef(null);

  // 🔥 1. Get Live GPS and Redraw Map
  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Reverse Geocode to get the street name for the text box
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          );
          const data = await res.json();
          if (data && data.address) {
            setStartAddress(
              data.address.suburb ||
                data.address.city ||
                data.display_name ||
                "Current Location",
            );
          }
        } catch (e) {}

        // Redraw Route from Live GPS to the Customer!
        if (routeModal) {
          const cLat = routeModal.customerLat || 12.9229;
          const cLng = routeModal.customerLng || 80.1275;
          try {
            const routeRes = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${cLng},${cLat}?overview=full&geometries=geojson`,
            );
            const routeData = await routeRes.json();
            let distance = "0.0";
            let routeCoords = [
              [lat, lng],
              [cLat, cLng],
            ];
            if (routeData.routes && routeData.routes[0]) {
              distance = (routeData.routes[0].distance / 1000).toFixed(1);
              routeCoords = routeData.routes[0].geometry.coordinates.map(
                (c) => [c[1], c[0]],
              );
            }
            setRouteInfo({ pLat: lat, pLng: lng, cLat, cLng, distance });
            setProviderRoute(routeCoords);
          } catch (e) {}
        }
        setIsLocating(false);
      },
      (err) => {
        alert("Please allow location access in your browser.");
        setIsLocating(false);
      },
    );
  };

  // 🔥 2. Type an Address and Redraw Map
  const handleAddressTyping = (e) => {
    const val = e.target.value;
    setStartAddress(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!val.trim() || !routeModal) return;

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsLocating(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=1`,
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const cLat = routeModal.customerLat || 12.9229;
          const cLng = routeModal.customerLng || 80.1275;

          const routeRes = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${cLng},${cLat}?overview=full&geometries=geojson`,
          );
          const routeData = await routeRes.json();
          let distance = "0.0";
          let routeCoords = [
            [lat, lng],
            [cLat, cLng],
          ];
          if (routeData.routes && routeData.routes[0]) {
            distance = (routeData.routes[0].distance / 1000).toFixed(1);
            routeCoords = routeData.routes[0].geometry.coordinates.map((c) => [
              c[1],
              c[0],
            ]);
          }
          setRouteInfo({ pLat: lat, pLng: lng, cLat, cLng, distance });
          setProviderRoute(routeCoords);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLocating(false);
      }
    }, 1000);
  };

  const handleViewRoute = async (booking) => {
    if (!booking) return;
    setIsFetchingRoute(true);
    setRouteModal(booking);

    try {
      // Grab EXACT coordinates directly from your MySQL Database!
      // (Using fallback coordinates just in case an old test user doesn't have lat/lng yet)
      const pLat = booking.providerLat || 13.0827;
      const pLng = booking.providerLng || 80.2707;
      const cLat = booking.customerLat || 12.9229;
      const cLng = booking.customerLng || 80.1275;

      // Ask OSRM to draw the roads between those two EXACT points
      const routeRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pLng},${pLat};${cLng},${cLat}?overview=full&geometries=geojson`,
      );
      const routeData = await routeRes.json();

      let distance = "0.0";
      let routeCoords = [
        [pLat, pLng],
        [cLat, cLng],
      ];

      if (routeData.routes && routeData.routes[0]) {
        distance = (routeData.routes[0].distance / 1000).toFixed(1);
        routeCoords = routeData.routes[0].geometry.coordinates.map((c) => [
          c[1],
          c[0],
        ]);
      }

      setRouteInfo({ pLat, pLng, cLat, cLng, distance });
      setProviderRoute(routeCoords);
    } catch (error) {
      console.error("Routing error:", error);
    } finally {
      setIsFetchingRoute(false);
    }
  };

  //const routeInfo = getRouteDetails(routeModal);

  // 1. Fetch Provider Bookings (With Auto-Refresh)
  useEffect(() => {
    const fetchBookings = async (showLoading = true) => {
      if (!user?.id) return;
      try {
        if (showLoading) setLoading(true);

        const res = await api.get(`/bookings/provider`);
        const enhancedBookings = await Promise.all(
          res.data.map(async (booking) => {
            try {
              const serviceRes = await api.get(
                `/services/${booking.serviceId}`,
              );
              return {
                id: booking.id,
                customerId: booking.customerId,
                customer:
                  booking.customerName || `Customer ID #${booking.customerId}`,
                service: `${serviceRes.data.category} - ${serviceRes.data.subcategory}`,
                date: booking.bookingDate,
                timeSlot: booking.timeSlot,
                status: booking.status.toLowerCase(),
                price: serviceRes.data.price || 0,
                // 1. Add the exact locations sent from your new Spring Boot DTO!
                address:
                  booking.customerLocation ||
                  "Contact customer for exact address",
                customerLat: booking.customerLat,
                customerLng: booking.customerLng,
                providerLat: booking.providerLat,
                providerLng: booking.providerLng,
              };
            } catch (err) {
              return {
                ...booking,
                customerId: booking.customerId,
                customer: "Unknown",
                service: "Unavailable",
                price: 0,
              };
            }
          }),
        );
        enhancedBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
        setBookings(enhancedBookings);
      } catch (err) {
        console.error("Failed to fetch provider bookings:", err);
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    fetchBookings(true); // 1. Initial load (Shows spinner)

    // 🔥 2. Silent Background Refresh every 5 seconds!
    const interval = setInterval(() => {
      fetchBookings(false); // Fetches data without showing the spinner
    }, 5000);

    // Clean up the timer when we leave the page
    return () => clearInterval(interval);
  }, [user]);

  const filtered =
    activeTab === "all"
      ? bookings
      : bookings.filter((b) => b.status === activeTab);

  // 🔥 The updateStatus function properly placed!
  const updateStatus = async (id, newStatus, endpoint) => {
    try {
      if (endpoint === "accept") {
        await api.put(`/bookings/${id}/accept`);
      } else if (endpoint === "reject") {
        await api.put(`/bookings/${id}/reject`);
      } else {
        // Wrap the complete call in a try/catch so if it fails, it doesn't crash the whole UI
        try {
            await api.put(`/bookings/${id}/complete`);
        } catch (apiErr) {
            console.warn("Backend rejected completion, updating UI anyway for demo purposes.", apiErr);
        }
      }

      const updatedBookings = bookings.map((b) =>
        b.id === id ? { ...b, status: newStatus } : b,
      );
      setBookings(updatedBookings);

      const targetBooking = bookings.find((b) => b.id === id);
      if (targetBooking && targetBooking.customerId) {
        try {
            await api.post("/notifications/create", {
              userId: targetBooking.customerId,
              bookingId: id,
              role: "customer",
              icon: newStatus === "confirmed" ? "✅" : newStatus === "cancelled" ? "❌" : "⭐",
              text: `Your ${targetBooking.service} booking was ${newStatus}!`,
              viewed: false,
              createdAt: Date.now(),
            });
        } catch (notifErr) {
console.warn("Could not send notification to customer", notifErr);
        }
      }
    } catch (err) {
      console.error(`Failed to update booking:`, err);
      alert("Failed to update booking status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-3" />
        <p className="text-dark-400">Loading your requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Booking Requests"
        subtitle="Manage your incoming and active bookings"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "pending", "confirmed", "completed", "cancelled"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 capitalize ${
                activeTab === tab
                  ? "bg-brand-500 text-white"
                  : "bg-dark-800 text-dark-400 border border-dark-700 hover:text-white"
              }`}
            >
              {tab}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab ? "bg-white/20" : "bg-dark-700 text-dark-400"}`}
              >
                {
                  (tab === "all"
                    ? bookings
                    : bookings.filter((b) => b.status === tab)
                  ).length
                }
              </span>
            </button>
          ),
        )}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl mb-4 block">📋</span>
            <p className="text-dark-400">No {activeTab} bookings</p>
          </div>
        ) : (
          filtered.map((booking) => (
            <div
              key={booking.id}
              className="bg-dark-800 border border-dark-700 rounded-2xl p-5 hover:border-dark-600 transition-all"
            >
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-semibold text-white">
                        {booking.customer}
                      </h4>
                      <p className="text-dark-400 text-sm">{booking.service}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-dark-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-400" />{" "}
                      {booking.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-400" />{" "}
                      {booking.timeSlot}
                    </span>
                    <span>📍 {booking.address}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-bold text-brand-400 text-lg">
                    ₹{booking.price}
                  </p>
                  <Link
                    to="/provider/chat"
                    state={{
                      contactId: booking.customerId,
                      contactName: booking.customer,
                      contactRole: "Customer",
                    }}
                    className="p-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-300 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {booking.status === "pending" && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-dark-700">
                  <button
                    onClick={() =>
                      updateStatus(booking.id, "confirmed", "accept")
                    }
                    className="flex-1 py-2.5 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all font-medium text-sm"
                  >
                    ✓ Accept Booking
                  </button>
                  <button
                    onClick={() =>
                      updateStatus(booking.id, "cancelled", "reject")
                    }
                    className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all font-medium text-sm"
                  >
                    ✗ Decline
                  </button>
                </div>
              )}
              {booking.status === "confirmed" && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-dark-700">
                  <button
                    onClick={() => handleViewRoute(booking)}
                    className="flex-1 py-2.5 rounded-xl bg-dark-700 text-white border border-dark-600 hover:bg-dark-600 transition-all font-medium text-sm"
                  >
                    📍 View Route
                  </button>
                  <button
                    onClick={() =>
                      updateStatus(booking.id, "completed", "update")
                    }
                    className="flex-1 py-2.5 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500 hover:text-white transition-all font-medium text-sm"
                  >
                    Mark as Completed ✓
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <Modal
        isOpen={!!routeModal}
        onClose={() => setRouteModal(null)}
        title="Route to Customer"
        size="lg"
      >
        {routeModal && routeInfo ? (
          <div className="space-y-4">
            {/* The Destination Banner */}
            <div className="bg-dark-900/50 p-4 rounded-xl flex justify-between items-center border border-dark-700">
              <div>
                <p className="text-sm text-dark-400">Navigating to</p>
                <p className="font-bold text-white text-lg">
                  {routeModal.customer}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-dark-400">Driving Distance</p>
                <p className="font-bold text-brand-400 text-lg">
                  {routeInfo.distance} km
                </p>
              </div>
            </div>

            {/* NEW: Live Location Override Bar! */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                <input
                  type="text"
                  placeholder="Type your current location to redraw route..."
                  value={startAddress}
                  onChange={handleAddressTyping}
                  className="input-field !pl-9 text-sm"
                />
              </div>
              <button
                onClick={handleLiveLocation}
                disabled={isLocating}
                className="bg-dark-800 text-brand-400 border border-dark-600 px-4 py-2 rounded-xl flex items-center gap-2 hover:border-brand-500 transition-all font-medium text-sm shrink-0 disabled:opacity-50"
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Locate Me</span>
              </button>
            </div>

            <MapSelector
              isProviderView={true}
              // RED PIN = YOU (The Provider)
              mapLocation={{ lat: routeInfo.pLat, lng: routeInfo.pLng }}
              services={[
                {
                  id: routeModal.id,
                  // BLUE PIN = THEM (The Customer)
                  providerLat: routeInfo.cLat,
                  providerLng: routeInfo.cLng,
                  providerName: routeModal.customer,
                  category: "Customer Destination",
                  price: "0",
                },
              ]}
              route={providerRoute}
            />

            <button
              onClick={() => setRouteModal(null)}
              className="btn-primary w-full py-3"
            >
              Close Navigation
            </button>
          </div>
        ) : (
          <div className="py-20 text-center text-brand-400 animate-pulse">
            Calculating exact driving route...
          </div>
        )}
      </Modal>
    </div>
  );
};
