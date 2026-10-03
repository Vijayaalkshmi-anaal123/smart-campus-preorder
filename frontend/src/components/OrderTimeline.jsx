import React from 'react';
import { CreditCard, CheckCircle2, ChefHat, Bell, Sparkles } from 'lucide-react';

const OrderTimeline = ({ order }) => {
  if (!order) return null;

  const statusOrder = ['ORDER_PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];
  const currentIndex = statusOrder.indexOf(order.order_status);
  const isRejected = order.order_status === 'REJECTED';
  const isCancelled = order.order_status === 'CANCELLED';

  const steps = [
    {
      key: 'ORDER_PLACED',
      label: 'Order Placed',
      sublabel: 'Payment Verified (PAID)',
      icon: CreditCard,
    },
    {
      key: 'ACCEPTED',
      label: 'Accepted',
      sublabel: `${order.shop_name || 'Shop'} Confirmed`,
      icon: CheckCircle2,
    },
    {
      key: 'PREPARING',
      label: 'Preparing',
      sublabel: order.estimated_minutes
        ? `~${order.estimated_minutes} mins estimated`
        : 'In kitchen',
      icon: ChefHat,
    },
    {
      key: 'READY',
      label: 'Ready for Pickup',
      sublabel: `Collect at ${order.shop_location || 'Shop Counter'}`,
      icon: Bell,
    },
    {
      key: 'COMPLETED',
      label: 'Collected',
      sublabel: 'Order Completed',
      icon: Sparkles,
    },
  ];

  if (isRejected || isCancelled) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 my-4 text-center">
        <h4 className="text-base font-bold text-rose-800">
          Order {isRejected ? 'Rejected' : 'Cancelled'}
        </h4>
        <p className="text-sm text-rose-600 mt-1">
          {order.rejection_reason || 'This order was cancelled.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full my-6">
      {/* Estimated Ready Time Banner if Preparing */}
      {order.order_status === 'PREPARING' && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl p-4 mb-6 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-100">Live Kitchen Status</span>
            <h4 className="text-lg font-bold">Estimated Ready Time</h4>
            <p className="text-sm text-amber-100">
              {order.estimated_ready_time
                ? new Date(order.estimated_ready_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '10-15 mins'}
            </p>
          </div>
          <div className="text-right bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            <span className="text-xs font-medium block">Approx Duration</span>
            <span className="text-2xl font-black">{order.estimated_minutes || 15}m</span>
          </div>
        </div>
      )}

      {/* Ready Alert Banner */}
      {order.order_status === 'READY' && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl p-4 mb-6 shadow-lg flex items-center justify-between animate-pulse">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200">Action Required</span>
            <h4 className="text-xl font-bold">🔔 Your Order is Ready!</h4>
            <p className="text-sm text-emerald-100">
              Please proceed to {order.shop_name} ({order.shop_location}) to pick up your order.
            </p>
          </div>
          <div className="bg-white text-emerald-800 font-extrabold px-3 py-1.5 rounded-md text-sm">
            Ready Now
          </div>
        </div>
      )}

      {/* Horizontal Steps */}
      <div className="relative flex items-center justify-between">
        {/* Background Connecting Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0" />
        
        {/* Active Filled Line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 z-0"
          style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center text-center max-w-[90px]">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                  isDone
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                } ${isCurrent ? 'scale-110 ring-4 ring-emerald-300 animate-bounce' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`mt-2 text-xs font-bold leading-tight ${isCurrent ? 'text-emerald-700' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                {step.sublabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
