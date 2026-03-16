import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  Loader2,
  Navigation,
} from "lucide-react";
import {
  api,
  SERVICE_CATEGORIES,
  normalizeServiceCategoryFields,
} from "../../utils/api";
import { SectionHeader } from "../../components/common/index";
import MapSelector from "../../components/common/MapSelector";

export const ServicesPage = () => {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [maxPrice, setMaxPrice] = useState(3000);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode] = useState("grid");
  const [services, setServices] = useState([]);
  const [categories] = useState(SERVICE_CATEGORIES);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [categoryLookup] = useState({
    categoryIdToName: new Map(),
    subcategoryIdToName: new Map(),
  });

  const [locationSearch, setLocationSearch] = useState("");
  const [loading, setLoading] = useState(true);
  // FIX 3: Start with a real coordinate so services load instantly!
  const [mapLocation, setMapLocation] = useState({
    lat: 13.0827,
    lng: 80.2707,
  });

  // NEW: Routing states
  const [route, setRoute] = useState(null);
  const [routeDistance, setRouteDistance] = useState("");

  const typingTimeoutRef = useRef(null);

  const getIcon = (category) => {
    return categories.find((c) => c.name === category)?.icon || "🔧";
  };

  const fetchServices = async (
    coords = null,
    lookupOverride = categoryLookup,
  ) => {
    try {
      setLoading(true);
      setRoute(null);
      setRouteDistance("");

      // 🔥 FIX 2: ALWAYS fetch all services initially so the screen is never empty!
      const res = await api.get("/services");
      const data = Array.isArray(res.data) ? res.data : [];

      // Frontend Math to calculate exact distance without relying on the backend filter
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      const formattedServices = data.map((service) => {
        const normalized = normalizeServiceCategoryFields(
          service,
          lookupOverride,
        );

        let distStr = "N/A";
        let rawDist = 9999;

        // If we have coordinates, calculate the real km distance!
        if (coords && normalized.providerLat && normalized.providerLng) {
          rawDist = calculateDistance(
            coords.lat,
            coords.lng,
            normalized.providerLat,
            normalized.providerLng,
          );
          distStr = rawDist.toFixed(1) + " km";
        }

        return {
          ...normalized,
          rating: normalized.rating ?? 0,
          reviews: normalized.reviews ?? 0,
          verified: normalized.verified ?? false,
          completedJobs: normalized.completedJobs ?? 0,
          image: normalized.image ?? getIcon(normalized.category),
          distance: distStr,
          rawDistance: rawDist, // Used for the "Sort by Nearest" filter
        };
      });

      setServices(formattedServices);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIX 1: Initial load & GPS tracking
  useEffect(() => {
    // 1. Instantly load services using the default mapLocation (Chennai)
    fetchServices(mapLocation);

    // 2. Try to find the user's real GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapLocation(coords);
          fetchServices(coords); // 3. Reload services centered on their REAL location!
        },
        (error) => {
          console.warn("Could not get location. Using default.", error);
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on page load

  const handleMapClick = (coords) => {
    setMapLocation(coords);
    fetchServices(coords);
  };

  // --- NEW: THE GPS "LOCATE ME" FUNCTION ---
  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapLocation(coords);

          // Convert coordinates back into a city name for the text box
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`,
            );
            const data = await res.json();
            if (data && data.address) {
              setLocationSearch(
                data.address.suburb ||
                  data.address.city ||
                  data.address.town ||
                  "My Location",
              );
            }
          } catch (e) {
            console.error(e);
          }

          fetchServices(coords);
        },
        (error) => {
          alert(
            "Please allow location access in your browser to use this feature.",
          );
          setLoading(false);
        },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // --- NEW: DRAW THE ROAD ROUTE ---
  const handleProviderClick = async (service) => {
    if (!mapLocation) {
      alert("Please set your location first so we can draw the route!");
      return;
    }
    try {
      // Call OSRM public API for driving directions
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${mapLocation.lng},${mapLocation.lat};${service.providerLng},${service.providerLat}?overview=full&geometries=geojson`,
      );
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        // OSRM returns [Lng, Lat], but Leaflet needs [Lat, Lng]. We swap them here:
        const coords = data.routes[0].geometry.coordinates.map((c) => [
          c[1],
          c[0],
        ]);
        setRoute(coords);
        setRouteDistance((data.routes[0].distance / 1000).toFixed(1) + " km");
      }
    } catch (e) {
      console.error("Routing failed", e);
    }
  };

  const filtered = useMemo(() => {
    let list = [...services];
    if (selectedCat !== "All")
      list = list.filter((s) => s.category === selectedCat);
    if (search) {
      list = list.filter(
        (s) =>
          s.category?.toLowerCase().includes(search.toLowerCase()) ||
          s.providerName?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    list = list.filter((s) => s.price <= maxPrice);
    if (verifiedOnly) list = list.filter((s) => s.verified === true);

    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "distance")
      list.sort((a, b) => (a.distance || "").localeCompare(b.distance || ""));
    else list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }, [services, search, selectedCat, sortBy, maxPrice, verifiedOnly]);

  // 2. SECOND: Add the Reset logic AFTER 'filtered' is defined
  useEffect(() => {
    if (filtered.length === 0) {
      // This clears the orange route line and distance box when no services match filters
      setRoute(null);
      setRouteDistance("");
    }
  }, [filtered]);
  // Add this after your other useEffects
  useEffect(() => {
    // Clear the route and distance badge whenever the category changes
    setRoute(null);
    setRouteDistance("");
  }, [selectedCat]); // This watches for when you click the category pills
  // Add this function inside your ServicesPage component
  const handleClearFilters = () => {
    setSearch("");
    setSelectedCat("All");
    setSortBy("rating");
    setMaxPrice(3000);
    setVerifiedOnly(false);
    // Important: Also clear the map routing
    setRoute(null);
    setRouteDistance("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Find Services"
        subtitle="Browse verified professionals near you"
      />

      {/* Search Bars */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search electricians, plumbers, carpenters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-12 !pr-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all ${
            showFilters
              ? "bg-brand-500 border-brand-500 text-white"
              : "bg-dark-800 border-dark-600 text-dark-300 hover:border-brand-500"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>
      {showFilters && (
        <div className="bg-dark-800 border border-dark-700 p-4 rounded-xl mt-3 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            {/* Sort Dropdown */}
            <div>
              <label className="text-xs text-dark-400 font-medium mb-1.5 block">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field py-2 text-sm w-full"
              >
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Lowest Price</option>
                <option value="price_desc">Highest Price</option>
                <option value="distance">Nearest First</option>
              </select>
            </div>
            {/* Price Slider */}
            <div>
              <label className="text-xs text-dark-400 font-medium mb-1.5 block">
                Max Price: ₹{maxPrice}
              </label>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>

            {/* Verified Toggle */}
            <div className="flex items-center h-10">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-dark-700 w-full transition-colors">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-dark-600 text-brand-500 bg-dark-900"
                />
                <span className="text-sm font-medium text-white">
                  Verified Only
                </span>
              </label>
            </div>

            {/* CLEAR ALL BUTTON */}
            <div className="flex justify-end h-10">
              <button
                onClick={handleClearFilters}
                className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-dark-400 hover:text-red-400 transition-colors bg-dark-900/50 hover:bg-red-500/10 rounded-lg border border-dark-700 hover:border-red-500/50 w-full sm:w-auto"
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Location Search & GPS Button */}
      <div className="flex gap-3 mt-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
          <input
            type="text"
            placeholder="Search by location (city / area) or click Locate Me"
            value={locationSearch}
            onChange={(e) => {
              const val = e.target.value;
              setLocationSearch(val);

              if (typingTimeoutRef.current)
                clearTimeout(typingTimeoutRef.current);

              if (!val.trim()) {
                setMapLocation(null);
                fetchServices(null);
                return;
              }

              typingTimeoutRef.current = setTimeout(async () => {
                try {
                  const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&limit=1`,
                  );
                  const data = await res.json();
                  if (data && data.length > 0) {
                    const coords = {
                      lat: parseFloat(data[0].lat),
                      lng: parseFloat(data[0].lon),
                    };
                    setMapLocation(coords);
                    fetchServices(coords);
                  } else {
                    setServices([]);
                  }
                } catch (err) {
                  console.error("Location search failed:", err);
                }
              }, 1000);
            }}
            className="input-field !pl-11"
          />
        </div>

        {/* LOCATE ME BUTTON */}
        <button
          onClick={handleLocateMe}
          className="bg-dark-800 text-brand-400 border border-dark-600 px-4 py-2 rounded-xl flex items-center gap-2 hover:border-brand-500 transition-all font-medium text-sm shrink-0"
        >
          <Navigation className="w-4 h-4" />{" "}
          <span className="hidden sm:inline">Locate Me</span>
        </button>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {["All", ...categories.map((c) => c.name)].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              selectedCat === cat
                ? "bg-brand-500 text-white"
                : "bg-dark-800 text-dark-400 hover:text-white border border-dark-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-dark-400 text-sm">
        <span className="text-white font-semibold">{filtered.length}</span>{" "}
        services found
      </p>

      <div className="mt-4 relative">
        {routeDistance && (
          <div className="absolute top-4 right-4 z-[400] bg-dark-900 border border-brand-500 px-4 py-2 rounded-xl shadow-lg animate-fade-in">
            <p className="text-white text-sm font-semibold">
              📍Distance:{" "}
              <span className="text-brand-400">{routeDistance}</span>
            </p>
          </div>
        )}

        <MapSelector
          /* CHANGE THIS LINE from services={services} to services={filtered} */
          services={filtered}
          mapLocation={mapLocation}
          onLocationSelect={handleMapClick}
          onProviderClick={handleProviderClick}
          route={route}
        />
      </div>

      {/* Services Grid with localized loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-3" />
          <p className="text-dark-400">Searching for providers...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="text-5xl mb-4">🔍</span>
          <h3 className="font-display font-semibold text-xl text-white mb-2">
            No services found
          </h3>
          <p className="text-dark-400 text-sm">
            Try adjusting your map radius or search terms
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} view={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
};

const ServiceCard = ({ service }) => {
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden card-hover group">
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 bg-dark-700 rounded-xl flex items-center justify-center text-3xl">
            {service.image || "🔧"}
          </div>
          <div className="flex flex-col items-end gap-1">
            {service.verified && (
              <span className="badge bg-green-500/20 text-green-400 text-[10px]">
                ✓ Verified
              </span>
            )}
            {service.providerLocation && (
              <span className="text-xs text-dark-400 flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {service.providerLocation}
              </span>
            )}
          </div>
        </div>
        <h4 className="font-display font-semibold text-white mb-0.5">
          {service.category}
        </h4>
        <p className="text-xs text-dark-400 mb-1">{service.subcategory}</p>
        <p className="text-sm text-dark-300 mb-3">👤 {service.providerName}</p>
      </div>
      <div className="border-t border-dark-700 px-5 py-3 flex items-center justify-between bg-dark-900/50">
        <div>
          <p className="text-xs text-dark-500">Starting from</p>
          <p className="font-bold text-brand-400 text-xl">₹{service.price}</p>
        </div>
        <Link
          to={`/customer/services/${service.id}`}
          className="btn-primary py-2.5 text-sm"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
};
