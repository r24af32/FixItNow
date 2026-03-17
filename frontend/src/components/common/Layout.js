// ─── CHANGE 1: Layout.js ─────────────────────────────────────────────────────
// File: frontend/src/components/common/Layout.js
// Add ONE line to adminLinks array (around line 33, after the Disputes entry)

// BEFORE:
const adminLinks = [
  { path: "/admin/dashboard", icon: BarChart2, label: "Analytics" },
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/providers", icon: UserCheck, label: "Providers" },
  { path: "/admin/pending-providers", icon: Shield, label: "Pending Approvals" },
  { path: "/admin/disputes", icon: AlertTriangle, label: "Disputes" },
];

// AFTER (add the Messages entry at the end):
const adminLinks = [
  { path: "/admin/dashboard", icon: BarChart2, label: "Analytics" },
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/providers", icon: UserCheck, label: "Providers" },
  { path: "/admin/pending-providers", icon: Shield, label: "Pending Approvals" },
  { path: "/admin/disputes", icon: AlertTriangle, label: "Disputes" },
  { path: "/admin/chat", icon: MessageCircle, label: "Messages" },  // ← ADD THIS LINE
];

// NOTE: MessageCircle is already imported in Layout.js — no import change needed.


// ─── CHANGE 2: App.js ────────────────────────────────────────────────────────
// File: frontend/src/App.js
// Add import + one Route for admin chat.

// STEP A — Add import at the top (after existing admin imports):
import { AdminChatPage } from './pages/admin/AdminChatPage';

// STEP B — Add route inside <Routes> (after the existing /admin/disputes route):
<Route path="/admin/chat" element={<ProtectedRoute requiredRole="admin"><AdminChatPage /></ProtectedRoute>} />