import React from 'react';
import { Clock, CheckCircle2, AlertCircle, ChefHat, Bell, XCircle } from 'lucide-react';

const OrderStatusBadge = ({ status }) => {
  const configs = {
    ORDER_PLACED: {
      label: 'Order Placed',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
      pulse: true
    },
    ACCEPTED: {
      label: 'Accepted',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: CheckCircle2,
      pulse: true
    },
    PREPARING: {
      label: 'Preparing',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: ChefHat,
      pulse: true
    },
    READY: {
      label: 'Ready for Pickup',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Bell,
      pulse: true
    },
    COMPLETED: {
      label: 'Completed / Collected',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: CheckCircle2,
      pulse: false
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      pulse: false
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-red-50 text-red-700 border-red-200',
      icon: AlertCircle,
      pulse: false
    }
  };

  const config = configs[status] || {
    label: status,
    bg: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Clock,
    pulse: false
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
      <Icon className={`w-3.5 h-3.5 ${config.pulse ? 'animate-pulse' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
};

export default OrderStatusBadge;
