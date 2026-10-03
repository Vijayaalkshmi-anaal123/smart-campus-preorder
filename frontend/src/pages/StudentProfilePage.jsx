import React, { useState } from 'react';
import { User, Mail, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StudentProfilePage = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/auth/profile', { name, phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6 pb-24">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-2xl">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">{user?.name}</h2>
            <span className="text-xs font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">
              Role: {user?.role}
            </span>
          </div>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 uppercase mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 text-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 uppercase mb-1">Mobile Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition"
          >
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentProfilePage;
