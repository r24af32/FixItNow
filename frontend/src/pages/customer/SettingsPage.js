import React, { useState } from 'react';
import { User, MapPin, Bell, Shield, LogOut, Camera, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Alert, SectionHeader } from '../../components/common/index';

export const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', location: user?.location || '' });
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({ bookingUpdates: true, chatMessages: true, promotions: false, sms: true });

  const handleSave = () => {
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title="Settings" subtitle="Manage your account preferences" />

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`sidebar-link w-full ${activeTab === tab.id ? 'active' : ''}`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
            <div className="border-t border-dark-700 pt-2 mt-2">
              <button
                onClick={logout}
                className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 space-y-6">
              {saved && <Alert type="success" message="Profile updated successfully!" />}
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <Avatar name={form.name} size="xl" />
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{form.name}</h3>
                  <p className="text-dark-400 text-sm capitalize">{user?.role || 'Customer'}</p>
                  <p className="text-dark-500 text-xs mt-1">Member since 2024</p>
                </div>
              </div>

              {/* Form */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-dark-300 mb-1.5 block">Full Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-300 mb-1.5 block">Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-300 mb-1.5 block">Phone Number</label>
                  <input type="tel" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-300 mb-1.5 block flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Location
                  </label>
                  <input type="text" placeholder="Your area" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" />
                </div>
              </div>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 space-y-5">
              <h3 className="font-display font-semibold text-lg text-white">Notification Preferences</h3>
              {[
                { key: 'bookingUpdates', label: 'Booking Updates', desc: 'Get notified about booking status changes' },
                { key: 'chatMessages', label: 'Chat Messages', desc: 'Receive notifications for new messages' },
                { key: 'promotions', label: 'Promotions & Offers', desc: 'Receive special offers and discounts' },
                { key: 'sms', label: 'SMS Notifications', desc: 'Receive important updates via SMS' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-dark-700 last:border-0">
                  <div>
                    <p className="font-medium text-white text-sm">{item.label}</p>
                    <p className="text-dark-400 text-xs mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-brand-500' : 'bg-dark-600'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications[item.key] ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 space-y-5">
              <h3 className="font-display font-semibold text-lg text-white">Security Settings</h3>
              <div className="space-y-4">
                {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                  <div key={label}>
                    <label className="text-sm font-medium text-dark-300 mb-1.5 block">{label}</label>
                    <input type="password" placeholder="••••••••" className="input-field" />
                  </div>
                ))}
                <button className="btn-primary">Update Password</button>
              </div>
              <div className="mt-6 pt-6 border-t border-dark-700">
                <h4 className="font-semibold text-white mb-4">Active Sessions</h4>
                <div className="space-y-3">
                  {[
                    { device: 'Chrome on Windows', location: 'Bengaluru, IN', current: true },
                    { device: 'iPhone 14', location: 'Bengaluru, IN', current: false },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-dark-900/50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-white">{session.device}</p>
                        <p className="text-xs text-dark-400">{session.location}</p>
                      </div>
                      {session.current ? (
                        <span className="text-xs text-green-400 font-medium">Current</span>
                      ) : (
                        <button className="text-xs text-red-400 hover:text-red-300">Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
