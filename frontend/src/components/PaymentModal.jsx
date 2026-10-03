import React, { useState } from 'react';
import { X, ShieldCheck, QrCode, CreditCard, Wallet, Smartphone, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

const PaymentModal = ({ isOpen, onClose, shop, items, totalAmount, notes, onSuccess }) => {
  const [method, setMethod] = useState('UPI');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const paymentMethods = [
    { id: 'UPI', name: 'UPI / QR Code', desc: 'GPay, PhonePe, Paytm', icon: Smartphone },
    { id: 'CAMPUS_WALLET', name: 'Campus Smart ID Card', desc: 'Pre-paid college balance', icon: Wallet },
    { id: 'CARD', name: 'Debit / Credit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
  ];

  const handlePay = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Simulate gateway handshake delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const payload = {
        shop_id: shop.id,
        items: items.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
        })),
        payment_method: method,
        simulate_failure: simulateFailure,
        notes: notes || '',
      };

      const res = await api.post('/orders/checkout-and-pay', payload);

      if (res.data.success && res.data.payment_status === 'PAID') {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        setIsProcessing(false);
        onSuccess(res.data.order);
      } else {
        setErrorMessage(res.data.message || 'Payment failed.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Payment was unsuccessful or rejected by banking gateway.';
      setErrorMessage(msg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Campus Pay Gateway</h3>
              <p className="text-xs text-slate-500">Order from: {shop?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-600 transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-500 block">Total Amount to Pay</span>
            <span className="text-3xl font-extrabold text-slate-900">₹{totalAmount?.toFixed(2)}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Items Count</span>
            <span className="text-sm font-semibold text-slate-700">{items?.length} products</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2.5 mb-5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Payment Method:
          </label>
          {paymentMethods.map((m) => {
            const Icon = m.icon;
            const isSelected = method === m.id;
            return (
              <div
                key={m.id}
                onClick={() => !isProcessing && setMethod(m.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800">{m.name}</h5>
                    <p className="text-xs text-slate-500">{m.desc}</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* UPI QR Display if UPI is selected */}
        {method === 'UPI' && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 mb-4 text-center">
            <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl shadow-inner border border-emerald-200 flex items-center justify-center">
              <QrCode className="w-24 h-24 text-slate-800" />
            </div>
            <p className="text-xs font-semibold text-emerald-800 mt-2">
              Scan & Pay using any UPI App
            </p>
            <p className="text-[11px] text-emerald-600">campus.preorder@bank</p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Simulated Failure Toggle for Testing */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 mb-6 flex items-start gap-2.5">
          <input
            id="fail-check"
            type="checkbox"
            checked={simulateFailure}
            onChange={(e) => setSimulateFailure(e.target.checked)}
            className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
          />
          <label htmlFor="fail-check" className="text-xs text-amber-900 cursor-pointer">
            <span className="font-bold">Test Scenario: Simulate Payment Failure</span>
            <span className="block text-[11px] text-amber-700">
              Check this box to test that a failed payment does NOT send an order to the shop owner.
            </span>
          </label>
        </div>

        {/* Security badge & Pay Button */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            256-bit Secure Demo Sandbox
          </span>
          <span>No real card info stored</span>
        </div>

        <button
          onClick={handlePay}
          disabled={isProcessing}
          className={`w-full py-3.5 px-6 rounded-2xl text-base font-extrabold text-white shadow-lg transition flex items-center justify-center gap-2 ${
            simulateFailure
              ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
          } disabled:opacity-60`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <span>{simulateFailure ? 'Simulate Failed Payment' : `Pay ₹${totalAmount?.toFixed(2)} & Confirm`}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
