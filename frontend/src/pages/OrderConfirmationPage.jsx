import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Copy,
  Clock,
  Store,
  MapPin,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import OrderTimeline from '../components/OrderTimeline';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';

const OrderConfirmationPage = ({ initialOrder, onTrackOrder, onHomeClick }) => {
  const [order, setOrder] = useState(initialOrder);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();

  // Listen for socket events for this order
  useEffect(() => {
    if (!socket || !order) return;

    socket.emit('join_order', { order_token: order.order_token });

    const handleUpdate = (data) => {
      if (data.order && data.order.order_token === order.order_token) {
        setOrder(data.order);
      }
    };

    socket.on('order_status_updated', handleUpdate);
    socket.on('prep_time_updated', handleUpdate);
    socket.on('order_ready', handleUpdate);

    return () => {
      socket.off('order_status_updated', handleUpdate);
      socket.off('prep_time_updated', handleUpdate);
      socket.off('order_ready', handleUpdate);
    };
  }, [socket, order?.order_token]);

  const refreshOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${order.order_token}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(order.order_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 pb-20">
      
      {/* Celebration Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-scale">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Payment Successful ✅ • Order Confirmed</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Your Order is Placed!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          The shop owner has received your confirmed paid order and will begin preparation shortly.
        </p>

        {/* Big Unique Order Token Display */}
        <div className="my-6 p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white max-w-sm mx-auto shadow-xl relative group">
          <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-extrabold block">
            Pickup Order Token
          </span>
          <div className="flex items-center justify-center gap-3 my-2">
            <span className="text-4xl font-black tracking-wider text-white">
              {order.order_token}
            </span>
            <button
              onClick={copyToken}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              title="Copy Token"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && <span className="text-[10px] text-emerald-300 font-bold">Token copied to clipboard!</span>}
          <p className="text-[11px] text-slate-300 mt-1">
            Show this token at the {order.shop_name} counter to collect your food.
          </p>
        </div>

        {/* Live Order Timeline */}
        <OrderTimeline order={order} />

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={refreshOrder}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
          <button
            onClick={onHomeClick}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <span>Browse More Shops</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pickup Details & Receipt Summary */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-base font-black text-slate-900">Pickup Details & Items</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Shop Location</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{order.shop_name}</span>
            <span className="text-slate-600 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-600" />
              {order.shop_location}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Payment Reference</span>
            <span className="font-mono text-slate-800 font-semibold block mt-0.5 truncate">
              {order.payment?.transaction_reference || 'PAID'}
            </span>
            <span className="text-emerald-700 font-bold">Method: {order.payment?.payment_method || 'UPI'}</span>
          </div>
        </div>

        {/* Itemized breakdown */}
        <div className="divide-y divide-slate-100">
          {order.items?.map((it) => (
            <div key={it.id} className="py-2.5 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{it.product_name}</span>
                <span className="text-slate-400 font-semibold">× {it.quantity}</span>
              </div>
              <span className="font-extrabold text-slate-900">₹{it.item_total.toFixed(2)}</span>
            </div>
          ))}
          <div className="pt-3 flex justify-between items-center font-black text-sm text-slate-900">
            <span>Total Paid</span>
            <span className="text-emerald-600 text-base">₹{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OrderConfirmationPage;
