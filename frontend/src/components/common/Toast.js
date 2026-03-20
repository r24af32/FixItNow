import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

/**
 * Toast  –  lightweight in-app notification
 *
 * Props:
 *   message   string   text to show
 *   type      'success' | 'error'   defaults to 'success'
 *   onClose   () => void            called when dismissed or auto-hidden
 *   duration  number (ms)           auto-dismiss after this delay (default 3000)
 *
 * Placed fixed at top-right — matches existing dark theme colors exactly.
 * Uses animate-slide-in-right which is already defined in tailwind.config.js.
 */
export const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      wrapper: 'bg-green-500/10 border border-green-500/30 text-green-400',
      Icon: CheckCircle,
    },
    error: {
      wrapper: 'bg-red-500/10 border border-red-500/30 text-red-400',
      Icon: AlertCircle,
    },
  };

  const { wrapper, Icon } = styles[type] || styles.success;

  return (
    <div className="fixed top-5 right-5 z-[9999] animate-slide-in-right">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${wrapper} min-w-[240px] max-w-sm`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="opacity-60 hover:opacity-100 transition-opacity ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};