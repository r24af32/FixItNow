import React, { useState } from 'react';
import { Star, X, Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// ─── StarRating ─────────────────────────────────────────────────────────────
export const StarRating = ({ rating, max = 5, size = 'sm', interactive = false, onChange }) => {
  const [hovered, setHovered] = useState(null);
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => {
        const filled = (hovered !== null ? i < hovered : i < Math.round(rating));
        return (
          <Star
            key={i}
            className={`${sizeClass} ${filled ? 'star-filled' : 'star-empty'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onChange && onChange(i + 1)}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(null)}
          />
        );
      })}
    </div>
  );
};

// ─── StatusBadge ────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    pending:   { cls: 'status-pending',   label: 'Pending' },
    confirmed: { cls: 'status-confirmed', label: 'Confirmed' },
    completed: { cls: 'status-completed', label: 'Completed' },
    cancelled: { cls: 'status-cancelled', label: 'Cancelled' },
    verified:  { cls: 'badge bg-green-500/20 text-green-400 border border-green-500/30', label: 'Verified' },
    unverified:{ cls: 'badge bg-dark-600 text-dark-300 border border-dark-500', label: 'Unverified' },
    approved:  { cls: 'badge bg-green-500/20 text-green-400 border border-green-500/30', label: 'Approved' },
    rejected:  { cls: 'badge bg-red-500/20 text-red-400 border border-red-500/30', label: 'Rejected' },
  };
  const { cls, label } = map[status] || { cls: 'badge bg-dark-700 text-dark-300', label: status };
  return <span className={cls}>{label}</span>;
};

// ─── LoadingSpinner ──────────────────────────────────────────────────────────
export const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12';
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${s} text-brand-500 animate-spin`} />
      {text && <p className="text-dark-400 text-sm">{text}</p>}
    </div>
  );
};

// ─── PageLoader ──────────────────────────────────────────────────────────────
export const PageLoader = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/20 flex items-center justify-center">
          <span className="text-3xl">🔧</span>
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-brand-500 animate-ping opacity-30" />
      </div>
      <p className="text-dark-400 text-sm font-medium tracking-wider uppercase">Loading FixItNow...</p>
    </div>
  </div>
);

// ─── Modal ───────────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizeMap = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-dark-800 border border-dark-600 rounded-2xl w-full ${sizeMap[size]} animate-slide-up shadow-2xl`}>
        <div className="flex items-center justify-between p-5 border-b border-dark-700">
          <h3 className="font-display font-semibold text-lg text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ─── Alert ───────────────────────────────────────────────────────────────────
export const Alert = ({ type = 'info', message, onClose }) => {
  const map = {
    success: { icon: CheckCircle, cls: 'bg-green-500/10 border-green-500/30 text-green-400' },
    error:   { icon: AlertCircle, cls: 'bg-red-500/10 border-red-500/30 text-red-400' },
    info:    { icon: Info, cls: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
    warning: { icon: AlertCircle, cls: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
  };
  const { icon: Icon, cls } = map[type];
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${cls} animate-fade-in`}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {onClose && <button onClick={onClose} className="text-current opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>}
    </div>
  );
};

// ─── Empty State ─────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="font-display font-semibold text-lg text-dark-200 mb-2">{title}</h3>
    <p className="text-dark-400 text-sm max-w-xs mb-6">{description}</p>
    {action}
  </div>
);

// ─── Avatar ──────────────────────────────────────────────────────────────────
export const Avatar = ({ name = '', size = 'md', src }) => {
  const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' };
  // Remove emojis from name before extracting initials
  const cleanName = name.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
  const initials = cleanName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || name.charAt(0).toUpperCase();
  const colors = ['bg-brand-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500'];
  // Use cleaned name for color calculation to ensure consistent colors
  const colorIndex = (cleanName || name).charCodeAt(0) % colors.length;
  const color = colors[colorIndex];

  if (src) return <img src={src} alt={name} className={`${sizeMap[size]} rounded-full object-cover`} />;
  return (
    <div className={`${sizeMap[size]} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials || '?'}
    </div>
  );
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
export const SkeletonCard = () => (
  <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 space-y-3">
    <div className="skeleton h-4 w-3/4" />
    <div className="skeleton h-3 w-1/2" />
    <div className="skeleton h-20 w-full" />
    <div className="flex gap-2">
      <div className="skeleton h-8 flex-1" />
      <div className="skeleton h-8 flex-1" />
    </div>
  </div>
);

// ─── Section Header ──────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h2 className="font-display font-bold text-xl text-white">{title}</h2>
      {subtitle && <p className="text-dark-400 text-sm mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ─── Chatbot ─────────────────────────────────────────────────────────────────
export { Chatbot } from './Chatbot';

export { Toast } from './Toast';
export { ReviewForm } from '../reviews/ReviewForm';
export { ReviewList } from '../reviews/ReviewList';