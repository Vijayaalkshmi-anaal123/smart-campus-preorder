import React, { useEffect, useState } from 'react';
import { Clock, Store, MapPin, ChevronRight, RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import OrderStatusBadge from '../components/OrderStatusBadge';
import OrderTimeline from '../components/OrderTimeline';

const OrderHistoryPage = ({ onViewOrderDetails }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ACTIVE') {
      return ['ORDER_PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.order_status);
    }
    if (filter === 'COMPLETED') {
      return o.order_status === 'COMPLETED';
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track active campus pre-orders and review previous receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {['ALL', 'ACTIVE', 'COMPLETED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === f ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Selected Order Modal / Detail View */}
      {selectedOrder && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-500/30 animate-in fade-in space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
                Order Tracking
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Token: #{selectedOrder.order_token}
              </h3>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          <OrderTimeline order={selectedOrder} />

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
            <div>
              <span className="text-slate-400 block font-bold">Shop</span>
              <span className="font-bold text-slate-800">{selectedOrder.shop_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">Location</span>
              <span className="font-bold text-slate-800">{selectedOrder.shop_location}</span>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
          <p className="text-xs">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100">
          <ShoppingBag className="w-12 h-12 stroke-1 mx-auto text-slate-300 mb-3" />
          <h4 className="text-base font-bold text-slate-700">No orders found</h4>
          <p className="text-xs text-slate-400 mt-1">
            You don't have any orders matching the "{filter}" filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => setSelectedOrder(ord)}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                    {ord.order_token}
                  </span>
                  <OrderStatusBadge status={ord.order_status} />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">{ord.shop_name}</span>
                  <span>•</span>
                  <span>
                    {ord.created_at ? new Date(ord.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                <p className="text-xs text-slate-500 truncate">
                  {ord.items?.map((it) => `${it.product_name} × ${it.quantity}`).join(', ')}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Paid Total</span>
                  <span className="text-base font-black text-slate-900">
                    ₹{ord.total_amount.toFixed(2)}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 transition">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
