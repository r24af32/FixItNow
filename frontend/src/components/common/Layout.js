import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Home, Search, Calendar, MessageCircle, Settings, LogOut, Bell, Menu, X, ChevronRight, Users, BarChart2, Shield, Wrench, ClipboardList, UserCheck, AlertTriangle, PlusCircle, } from "lucide-react";
import { Avatar, Chatbot } from "./index";
import { api } from '../../utils/api';

const customerLinks = [
  { path: "/customer/dashboard", icon: Home, label: "Dashboard" },
  { path: "/customer/services", icon: Search, label: "Find Services" },
  { path: "/customer/bookings", icon: Calendar, label: "My Bookings" },
  { path: "/customer/chat", icon: MessageCircle, label: "Messages" },
  { path: "/customer/settings", icon: Settings, label: "Settings" },
];

const providerLinks = [
  { path: "/provider/dashboard", icon: Home, label: "Dashboard" },
  { path: "/provider/services", icon: Wrench, label: "My Services" },
  { path: "/provider/bookings", icon: ClipboardList, label: "Bookings" },
  { path: "/provider/chat", icon: MessageCircle, label: "Messages" },
  { path: "/provider/settings", icon: Settings, label: "Settings" },
];

const adminLinks = [
  { path: "/admin/dashboard", icon: BarChart2, label: "Analytics" },
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/providers", icon: UserCheck, label: "Providers" },
  {
    path: "/admin/pending-providers",
    icon: Shield,
    label: "Pending Approvals",
  },
  { path: "/admin/disputes", icon: AlertTriangle, label: "Disputes" },
  { path: "/admin/chat", icon: MessageCircle, label: "Messages" },
];

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const role = user?.role || "customer";
  const links =
    role === "admin"
      ? adminLinks
      : role === "provider"
        ? providerLinks
        : customerLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  const ONE_DAY = 24 * 60 * 60 * 1000;
  
