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
// ─── MOCK DATA (used when backend is not connected) ─────────────────────────

export const MOCK_SERVICES = [
  {
    id: 1,
    category: "Electrical",
    subcategory: "Wiring",
    provider: "Ravi Kumar",
    providerId: 101,
    rating: 4.8,
    reviews: 124,
    price: 499,
    location: "Koramangala, Bengaluru",
    distance: "1.2 km",
    image: "⚡",
    verified: true,
    completedJobs: 240,
  },
  {
    id: 2,
    category: "Plumbing",
    subcategory: "Pipe Repair",
    provider: "Suresh Babu",
    providerId: 102,
    rating: 4.6,
    reviews: 89,
    price: 399,
    location: "Indiranagar, Bengaluru",
    distance: "2.4 km",
    image: "🔧",
    verified: true,
    completedJobs: 185,
  },
  {
    id: 3,
    category: "Carpentry",
    subcategory: "Furniture Repair",
    provider: "Mohan Das",
    providerId: 103,
    rating: 4.9,
    reviews: 201,
    price: 599,
    location: "Whitefield, Bengaluru",
    distance: "3.1 km",
    image: "🪚",
    verified: true,
    completedJobs: 312,
  },
  {
    id: 4,
    category: "AC Repair",
    subcategory: "Servicing",
    provider: "Anil Sharma",
    providerId: 104,
    rating: 4.7,
    reviews: 156,
    price: 799,
    location: "HSR Layout, Bengaluru",
    distance: "0.8 km",
    image: "❄️",
    verified: false,
    completedJobs: 198,
  },
  {
    id: 5,
    category: "Painting",
    subcategory: "Interior",
    provider: "Ramesh Gowda",
    providerId: 105,
    rating: 4.5,
    reviews: 67,
    price: 1299,
    location: "Marathahalli, Bengaluru",
    distance: "4.5 km",
    image: "🎨",
    verified: true,
    completedJobs: 89,
  },
  {
    id: 6,
    category: "Cleaning",
    subcategory: "Deep Clean",
    provider: "CleanPro Team",
    providerId: 106,
    rating: 4.8,
    reviews: 302,
    price: 1499,
    location: "BTM Layout, Bengaluru",
    distance: "2.0 km",
    image: "🧹",
    verified: true,
    completedJobs: 450,
  },
];

export const MOCK_BOOKINGS = [
  {
    id: 1,
    service: "Electrical Wiring",
    provider: "Ravi Kumar",
    providerId: 101,
    date: "2025-08-15",
    timeSlot: "10:00 AM",
    status: "confirmed",
    price: 499,
  },
  {
    id: 2,
    service: "Pipe Repair",
    provider: "Suresh Babu",
    date: "2025-08-10",
    timeSlot: "2:00 PM",
    status: "completed",
    price: 399,
    rating: 4,
  },
  {
    id: 3,
    service: "AC Servicing",
    provider: "Anil Sharma",
    date: "2025-08-18",
    timeSlot: "11:00 AM",
    status: "pending",
    price: 799,
  },
  {
    id: 4,
    service: "Furniture Repair",
    provider: "Mohan Das",
    date: "2025-07-28",
    timeSlot: "3:00 PM",
    status: "cancelled",
    price: 599,
  },
];

export const MOCK_PROVIDER_BOOKINGS = [
  {
    id: 1,
    customer: "Priya Nair",
    service: "Electrical Wiring",
    date: "2025-08-15",
    timeSlot: "10:00 AM",
    status: "confirmed",
    price: 499,
    address: "123 MG Road, Bengaluru",
  },
  {
    id: 2,
    customer: "Arjun Mehta",
    service: "Switch Repair",
    date: "2025-08-16",
    timeSlot: "2:00 PM",
    status: "pending",
    price: 299,
    address: "45 Brigade Road, Bengaluru",
  },
  {
    id: 3,
    customer: "Kavita Singh",
    service: "Electrical Wiring",
    date: "2025-08-10",
    timeSlot: "11:00 AM",
    status: "completed",
    price: 799,
    address: "78 Residency Road, Bengaluru",
  },
];

