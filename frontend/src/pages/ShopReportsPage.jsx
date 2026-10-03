import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Package, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

const ShopReportsPage = () => {
  const [orders, setOrders] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sRes, oRes] = await Promise.all([
          api.get('/shops/my-shop'),
          api.get('/orders')
        ]);
        if (sRes.data.success) setShop(sRes.data.shop);
        if (oRes.data.success) setOrders(oRes.data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const completedCount = orders.filter(o => o.order_status === 'COMPLETED').length;
  
  // Calculate item breakdown
  const itemMap = {};
  orders.forEach(o => {
    o.items?.forEach(it => {
      if (!itemMap[it.product_name]) {
        itemMap[it.product_name] = { qty: 0, revenue: 0 };
      }
      itemMap[it.product_name].qty += it.quantity;
      itemMap[it.product_name].revenue += it.item_total;
    });
  });

  const popularItems = Object.entries(itemMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Sales & Queue Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Outlet: {shop?.name} • Historical sales, revenue metrics and top-ordered items.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Gross Verified Sales</span>
          <span className="text-3xl font-black text-emerald-600 block mt-1">₹{totalRevenue.toFixed(2)}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">From verified paid orders</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Completed Deliveries</span>
          <span className="text-3xl font-black text-slate-900 block mt-1">{completedCount} orders</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Picked up by students</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Orders Handled</span>
          <span className="text-3xl font-black text-slate-900 block mt-1">{orders.length}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">All-time pre-orders</span>
        </div>
      </div>

      {/* Top Ordered Items */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900">Most Popular Items in Your Outlet</h3>
        <div className="divide-y divide-slate-100">
          {popularItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No order items recorded yet.</p>
          ) : (
            popularItems.map((item, idx) => (
              <div key={item.name} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-slate-500 font-semibold">{item.qty} units sold</span>
                  <span className="font-black text-slate-900 text-sm">₹{item.revenue.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopReportsPage;
