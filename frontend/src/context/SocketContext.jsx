import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeAlert, setActiveAlert] = useState(null);

  // Fetch notifications from database
  const refreshNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unread_count);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, [user]);

  // Connect Socket.IO
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    s.on('connect', () => {
      console.log("[Socket.IO] Connected with ID:", s.id);
      
      // Join user specific room
      s.emit('join_user', { user_id: user.id });

      // If shop owner, join shop room
      if (user.role === 'shop_owner' && user.shop?.id) {
        s.emit('join_shop', { shop_id: user.shop.id });
        console.log(`[Socket.IO] Joining shop room: shop_${user.shop.id}`);
      }

      // If admin, join admin room
      if (user.role === 'admin') {
        s.emit('join_admin', {});
      }
    });

    // Listen for New Paid Order (for Shop Owner)
    s.on('new_paid_order', (data) => {
      console.log("[Socket.IO] Received new_paid_order:", data);
      playAlertSound();
      setActiveAlert({
        type: 'new_order',
        title: '🔔 NEW PAID ORDER',
        message: data.message || `Order #${data.order?.order_token} received and paid!`,
        token: data.order?.order_token
      });
      refreshNotifications();
    });

    // Listen for order status updates (for Student)
    s.on('order_status_updated', (data) => {
      console.log("[Socket.IO] Received order_status_updated:", data);
      setActiveAlert({
        type: 'status_update',
        title: 'Order Status Update',
        message: `Your order #${data.order?.order_token} is now ${data.order?.order_status}`,
        token: data.order?.order_token
      });
      refreshNotifications();
    });

    // Listen for preparation time updates
    s.on('prep_time_updated', (data) => {
      console.log("[Socket.IO] Received prep_time_updated:", data);
      setActiveAlert({
        type: 'prep_time',
        title: '⏱️ Prep Time Updated',
        message: `Order #${data.order?.order_token}: Estimated ready in ${data.order?.estimated_minutes} minutes.`,
        token: data.order?.order_token
      });
      refreshNotifications();
    });

    // Listen for Order Ready (for Student)
    s.on('order_ready', (data) => {
      console.log("[Socket.IO] Received order_ready:", data);
      playAlertSound();
      setActiveAlert({
        type: 'ready',
        title: '🎉 Order Ready for Pickup!',
        message: data.message || `Your order #${data.order?.order_token} is ready!`,
        token: data.order?.order_token
      });
      refreshNotifications();
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user]);

  const playAlertSound = () => {
    try {
      // Modern Web Audio API synth beep
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      // ignore audio context restrictions
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      notifications,
      unreadCount,
      activeAlert,
      setActiveAlert,
      markAsRead,
      markAllAsRead,
      refreshNotifications
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
