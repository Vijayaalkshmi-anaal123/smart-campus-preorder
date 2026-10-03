import React, { useState } from 'react';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Store,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

const CheckoutPage = ({ onBack, onOrderSuccess, onRequireLogin }) => {
  const { user } = useAuth();
  const {
    items,
    currentShop,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    finalTotal
  } = useCart();

  const [notes, setNotes] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Add some delicious food or study items before checking out.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-700 transition"
        >
          Explore Campus Shops
        </button>
      </div>
    );
  }

  const handlePayClick = () => {
    if (!user) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menu
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Checkout & Pre-Order
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your items and pay to send your order directly to the kitchen queue.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left: Cart Items List */}
        <div className="md:col-span-2 space-y-4">
          {/* Outlet Info */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-800">
                  Pre-Ordering From:
                </span>
                <h4 className="text-sm font-black text-slate-900">{currentShop?.name}</h4>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  {currentShop?.location}
                </span>
              </div>
            </div>
            <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
              {currentShop?.type}
            </span>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                <img
                  src={item.product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&q=80'}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate">
                    {item.product.name}
                  </h4>
                  <span className="text-xs text-slate-500">₹{item.product.price} each</span>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-300 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900 block">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Notes to Shop */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Special Instructions / Kitchen Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Less spicy, pack parcel, extra tissue..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Payment & Total Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-base font-black text-slate-900">Order Summary</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-bold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Campus Pre-Order Fee</span>
                <span className="font-bold text-emerald-600">FREE (₹0.00)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & GST</span>
                <span className="font-bold text-slate-700">Included</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900">Final Total</span>
                <span className="text-2xl font-black text-emerald-600">
                  ₹{finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Crucial Note about Payment-First Requirement */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Queue Policy:</strong> Payment is verified before the shop receives your order. Once paid, a unique order token is generated.
              </span>
            </div>

            <button
              onClick={handlePayClick}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Pay ₹{finalTotal.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          shop={currentShop}
          items={items}
          totalAmount={finalTotal}
          notes={notes}
          onSuccess={(confirmedOrder) => {
            clearCart();
            setIsPaymentModalOpen(false);
            if (onOrderSuccess) onOrderSuccess(confirmedOrder);
          }}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
