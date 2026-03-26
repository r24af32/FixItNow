import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Users, Shield, AlertTriangle, TrendingUp, CheckCircle, XCircle, Eye, Ban } from 'lucide-react';
import { fetchAnalyticsData, fetchPendingProviders, fetchAdminReports, fetchAllUsers, api } from '../../utils/api';
import { SectionHeader, Avatar, Modal } from '../../components/common/index';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';

const StatCard = ({ icon, label, value, sub, color }) => {
  const colorMap = {
    brand:  'text-brand-400 bg-brand-500/10 border-brand-500/20',
    green:  'text-green-400 bg-green-500/10 border-green-500/20',
    blue:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    red:    'text-red-400 bg-red-500/10 border-red-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };
  return (
    <div className={`p-5 rounded-2xl border ${colorMap[color]} card-hover`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <p className="text-sm font-medium opacity-80">{label}</p>
      </div>
      <p className="font-display font-bold text-2xl text-white">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-sm">
        <p className="text-dark-300 mb-1">{label}</p>
        <p className="text-brand-400 font-bold">{payload[0].value} bookings</p>
      </div>
    );
  }
  return null;
};

const CategoryTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-sm">
      <p className="text-dark-300 mb-1">{point.name}</p>
      <p className="text-white font-semibold">{point.count} bookings</p>
    </div>
  );
};

const renderActiveCategoryShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props;

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 8}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [selectedRecentUser, setSelectedRecentUser] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);

  const formatDateSafe = (value) => {
    if (!value) return 'Recently';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'Recently' : parsed.toLocaleDateString();
  };

  const normalizeStatus = (value) => (value || '').toString().trim().toUpperCase();

  const getRelativeLabel = (current, previous, noun) => {
    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
      return '';
    }

    if (previous <= 0) {
      return current > 0 ? `+${current} this ${noun}` : `No change this ${noun}`;
    }

    const diff = current - previous;
    if (diff === 0) {
      return `No change this ${noun}`;
    }

    return `${diff > 0 ? '+' : ''}${diff} this ${noun}`;
  };

  const getRevenueGrowthLabel = (monthlyRevenue) => {
    if (!monthlyRevenue || monthlyRevenue.length < 2) {
      return 'No last-month comparison';
    }

    const last = Number(monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0);
    const prev = Number(monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0);

    if (prev <= 0) {
      return last > 0 ? '+100% vs last month' : 'No last-month comparison';
    }

    const changePct = ((last - prev) / prev) * 100;
    const rounded = Math.round(changePct);
    return `${rounded > 0 ? '+' : ''}${rounded}% vs last month`;
  };
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all analytics data in parallel
        const analyticsData = await fetchAnalyticsData();
        const pendingProvidersData = await fetchPendingProviders();
        const reportsData = await fetchAdminReports();
        const usersData = await fetchAllUsers();

        // Process analytics data
        const userCounts = analyticsData.userCounts;
        const bookingCounts = analyticsData.bookingCounts;
        const topServices = analyticsData.topServices || [];
        const monthlyBookingTrends = analyticsData.monthlyBookingTrends || [];
        const monthlyRevenue = analyticsData.monthlyRevenue || [];

        // Calculate total monthly revenue from real data
        const totalMonthlyRevenue = monthlyRevenue.reduce((sum, item) => sum + (item.revenue || 0), 0);

        const now = new Date();
        const currentWindowStart = new Date(now);
        currentWindowStart.setDate(now.getDate() - 7);
        const previousWindowStart = new Date(now);
        previousWindowStart.setDate(now.getDate() - 14);

        const usersWithDates = usersData.map((u) => ({
          ...u,
          createdAtResolved: u.createdAt || u.joinedAt,
        }));

        const joinedThisWeek = usersWithDates.filter((u) => {
          const d = new Date(u.createdAtResolved);
          return !Number.isNaN(d.getTime()) && d >= currentWindowStart && d <= now;
        }).length;

        const joinedPreviousWeek = usersWithDates.filter((u) => {
          const d = new Date(u.createdAtResolved);
          return !Number.isNaN(d.getTime()) && d >= previousWindowStart && d < currentWindowStart;
        }).length;

        const providerJoinedThisWeek = usersWithDates.filter((u) => {
          const d = new Date(u.createdAtResolved);
          return (u.role || '').toUpperCase() === 'PROVIDER' && !Number.isNaN(d.getTime()) && d >= currentWindowStart && d <= now;
        }).length;

        const providerJoinedPreviousWeek = usersWithDates.filter((u) => {
          const d = new Date(u.createdAtResolved);
          return (u.role || '').toUpperCase() === 'PROVIDER' && !Number.isNaN(d.getTime()) && d >= previousWindowStart && d < currentWindowStart;
        }).length;

        const unresolvedReports = reportsData.filter((r) => {
          const status = normalizeStatus(r.status);
          return status !== 'RESOLVED' && status !== 'DISMISSED';
        });

        // Calculate stats
        const statsData = {
          totalUsers: userCounts.totalUsers || 0,
          totalProviders: userCounts.providers || 0,
          activeBookings: bookingCounts.confirmed || 0,
          revenue: totalMonthlyRevenue || 0,
          userDeltaLabel: getRelativeLabel(joinedThisWeek, joinedPreviousWeek, 'week'),
          providerDeltaLabel: getRelativeLabel(providerJoinedThisWeek, providerJoinedPreviousWeek, 'week'),
          revenueDeltaLabel: getRevenueGrowthLabel(monthlyRevenue),
          pendingVerifications: pendingProvidersData.length,
          activeDisputes: unresolvedReports.length,
          monthlyBookings: monthlyBookingTrends,
          topCategories: generateCategoryColors(topServices),
        };

        setStats(statsData);

        // Process disputes/reports
        const formattedDisputes = unresolvedReports.map(report => ({
          id: report.id,
          customer: report.customerName || 'Unknown Customer',
          provider: report.providerName || 'Unknown Provider',
          issue: report.reason || report.issue || 'Service dispute',
          date: report.createdAt ? report.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          severity: report.severity || 'med',
          status: report.status || 'OPEN'
        }));
        setDisputes(formattedDisputes);

        // Process pending providers
        const formattedVerifications = pendingProvidersData.slice(0, 5).map(provider => ({
          id: provider.id,
          userId: provider.user?.id,
          name: provider.user?.name || 'Unknown',
          category: provider.category || 'Service Provider',
          submitted: provider.createdAt ? new Date(provider.createdAt).toLocaleDateString() : 'Recently',
          docs: 0,
        }));
        setVerifications(formattedVerifications);

        // Process recent users
        const formattedUsers = usersData.slice(0, 10).map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role?.toLowerCase() || 'customer',
          joined: formatDateSafe(user.createdAt || user.joinedAt),
          status: user.active ? 'active' : 'inactive',
        }));
        setRecentUsers(formattedUsers);

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Using fallback data.');
        setStats({
          totalUsers: 0,
          totalProviders: 0,
          activeBookings: 0,
          revenue: 0,
          userDeltaLabel: '',
          providerDeltaLabel: '',
          revenueDeltaLabel: 'No last-month comparison',
          monthlyBookings: [],
          topCategories: [],
          pendingVerifications: 0,
          activeDisputes: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const approveProvider = async (id) => {
    try {
      await api.put(`/admin/approve/${id}`);
      setVerifications(v => v.filter(p => p.userId !== id));
      setStats((prev) => prev ? { ...prev, pendingVerifications: Math.max((prev.pendingVerifications || 1) - 1, 0) } : prev);
    } catch (err) {
      console.error('Error approving provider:', err);
    }
  };

  const rejectProvider = async (id) => {
    try {
      await api.put(`/admin/reject/${id}`);
      setVerifications(v => v.filter(p => p.userId !== id));
      setStats((prev) => prev ? { ...prev, pendingVerifications: Math.max((prev.pendingVerifications || 1) - 1, 0) } : prev);
    } catch (err) {
      console.error('Error rejecting provider:', err);
    }
  };

  const resolveDispute = async (id) => {
    try {
      await api.put(`/admin/reports/${id}/resolve`);
      setDisputes(prev =>
        prev.map(d =>
          d.id === id ? { ...d, status: 'Resolved' } : d
        )
      );
    } catch (err) {
      console.error('Error resolving dispute:', err);
    }
  };

  const dismissDispute = async (id) => {
    try {
      await api.put(`/admin/reports/${id}/dismiss`);
      setDisputes(prev => prev.filter(d => d.id !== id));
      setStats((prev) => prev ? { ...prev, activeDisputes: Math.max((prev.activeDisputes || 1) - 1, 0) } : prev);
    } catch (err) {
      console.error('Error dismissing dispute:', err);
    }
  };

  const openDisputeDetail = (disputeId) => {
    navigate('/admin/disputes', { state: { selectedDisputeId: disputeId } });
  };

  const setUserStatus = async (userId, action) => {
    try {
      setUpdatingUserId(userId);
      await api.put(`/admin/users/${userId}/${action}`);

      const nextStatus = action === 'suspend' ? 'inactive' : 'active';
      setRecentUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)),
      );

      setSelectedRecentUser((prev) =>
        prev && prev.id === userId ? { ...prev, status: nextStatus } : prev,
      );
    } catch (err) {
      console.error(`Error trying to ${action} user:`, err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <SectionHeader title="Admin Dashboard" subtitle="Platform overview and management" />
        <div className="flex items-center justify-center h-96">
          <p className="text-dark-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-8 animate-fade-in">
        <SectionHeader title="Admin Dashboard" subtitle="Platform overview and management" />
        <div className="flex items-center justify-center h-96">
          <p className="text-red-400">{error || 'Failed to load dashboard data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader title="Admin Dashboard" subtitle="Platform overview and management" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={(stats.totalUsers || 0).toLocaleString()} sub={stats.userDeltaLabel} color="blue" />
        <StatCard icon={<BarChart2 className="w-5 h-5" />} label="Active Bookings" value={stats.activeBookings || 0} sub="Right now" color="brand" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Revenue (Month)" value={`₹${(stats.revenue || 0).toLocaleString()}`} sub={stats.revenueDeltaLabel} color="green" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Providers" value={stats.totalProviders || 0} sub={stats.providerDeltaLabel} color="purple" />
        <StatCard icon={<Shield className="w-5 h-5" />} label="Pending Verification" value={stats.pendingVerifications || 0} sub="Needs review" color="yellow" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Active Disputes" value={stats.activeDisputes || 0} sub="Requires attention" color="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Trends Chart */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5">
          <h3 className="font-display font-semibold text-white mb-5">Booking Trends (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.monthlyBookings} barSize={28}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="bookings" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5">
          <h3 className="font-display font-semibold text-white mb-5">Top Service Categories</h3>
          {stats.topCategories && stats.topCategories.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="45%" height={180}>
                <PieChart>
                  <Tooltip content={<CategoryTooltip />} />
                  <Pie
                    data={stats.topCategories}
                    dataKey="count"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    activeIndex={activeCategoryIndex}
                    activeShape={renderActiveCategoryShape}
                    onMouseEnter={(_, index) => setActiveCategoryIndex(index)}
                    onMouseLeave={() => setActiveCategoryIndex(null)}
                    isAnimationActive
                    animationDuration={900}
                  >
                    {stats.topCategories.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {stats.topCategories.map((cat, index) => (
                <div
                  key={cat.name}
                  className={`flex items-center justify-between rounded-lg px-2 py-1 cursor-pointer transition-colors ${activeCategoryIndex === index ? 'bg-dark-700/60' : 'hover:bg-dark-700/40'}`}
                  onMouseEnter={() => setActiveCategoryIndex(index)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-dark-300">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{cat.count}</span>
                </div>
              ))}
            </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-dark-400">No service category data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Verifications */}
      <div>
        <SectionHeader title="Pending Verifications" subtitle="Review and approve service providers" />
        <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
        <div className="divide-y divide-dark-700">
              {verifications.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                  <p className="text-dark-400">All verifications are up to date!</p>
                </div>
              ) : (
                verifications.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-dark-750 transition-colors">
                    <Avatar name={p.name} size="md" />
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{p.name}</p>
                      <p className="text-dark-400 text-xs">{p.category} • Submitted {p.submitted} • {p.docs} documents</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors"
                        onClick={() => setSelectedVerification(p)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => approveProvider(p.userId)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 rounded-lg text-xs font-medium transition-all">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={() => rejectProvider(p.userId)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-all">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedVerification}
        onClose={() => setSelectedVerification(null)}
        title="Pending Provider Details"
        size="md"
      >
        {selectedVerification && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selectedVerification.name} size="md" />
              <div>
                <p className="font-semibold text-white">{selectedVerification.name}</p>
                <p className="text-xs text-dark-400">{selectedVerification.category}</p>
              </div>
            </div>
            <div className="bg-dark-900/50 rounded-xl p-3 space-y-2">
              <p className="text-sm text-dark-300">Submitted: {selectedVerification.submitted}</p>
              <p className="text-sm text-dark-300">Documents: {selectedVerification.docs}</p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  rejectProvider(selectedVerification.userId);
                  setSelectedVerification(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-all"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
              <button
                onClick={() => {
                  approveProvider(selectedVerification.userId);
                  setSelectedVerification(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 rounded-lg text-xs font-medium transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Active Disputes */}
      <div>
        <SectionHeader title="Active Disputes" subtitle="Resolve customer-provider conflicts" />
        <div className="space-y-3">
          {disputes.length === 0 ? (
            <div className="p-8 text-center bg-dark-800 border border-dark-700 rounded-2xl">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-dark-400">No active disputes at the moment!</p>
            </div>
          ) : (
            disputes.map(dispute => (
              <div key={dispute.id} className="bg-dark-800 border border-dark-700 rounded-xl p-4 hover:border-dark-600 transition-all">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className={`p-2.5 rounded-xl ${dispute.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{dispute.issue}</p>
                    <p className="text-xs text-dark-400">Status: <span className="font-semibold">{dispute.status}</span></p>
                    <p className="text-dark-400 text-xs mt-1">
                      {dispute.customer} vs {dispute.provider} • {dispute.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs hover:bg-blue-500/30 transition-all"
                      onClick={() => openDisputeDetail(dispute.id)}
                    >
                      View
                    </button>
                    <button
                      className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs hover:bg-green-500/30 transition-all"
                      onClick={() => resolveDispute(dispute.id)}
                    >
                      Resolve
                    </button>
                    <button
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-500/30 transition-all"
                      onClick={() => dismissDispute(dispute.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div>
        <SectionHeader title="Recently Joined Users" />
        <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700 text-dark-400">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Joined</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-dark-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  recentUsers.map(u => (
                    <tr key={u.id} className="hover:bg-dark-750 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="sm" />
                          <div>
                            <p className="font-medium text-white">{u.name}</p>
                            <p className="text-xs text-dark-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`badge border ${u.role === 'provider' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-dark-700 text-dark-300 border-dark-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-dark-400">{u.joined}</td>
                      <td className="p-4">
                        <span className={`badge border ${u.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white transition-colors"
                            onClick={() => setSelectedRecentUser(u)}
                            title="View user details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setUserStatus(u.id, u.status === 'active' ? 'suspend' : 'activate')}
                            disabled={updatingUserId === u.id}
                            title={u.status === 'active' ? 'Suspend user' : 'Activate user'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedRecentUser}
        onClose={() => setSelectedRecentUser(null)}
        title="User Details"
        size="md"
      >
        {selectedRecentUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selectedRecentUser.name} size="md" />
              <div>
                <p className="font-semibold text-white">{selectedRecentUser.name}</p>
                <p className="text-xs text-dark-400">{selectedRecentUser.email}</p>
              </div>
            </div>

            <div className="bg-dark-900/50 rounded-xl p-3 space-y-2">
              <p className="text-sm text-dark-300">Role: <span className="text-white">{selectedRecentUser.role}</span></p>
              <p className="text-sm text-dark-300">Joined: <span className="text-white">{selectedRecentUser.joined}</span></p>
              <p className="text-sm text-dark-300">Status: <span className="text-white">{selectedRecentUser.status}</span></p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setUserStatus(selectedRecentUser.id, selectedRecentUser.status === 'active' ? 'suspend' : 'activate')}
                disabled={updatingUserId === selectedRecentUser.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${selectedRecentUser.status === 'active' ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'}`}
              >
                <Ban className="w-3.5 h-3.5" />
                {selectedRecentUser.status === 'active' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Helper function to generate category colors
const generateCategoryColors = (topServices) => {
  const colorPalette = ['#f59e0b', '#3b82f6', '#06b6d4', '#10b981', '#f97316'];
  
  if (!topServices || topServices.length === 0) {
    return [];
  }

  return topServices
    .slice(0, 5)
    .map((service, index) => ({
      name: service.serviceName || service.name || 'Service',
      count: Number(service.totalBookings ?? service.count ?? 0),
      color: colorPalette[index % colorPalette.length],
    }))
    .filter((service) => service.count > 0);
};