// 🔥 FETCH REAL NOTIFICATIONS FROM DATABASE
  useEffect(() => {
    if (!user?.id) return;
    const fetchNotifications = async () => {
      try {
        const res = await api.get(`/notifications/${user.id}`);
        // Filter out notifications older than 10 days, just like your teammate wanted
        const tenDays = 10 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const validNotifs = res.data.filter(n => now - n.createdAt < tenDays);
        setNotifications(validNotifs);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    fetchNotifications();
    
    // Optional: Refresh notifications every 10 seconds so the bell updates automatically!
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // 🔥 MARK AS READ IN DATABASE
  const handleBellClick = async () => {
    const opened = !notifOpen;
    setNotifOpen(opened);

    if (opened && notifications.some(n => !n.viewed)) {
      try {
        await api.put(`/notifications/${user.id}/read`);
        setNotifications(notifications.map(n => ({ ...n, viewed: true })));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const visibleNotifications = showAllNotifications
    ? notifications
    : notifications.slice(0, 3);

const handleNotificationClick = (notification) => {
    // FIX: Just navigate! The handleBellClick already marked everything as read in the DB.
    if (role === 'provider') {
      navigate(`/provider/bookings?highlight=${notification.bookingId}`);
    } else {
      navigate(`/customer/bookings?highlight=${notification.bookingId}`);
    }
    setNotifOpen(false); // Close the dropdown
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-dark-700">
        <Link to={`/${role}/dashboard`} className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow-sm">
            <span className="text-lg">🔧</span>
          </div>
          <div>
            <span className="font-display font-bold text-white text-lg">
              FixIt
            </span>
            <span className="font-display font-bold text-brand-500 text-lg">
              Now
            </span>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3">
        <span className="text-xs font-mono uppercase tracking-widest text-dark-400">
          {role === "admin"
            ? "⚙️ Admin Panel"
            : role === "provider"
              ? "🛠️ Provider Portal"
              : "🏠 Customer Portal"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {links.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${active ? "active" : ""}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
              {active && (
                <ChevronRight className="w-4 h-4 ml-auto text-brand-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile at bottom */}
      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-900/50 hover:bg-dark-700 transition-colors">
          <Avatar name={user?.name || "User"} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-dark-400 truncate">
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-dark-400 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-dark-900 border-r border-dark-700 flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-dark-900 border-r border-dark-700 animate-slide-in-right">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark-700 text-dark-400"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Bar */}
        <header className="h-16 bg-dark-900/80 backdrop-blur-md border-b border-dark-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-dark-700 text-dark-400"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title placeholder */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {role === "provider" && (
              <Link
                to="/provider/services/new"
                className="hidden sm:flex items-center gap-2 btn-primary py-2 px-4 text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Add Service
              </Link>
            )}
            {/* Notification bell */}
            <div className="relative">
              {/* <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              </button> */}

              <button
                onClick={handleBellClick} // 🔥 FIX: Use the new DB function instead of localStorage
                className="relative p-2 rounded-xl hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />

                {/* Notification Count Badge */}
                {notifications.filter(n => !n.viewed).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                    {notifications.filter((n) => !n.viewed).length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-dark-700">
                    <h4 className="font-semibold text-white">Notifications</h4>
                  </div>
                  {/* <div className="divide-y divide-dark-700">
                    {[
                      { icon: '✅', text: 'Booking #1 confirmed by Ravi Kumar', time: '2m ago' },
                      { icon: '💬', text: 'New message from Suresh Babu', time: '15m ago' },
                      { icon: '⭐', text: 'Rate your recent service', time: '1h ago' },
                    ].map((n, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 hover:bg-dark-700 transition-colors cursor-pointer">
                        <span className="text-lg">{n.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm text-dark-200">{n.text}</p>
                          <p className="text-xs text-dark-500 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                     </div> */}

                  <div className={`divide-y divide-dark-700 ${
                    showAllNotifications ? "max-h-72 overflow-y-auto" : ""
                  }`}>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-dark-400 text-sm">
                        No notifications
                      </div>
                    ) : (
                      <>
                        {/* NEW NOTIFICATIONS */}
                        {notifications.filter(n => Date.now() - n.createdAt < ONE_DAY).length > 0 && (
                          <>
                            <div className="px-4 py-2 text-xs text-dark-400">
                              New
                            </div>

                            {visibleNotifications
                              .filter(n => Date.now() - n.createdAt < ONE_DAY)
                              .map((n) => (
                                <div
                                  key={n.id}
                                  onClick={() => handleNotificationClick(n)}
                                  className="flex items-start gap-3 p-4 hover:bg-dark-700 cursor-pointer"
                                >
                                  <span className="text-lg">{n.icon || "📅"}</span>

                                  <div className="flex-1">
                                    <p className="text-sm text-dark-200">
                                      {n.text}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </>
                        )}

                        {/* OLD NOTIFICATIONS */}
                        {notifications.filter(n => Date.now() - n.createdAt >= ONE_DAY).length > 0 && (
                          <>
                            <div className="px-4 py-2 text-xs text-dark-500">
                              Old
                            </div>

                            {showAllNotifications && visibleNotifications.filter((n) => (n) => Date.now() - n.createdAt >= ONE_DAY)
                              .map((n) => (
                                <div
                                  key={n.id}
                                  onClick={() => handleNotificationClick(n)}
                                  className="flex items-start gap-3 p-4 opacity-70 hover:bg-dark-700 cursor-pointer"
                                >
                                  <span className="text-lg">{n.icon || "📅"}</span>

                                  <div className="flex-1">
                                    <p className="text-sm text-dark-300">
                                      {n.text}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <div className="p-3 border-t border-dark-700">
                    {/* <button className="w-full text-center text-sm text-brand-400 hover:text-brand-300 py-1">
                      View all notifications
                    </button> */}

                    <button
                      onClick={() =>
                        setShowAllNotifications(!showAllNotifications)
                      }
                      className="w-full text-center text-sm text-brand-400 hover:text-brand-300 py-1"
                    >
                      {showAllNotifications
                        ? "Show less"
                        : "View all notifications"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="hidden sm:block">
              <Avatar name={user?.name || "User"} size="sm" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="page-enter max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Chatbot Assistant */}
        <Chatbot userRole={role} />

        {/* Logout Confirmation */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <div className="relative bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-sm animate-slide-up shadow-2xl p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <LogOut className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="font-display font-semibold text-lg text-white mb-2">
                Confirm Logout
              </h3>
              <p className="text-dark-400 text-sm mb-6">
                Are you sure you want to logout? You'll need to login again to
                access your account.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 border border-dark-600 text-dark-200 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