export const MOCK_CHAT_MESSAGES = [
  {
    id: 1,
    senderId: "customer",
    content: "Hi! I need help with electrical wiring in my apartment.",
    time: "10:30 AM",
  },
  {
    id: 2,
    senderId: "provider",
    content: "Sure! Can you tell me more about the issue?",
    time: "10:31 AM",
  },
  {
    id: 3,
    senderId: "customer",
    content:
      "There are 3 rooms that need new wiring done. The switches aren't working properly.",
    time: "10:32 AM",
  },
  {
    id: 4,
    senderId: "provider",
    content:
      "I can come and take a look. Would tomorrow at 10 AM work for you?",
    time: "10:33 AM",
  },
  {
    id: 5,
    senderId: "customer",
    content: "That works perfectly! What's the estimated cost?",
    time: "10:34 AM",
  },
  {
    id: 6,
    senderId: "provider",
    content:
      "It depends on the extent of work, but roughly ₹500–₹800. I'll give a proper quote after inspection.",
    time: "10:35 AM",
  },
];

export const SERVICE_CATEGORIES = [
  {
    id: 1,
    name: "Electrical",
    icon: "⚡",
    color: "yellow",
    subcategories: [
      "Wiring",
      "Switch Repair",
      "Fan Installation",
      "Inverter Setup",
    ],
  },
  {
    id: 2,
    name: "Plumbing",
    icon: "🔧",
    color: "blue",
    subcategories: [
      "Pipe Repair",
      "Tap Fitting",
      "Drain Cleaning",
      "Water Heater",
    ],
  },
  {
    id: 3,
    name: "Carpentry",
    icon: "🪚",
    color: "amber",
    subcategories: [
      "Furniture Repair",
      "Door Fixing",
      "Cabinet Making",
      "Flooring",
    ],
  },
  {
    id: 4,
    name: "AC Repair",
    icon: "❄️",
    color: "cyan",
    subcategories: ["Servicing", "Gas Refill", "Installation", "PCB Repair"],
  },
  {
    id: 5,
    name: "Painting",
    icon: "🎨",
    color: "pink",
    subcategories: ["Interior", "Exterior", "Waterproofing", "Texture Paint"],
  },
  {
    id: 6,
    name: "Cleaning",
    icon: "🧹",
    color: "green",
    subcategories: [
      "Deep Clean",
      "Sofa Cleaning",
      "Bathroom Cleaning",
      "Kitchen Cleaning",
    ],
  },
  {
    id: 7,
    name: "Appliance",
    icon: "📺",
    color: "purple",
    subcategories: [
      "TV Repair",
      "Washing Machine",
      "Refrigerator",
      "Microwave",
    ],
  },
  {
    id: 8,
    name: "Security",
    icon: "🔒",
    color: "red",
    subcategories: [
      "CCTV Install",
      "Door Lock",
      "Alarm System",
      "Safe Install",
    ],
  },
];

const FALLBACK_ICON_BY_NAME = SERVICE_CATEGORIES.reduce((acc, category) => {
  acc[category.name.toLowerCase()] = category.icon;
  return acc;
}, {});

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

  return {
    ...service,
    category,
    subcategory,
  };
};

export const fetchServiceCatalog = async () => {
  try {
    const { data } = await api.get("/catalog/categories-with-subcategories");

    if (!Array.isArray(data) || data.length === 0) {
      return SERVICE_CATEGORIES;
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
    return SERVICE_CATEGORIES.map((category) => ({
      ...category,
      subcategories: category.subcategories.map((subcategoryName, index) => ({
        id: index + 1,
        name: subcategoryName,
        categoryId: category.id,
      })),
    }));
  }
};

export const ADMIN_STATS = {
  totalUsers: 1842,
  totalProviders: 384,
  activeBookings: 127,
  revenue: 284500,
  pendingVerifications: 12,
  activeDisputes: 5,
  monthlyBookings: [
    { month: "Mar", bookings: 120 },
    { month: "Apr", bookings: 145 },
    { month: "May", bookings: 162 },
    { month: "Jun", bookings: 198 },
    { month: "Jul", bookings: 215 },
    { month: "Aug", bookings: 243 },
  ],
  topCategories: [
    { name: "Electrical", count: 342, color: "#f59e0b" },
    { name: "Plumbing", count: 289, color: "#3b82f6" },
    { name: "AC Repair", count: 218, color: "#06b6d4" },
    { name: "Cleaning", count: 195, color: "#10b981" },
    { name: "Carpentry", count: 156, color: "#f97316" },
  ],
};
