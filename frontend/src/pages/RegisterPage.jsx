import React, { useState } from 'react';
import { UserPlus, User, Mail, Phone, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = ({ onLoginClick, onSuccess }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, phone, password, role });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try with another email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100">
        <button
          onClick={onLoginClick}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </button>

        <div className="flex items-center gap-2 text-emerald-600 mb-1">
          <UserPlus className="w-5 h-5" />
          <span className="text-xs uppercase font-extrabold tracking-wider">Join Campus Network</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h2>
        <p className="text-xs text-slate-500 mt-1">
          Sign up to pre-order food & stationery before breaks.
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
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 pl-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 pl-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mobile Phone
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 pl-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  role === 'student'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => setRole('shop_owner')}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  role === 'shop_owner'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                🏪 Shop Owner
              </button>
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
                placeholder="At least 6 characters"
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
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <span className="text-xs text-slate-500">Already registered? </span>
          <button
            onClick={onLoginClick}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 ml-1 underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
