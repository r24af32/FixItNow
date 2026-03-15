import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/common/Layout';
import { PageLoader } from './components/common/index';

// Auth Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { ServicesPage } from './pages/customer/ServicesPage';
import { ServiceDetailPage } from './pages/customer/ServiceDetailPage';
import { CustomerBookingsPage } from './pages/customer/BookingsPage';
import { ChatPage } from './pages/customer/ChatPage';
import { SettingsPage } from './pages/customer/SettingsPage';

// Provider Pages
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { ProviderServicesPage, ProviderBookingsPage } from './pages/provider/ProviderPages';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage, AdminProvidersPage, AdminDisputesPage, PendingProvidersPage } from './pages/admin/AdminPages';
import "leaflet/dist/leaflet.css";

import { PaymentPage } from "./pages/customer/PaymentPage";
// import "leaflet/dist/leaflet.css";


const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <Layout>{children}</Layout>;
};


const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  // If NOT logged in → allow access
  if (!user) return children;

  // If logged in → just render nothing to avoid redirect loop
  return <Navigate to={`/${user.role}/dashboard`} replace={true} />;
};


// ─── App Routes ───────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

    {/* Customer Routes */}
    <Route path="/customer/dashboard" element={<ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>} />
    <Route path="/customer/services" element={<ProtectedRoute requiredRole="customer"><ServicesPage /></ProtectedRoute>} />
    <Route path="/customer/services/:id" element={<ProtectedRoute requiredRole="customer"><ServiceDetailPage /></ProtectedRoute>} />
    <Route path="/customer/bookings" element={<ProtectedRoute requiredRole="customer"><CustomerBookingsPage /></ProtectedRoute>} />
    <Route path="/customer/chat" element={<ProtectedRoute requiredRole="customer"><ChatPage /></ProtectedRoute>} />
    <Route path="/customer/settings" element={<ProtectedRoute requiredRole="customer"><SettingsPage /></ProtectedRoute>} />
    <Route path="/customer/payment" element={<ProtectedRoute requiredRole="customer"><PaymentPage /></ProtectedRoute>} />

    {/* Provider Routes */}
    <Route path="/provider/dashboard" element={<ProtectedRoute requiredRole="provider"><ProviderDashboard /></ProtectedRoute>} />
    <Route path="/provider/services" element={<ProtectedRoute requiredRole="provider"><ProviderServicesPage /></ProtectedRoute>} />
    <Route path="/provider/services/new" element={<ProtectedRoute requiredRole="provider"><ProviderServicesPage /></ProtectedRoute>} />
    <Route path="/provider/bookings" element={<ProtectedRoute requiredRole="provider"><ProviderBookingsPage /></ProtectedRoute>} />
    <Route path="/provider/chat" element={<ProtectedRoute requiredRole="provider"><ChatPage /></ProtectedRoute>} />
    <Route path="/provider/settings" element={<ProtectedRoute requiredRole="provider"><SettingsPage /></ProtectedRoute>} />

    {/* Admin Routes */}
    <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsersPage /></ProtectedRoute>} />
    <Route path="/admin/providers" element={<ProtectedRoute requiredRole="admin"><AdminProvidersPage /></ProtectedRoute>} />
    <Route path="/admin/pending-providers" element={<ProtectedRoute requiredRole="admin"><PendingProvidersPage /></ProtectedRoute>} />
    <Route path="/admin/verifications" element={<ProtectedRoute requiredRole="admin"><PendingProvidersPage /></ProtectedRoute>} />
    <Route path="/admin/disputes" element={<ProtectedRoute requiredRole="admin"><AdminDisputesPage /></ProtectedRoute>} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

// ─── Root App ─────────────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
