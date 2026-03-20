import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  UserPlus,
  Wrench,
  MapPin,
  Clock,
  Upload,
  CheckCircle,
  X,
  FileText,
  Navigation,
  Loader2,
} from "lucide-react";
import { api } from "../utils/api";

// Time Slots Configuration
const TIME_SLOTS = [
  { id: "slot_1", label: "9:00 AM - 11:00 AM" },
  { id: "slot_2", label: "11:00 AM - 1:00 PM" },
  { id: "slot_3", label: "2:00 PM - 4:00 PM" },
  { id: "slot_4", label: "4:00 PM - 6:00 PM" },
  { id: "slot_5", label: "6:00 PM - 8:00 PM" },
];

const ACCEPTED_DOC_TYPES = ["Aadhaar Card", "PAN Card", "Driving License"];
const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_MIME = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
];

// â”€â”€â”€ Success Popup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SuccessPopup = ({ onClose, role }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
    <div className="relative bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md animate-slide-up shadow-2xl p-8 text-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="relative inline-flex items-center justify-center mb-5">
        <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-20" />
      </div>
      <h3 className="font-display font-bold text-xl text-white mb-3">
        {role === "provider"
          ? "Profile Submitted Successfully!"
          : "Account Created Successfully!"}
      </h3>

      <p className="text-dark-300 text-sm leading-relaxed mb-6">
        {role === "provider"
          ? "Your profile has been submitted successfully and is under admin verification. You will be notified once approved."
          : "Your account has been created successfully. You can now login."}
      </p>

      {role === "provider" && (
        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
          <span className="text-yellow-400 text-sm font-medium">
            Status: Pending Admin Approval
          </span>
        </div>
      )}
      <button onClick={onClose} className="btn-primary w-full">
        Got It, Thanks!
      </button>
    </div>
  </div>
);

