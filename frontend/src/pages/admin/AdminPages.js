import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  Shield,
  AlertTriangle,
  Download,
  XCircle,
  Loader2,
} from "lucide-react";
import { Avatar, SectionHeader, Modal } from "../../components/common/index";
import { api } from "../../utils/api";

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toISOString().split("T")[0];
};

const ApprovalBadge = ({ status }) => {
  const normalized = (status || "").toLowerCase();
  const style =
    normalized === "approved"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : normalized === "rejected" || normalized === "suspended"
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";

  return <span className={`badge border ${style}`}>{normalized || "pending"}</span>;
};

export const PendingProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [filter, setFilter] = useState("pending");

  const fetchPendingProviders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/providers");
      const rows = Array.isArray(res.data) ? res.data : [];
      setProviders(
        rows.map((provider) => ({
          ...provider,
          approvalStatus: (provider?.approvalStatus || "PENDING").toUpperCase(),
        })),
      );
    } catch (err) {
      console.error("Error fetching pending providers:", err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProviders();
  }, []);

  const approveProvider = async (provider) => {
    try {
      await api.put(`/admin/approve/${provider.user.id}`);
      await fetchPendingProviders();
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const rejectProvider = async (provider) => {
    try {
      await api.put(`/admin/reject/${provider.user.id}`);
      await fetchPendingProviders();
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  const filtered =
    filter === "all"
      ? providers
      : providers.filter((p) => (p.approvalStatus || "").toLowerCase() === filter.toLowerCase());

  const counts = {
    all: providers.length,
    pending: providers.filter((p) => (p.approvalStatus || "").toUpperCase() === "PENDING").length,
    approved: providers.filter((p) => (p.approvalStatus || "").toUpperCase() === "APPROVED").length,
    rejected: providers.filter((p) => (p.approvalStatus || "").toUpperCase() === "REJECTED").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Pending Service Providers"
        subtitle="Review applications, verify ID proofs and approve or reject providers"
      />

      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "approved", "rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all flex items-center gap-1.5 ${
              filter === tab
                ? "bg-brand-500 text-white"
                : "bg-dark-800 text-dark-400 border border-dark-700 hover:text-white"
            }`}
          >
            {tab}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter === tab ? "bg-white/20" : "bg-dark-700 text-dark-400"}`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-dark-300 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading providers...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-dark-800 border border-dark-700 rounded-2xl">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
          <p className="text-dark-400">No {filter} providers at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((provider) => (
            <div key={provider.id} className="bg-dark-800 rounded-2xl p-5 border border-dark-700">
              <div className="flex items-start gap-4 flex-wrap">
                <Avatar name={provider.user?.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-semibold text-white">{provider.user?.name}</h4>
                    <ApprovalBadge status={provider.approvalStatus} />
                  </div>
                  <p className="text-dark-400 text-sm">{provider.user?.email}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-dark-400">
                    <span>{provider.category || "-"}</span>
                    <span>{provider.user?.location || "-"}</span>
                    <span>Area: {provider.serviceArea || "-"}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => setSelectedProvider(provider)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>

                  {(provider.approvalStatus || "").toUpperCase() === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveProvider(provider)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 rounded-lg text-xs font-medium transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => rejectProvider(provider)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!selectedProvider} onClose={() => setSelectedProvider(null)} title="Provider Application Details" size="lg">
        {selectedProvider && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={selectedProvider.user?.name} size="lg" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white text-lg">{selectedProvider.user?.name}</p>
                  <ApprovalBadge status={selectedProvider.approvalStatus} />
                </div>
                <p className="text-dark-400 text-sm">{selectedProvider.user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-900/50 rounded-xl p-3">
                <p className="text-xs text-dark-400">Category</p>
                <p className="text-sm text-white font-medium mt-0.5">{selectedProvider.category || "-"}</p>
              </div>
              <div className="bg-dark-900/50 rounded-xl p-3">
                <p className="text-xs text-dark-400">Location</p>
                <p className="text-sm text-white font-medium mt-0.5">{selectedProvider.user?.location || "-"}</p>
              </div>
              <div className="bg-dark-900/50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-dark-400">ID Proof</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-white font-medium">{selectedProvider.idDocType || "N/A"}</p>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded-lg text-xs transition-all">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      const rows = Array.isArray(res.data) ? res.data : [];
      setUsers(
        rows.map((u) => ({
          id: u.id,
          name: u.name || `User #${u.id}`,
          email: u.email || "N/A",
          role: (u.role || "customer").toLowerCase(),
          providerApprovalStatus: u.providerApprovalStatus || null,
          location: u.location || "-",
          bookings: Number(u.bookings || 0),
          joined: formatDate(u.joinedAt),
          status: u.active ? "active" : "suspended",
        })),
      );
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const matchSearch =
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase());
        const matchFilter =
          filter === "all" ||
          (filter === "suspended" ? u.status === "suspended" : u.role === filter);
        return matchSearch && matchFilter;
      }),
    [users, search, filter],
  );

  const toggleStatus = async (user) => {
    const action = user.status === "active" ? "suspend" : "activate";
    try {
      setActionLoading((prev) => ({ ...prev, [user.id]: true }));
      await api.put(`/admin/users/${user.id}/${action}`);
      await fetchUsers();
    } catch (err) {
      console.error("Failed to update user status:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title="User Management" subtitle={`${users.length} registered profiles`} />

      {loading && (
        <div className="flex items-center gap-2 text-dark-300 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading users...
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field py-2 text-sm"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "customer", "provider", "suspended"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f
                  ? "bg-brand-500 text-white"
                  : "bg-dark-800 text-dark-400 border border-dark-700 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700 bg-dark-900/50">
                {["User", "Location", "Bookings", "Joined", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left p-4 text-dark-400 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-dark-750 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-xs text-dark-400">{u.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge border ${u.role === "provider" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-dark-700 text-dark-300 border-dark-600"}`}>
                            {u.role}
                          </span>
                          {u.role === "provider" && u.providerApprovalStatus && <ApprovalBadge status={u.providerApprovalStatus} />}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-dark-300">{u.location}</td>
                  <td className="p-4 text-dark-300">{u.bookings}</td>
                  <td className="p-4 text-dark-400 text-xs">{u.joined}</td>
                  <td className="p-4">
                    <span className={`badge border ${u.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedUser(u)} className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStatus(u)}
                        disabled={!!actionLoading[u.id]}
                        className={`p-1.5 rounded-lg transition-colors ${u.status === "active" ? "hover:bg-red-500/20 text-dark-400 hover:text-red-400" : "hover:bg-green-500/20 text-dark-400 hover:text-green-400"} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {actionLoading[u.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : u.status === "active" ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details" size="sm">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={selectedUser.name} size="lg" />
              <div>
                <p className="font-bold text-white text-lg">{selectedUser.name}</p>
                <p className="text-dark-400 text-sm">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Role", value: selectedUser.role },
                { label: "Location", value: selectedUser.location },
                { label: "Total Bookings", value: selectedUser.bookings },
                { label: "Member Since", value: selectedUser.joined },
                { label: "Status", value: selectedUser.status },
              ].map((item) => (
                <div key={item.label} className="bg-dark-900/50 rounded-xl p-3">
                  <p className="text-xs text-dark-400">{item.label}</p>
                  <p className="text-sm font-medium text-white capitalize">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export const AdminProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchProviders = async () => {
    try {
      const res = await api.get("/admin/services");
      setProviders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching providers:", err);
      setProviders([]);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [refreshKey]);

  const approveService = async (id) => {
    try {
      await api.put(`/admin/services/${id}/approve`);
      fetchProviders();
    } catch (err) {
      console.error("Approve service failed:", err);
    }
  };

  const suspendService = async (id) => {
    try {
      await api.put(`/admin/services/${id}/suspend`);
      fetchProviders();
    } catch (err) {
      console.error("Suspend service failed:", err);
    }
  };

  const restoreService = async (id) => {
    try {
      await api.put(`/admin/services/${id}/restore`);
      fetchProviders();
    } catch (err) {
      console.error("Restore service failed:", err);
    }
  };

  const filtered = providers
    .filter((p) => {
      const providerStatus = (p.providerApprovalStatus || "").toUpperCase();
      if (providerStatus === "SUSPENDED") return false;
      return true;
    })
    .filter((p) => {
      const name = (p.providerName || "").toLowerCase();
      const category = (p.category || "").toLowerCase();
      const status = (p.status || "").toLowerCase();
      const matchSearch = name.includes(search.toLowerCase()) || category.includes(search.toLowerCase());
      const matchFilter = filter === "all" || status === filter.toLowerCase();
      return matchSearch && matchFilter;
    });

  const statusStyle = (status) => {
    if (status === "approved") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (status === "pending") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title="Provider Management" subtitle={`${providers.length} registered service providers`} />

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field py-2 text-sm"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <button
          onClick={() => {
            setRefreshKey((prev) => prev + 1);
          }}
          className="flex items-center gap-2 btn-secondary text-sm py-2 px-4 hover:bg-dark-700 transition-all"
          title="Refresh to see updated provider status"
        >
          <Filter className="w-4 h-4" /> Refresh
        </button>
        <div className="flex gap-2 flex-wrap">
          {["all", "approved", "pending", "suspended"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f
                  ? "bg-brand-500 text-white"
                  : "bg-dark-800 text-dark-400 border border-dark-700 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar name={p.providerName} size="md" />
                <div>
                  <p className="font-semibold text-white">{p.providerName}</p>
                  <p className="text-dark-400 text-sm">{p.category}</p>
                </div>
              </div>
              <span className={`badge border ${statusStyle((p.status || "").toLowerCase())}`}>
                {(p.status || "").toLowerCase() === "approved" && <Shield className="w-3 h-3 mr-1" />}
                {(p.status || "").toLowerCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-dark-900/50 rounded-xl">
                <p className="font-bold text-white text-sm">{p.jobsCompleted ?? 0}</p>
                <p className="text-xs text-dark-500">Jobs</p>
              </div>
              <div className="text-center p-2 bg-dark-900/50 rounded-xl">
                <p className="font-bold text-white text-sm">{Number(p.averageRating || 0) > 0 ? Number(p.averageRating).toFixed(1) : "-"}</p>
                <p className="text-xs text-dark-500">Rating</p>
              </div>
              <div className="text-center p-2 bg-dark-900/50 rounded-xl">
                <p className="font-bold text-white text-sm">₹{Math.round(Number(p.revenue || 0))}</p>
                <p className="text-xs text-dark-500">Revenue</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedProvider(p)}
                className="flex-1 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              {(p.status || "").toLowerCase() === "pending" && (
                <button
                  onClick={() => approveService(p.id)}
                  className="flex-1 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 text-xs font-medium transition-all flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </button>
              )}
              {(p.status || "").toLowerCase() === "suspended" ? (
                <button
                  onClick={() => restoreService(p.id)}
                  className="py-2 px-3 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all"
                  title="Restore to active"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => suspendService(p.id)}
                  className="py-2 px-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
                  title="Suspend service"
                >
                  <Ban className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={!!selectedProvider} onClose={() => setSelectedProvider(null)} title="Provider Service Details" size="md">
        {selectedProvider && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selectedProvider.providerName} size="lg" />
              <div>
                <p className="text-white font-semibold text-lg">{selectedProvider.providerName}</p>
                <p className="text-dark-400 text-sm">{selectedProvider.providerEmail || "No email"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-900/50 rounded-xl p-3">
                <p className="text-xs text-dark-400">Category</p>
                <p className="text-sm text-white font-medium mt-0.5">{selectedProvider.category || "-"}</p>
              </div>
              <div className="bg-dark-900/50 rounded-xl p-3">
                <p className="text-xs text-dark-400">Subcategory</p>
                <p className="text-sm text-white font-medium mt-0.5">{selectedProvider.subcategory || "-"}</p>
              </div>
              <div className="bg-dark-900/50 rounded-xl p-3">
                <p className="text-xs text-dark-400">Price</p>
                <p className="text-sm text-white font-medium mt-0.5">₹{selectedProvider.price ?? 0}</p>
              </div>
              <div className="bg-dark-900/50 rounded-xl p-3">
                <p className="text-xs text-dark-400">Status</p>
                <p className="text-sm text-white font-medium mt-0.5 capitalize">{(selectedProvider.status || "").toLowerCase()}</p>
              </div>
              <div className="bg-dark-900/50 rounded-xl p-3">
                <p className="text-xs text-dark-400">Joined</p>
                <p className="text-sm text-white font-medium mt-0.5">{formatDate(selectedProvider.providerJoinedAt)}</p>
              </div>
              <div className="bg-dark-900/50 rounded-xl p-3">
                <p className="text-xs text-dark-400">Rating</p>
                <p className="text-sm text-white font-medium mt-0.5">{Number(selectedProvider.averageRating || 0) > 0 ? Number(selectedProvider.averageRating).toFixed(1) : "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-900/50 rounded-xl p-3">
                <p className="text-xs text-dark-400">Jobs Completed</p>
                <p className="text-sm text-white font-medium mt-0.5">{selectedProvider.jobsCompleted ?? 0}</p>
              </div>
              <div className="bg-dark-900/50 rounded-xl p-3">
                <p className="text-xs text-dark-400">Availability</p>
                <p className="text-sm text-white font-medium mt-0.5">{(selectedProvider.availability || "all").toLowerCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-900/50 rounded-xl p-3">
                <p className="text-xs text-dark-400">Revenue</p>
                <p className="text-sm text-white font-medium mt-0.5">₹{Math.round(Number(selectedProvider.revenue || 0))}</p>
              </div>
              <div className="bg-dark-900/50 rounded-xl p-3">
                <p className="text-xs text-dark-400">Reviews</p>
                <p className="text-sm text-white font-medium mt-0.5">{selectedProvider.reviewCount ?? 0}</p>
              </div>
            </div>

            <div className="bg-dark-900/50 rounded-xl p-3">
              <p className="text-xs text-dark-400">Description</p>
              <p className="text-sm text-dark-200 mt-0.5">{selectedProvider.description || "No description provided"}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/reports");
      setDisputes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: "resolve" }));
    try {
      await api.put(`/admin/reports/${id}/resolve`);
      setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, status: "resolved" } : d)));
    } catch (err) {
      console.error("Resolve failed:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleDismiss = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: "dismiss" }));
    try {
      await api.put(`/admin/reports/${id}/dismiss`);
      setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, status: "dismissed" } : d)));
    } catch (err) {
      console.error("Dismiss failed:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-3" />
        <p className="text-dark-400">Loading disputes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title="Dispute Management" subtitle="Handle customer-provider conflicts" />

      {disputes.length === 0 ? (
        <div className="text-center py-16 bg-dark-800 border border-dark-700 rounded-2xl">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
          <p className="text-dark-400">No disputes reported at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => {
            const isOpen = (d.status || "").toUpperCase() === "OPEN";
            const isResolved = (d.status || "").toUpperCase() === "RESOLVED";
            const isDismissed = (d.status || "").toUpperCase() === "DISMISSED";

            return (
              <div
                key={d.id}
                className={`bg-dark-800 rounded-2xl p-5 border ${
                  isResolved ? "border-green-500/20 opacity-70" : isDismissed ? "border-dark-600 opacity-60" : "border-dark-700"
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{d.reason}</p>
                    <p className="text-dark-400 text-sm mt-1">
                      Report #{d.id}
                      {d.targetId ? ` | ${d.targetType || "Booking"} #${d.targetId}` : ""}
                      {d.createdAt ? ` | ${new Date(d.createdAt).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                </div>

                {isOpen && (
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleResolve(d.id)}
                      disabled={!!actionLoading[d.id]}
                      className="flex-1 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 text-sm font-medium transition-all disabled:opacity-40"
                    >
                      {actionLoading[d.id] === "resolve" ? "Resolving..." : "Resolve"}
                    </button>
                    <button
                      onClick={() => handleDismiss(d.id)}
                      disabled={!!actionLoading[d.id]}
                      className="flex-1 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white border border-dark-600 text-sm font-medium transition-all disabled:opacity-40"
                    >
                      {actionLoading[d.id] === "dismiss" ? "Dismissing..." : "Dismiss"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
