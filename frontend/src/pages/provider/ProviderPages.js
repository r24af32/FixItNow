import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit3, Trash2, Eye, Calendar, Clock, MessageCircle } from 'lucide-react';
import { MOCK_SERVICES, MOCK_PROVIDER_BOOKINGS, SERVICE_CATEGORIES } from '../../utils/api';
import { Modal, SectionHeader, StatusBadge } from '../../components/common/index';
import { api } from '../../utils/api';
import { useEffect } from 'react';

// ─── Provider My Services Page ───────────────────────────────────────────────
export const ProviderServicesPage = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ category: '', subcategory: '', description: '', price: '', availability: '' });


    useEffect(() => {
    fetchMyServices();
  }, []);

  const fetchMyServices = async () => {
    try {
      const res = await api.get('/services/provider');
      // Since backend returns all approved services,
      // we filter by logged-in provider later if needed.
      setServices(res.data);
    } catch (err) {
      console.error('Failed to load services', err);
    }
  };
  const handleCloseModal = () => {
  setShowModal(false);
  setEditingId(null);
  setForm({
    category: '',
    subcategory: '',
    description: '',
    price: '',
    availability: ''
    });
  };
    const handleSaveService = async () => {
    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, {
          ...form,
          price: Number(form.price)
        });
      } else {
        await api.post('/services', {
          ...form,
          price: Number(form.price)
        });
      }

      fetchMyServices();
      handleCloseModal();   // 🔥 THIS LINE FIXES EVERYTHING
    } catch (err) {
      console.error("Save failed:", err);
    }
  };
  const handleDelete = async (id) => {
  try {
    await api.delete(`/services/${id}`);
    fetchMyServices();  // reload from backend
  } catch (err) {
    console.error("Delete failed:", err);
  }
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="My Services"
        subtitle={`${services.length} services listed`}
        action={
          <button onClick={() => {
            setEditingId(null);
            setForm({
              category: '',
              subcategory: '',
              description: '',
              price: '',
              availability: ''
            });
            setShowModal(true);
          }} className="btn-primary flex items-center gap-2 py-2 text-sm">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        }
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map(service => (
          <div key={service.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center text-2xl">{service.image}</div>
              <div className="flex items-center gap-1">
                <button
                    onClick={() => setSelectedService(service)}
                    className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      category: service.category,
                      subcategory: service.subcategory,
                      description: service.description,
                      price: service.price,
                      availability: service.availability
                    });
                    setEditingId(service.id);
                    setShowModal(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-blue-400 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h4 className="font-display font-semibold text-white">{service.category}</h4>
            <p className="text-dark-400 text-sm">{service.subcategory || 'General'}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-700">
              <p className="font-bold text-brand-400 text-lg">₹{service.price}</p>
             <div className="flex items-center gap-1.5">
                <span className="text-xs text-dark-400">
                  {service.completedJobs} jobs
                </span>

                {service.status === 'APPROVED' ? (
                  <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 text-[10px]">
                    Verified
                  </span>
                ) : service.status === 'SUSPENDED' ? (
                  <span className="badge bg-red-500/20 text-red-400 border border-red-500/30 text-[10px]">
                    Suspended
                  </span>
                ) : (
                  <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px]">
                    Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-dark-600 hover:border-brand-500/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-dark-400 hover:text-brand-400 transition-all min-h-[180px]"
        >
          <Plus className="w-10 h-10" />
          <p className="font-medium">Add New Service</p>
        </button>
      </div>

      <Modal isOpen={showModal}
        onClose={handleCloseModal}
        title={editingId ? "Update Service" : "Add New Service"}
        size="md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-dark-300 mb-1.5 block">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
              <option value="">Select category</option>
              {SERVICE_CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          {form.category && (
            <div>
              <label className="text-sm font-medium text-dark-300 mb-1.5 block">Subcategory</label>
              <select value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} className="input-field">
                <option value="">Select subcategory</option>
                {SERVICE_CATEGORIES.find(c => c.name === form.category)?.subcategories.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-dark-300 mb-1.5 block">Description</label>
            <textarea
              rows={3}
              placeholder="Describe your service..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field resize-none text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark-300 mb-1.5 block">Starting Price (₹)</label>
              <input type="number" placeholder="e.g. 499" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-300 mb-1.5 block">Availability</label>
              <select value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })} className="input-field">
                <option value="">Select</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="all">All Days</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleCloseModal}   className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSaveService} className="btn-primary flex-1">{editingId ? "Update Service" : "Add Service"}</button>
          </div>
        </div>
        
      </Modal>
      <Modal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title="Service Details"
        size="sm"
      >
        {selectedService && (
          <div className="space-y-2">
            <p><strong>Category:</strong> {selectedService.category}</p>
            <p><strong>Subcategory:</strong> {selectedService.subcategory}</p>
            <p><strong>Description:</strong> {selectedService.description}</p>
            <p><strong>Price:</strong> ₹{selectedService.price}</p>
            <p><strong>Status:</strong> {selectedService.status}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ─── Provider Bookings Page ───────────────────────────────────────────────────
export const ProviderBookingsPage = () => {
  const [bookings, setBookings] = useState(MOCK_PROVIDER_BOOKINGS);
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);

  const updateStatus = (id, status) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title="Booking Requests" subtitle="Manage your incoming and active bookings" />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 capitalize ${
              activeTab === tab ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-400 border border-dark-700 hover:text-white'
            }`}
          >
            {tab}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-white/20' : 'bg-dark-700 text-dark-400'}`}>
              {(tab === 'all' ? bookings : bookings.filter(b => b.status === tab)).length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl mb-4 block">📋</span>
            <p className="text-dark-400">No {activeTab} bookings</p>
          </div>
        ) : filtered.map(booking => (
          <div key={booking.id} className="bg-dark-800 border border-dark-700 rounded-2xl p-5 hover:border-dark-600 transition-all">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-semibold text-white">{booking.customer}</h4>
                    <p className="text-dark-400 text-sm">{booking.service}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-dark-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-400" /> {booking.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-400" /> {booking.timeSlot}
                  </span>
                  <span>📍 {booking.address}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="font-bold text-brand-400 text-lg">₹{booking.price}</p>
                <Link to="/provider/chat" className="p-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-300 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </Link>
              </div>
            </div>
            {booking.status === 'pending' && (
              <div className="flex gap-3 mt-4 pt-4 border-t border-dark-700">
                <button
                  onClick={() => updateStatus(booking.id, 'confirmed')}
                  className="flex-1 py-2.5 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all font-medium text-sm"
                >
                  ✓ Accept Booking
                </button>
                <button
                  onClick={() => updateStatus(booking.id, 'cancelled')}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all font-medium text-sm"
                >
                  ✗ Decline
                </button>
              </div>
            )}
            {booking.status === 'confirmed' && (
              <button
                onClick={() => updateStatus(booking.id, 'completed')}
                className="w-full mt-4 py-2.5 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500 hover:text-white transition-all font-medium text-sm"
              >
                Mark as Completed ✓
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
