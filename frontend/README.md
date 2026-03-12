# FixItNow – Frontend

A professional React + Tailwind CSS frontend for the FixItNow neighborhood service marketplace.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

```bash
# 1. Navigate to the project folder
cd fixitnow

# 2. Install all dependencies
npm install

# 3. Start the development server
npm start
```

The app will open at **http://localhost:3000**

---

## 🔑 Demo Login Accounts

Use these to explore each role without needing a backend:

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@demo.com | demo123 |
| Provider | provider@demo.com | demo123 |
| Admin | admin@demo.com | demo123 |

---

## 📁 Project Structure

```
src/
├── context/
│   └── AuthContext.js        # JWT auth state management
├── utils/
│   └── api.js                # Axios instance + mock data
├── components/
│   └── common/
│       ├── index.js          # Shared UI components
│       └── Layout.js         # Sidebar + header layout
├── pages/
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   ├── customer/
│   │   ├── CustomerDashboard.js
│   │   ├── ServicesPage.js
│   │   ├── ServiceDetailPage.js
│   │   ├── BookingsPage.js
│   │   ├── ChatPage.js
│   │   └── SettingsPage.js
│   ├── provider/
│   │   ├── ProviderDashboard.js
│   │   └── ProviderPages.js  # Services + Bookings
│   └── admin/
│       ├── AdminDashboard.js
│       └── AdminPages.js     # Users + Providers + Disputes
└── App.js                    # Routes
```

---

## 🔌 Connecting to Spring Boot Backend

1. Create a `.env` file in the project root:
   ```
   REACT_APP_API_URL=http://localhost:8080/api
   ```

2. The `src/utils/api.js` file contains an Axios instance that automatically:
   - Adds JWT Bearer tokens to all requests
   - Handles 401 errors by redirecting to login

3. Replace mock data calls with real API calls:
   ```js
   // Instead of MOCK_SERVICES, call:
   const response = await api.get('/services');
   ```

---

## ✅ Features Implemented

### Authentication
- Login with role-based redirect (customer/provider/admin)
- Register with role selection
- JWT token stored in localStorage
- Protected routes per role

### Customer Portal
- Dashboard with stats + nearby services
- Service search with filters (category, price, distance, ratings)
- Service detail page with booking flow
- Bookings management with status tracking + review system
- Real-time chat interface (WebSocket-ready)
- Profile settings

### Provider Portal
- Earnings dashboard with chart
- Service listing + CRUD
- Booking management (accept/decline/complete)
- Chat interface
- Availability toggle

### Admin Panel
- Analytics dashboard (Recharts charts)
- User management with status control
- Provider management + verification
- Dispute resolution workflow

---

## 🎨 Tech Stack
- **React 18** + React Router v6
- **Tailwind CSS** (dark theme, custom tokens)
- **Recharts** (admin analytics)
- **Axios** (API calls with interceptors)
- **Lucide React** (icons)
- **Google Fonts** (Sora + DM Sans)
