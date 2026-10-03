import React, { useState } from 'react';
import { LogIn, GraduationCap, Lock, Mail, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const demoLogins = [
  { role: 'Student', name: 'Rahul Sharma', email: 'student@campus.edu', pass: 'password123', badge: 'bg-emerald-100 text-emerald-800' },
  { role: 'Canteen Owner', name: 'Ramesh Kumar', email: 'canteen@campus.edu', pass: 'password123', badge: 'bg-amber-100 text-amber-800' },
  { role: 'Fruit Shop Owner', name: 'Anil Rao', email: 'fruit@campus.edu', pass: 'password123', badge: 'bg-orange-100 text-orange-800' },
  { role: 'Cafeteria Owner', name: 'Priya Nair', email: 'cafeteria@campus.edu', pass: 'password123', badge: 'bg-indigo-100 text-indigo-800' },
  { role: 'Roll Shop Owner', name: 'Sunil Verma', email: 'roll@campus.edu', pass: 'password123', badge: 'bg-rose-100 text-rose-800' },
  { role: 'Text Shop Owner', name: 'Kavita Reddy', email: 'text@campus.edu', pass: 'password123', badge: 'bg-blue-100 text-blue-800' },
  { role: 'Campus Admin', name: 'Admin Officer', email: 'admin@campus.edu', pass: 'admin123', badge: 'bg-purple-100 text-purple-800' },
];

const LoginPage = ({ onRegisterClick, onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100">
        
        {/* Left: Email/Password Form */}
        <div>
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <GraduationCap className="w-6 h-6" />
            <span className="text-xs uppercase font-extrabold tracking-wider">Campus Portal</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your orders, shop kitchen, or administrative tools.
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campus Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. student@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">Don't have an account yet? </span>
            <button
              onClick={onRegisterClick}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 ml-1 underline"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Right: Instant 1-Click Demo Accounts */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-extrabold uppercase tracking-wider">Fast Evaluation</span>
            </div>
            <h3 className="text-base font-black text-slate-900">1-Click Demo Logins</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Click any profile below to sign in instantly with seeded credentials:
            </p>

            <div className="space-y-2">
              {demoLogins.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleDemoClick(demo.email, demo.pass)}
                  className="w-full text-left p-2.5 bg-white hover:bg-emerald-50/60 rounded-xl border border-slate-200/80 hover:border-emerald-500 transition group flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${demo.badge}`}>
                        {demo.role}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{demo.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{demo.email}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 text-center">
            Pass: <code className="bg-white px-1.5 py-0.5 rounded text-slate-600">password123</code> (Admin: <code className="bg-white px-1.5 py-0.5 rounded text-slate-600">admin123</code>)
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