// â”€â”€â”€ Location Toast Popup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const LocationToast = ({ type, onClose }) => {
  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />,
      text: "Location captured successfully.",
      cls: "bg-green-500/10 border-green-500/20 text-green-300",
    },
    denied: {
      icon: <MapPin className="w-5 h-5 text-red-400 flex-shrink-0" />,
      text: "Location access denied. Please allow location permission.",
      cls: "bg-red-500/10 border-red-500/20 text-red-300",
    },
  };
  const { icon, text, cls } = config[type];
  return (
    <div
      className={`flex items-center gap-3 p-3.5 rounded-xl border animate-slide-up ${cls}`}
    >
      {icon}
      <p className="text-sm flex-1">{text}</p>
      <button
        onClick={onClose}
        className="text-current opacity-60 hover:opacity-100 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    location: "",
    category: "",
    serviceArea: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [idFile, setIdFile] = useState(null);
  const [idDocType, setIdDocType] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [geoCoords, setGeoCoords] = useState({ lat: "", lng: "" });
  const [geoStatus, setGeoStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'denied'
  const navigate = useNavigate();
  const [geoAddress, setGeoAddress] = useState("");

  // â”€â”€ Reset form completely when component mounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    // Clear all form fields on mount
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "customer",
      location: "",
      category: "",
      serviceArea: "",
    });
    setShowPass(false);
    setShowConfirmPass(false);
    setErrors({});
    setSelectedSlots([]);
    setIdFile(null);
    setIdDocType("");
    setGeoCoords({ lat: "", lng: "" });
    setGeoStatus("idle");
  }, []); // Empty dependency - runs once on mount

  // â”€â”€ Reset provider-specific fields when role changes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (form.role === "customer") {
      setSelectedSlots([]);
      setIdFile(null);
      setIdDocType("");
      setForm((prev) => ({ ...prev, category: "", serviceArea: "" }));
    }
  }, [form.role]);

  // â”€â”€ Slot toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const toggleSlot = (slotId) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((s) => s !== slotId)
        : [...prev, slotId],
    );
    setErrors((prev) => ({ ...prev, timeSlots: "" }));
  };

  // â”€â”€ File upload handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_MIME.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        idFile: "Only JPG, PNG, or PDF files are accepted.",
      }));
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        idFile: `File size must be under ${MAX_FILE_SIZE_MB}MB.`,
      }));
      return;
    }
    setIdFile(file);
    setErrors((prev) => ({ ...prev, idFile: "" }));
  };

  // â”€â”€ Geolocation capture â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }

    setGeoStatus("loading");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);

        setGeoCoords({ lat, lng });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
            { headers: { "Accept-Language": "en" } },
          );

          const data = await res.json();
          const a = data.address || {};

          const parts = [
            a.neighbourhood || a.suburb || a.village || a.town,
            a.city || a.county,
            a.state,
          ].filter(Boolean);

          const addr =
            parts.join(", ") || data.display_name || `${lat}, ${lng}`;

          setGeoAddress(addr);

          // Auto-fill location field
          setForm((prev) => ({ ...prev, location: addr }));
          setErrors((prev) => ({ ...prev, location: "" }));
        } catch {
          setGeoAddress(`${lat}, ${lng}`);
          setForm((prev) => ({ ...prev, location: `${lat}, ${lng}` }));
        }

        setGeoStatus("success");
      },
      () => {
        setGeoStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  // â”€â”€ Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (!form.location.trim()) e.location = "Location is required";
    if (form.role === "provider") {
      if (!form.category) e.category = "Category is required";
      if (selectedSlots.length === 0)
        e.timeSlots = "Please select at least one time slot";
      if (!idDocType) e.idDocType = "Please select document type";
      if (!idFile) e.idFile = "ID proof is mandatory for provider registration";
    }
    return e;
  };

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role.toUpperCase(),
        location: form.location,
        category: form.role === "provider" ? form.category : null,
        serviceArea: form.role === "provider" ? form.serviceArea : null,
        timeSlots: form.role === "provider" ? selectedSlots : [],
        idDocType: form.role === "provider" ? idDocType : null,
        latitude: geoCoords.lat ? parseFloat(geoCoords.lat) : null,
        longitude: geoCoords.lng ? parseFloat(geoCoords.lng) : null,
      };
      await api.post("/auth/register", payload);

      if (form.role === "provider") {
        setShowSuccess(true);
      } else {
        // Show popup for customer also
        setShowSuccess(true);
      }
    } catch (err) {
      console.error("REGISTER ERROR:", err.response);

      if (err.response) {
        const status = err.response.status;

        // Catch the specific 400 error
        if (status === 400) {
          setErrors({
            general:
              "Invalid registration data. Please check your inputs or role.",
          });
        } else {
          // Fallback for other errors
          const message =
            err.response.data?.message ||
            (typeof err.response.data === "string"
              ? err.response.data
              : "Registration failed. Try again.");
          setErrors({ general: message });
        }
      } else {
        setErrors({ general: "Network error. Is the backend running?" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/login");
  };
  const f = (field, val) => {
    setForm({ ...form, [field]: val });
    setErrors({ ...errors, [field]: "" });
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      {showSuccess && (
        <SuccessPopup onClose={handleSuccessClose} role={form.role} />
      )}

      <div className="w-full max-w-lg relative z-10 animate-slide-up py-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl shadow-glow-orange mb-3">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">
            Join FixIt<span className="text-brand-500">Now</span>
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            Create your account to get started
          </p>
        </div>

        <div className="bg-glass rounded-2xl p-6 shadow-2xl">
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {["customer", "provider"].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => f("role", role)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  form.role === role
                    ? "border-brand-500 bg-brand-500/10 text-white"
                    : "border-dark-600 bg-dark-800 text-dark-400 hover:border-dark-500"
                }`}
              >
                <div className="text-2xl mb-1">
                  {role === "customer" ? "👤" : "🛠️"}
                </div>
                <p className="font-semibold text-sm capitalize">{role}</p>
                <p className="text-xs text-dark-400 mt-0.5">
                  {role === "customer" ? "Book services" : "Offer services"}
                </p>
              </button>
            ))}
          </div>
          {errors.general && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-dark-300 mb-1.5 block">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => f("name", e.target.value)}
                  className="input-field"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-dark-300 mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => f("email", e.target.value)}
                  className="input-field"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium text-dark-300 mb-1.5 block">
                <MapPin className="inline w-3.5 h-3.5 mr-1" />
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Koramangala, Bengaluru"
                value={form.location}
                onChange={(e) => f("location", e.target.value)}
                className="input-field"
              />
              {errors.location && (
                <p className="text-red-400 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            {/* â”€â”€ Precise Location (all roles) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700">
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="w-4 h-4 text-brand-400" />
                <p className="text-xs font-mono uppercase tracking-wider text-dark-400">
                  Set Precise Location
                </p>
              </div>
              <p className="text-xs text-dark-500 mb-3">
                Capture your exact coordinates so customers can find you
                accurately
              </p>

              {/* Use Current Location button matching existing btn-primary style */}
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={geoStatus === "loading"}
                className="btn-primary flex items-center gap-2 py-2 px-4 text-sm disabled:opacity-60 mb-3"
              >
                {geoStatus === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Detecting
                    location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" /> Use Current Location
                  </>
                )}
              </button>

              {/* Toast feedback */}
              {(geoStatus === "success" || geoStatus === "denied") && (
                <div className="mb-3">
                  <LocationToast
                    type={geoStatus === "success" ? "success" : "denied"}
                    onClose={() => setGeoStatus("idle")}
                  />
                </div>
              )}

              {/* Coordinates display, read-only, shown only after capture */}
              {geoStatus === "success" && (
                <div>
                  <label className="text-xs font-medium text-dark-400 mb-1 block">
                    Detected Location
                  </label>
                  <input
                    type="text"
                    value={geoAddress}
                    readOnly
                    className="input-field text-sm text-dark-300 bg-dark-800 cursor-default"
                  />
                </div>
              )}
            </div>

            {/* â”€â”€ Provider-specific fields â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {form.role === "provider" && (
              <>
                {/* Category + Service Area */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-dark-900/50 rounded-xl border border-dark-700">
                  <p className="col-span-2 text-xs font-mono uppercase tracking-wider text-dark-400">
                    Provider Details
                  </p>
                  <div>
                    <label className="text-sm font-medium text-dark-300 mb-1.5 block">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => f("category", e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select category</option>
                      {[
                        "Electrical",
                        "Plumbing",
                        "Carpentry",
                        "AC Repair",
                        "Painting",
                        "Cleaning",
                        "Appliance",
                        "Security",
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.category}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-300 mb-1.5 block">
                      Service Area (km)
                    </label>
                    <select
                      value={form.serviceArea}
                      onChange={(e) => f("serviceArea", e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select range</option>
                      {["5", "10", "20", "50"].map((v) => (
                        <option key={v} value={v}>
                          {v} km
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* â”€â”€ FEATURE 1: Time Slot Selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-brand-400" />
                    <p className="text-xs font-mono uppercase tracking-wider text-dark-400">
                      Available Time Slots
                    </p>
                    <span className="text-red-400 text-xs">*required</span>
                  </div>
                  <p className="text-xs text-dark-500 mb-3">
                    Select all time slots when you are available to work
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = selectedSlots.includes(slot.id);
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => toggleSlot(slot.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-brand-500/20 border-brand-500/60 text-brand-300"
                              : "bg-dark-800 border-dark-600 text-dark-400 hover:border-dark-500 hover:text-dark-300"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle className="w-3 h-3 text-brand-400" />
                          )}
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                  {selectedSlots.length > 0 && (
                    <p className="text-xs text-brand-400 mt-2">
                      ✓ {selectedSlots.length} slot
                      {selectedSlots.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                  {errors.timeSlots && (
                    <p className="text-red-400 text-xs mt-2">
                      {errors.timeSlots}
                    </p>
                  )}
                </div>

                {/* â”€â”€ FEATURE 2: ID Proof Upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-brand-400" />
                    <p className="text-xs font-mono uppercase tracking-wider text-dark-400">
                      ID Proof Verification
                    </p>
                    <span className="text-red-400 text-xs">*mandatory</span>
                  </div>
                  <p className="text-xs text-dark-500 mb-3">
                    Upload a valid government-issued ID. Accepted: Aadhaar Card,
                    PAN Card, Driving License
                  </p>
                  <div className="mb-3">
                    <label className="text-sm font-medium text-dark-300 mb-1.5 block">
                      Document Type
                    </label>
                    <select
                      value={idDocType}
                      onChange={(e) => {
                        setIdDocType(e.target.value);
                        setErrors((prev) => ({ ...prev, idDocType: "" }));
                      }}
                      className="input-field"
                    >
                      <option value="">Select document type</option>
                      {ACCEPTED_DOC_TYPES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    {errors.idDocType && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.idDocType}
                      </p>
                    )}
                  </div>
                  <label
                    className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      idFile
                        ? "border-green-500/50 bg-green-500/5"
                        : errors.idFile
                          ? "border-red-500/50 bg-red-500/5"
                          : "border-dark-600 bg-dark-800 hover:border-brand-500/50 hover:bg-brand-500/5"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {idFile ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-green-400" />
                        <div className="text-center">
                          <p className="text-green-400 text-sm font-medium">
                            {idFile.name}
                          </p>
                          <p className="text-dark-400 text-xs mt-0.5">
                            {(idFile.size / 1024).toFixed(0)} KB • Click to
                            replace
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-dark-400" />
                        <div className="text-center">
                          <p className="text-dark-300 text-sm font-medium">
                            Click to upload ID proof
                          </p>
                          <p className="text-dark-500 text-xs mt-0.5">
                            JPG, PNG or PDF • Max {MAX_FILE_SIZE_MB}MB
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                  {errors.idFile && (
                    <p className="text-red-400 text-xs mt-2">{errors.idFile}</p>
                  )}
                </div>
              </>
            )}

            {/* Password fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-dark-300 mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => f("password", e.target.value)}
                    className="input-field pr-10"
                    style={{
                      WebkitTextSecurity: showPass ? "none" : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                  >
                    {showPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-dark-300 mb-1.5 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => f("confirmPassword", e.target.value)}
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                  >
                    {showConfirmPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                required
                className="accent-brand-500 mt-0.5 flex-shrink-0"
              />
              <p className="text-dark-400">
                I agree to the{" "}
                <button
                  type="button"
                  className="text-brand-400 hover:underline"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-brand-400 hover:underline"
                >
                  Privacy Policy
                </button>
              </p>
            </div>

            {/* Provider approval notice */}
            {form.role === "provider" && (
              <div className="flex items-start gap-2.5 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0 animate-pulse" />
                <p className="text-yellow-300 text-xs leading-relaxed">
                  Provider accounts require admin approval. After registration,
                  your profile will be reviewed before you can start accepting
                  bookings.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" /> Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-dark-400 text-sm mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
