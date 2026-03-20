import React, { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  Shield,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  XCircle,
  Loader2,
} from "lucide-react";
import { Avatar, SectionHeader, Modal } from "../../components/common/index";
import { useEffect } from "react";
import { api } from "../../utils/api";

const ALL_USERS = [
  {
    id: 1,
    name: "Priya Nair",
    email: "priya@gmail.com",
    role: "customer",
    location: "Koramangala",
    bookings: 8,
    joined: "2025-07-15",
    status: "active",
  },
  {
    id: 2,
    name: "Arjun Mehta",
    email: "arjun@gmail.com",
    role: "customer",
    location: "Indiranagar",
    bookings: 4,
    joined: "2025-07-20",
    status: "active",
  },
  {
    id: 3,
    name: "Kavita Singh",
    email: "kavita@gmail.com",
    role: "customer",
    location: "Whitefield",
    bookings: 12,
    joined: "2025-06-01",
    status: "suspended",
  },
  {
    id: 4,
    name: "Rahul Verma",
    email: "rahul@gmail.com",
    role: "customer",
    location: "HSR Layout",
    bookings: 2,
    joined: "2025-08-01",
    status: "active",
  },
];

// // â”€â”€ Pending Providers mock data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// const INITIAL_PENDING_PROVIDERS = [
//   {
//     id: 101, name: 'Vikram Patel', email: 'vikram@gmail.com', phone: '+91 98765 43210',
//     category: 'AC Repair', location: 'Marathahalli, Bengaluru', serviceArea: '10 km',
//     submittedAt: '2025-08-10', status: 'pending',
//     timeSlots: ['9:00 AM - 11:00 AM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'],
//     idProof: { docType: 'Aadhaar Card', fileName: 'vikram_aadhaar.jpg', fileSize: '1.2 MB' },
//   },
//   {
//     id: 102, name: 'Lakshmi Devi', email: 'lakshmi@gmail.com', phone: '+91 87654 32109',
//     category: 'Plumbing', location: 'Jayanagar, Bengaluru', serviceArea: '5 km',
//     submittedAt: '2025-08-12', status: 'pending',
//     timeSlots: ['11:00 AM - 1:00 PM', '6:00 PM - 8:00 PM'],
//     idProof: { docType: 'PAN Card', fileName: 'lakshmi_pan.pdf', fileSize: '850 KB' },
//   },
//   {
//     id: 103, name: 'Santosh Kumar', email: 'santosh@gmail.com', phone: '+91 76543 21098',
//     category: 'Carpentry', location: 'BTM Layout, Bengaluru', serviceArea: '20 km',
//     submittedAt: '2025-08-14', status: 'pending',
//     timeSlots: ['9:00 AM - 11:00 AM', '11:00 AM - 1:00 PM', '2:00 PM - 4:00 PM'],
//     idProof: { docType: 'Driving License', fileName: 'santosh_dl.jpg', fileSize: '2.1 MB' },
//   },
// ];

// â”€â”€ Status badge helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ApprovalBadge = ({ status }) => {
  const map = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    approved: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return (
    <span
      className={`badge border ${map[status] || "bg-dark-700 text-dark-400 border-dark-600"} capitalize`}
    >
      {status}
    </span>
  );
};

