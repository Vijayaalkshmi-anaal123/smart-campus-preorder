import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const NotificationBell = ({ onOrderClick }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
              {unreadCount > 0 && (
                <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-1 mb-2" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read) markAsRead(n.id);
                    if (n.order_id && onOrderClick) {
                      onOrderClick(n.order_id);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 transition cursor-pointer hover:bg-slate-50 ${
                    !n.is_read ? 'bg-emerald-50/40 border-l-4 border-l-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-800">{n.title}</h5>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">{n.message}</p>
                  {n.order_id && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2 hover:underline">
                      View order details <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
