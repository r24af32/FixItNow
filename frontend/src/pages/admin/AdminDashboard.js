import React, { useState } from 'react';
import { BarChart2, Users, Shield, AlertTriangle, TrendingUp, CheckCircle, XCircle, Eye, Ban } from 'lucide-react';
import { ADMIN_STATS } from '../../utils/api';
import { SectionHeader, Avatar } from '../../components/common/index';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

const PENDING_VERIFICATIONS = [
  { id: 1, name: 'Vikram Patel', category: 'Electrician', submitted: '2 days ago', docs: 3 },
  { id: 2, name: 'Lakshmi Devi', category: 'Plumber', submitted: '1 day ago', docs: 2 },
  { id: 3, name: 'Santosh Kumar', category: 'Carpenter', submitted: '3 hours ago', docs: 4 },
];

const ACTIVE_DISPUTES = [
  {
    id: 1,
    customer: 'Priya N.',
    provider: 'Ravi K.',
    issue: 'Service quality not as described',
    date: '2025-08-14',
    severity: 'med',
    status: 'Pending'
  },
  {
    id: 2,
    customer: 'Arjun M.',
    provider: 'Suresh B.',
    issue: 'Provider did not show up',
    date: '2025-08-12',
    severity: 'high',
    status: 'In Progress'
  }
];

const RECENT_USERS = [
  { id: 1, name: 'Priya Nair', email: 'priya@gmail.com', role: 'customer', joined: '2 days ago', status: 'active' },
  { id: 2, name: 'Vikram Patel', email: 'vikram@gmail.com', role: 'provider', joined: '3 days ago', status: 'pending' },
  { id: 3, name: 'Arjun Mehta', email: 'arjun@gmail.com', role: 'customer', joined: '1 week ago', status: 'active' },
  { id: 4, name: 'Lakshmi Devi', email: 'lakshmi@gmail.com', role: 'provider', joined: '5 days ago', status: 'active' },
];

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

export const AdminDashboard = () => {
  const [disputes, setDisputes] = useState(ACTIVE_DISPUTES);
  const [verifications, setVerifications] = useState(PENDING_VERIFICATIONS);

  const approveProvider = (id) => setVerifications(v => v.filter(p => p.id !== id));

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader title="Admin Dashboard" subtitle="Platform overview and management" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={ADMIN_STATS.totalUsers.toLocaleString()} sub="+48 this week" color="blue" />
        <StatCard icon={<BarChart2 className="w-5 h-5" />} label="Active Bookings" value={ADMIN_STATS.activeBookings} sub="Right now" color="brand" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Revenue (Month)" value={`₹${ADMIN_STATS.revenue.toLocaleString()}`} sub="+12% vs last month" color="green" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Providers" value={ADMIN_STATS.totalProviders} sub="+12 new this week" color="purple" />
        <StatCard icon={<Shield className="w-5 h-5" />} label="Pending Verification" value={ADMIN_STATS.pendingVerifications} sub="Needs review" color="yellow" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Active Disputes" value={ADMIN_STATS.activeDisputes} sub="Requires attention" color="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Trends Chart */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5">
          <h3 className="font-display font-semibold text-white mb-5">Booking Trends (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ADMIN_STATS.monthlyBookings} barSize={28}>
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
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="45%" height={180}>
              <PieChart>
                <Pie data={ADMIN_STATS.topCategories} dataKey="count" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {ADMIN_STATS.topCategories.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {ADMIN_STATS.topCategories.map(cat => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-dark-300">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Verifications */}
      <div>
        <SectionHeader title="Pending Verifications" subtitle="Review and approve service providers" />
        <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
          {verifications.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-dark-400">All verifications are up to date!</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-700">
              {verifications.map(p => (
                <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-dark-750 transition-colors">
                  <Avatar name={p.name} size="md" />
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{p.name}</p>
                    <p className="text-dark-400 text-xs">{p.category} • Submitted {p.submitted} • {p.docs} documents</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => approveProvider(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 rounded-lg text-xs font-medium transition-all">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => approveProvider(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-all">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Disputes */}
      <div>
        <SectionHeader title="Active Disputes" subtitle="Resolve customer-provider conflicts" />
        <div className="space-y-3">
          {disputes.map(dispute => (
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
                  <span className={`badge ${dispute.severity === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'} border`}>
                    {dispute.severity}
                  </span>
                  <button
                   className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded"
                   onClick={() =>
                   setDisputes(prev =>
                   prev.map(d =>
                   d.id === dispute.id ? { ...d, status: "Resolved" } : d
                   )
                  )
                 }
                 >
                 Resolve
                </button>
                <button
                 className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded"
                 onClick={() =>
                  setDisputes(prev =>
                  prev.map(d =>
                  d.id === dispute.id ? { ...d, status: "In Progress" } : d
                  )
                )
                }
                >
                In Progress
                </button>
                </div>
              </div>
            </div>
          ))}
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
                {RECENT_USERS.map(u => (
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
                        <button className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white transition-colors"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-red-400 transition-colors"><Ban className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