// â”€â”€â”€ FEATURE 4: Pending Service Providers Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const PendingProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [, setLoading] = useState(false);

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [filter, setFilter] = useState("pending");

  const approveProvider = async (provider) => {
    try {
      await api.put(`/admin/approve/${provider.user.id}`);
      fetchPendingProviders();
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const rejectProvider = async (provider) => {
    try {
      await api.put(`/admin/reject/${provider.user.id}`);
      fetchPendingProviders();
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  const filtered =
    filter === "all"
      ? providers
      : providers.filter(
          (p) => p.approvalStatus?.toLowerCase() === filter.toLowerCase(),
        );

  const counts = {
    all: providers.length,
    pending: providers.filter((p) => p.approvalStatus === "PENDING").length,
    approved: providers.filter((p) => p.approvalStatus === "APPROVED").length,
    rejected: providers.filter((p) => p.approvalStatus === "REJECTED").length,
  };

  useEffect(() => {
    fetchPendingProviders();
  }, []);

const fetchPendingProviders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/pending-providers");
      // Fallback to empty array if data is missing to prevent .filter crash
      setProviders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching pending providers:", err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Pending Service Providers"
        subtitle="Review applications, verify ID proofs and approve or reject providers"
      />

      {/* Filter Tabs */}
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
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs ${filter === tab ? "bg-white/20" : "bg-dark-700 text-dark-400"}`}
            >
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Provider Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-dark-800 border border-dark-700 rounded-2xl">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
          <p className="text-dark-400">No {filter} providers at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((provider) => (
            <div
              key={provider.id}
              className={`bg-dark-800 rounded-2xl p-5 border transition-all ${
                provider.approvalStatus === "pending"
                  ? "border-yellow-500/20"
                  : provider.approvalStatus === "approved"
                    ? "border-green-500/20"
                    : "border-dark-700 opacity-75"
              }`}
            >
              <div className="flex items-start gap-4 flex-wrap">
                <Avatar name={provider.user?.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-semibold text-white">
                      {provider.user?.name}
                    </h4>
                    <ApprovalBadge status={provider.approvalStatus} />
                  </div>
                  <p className="text-dark-400 text-sm">
                    {provider.user?.email} • {provider.phone}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-dark-400">
                    <span>🔧 {provider.category}</span>
                    <span>📍 {provider.user?.location}</span>
                    <span>📐 {provider.serviceArea} range</span>
                    <span>📅 Submitted: {provider.submittedAt}</span>
                  </div>

                  {/* Time Slots */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="text-xs text-dark-500 flex items-center gap-1 mr-1">
                      <Clock className="w-3 h-3" /> Slots:
                    </span>
                    {Array.isArray(provider.timeSlots) &&
                      provider.timeSlots.map((slot) => (
                        <span
                          key={slot}
                          className="px-2 py-0.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs"
                        >
                          {slot}
                        </span>
                      ))}
                  </div>

                  {/* ID Proof Info */}
                  <div className="mt-3 text-xs text-dark-400">
                    <p>
                      <strong>Document Type:</strong>{" "}
                      {provider.idDocType || "Not Uploaded"}
                    </p>
                  </div>
                </div>

                {/* Action area */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => setSelectedProvider(provider)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>
                  {provider.approvalStatus?.toUpperCase() === "PENDING" && (
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

      {/* Provider Detail Modal */}
      <Modal
        isOpen={!!selectedProvider}
        onClose={() => setSelectedProvider(null)}
        title="Provider Application Details"
        size="lg"
      >
        {selectedProvider && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Avatar name={selectedProvider.user.name} size="lg" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white text-lg">
                    {selectedProvider.user.name}
                  </p>
                  <ApprovalBadge
                    status={selectedProvider.approvalStatus?.toLowerCase()}
                  />
                </div>
                <p className="text-dark-400 text-sm">
                  {selectedProvider.user?.email}
                </p>
                <p className="text-dark-400 text-sm">
                  {selectedProvider.phone}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Category", value: selectedProvider.category },
                { label: "Location", value: selectedProvider.user?.location },
                { label: "Service Area", value: selectedProvider.serviceArea },
                { label: "Submitted", value: "N/A" },
              ].map((item) => (
                <div key={item.label} className="bg-dark-900/50 rounded-xl p-3">
                  <p className="text-xs text-dark-400">{item.label}</p>
                  <p className="text-sm font-medium text-white mt-0.5">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="bg-dark-900/50 rounded-xl p-4">
              <p className="text-xs text-dark-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Selected Time Slots
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(selectedProvider?.timeSlots) &&
                  selectedProvider.timeSlots.map((slot) => (
                    <span
                      key={slot}
                      className="px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium"
                    >
                      {slot}
                    </span>
                  ))}
              </div>
            </div>

            {/* ID Proof */}
            <div className="bg-dark-900/50 rounded-xl p-4">
              <p className="text-xs text-dark-400 mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> ID Proof Document
              </p>
              <div className="flex items-center justify-between p-3 bg-dark-800 rounded-xl border border-dark-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {selectedProvider?.idDocType ||
                        selectedProvider?.idProof?.idDocType ||
                        "N/A"}
                    </p>

                    <p className="text-xs text-dark-400">
                      {selectedProvider?.idDocType ||
                        selectedProvider?.idProof?.idDocType ||
                        "No file"}
                      {" • "}
                      {selectedProvider?.idDocType ||
                        selectedProvider?.idProof?.idDocType ||
                        "Unknown size"}
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded-lg text-xs transition-all">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>

            {/* Approve / Reject Actions */}
            {selectedProvider?.approvalStatus === "PENDING" && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => rejectProvider(selectedProvider)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Reject Application
                </button>

                <button
                  onClick={() => approveProvider(selectedProvider)}
                  className="flex-1 py-2.5 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Approve Provider
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// â”€â”€â”€ Admin Users Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const AdminUsersPage = () => {
  const [users, setUsers] = useState(ALL_USERS);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleStatus = (id) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u,
      ),
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="User Management"
        subtitle={`${users.length} registered customers`}
      />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button className="flex items-center gap-2 btn-secondary text-sm py-2 px-4">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700 bg-dark-900/50">
                {[
                  "User",
                  "Location",
                  "Bookings",
                  "Joined",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left p-4 text-dark-400 font-medium"
                  >
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
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-dark-300">{u.location}</td>
                  <td className="p-4 text-dark-300">{u.bookings}</td>
                  <td className="p-4 text-dark-400 text-xs">{u.joined}</td>
                  <td className="p-4">
                    <span
                      className={`badge border ${u.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={`p-1.5 rounded-lg transition-colors ${u.status === "active" ? "hover:bg-red-500/20 text-dark-400 hover:text-red-400" : "hover:bg-green-500/20 text-dark-400 hover:text-green-400"}`}
                      >
                        {u.status === "active" ? (
                          <Ban className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Details"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={selectedUser.name} size="lg" />
              <div>
                <p className="font-bold text-white text-lg">
                  {selectedUser.name}
                </p>
                <p className="text-dark-400 text-sm">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Location", value: selectedUser.location },
                { label: "Total Bookings", value: selectedUser.bookings },
                { label: "Member Since", value: selectedUser.joined },
                { label: "Status", value: selectedUser.status },
              ].map((item) => (
                <div key={item.label} className="bg-dark-900/50 rounded-xl p-3">
                  <p className="text-xs text-dark-400">{item.label}</p>
                  <p className="text-sm font-medium text-white capitalize">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// â”€â”€â”€ Admin Providers Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const AdminProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await api.get("/admin/services");
      setProviders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching providers:", err);
      setProviders([]);
    }
  };
  const approveService = async (id) => {
    try {
      await api.put(`/admin/services/${id}/approve`);
      fetchProviders();
    } catch (err) {
      console.error("Approve service failed:", err);
    }
  };
  const filtered = providers.filter((p) => {
    const name = p.provider?.name || "";
    const category = p.category || "";
    const status = p.status || "";

    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase());

    const matchFilter = filter === "all" || status.toLowerCase() === filter;

    return matchSearch && matchFilter;
  });

  const statusStyle = (status) => {
    if (status === "approved")
      return "bg-green-500/20 text-green-400 border-green-500/30";
    if (status === "pending")
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };
  const suspendService = async (id) => {
    try {
      await api.put(`/admin/services/${id}/suspend`);
      fetchProviders();
    } catch (err) {
      console.error("Suspend service failed:", err);
    }
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Provider Management"
        subtitle={`${providers.length} registered service providers`}
      />

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "approved", "pending", "suspended"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f ? "bg-brand-500 text-white" : "bg-dark-800 text-dark-400 border border-dark-700 hover:text-white"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-dark-800 border border-dark-700 rounded-2xl p-5 card-hover"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar name={p.provider?.name} size="md" />
                <div>
                  <p className="font-semibold text-white">{p.provider?.name}</p>
                  <p className="text-dark-400 text-sm">{p.category}</p>
                </div>
              </div>
              <span
                className={`badge border ${statusStyle(p.status?.toLowerCase())}`}
              >
                {p.status?.toLowerCase() === "approved" && (
                  <Shield className="w-3 h-3 mr-1" />
                )}
                {p.status?.toLowerCase()}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-dark-900/50 rounded-xl">
                <p className="font-bold text-white text-sm">0</p>
                <p className="text-xs text-dark-500">Jobs</p>
              </div>
              <div className="text-center p-2 bg-dark-900/50 rounded-xl">
                <p className="font-bold text-white text-sm">-</p>
                <p className="text-xs text-dark-500">Rating</p>
              </div>
              <div className="text-center p-2 bg-dark-900/50 rounded-xl">
                <p className="font-bold text-white text-sm">₹0</p>
                <p className="text-xs text-dark-500">Revenue</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-1">
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              {p.status?.toLowerCase() === "pending" && (
                <button
                  onClick={() => approveService(p.id)}
                  className="flex-1 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 text-xs font-medium transition-all flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </button>
              )}
              <button
                onClick={() => suspendService(p.id)}
                className="py-2 px-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// â”€â”€â”€ Admin Disputes Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reports');
      setDisputes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'resolve' }));
    try {
      await api.put(`/admin/reports/${id}/resolve`);
      setDisputes((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'resolved' } : d))
      );
    } catch (err) {
      console.error('Resolve failed:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleDismiss = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'dismiss' }));
    try {
      await api.put(`/admin/reports/${id}/dismiss`);
      setDisputes((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'dismissed' } : d))
      );
    } catch (err) {
      console.error('Dismiss failed:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  // â”€â”€ Loading state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      <SectionHeader
        title="Dispute Management"
        subtitle="Handle customer-provider conflicts"
      />

      {/* â”€â”€ Empty state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {disputes.length === 0 ? (
        <div className="text-center py-16 bg-dark-800 border border-dark-700 rounded-2xl">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
          <p className="text-dark-400">No disputes reported at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => {
            const isOpen      = d.status === 'open' || d.status === 'OPEN';
            const isResolved  = d.status === 'resolved' || d.status === 'RESOLVED';
            const isDismissed = d.status === 'dismissed' || d.status === 'DISMISSED';

            return (
              <div
                key={d.id}
                className={`bg-dark-800 rounded-2xl p-5 border ${
                  isResolved  ? 'border-green-500/20 opacity-70' :
                  isDismissed ? 'border-dark-600 opacity-60'     :
                                'border-dark-700'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    {/* Status badges row */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="badge border bg-red-500/20 text-red-400 border-red-500/30">
                        {d.targetType || 'booking'}
                      </span>
                      <span
                        className={`badge border ${
                          isResolved  ? 'bg-green-500/20 text-green-400 border-green-500/30'  :
                          isDismissed ? 'bg-dark-600 text-dark-400 border-dark-500'            :
                                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {d.status?.toLowerCase() || 'open'}
                      </span>
                    </div>

                    {/* Reason / issue text */}
                    <p className="text-white font-medium">{d.reason}</p>

                    {/* Meta info row */}
                    <p className="text-dark-400 text-sm mt-1">
                      Report #{d.id}
                      {d.targetId   ? ` Â· ${d.targetType || 'Booking'} #${d.targetId}` : ''}
                      {d.reportedBy ? ` Â· Reported by User #${d.reportedBy}` : ''}
                      {d.createdAt  ? ` Â· ${new Date(d.createdAt).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                </div>

                {/* Action buttons only shown when open */}
                {isOpen && (
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleResolve(d.id)}
                      disabled={!!actionLoading[d.id]}
                      className="flex-1 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 text-sm font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                      {actionLoading[d.id] === 'resolve' ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Resolving...</>
                      ) : (
                        <><CheckCircle className="w-3.5 h-3.5" /> Resolve</>
                      )}
                    </button>
                    <button
                      onClick={() => handleDismiss(d.id)}
                      disabled={!!actionLoading[d.id]}
                      className="flex-1 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white border border-dark-600 text-sm font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                      {actionLoading[d.id] === 'dismiss' ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Dismissing...</>
                      ) : (
                        <><XCircle className="w-3.5 h-3.5" /> Dismiss</>
                      )}
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


