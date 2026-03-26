import axios from "axios";

// Axios instance – swap BASE_URL with your Spring Boot backend
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fixitnow_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally, but IGNORE it if the user is on the login route
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Check if the request was made to the login endpoint
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    // Only force logout/redirect if it's NOT a login attempt
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("fixitnow_token");
      localStorage.removeItem("fixitnow_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ─── CATEGORY ICON METADATA ────────────────────────────────────────────────

const CATEGORY_ICON_BY_NAME = {
  electrical: "⚡",
  plumbing: "🔧",
  carpentry: "🪚",
  "ac repair": "❄️",
  painting: "🎨",
  cleaning: "🧹",
  appliance: "📺",
  security: "🔒",
};

const FALLBACK_ICON_BY_NAME = CATEGORY_ICON_BY_NAME;

const hasMojibake = (value) =>
  typeof value === "string" && /(ð|â|Ã|�)/.test(value);

const normalizeIconValue = (value, fallback = "🔧") => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed || hasMojibake(trimmed)) return fallback;
  return trimmed;
};

const coerceToName = (value, idToNameMap = new Map()) => {
  if (value == null) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";

    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        return coerceToName(parsed, idToNameMap);
      } catch {
        return trimmed;
      }
    }

    if (/^\d+$/.test(trimmed) && idToNameMap.has(Number(trimmed))) {
      return idToNameMap.get(Number(trimmed)) || trimmed;
    }

    return trimmed;
  }

  if (typeof value === "number") {
    return idToNameMap.get(value) || String(value);
  }

  if (typeof value === "object") {
    const explicitName = value.name || value.label || value.title;
    if (typeof explicitName === "string" && explicitName.trim()) {
      return explicitName.trim();
    }

    if (value.id != null && idToNameMap.has(Number(value.id))) {
      return idToNameMap.get(Number(value.id)) || String(value.id);
    }
  }

  return String(value);
};

export const buildCategoryLookup = (catalog = []) => {
  const categoryIdToName = new Map();
  const subcategoryIdToName = new Map();

  catalog.forEach((category) => {
    if (category?.id != null && category?.name) {
      categoryIdToName.set(Number(category.id), category.name);
    }

    (category?.subcategories || []).forEach((subcategory) => {
      if (subcategory?.id != null && subcategory?.name) {
        subcategoryIdToName.set(Number(subcategory.id), subcategory.name);
      }
    });
  });

  return { categoryIdToName, subcategoryIdToName };
};

export const normalizeServiceCategoryFields = (service, lookup = {}) => {
  const category = coerceToName(
    service?.category,
    lookup.categoryIdToName || new Map(),
  );
  const subcategory = coerceToName(
    service?.subcategory,
    lookup.subcategoryIdToName || new Map(),
  );

  const fallbackIcon =
    FALLBACK_ICON_BY_NAME[(category || "").toLowerCase()] || "🔧";
  const normalizedIcon = normalizeIconValue(
    service?.image ?? service?.icon,
    fallbackIcon,
  );

  return {
    ...service,
    category,
    subcategory,
    image: normalizedIcon,
    icon: normalizedIcon,
  };
};

export const fetchServiceCatalog = async () => {
  try {
    const { data } = await api.get("/catalog/categories-with-subcategories");

    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((category) => {
      const categoryName = coerceToName(category?.name);
      const fallback =
        FALLBACK_ICON_BY_NAME[categoryName.toLowerCase()] || "🔧";

      return {
        id: category.id,
        name: categoryName,
        icon: fallback,
        color: "slate",
        subcategories: (category.subcategories || []).map((subcategory) => ({
          id: subcategory.id,
          name: coerceToName(subcategory?.name),
          categoryId: subcategory.categoryId,
        })),
      };
    });
  } catch {
    return [];
  }
};

// ─── ADMIN ANALYTICS APIs ─────────────────────────────────────────────────

export const fetchAnalyticsData = async () => {
  try {
    const [userCountsRes, bookingCountsRes, topProvidersRes, topServicesRes, monthlyTrendRes, monthlyRevenueRes] = await Promise.all([
      api.get("/admin/analytics/users/count"),
      api.get("/admin/analytics/bookings/count"),
      api.get("/admin/analytics/providers/top"),
      api.get("/admin/analytics/services/top"),
      api.get("/admin/analytics/bookings/monthly"),
      api.get("/admin/analytics/revenue/monthly"),
    ]);

    const userCounts = userCountsRes.data;
    const bookingCounts = bookingCountsRes.data;
    const topProviders = topProvidersRes.data || [];
    const topServices = topServicesRes.data || [];
    const monthlyBookingTrends = monthlyTrendRes.data || [];
    const monthlyRevenue = monthlyRevenueRes.data || [];

    return {
      userCounts,
      bookingCounts,
      topProviders,
      topServices,
      monthlyBookingTrends,
      monthlyRevenue,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw error;
  }
};

export const fetchPendingProviders = async () => {
  try {
    const { data } = await api.get("/admin/pending-providers");
    const rows = Array.isArray(data) ? data : [];
    return rows.filter((provider) => {
      const status = (provider?.approvalStatus || "").trim().toUpperCase();
      return status === "" || status === "PENDING";
    });
  } catch (error) {
    console.error("Error fetching pending providers:", error);
    return [];
  }
};

export const fetchAdminReports = async () => {
  try {
    const { data } = await api.get("/admin/reports");
    return data || [];
  } catch (error) {
    console.error("Error fetching disputes:", error);
    return [];
  }
};

export const fetchAllUsers = async () => {
  try {
    const { data } = await api.get("/admin/users");
    return data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

