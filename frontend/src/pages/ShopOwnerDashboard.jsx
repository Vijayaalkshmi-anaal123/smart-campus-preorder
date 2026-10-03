import React, { useEffect, useState } from 'react';
import {
  ChefHat,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Phone,
  User,
  ArrowRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import OrderStatusBadge from '../components/OrderStatusBadge';
import PrepTimeModal from '../components/PrepTimeModal';

const ShopOwnerDashboard = () => {
  const { socket, activeAlert, setActiveAlert } = useSocket();
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('NEW'); // 'NEW', 'PREPARING', 'READY', 'COMPLETED'
  const [selectedOrderForPrep, setSelectedOrderForPrep] = useState(null);
  const [prepModalTitle, setPrepModalTitle] = useState('Set Preparation Time');
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch shop data and active orders
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [shopRes, ordersRes] = await Promise.all([
        api.get('/shops/my-shop'),
        api.get('/orders')
      ]);

      if (shopRes.data.success) {
        setShop(shopRes.data.shop);
      }
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.orders);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Real-time socket event handling for incoming orders
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data) => {
      console.log("[Owner Dashboard] New paid order received via socket:", data);
      loadDashboardData();
    };

    const handleStatusUpdate = () => {
      loadDashboardData();
    };

    socket.on('new_paid_order', handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('new_paid_order', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [socket]);

  // Order Actions
  const handleAcceptOrder = async (orderToken) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/orders/${orderToken}/accept`);
      if (res.data.success) {
        // Open prep time modal immediately to prompt owner for prep minutes
        const updated = res.data.order;
        setSelectedOrderForPrep(updated);
        setPrepModalTitle(`Accept & Set Prep Time for #${orderToken}`);
        setIsPrepModalOpen(true);
        await loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartPrep = (order) => {
    setSelectedOrderForPrep(order);
    setPrepModalTitle(`Set Kitchen Prep Time for #${order.order_token}`);
    setIsPrepModalOpen(true);
  };

  const handleUpdatePrepTime = (order) => {
    setSelectedOrderForPrep(order);
    setPrepModalTitle(`Update Prep Time for #${order.order_token}`);
    setIsPrepModalOpen(true);
  };

  const handleConfirmPrepMinutes = async (minutes) => {
    if (!selectedOrderForPrep) return;
    try {
      if (selectedOrderForPrep.order_status === 'ACCEPTED' || selectedOrderForPrep.order_status === 'ORDER_PLACED') {
        await api.put(`/orders/${selectedOrderForPrep.order_token}/prepare`, {
          estimated_minutes: minutes
        });
      } else {
        await api.put(`/orders/${selectedOrderForPrep.order_token}/update-prep-time`, {
          estimated_minutes: minutes
        });
      }
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update preparation time');
    }
  };

  const handleMarkReady = async (orderToken) => {
    if (!window.confirm(`Mark order #${orderToken} as Ready for student collection?`)) return;
    try {
      setActionLoading(true);
      await api.put(`/orders/${orderToken}/ready`);
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark order ready.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCompleted = async (orderToken) => {
    try {
      setActionLoading(true);
      await api.put(`/orders/${orderToken}/complete`);
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOrder = async (orderToken) => {
    const reason = window.prompt("Reason for rejecting this order (e.g. Item out of stock):", "Item unavailable");
    if (!reason) return;
    try {
      setActionLoading(true);
      await api.put(`/orders/${orderToken}/reject`, { reason });
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject order.');
    } finally {
      setActionLoading(false);
    }
  };

  // Categorize orders
  const newOrders = orders.filter((o) => ['ORDER_PLACED', 'ACCEPTED'].includes(o.order_status));
  const prepOrders = orders.filter((o) => o.order_status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.order_status === 'READY');
  const completedOrders = orders.filter((o) => o.order_status === 'COMPLETED');

  // Stats calculation
  const todaysRevenue = completedOrders.reduce((sum, o) => sum + o.total_amount, 0) +
                        readyOrders.reduce((sum, o) => sum + o.total_amount, 0) +
                        prepOrders.reduce((sum, o) => sum + o.total_amount, 0) +
                        newOrders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      
      {/* Top Banner / Shop Identification */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black uppercase tracking-wider mb-2">
            <ChefHat className="w-4 h-4" />
            <span>Shop Kitchen Console • {shop?.type}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">{shop?.name || 'My Campus Shop'}</h1>
          <p className="text-xs text-amber-100 mt-1">
            {shop?.location} • Only verified pre-paid orders are delivered to this screen.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="self-start sm:self-center px-4 py-2.5 bg-white text-amber-900 rounded-2xl text-xs font-extrabold shadow-sm hover:bg-amber-50 transition flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Queue</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">New Orders</span>
            <Bell className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {newOrders.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Preparing</span>
            <ChefHat className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {prepOrders.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Ready Pickup</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {readyOrders.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            ₹{todaysRevenue.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'NEW', label: `🔔 New Paid Orders (${newOrders.length})`, count: newOrders.length },
          { id: 'PREPARING', label: `🍳 Preparing (${prepOrders.length})`, count: prepOrders.length },
          { id: 'READY', label: `📦 Ready for Pickup (${readyOrders.length})`, count: readyOrders.length },
          { id: 'COMPLETED', label: `✅ Completed (${completedOrders.length})`, count: completedOrders.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Orders Container */}
      <div className="space-y-4">
        {/* NEW PAID ORDERS TAB */}
        {activeTab === 'NEW' && (
          <div className="space-y-4">
            {newOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100">
                <Bell className="w-12 h-12 stroke-1 mx-auto text-slate-300 mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No new incoming paid orders</h4>
                <p className="text-xs text-slate-400 mt-1">
                  When a student completes payment, the confirmed order will appear here with an audio chime!
                </p>
              </div>
            ) : (
              newOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-md space-y-4 animate-in fade-in"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl font-black text-white bg-slate-900 px-3.5 py-1.5 rounded-xl shadow-xs">
                        {ord.order_token}
                      </span>
                      <OrderStatusBadge status={ord.order_status} />
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                        ✅ {ord.payment_status}
                      </span>
                    </div>

                    <div className="text-right text-xs text-slate-500">
                      <span>Placed: {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <User className="w-3.5 h-3.5 text-amber-600" />
                      <span>{ord.student_name}</span>
                    </div>
                    {ord.student_phone && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Phone className="w-3 h-3" />
                        {ord.student_phone}
                      </span>
                    )}
                    {ord.notes && (
                      <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md font-semibold italic">
                        Note: "{ord.notes}"
                      </span>
                    )}
                  </div>

                  {/* Ordered Items List */}
                  <div className="bg-slate-50 rounded-2xl p-4 divide-y divide-slate-200/60">
                    {ord.items?.map((it) => (
                      <div key={it.id} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {it.product_name}
                          </span>
                          <span className="bg-white border px-2 py-0.5 rounded-md font-bold text-slate-700">
                            × {it.quantity}
                          </span>
                        </div>
                        <span className="font-black text-slate-900">
                          ₹{it.item_total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-between items-center font-black text-sm">
                      <span>Total Amount Paid</span>
                      <span className="text-emerald-700 text-base">₹{ord.total_amount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleRejectOrder(ord.order_token)}
                      disabled={actionLoading}
                      className="px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                    >
                      Reject Order
                    </button>

                    {ord.order_status === 'ORDER_PLACED' ? (
                      <button
                        onClick={() => handleAcceptOrder(ord.order_token)}
                        disabled={actionLoading}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept Order</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartPrep(ord)}
                        disabled={actionLoading}
                        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Start Preparing</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PREPARING ORDERS TAB */}
        {activeTab === 'PREPARING' && (
          <div className="space-y-4">
            {prepOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100">
                <ChefHat className="w-12 h-12 stroke-1 mx-auto text-slate-300 mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No orders currently in preparation</h4>
              </div>
            ) : (
              prepOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg font-black text-slate-900 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-xl">
                        {ord.order_token}
                      </span>
                      <OrderStatusBadge status={ord.order_status} />
                    </div>

                    {/* Live Estimated Ready Time Indicator */}
                    <div className="bg-amber-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        Estimated Ready: {ord.estimated_ready_time ? new Date(ord.estimated_ready_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${ord.estimated_minutes || 15} mins`}
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-slate-700 font-semibold space-y-1">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Items to Prepare</span>
                    <p>{ord.items?.map((it) => `${it.product_name} (×${it.quantity})`).join(', ')}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleUpdatePrepTime(ord)}
                      className="px-3.5 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Change Prep Time ({ord.estimated_minutes || 15}m)</span>
                    </button>

                    <button
                      onClick={() => handleMarkReady(ord.order_token)}
                      disabled={actionLoading}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Mark Order Ready (Notify Student)</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* READY FOR PICKUP TAB */}
        {activeTab === 'READY' && (
          <div className="space-y-4">
            {readyOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100">
                <CheckCircle className="w-12 h-12 stroke-1 mx-auto text-slate-300 mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No orders waiting for pickup</h4>
              </div>
            ) : (
              readyOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl font-black text-emerald-800 bg-emerald-100 px-3.5 py-1.5 rounded-xl">
                        {ord.order_token}
                      </span>
                      <OrderStatusBadge status={ord.order_status} />
                    </div>
                    <span className="text-xs font-bold text-emerald-600">Student Notified 🔔</span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <p>Student: <strong>{ord.student_name}</strong> • Total: <strong>₹{ord.total_amount.toFixed(2)}</strong></p>
                    <p className="mt-1 text-slate-500">Items: {ord.items?.map(it => `${it.product_name} × ${it.quantity}`).join(', ')}</p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleMarkCompleted(ord.order_token)}
                      disabled={actionLoading}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Student Collected • Mark Completed</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* COMPLETED TAB */}
        {activeTab === 'COMPLETED' && (
          <div className="space-y-3">
            {completedOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100">
                <p className="text-sm font-bold">No completed orders today yet.</p>
              </div>
            ) : (
              completedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {ord.order_token}
                    </span>
                    <span className="text-slate-600">
                      {ord.student_name} • {ord.items?.length} items
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900">₹{ord.total_amount.toFixed(2)}</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      COMPLETED
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Prep Time Setting Modal */}
      {isPrepModalOpen && (
        <PrepTimeModal
          isOpen={isPrepModalOpen}
          onClose={() => setIsPrepModalOpen(false)}
          title={prepModalTitle}
          initialMinutes={selectedOrderForPrep?.estimated_minutes || 15}
          onConfirm={handleConfirmPrepMinutes}
        />
      )}
    </div>
  );
};

export default ShopOwnerDashboard;
