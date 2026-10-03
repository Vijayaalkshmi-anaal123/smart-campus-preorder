import React, { useEffect, useState } from 'react';
import {
  Store,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle,
  Coffee,
  BookOpen,
  Apple,
  UtensilsCrossed,
  Sandwich
} from 'lucide-react';
import api from '../services/api';

const shopIcons = {
  FRU: Apple,
  CAN: Coffee,
  TXT: BookOpen,
  CAF: UtensilsCrossed,
  ROL: Sandwich
};

const LandingPage = ({ onSelectShop, onExploreAllShops, onLoginClick }) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await api.get('/shops');
        if (res.data.success) {
          setShops(res.data.shops);
        }
      } catch (err) {
        console.error("Failed to load shops:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide shadow-xs animate-bounce">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Skip Long Campus Break Queues
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Pre-Order Food & Stationery <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                Pick Up Ready at Counter
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Order your favorite canteen snacks, fresh fruit juices, hot cafeteria biryani, kathi rolls, or lab stationery ahead of time. Get an exact ready time and collect without standing in lines!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={onExploreAllShops}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 hover:scale-105 transition flex items-center gap-2"
              >
                <span>Browse 5 Campus Shops</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onLoginClick}
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm rounded-2xl shadow-sm hover:shadow transition"
              >
                Test With Demo Accounts
              </button>
            </div>

            {/* Quick Benefits Pills */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 font-semibold max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-1.5 p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Zero Wait Time</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Pre-Paid Verified</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                <Zap className="w-4 h-4 text-indigo-500" />
                <span>Unique Token System</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                <Store className="w-4 h-4 text-rose-500" />
                <span>5 Campus Outlets</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Campus Shops Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <Store className="w-4 h-4" />
              <span>Campus Outlets</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Select a Shop to Pre-Order
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Choose from our 5 official campus outlets. Each outlet manages their own live kitchen queue.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full shrink-0">
            5 Shops Operational
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => {
              const IconComponent = shopIcons[shop.type] || Store;
              return (
                <div
                  key={shop.id}
                  onClick={() => onSelectShop(shop)}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={shop.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80'}
                      alt={shop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                    
                    {/* Shop Type Tag */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-slate-800 shadow-sm flex items-center gap-1.5">
                      <IconComponent className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{shop.type}</span>
                    </div>

                    <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                      OPEN NOW
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="text-lg font-black leading-tight drop-shadow-sm">
                        {shop.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-200 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{shop.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {shop.description}
                    </p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        {shop.product_count} Products Available
                      </span>
                      <button className="text-xs font-bold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>View Menu</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-900 text-white py-16 rounded-3xl max-w-7xl mx-auto px-6 sm:px-12 my-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl font-black tracking-tight mt-1">
            How Smart Campus Pre-Order Solves Waiting
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            No crowds, no cash chaos, and no rushing during short break intervals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-white">Select Shop & Menu</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open any of the 5 campus outlets. Add items with customized quantities to your digital cart.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-white">Pay & Get Token</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete mock payment via UPI or Smart ID. Instantly receive your unique token (e.g. CAN-1025).
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-white">Kitchen Prepares</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Shop owner receives only paid orders, sets estimated prep time (e.g. 15m), and updates progress live.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-lg">
              4
            </div>
            <h3 className="text-base font-bold text-white">Fast Counter Pickup</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive a ready notification bell. Walk to the counter, show your token, and collect immediately!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
