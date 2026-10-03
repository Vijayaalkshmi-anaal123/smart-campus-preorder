import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ onCheckoutClick }) => {
  const {
    items,
    currentShop,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    finalTotal,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Your Campus Cart</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Shop Tag */}
          {currentShop && (
            <div className="bg-emerald-50/60 px-5 py-2.5 border-b border-emerald-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                <Store className="w-3.5 h-3.5 text-emerald-700" />
                <span>Shop: {currentShop.name}</span>
              </div>
              <button
                onClick={clearCart}
                className="text-emerald-700 hover:text-rose-600 font-medium transition"
              >
                Clear
              </button>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingBag className="w-16 h-16 stroke-1 text-slate-300 mb-3" />
                <h4 className="text-base font-bold text-slate-700">Your cart is empty</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Browse through our 5 campus shops and pre-order your favorite food or supplies!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow hover:bg-emerald-700 transition"
                >
                  Explore Shops
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="py-4 flex gap-3 items-center">
                  <img
                    src={item.product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&q=80'}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-slate-500">₹{item.product.price} each</p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total for this item */}
                      <span className="text-sm font-extrabold text-slate-900">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Campus Convenience Fee</span>
                <span className="text-emerald-600 font-bold">FREE (₹0.00)</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Final Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  if (onCheckoutClick) onCheckoutClick();
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Prices and availability strictly verified on the backend.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
