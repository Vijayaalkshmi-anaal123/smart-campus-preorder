import React, { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  Store,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  CreditCard
} from 'lucide-react';
import api from '../services/api';
import OrderStatusBadge from '../components/OrderStatusBadge';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [shopBreakdown, setShopBreakdown] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW', 'SHOPS', 'USERS', 'ORDERS', 'PAYMENTS'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [dashRes, usersRes, shopsRes, paymentsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/shops?all=true'),
        api.get('/admin/payments')
      ]);

      if (dashRes.data.success) {
        setMetrics(dashRes.data.metrics);
        setShopBreakdown(dashRes.data.shop_breakdown);
        setRecentOrders(dashRes.data.recent_orders);
      }
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (shopsRes.data.success) setShops(shopsRes.data.shops);
      if (paymentsRes.data.success) setPayments(paymentsRes.data.payments);
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-status`);
      if (res.data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? res.data.user : u));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle user status');
    }
  };

  const handleToggleShopStatus = async (shop) => {
    const nextStatus = shop.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.put(`/admin/shops/${shop.id}`, { status: nextStatus });
      if (res.data.success) {
        setShops(prev => prev.map(s => s.id === shop.id ? res.data.shop : s));
      }
    } catch (err) {
      alert("Failed to update shop status");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4" />
            <span>Campus Administrative Console</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">System Master Dashboard</h1>
          <p className="text-xs text-purple-200 mt-1">
            Global monitoring of shops, queues, revenue, payments and access control.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="self-start sm:self-center px-4 py-2 bg-white text-purple-900 rounded-xl text-xs font-bold shadow-sm hover:bg-purple-50 transition flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh All Metrics</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'OVERVIEW', label: '📊 System Overview' },
          { id: 'SHOPS', label: `🏪 Campus Shops (${shops.length})` },
          { id: 'USERS', label: `👥 User Accounts (${users.length})` },
          { id: 'ORDERS', label: '📦 Orders Audit' },
          { id: 'PAYMENTS', label: '💳 Payment Audit' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && metrics && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Students</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.total_students}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Shop Owners</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.total_shop_owners}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Shops</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.total_shops}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Products</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.total_products}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Total Revenue</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">₹{metrics.total_revenue.toFixed(2)}</span>
            </div>
          </div>

          {/* Orders Status Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-blue-600">Today's Orders</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.todays_orders}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-amber-600">Pending in Kitchen</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{metrics.pending_orders}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-emerald-600">Completed Orders</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{metrics.completed_orders}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-rose-600">Cancelled / Rejected</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">{metrics.cancelled_orders}</span>
            </div>
          </div>

          {/* Shop Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Revenue Breakdown by Shop</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopBreakdown.map((s) => (
                <div key={s.shop_id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{s.shop_name}</span>
                    <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      {s.shop_type}
                    </span>
                  </div>
                  <span className="text-xl font-black text-emerald-600 block">₹{s.revenue.toFixed(2)}</span>
                  <span className="text-xs text-slate-400">{s.order_count} paid orders completed</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SHOPS TAB */}
      {activeTab === 'SHOPS' && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-4">Shop</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Location</th>
                <th className="p-4">Products</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shops.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono">{s.type}</span>
                      <span>{s.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{s.owner_name} ({s.owner_email})</td>
                  <td className="p-4 text-slate-500">{s.location}</td>
                  <td className="p-4 font-semibold text-slate-700">{s.product_count} items</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleShopStatus(s)}
                      className="text-xs font-bold text-purple-700 hover:underline"
                    >
                      {s.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{u.name}</span>
                    <span className="text-[11px] text-slate-400">{u.email}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'shop_owner'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{u.phone || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u.id)}
                      className="text-xs font-bold text-purple-700 hover:underline"
                    >
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900">Recent Campus Pre-Orders Audit</h3>
          <div className="divide-y divide-slate-100">
            {recentOrders.map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-900">
                    {ord.order_token}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {ord.shop_name} • {ord.student_name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(ord.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={ord.order_status} />
                  <span className="font-black text-slate-900 text-sm">₹{ord.total_amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAYMENTS TAB */}
      {activeTab === 'PAYMENTS' && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-4">Transaction Ref</th>
                <th className="p-4">Order Token</th>
                <th className="p-4">Student</th>
                <th className="p-4">Outlet</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-slate-800">{p.transaction_reference}</td>
                  <td className="p-4 font-mono font-bold text-emerald-700">{p.order_token || 'N/A'}</td>
                  <td className="p-4 text-slate-700">{p.student_name || 'Rahul'}</td>
                  <td className="p-4 text-slate-600">{p.shop_name}</td>
                  <td className="p-4 font-semibold text-slate-600">{p.payment_method}</td>
                  <td className="p-4 font-black text-slate-900 text-sm">₹{p.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      {p.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
