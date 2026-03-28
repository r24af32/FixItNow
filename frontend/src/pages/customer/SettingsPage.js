import React, { useState, useEffect } from 'react';
import { User, MapPin, Bell, Shield, LogOut, Camera, Save, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Alert, SectionHeader } from '../../components/common/index';
import { api } from '../../utils/api';

export const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', location: user?.location || '' });
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({ bookingUpdates: true, chatMessages: true, promotions: false, sms: true });
  const [errors, setErrors] = useState({});
  const [verificationData, setVerificationData] = useState({
    idType: '',
    idFile: null,
    selfie: null,
    skillCert: null,
    skillText: '',
    addressProof: null,
    addressText: '',
    experienceText: '',
    workImages: [],
    businessCert: null,
  });

  // not_submitted | pending | verified | rejected
  const [verificationStatus, setVerificationStatus] = useState('not_submitted');
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/provider/status");

        updateUser(prev => ({
          ...prev,
          verificationStatus: res.data.status
        }));

      } catch (err) {
        console.error("Failed to fetch verification status", err);
      }
    };

    if (user?.role === "provider") {
      fetchStatus();
    }
  }, [user?.id]);

  const handleSave = () => {
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // const tabs = [
  //   { id: 'profile', label: 'Profile', icon: User },
  //   { id: 'notifications', label: 'Notifications', icon: Bell },
  //   { id: 'security', label: 'Security', icon: Shield },
  // ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },

    // Documents
    { id: 'verification', label: 'Verification', icon: FileText },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const ToggleSwitch = ({ enabled, onToggle }) => {
    return (
      <button
        onClick={onToggle}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
          enabled ? "bg-brand-500 justify-end" : "bg-dark-600 justify-start"
        }`}
      >
        <div className="w-4 h-4 bg-white rounded-full shadow-md transition-all" />
      </button>
    );
  };

  const status = user?.verificationStatus || verificationStatus;

  const validateFile = (file, fieldName) => {
    if (!file) return true;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf"
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: "Only JPG, PNG, JPEG or PDF files are allowed"
      }));
      return false;
    }

    // clear error if valid
    setErrors(prev => ({
      ...prev,
      [fieldName]: ""
    }));

    return true;
  };

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
                  {/* <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-brand-500' : 'bg-dark-600'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications[item.key] ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button> */}

                  <ToggleSwitch
                    enabled={notifications[item.key]}
                    onToggle={() =>
                      setNotifications({
                        ...notifications,
                        [item.key]: !notifications[item.key],
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 space-y-6">

              <h3 className="font-display font-semibold text-lg text-white">
                Provider Verification
              </h3>

              {/* STATUS BADGE */}
              <div className="flex items-center gap-2">
                {status === "APPROVED" ? (
                  <span className="badge bg-green-500/20 text-green-400 border border-green-500/30">
                    ✅ Verified Provider
                  </span>
                ) : status === "PENDING" ? (
                  <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    ⏳ Pending Approval
                  </span>
                ) : status === "REJECTED" ? (
                  <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">
                    ❌ Rejected
                  </span>
                ) : (
                  <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">
                    ❌ Not Verified
                  </span>
                )}
              </div>

              {/* MESSAGE */}
              {status === "PENDING" && (
                <p className="text-yellow-400 text-sm mt-2">
                  Your documents have been submitted. Please wait for admin approval.
                </p>
              )}

              {status === "REJECTED" && (
                <p className="text-red-400 text-sm mt-2">
                  Your documents were rejected. Please re-upload valid documents.
                </p>
              )}

              {/* 1. ID PROOF */}
              <div className="space-y-3">
                <p className="text-sm text-white font-medium">Identity Proof *</p>

                <select
                  className="input-field"
                  onChange={(e) =>
                    setVerificationData({ ...verificationData, idType: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option>Aadhaar Card</option>
                  <option>PAN Card</option>
                  <option>Driving License</option>
                </select>

                <input
                  type="file"
                  className="input-field mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-dark-600 file:bg-dark-800 file:text-white file:text-sm file:font-medium hover:file:bg-dark-700 file:transition-all cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!validateFile(file)) return;
                    setVerificationData({ ...verificationData, idFile: e.target.files[0] })
                  }}
                />
              </div>

              {/* 2. SELFIE */}
              <div>
                <p className="text-sm text-white font-medium">Selfie *</p>
                <input
                  type="file"
                  className="input-field mt-1 
                            file:mr-4 file:py-2 file:px-4 
                            file:rounded-lg 
                            file:border file:border-dark-600 
                            file:bg-dark-800 
                            file:text-white 
                            file:text-sm file:font-medium 
                            hover:file:bg-dark-700 
                            file:transition-all 
                            cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!validateFile(file)) return;
                    setVerificationData({ ...verificationData, selfie: e.target.files[0] })
                  }}
                />
              </div>

              {/* 3. SKILL VERIFICATION */}
              <div className="space-y-2">
                <p className="text-sm text-white font-medium">Skill Certificate</p>

                <input
                  type="file"
                  className="input-field mt-1 
                            file:mr-4 file:py-2 file:px-4 
                            file:rounded-lg 
                            file:border file:border-dark-600 
                            file:bg-dark-800 
                            file:text-white 
                            file:text-sm file:font-medium 
                            hover:file:bg-dark-700 
                            file:transition-all 
                            cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!validateFile(file)) return;
                    setVerificationData({ ...verificationData, skillCert: e.target.files[0] })
                  }}
                />

                {/* <textarea
                  placeholder="Or describe your experience..."
                  className="input-field"
                  onChange={(e) =>
                    setVerificationData({ ...verificationData, skillText: e.target.value })
                  }
                /> */}
              </div>

              {/* 4. ADDRESS */}
              <div className="space-y-2">
                <p className="text-sm text-white font-medium">Address Proof *</p>

                {/* <input
                  type="file"
                  className="input-field"
                  onChange={(e) =>
                    setVerificationData({ ...verificationData, addressProof: e.target.files[0] })
                  }
                /> */}

                <input
                  type="text"
                  placeholder="Enter your address details"
                  className="input-field"
                  onChange={(e) =>
                    setVerificationData({ ...verificationData, addressText: e.target.value })
                  }
                />
              </div>

              {/* 5. EXPERIENCE */}
              <div>
                <p className="text-sm text-white font-medium">Experience *</p>
                <textarea
                  placeholder="Describe your work experience..."
                  className="input-field"
                  onChange={(e) =>
                    setVerificationData({ ...verificationData, experienceText: e.target.value })
                  }
                />
              </div>

              {/* 6. WORK PHOTOS */}
              <div>
                <p className="text-sm text-white font-medium">Work Photos</p>
                <input
                  type="file"
                  multiple
                  className="input-field mt-1 
                            file:mr-4 file:py-2 file:px-4 
                            file:rounded-lg 
                            file:border file:border-dark-600 
                            file:bg-dark-800 
                            file:text-white 
                            file:text-sm file:font-medium 
                            hover:file:bg-dark-700 
                            file:transition-all 
                            cursor-pointer"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);

                    // No file selected
                    if (files.length === 0) {
                      setErrors(prev => ({
                        ...prev,
                        workImages: "Please upload at least 1 image"
                      }));
                      return;
                    }

                    // More than 5 images
                    if (files.length > 5) {
                      setErrors(prev => ({
                        ...prev,
                        workImages: "Maximum 5 images allowed"
                      }));
                      return;
                    }

                    // Validate each file type
                    for (let file of files) {
                      if (!validateFile(file, "workImages")) return;
                    }

                    // Clear error
                    setErrors(prev => ({
                      ...prev,
                      workImages: ""
                    }));

                    // Save files
                    setVerificationData(prev => ({
                      ...prev,
                      workImages: files
                    }));
                  }}
                />
              </div>

              {/* 7. BUSINESS */}
              <div>
                <p className="text-sm text-white font-medium">Business Proof</p>
                <input
                  type="file"
                  className="input-field mt-1 
                            file:mr-4 file:py-2 file:px-4 
                            file:rounded-lg 
                            file:border file:border-dark-600 
                            file:bg-dark-800 
                            file:text-white 
                            file:text-sm file:font-medium 
                            hover:file:bg-dark-700 
                            file:transition-all 
                            cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!validateFile(file)) return;
                    setVerificationData({ ...verificationData, businessCert: e.target.files[0] })
                  }}
                />
              </div>

              {/* SUBMIT */}
              <button
                onClick={async () => {
                  try {
                    if (!verificationData.idType) {
                      return alert("Please select ID type");
                    }

                    if (!verificationData.idFile) {
                      return alert("Please upload ID proof");
                    }

                    if (!verificationData.selfie) {
                      return alert("Please upload selfie");
                    }

                    if (!verificationData.addressText) {
                      return alert("Please enter address");
                    }

                    const formData = new FormData();
                    formData.append("idType", verificationData.idType);
                    formData.append("idFile", verificationData.idFile);
                    formData.append("selfie", verificationData.selfie);
                    formData.append("skillCert", verificationData.skillCert);
                    formData.append("addressText", verificationData.addressText);
                    formData.append("experienceText", verificationData.experienceText);

                    if (verificationData.workImages) {
                      Array.from(verificationData.workImages).forEach((file) => {
                        formData.append("workImages", file);
                      });
                    }

                    if (verificationData.businessCert) {
                      formData.append("businessCert", verificationData.businessCert);
                    }

                    // 1. Send verification request
                    await api.post("/provider/verification", formData, {
                      headers: {
                        "Content-Type": "multipart/form-data",
                      },
                    });

                    // 2. Notify admin
                    await api.post("/notifications/create", {
                      role: "admin",
                      type: "VERIFICATION_REQUEST",
                      providerId: user.id,
                      text: `${user.name} requested verification`,
                      viewed: false,
                      createdAt: Date.now()
                    });

                    setVerificationStatus("PENDING");

                    // Update local state
                    setVerificationStatus("PENDING");

                    // Update global user (VERY IMPORTANT)
                    updateUser({
                      ...user,
                      verificationStatus: "PENDING"
                    });

                    // (optional) you can keep alert OR remove it
                    alert("✅ Documents submitted. Wait for admin approval.");

                  } catch (err) {
                    console.error(err);
                    console.error("BACKEND ERROR:", err.response?.data);
                    alert(err.response?.data?.message || "❌ Submission failed");
                  }
                }}
                className="btn-primary w-full"
              >
                Submit
              </button>
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
