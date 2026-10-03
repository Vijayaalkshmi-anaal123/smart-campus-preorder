import React, { useState } from 'react';
import { X, Clock, Flame } from 'lucide-react';

const PrepTimeModal = ({ isOpen, onClose, onConfirm, initialMinutes = 15, title = "Set Preparation Time" }) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const now = new Date();
  const calculatedReadyTime = new Date(now.getTime() + minutes * 60000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(minutes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">Student will see this estimated ready time.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Quick presets */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[10, 15, 20, 30].map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMinutes(m)}
                className={`py-2 text-sm font-semibold rounded-lg border transition ${
                  minutes === m
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {m} mins
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Custom Duration (minutes):
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="120"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 pl-9 text-lg font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Real-time Preview */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex items-center justify-between">
            <span className="text-xs font-medium text-amber-900">Expected Ready Time:</span>
            <span className="text-base font-extrabold text-amber-700">
              {calculatedReadyTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow transition disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Confirm Time'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrepTimeModal;
