import React, { useState } from 'react';
import {
  GraduationCap,
  ShoppingBag,
  Store,
  Clock,
  Shield,
  ChefHat,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NotificationBell from './NotificationBell';

const Navbar = ({ onNavigate, currentTab }) => {
  const { user, logout, isStudent, isShopOwner, isAdmin, quickLogin } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);

  const demoRoles = [
    { label: 'Student (Rahul)', email: 'student@campus.edu', pass: 'password123', color: 'bg-emerald-500' },
    { label: 'Canteen Owner (Ramesh)', email: 'canteen@campus.edu', pass: 'password123', color: 'bg-amber-500' },
    { label: 'Fruit Shop Owner (Anil)', email: 'fruit@campus.edu', pass: 'password123', color: 'bg-orange-500' },
    { label: 'Cafeteria Owner (Priya)', email: 'cafeteria@campus.edu', pass: 'password123', color: 'bg-indigo-500' },
    { label: 'Roll Shop Owner (Sunil)', email: 'roll@campus.edu', pass: 'password123', color: 'bg-rose-500' },
    { label: 'Text Shop Owner (Kavita)', email: 'text@campus.edu', pass: 'password123', color: 'bg-blue-500' },
    { label: 'Campus Admin', email: 'admin@campus.edu', pass: 'admin123', color: 'bg-purple-600' }
  ];

  const handleRoleSwitch = async (email, pass) => {
    try {
      await quickLogin(email, pass);
      setDemoSwitchOpen(false);
      onNavigate('home');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-base sm:text-lg text-slate-900 tracking-tight block leading-tight">
                SmartCampus<span className="text-emerald-600">Order</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Multi-Shop Pre-Ordering
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {(!user || isStudent) && (
              <>
                <button
                  onClick={() => onNavigate('shops')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentTab === 'shops' || currentTab === 'home'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Campus Shops
                </button>
                {user && (
                  <button
                    onClick={() => onNavigate('orders')}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                      currentTab === 'orders'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    My Orders
                  </button>
                )}
              </>
            )}

            {isShopOwner && (
              <>
                <button
                  onClick={() => onNavigate('owner-dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentTab === 'owner-dashboard'
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                  Kitchen Orders
                </button>
                <button
                  onClick={() => onNavigate('owner-products')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentTab === 'owner-products'
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Menu & Prices
                </button>
                <button
                  onClick={() => onNavigate('owner-reports')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentTab === 'owner-reports'
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Sales Reports
                </button>
              </>
            )}

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                  currentTab === 'admin-dashboard'
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Console
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-emerald-400 bg-emerald-50/50 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition"
              >
                <span>⚡ Switch Demo Role</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {demoSwitchOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b mb-1">
                    Instant Demo Switcher
                  </div>
                  {demoRoles.map((role) => (
                    <button
                      key={role.email}
                      onClick={() => handleRoleSwitch(role.email, role.pass)}
                      className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-2 transition"
                    >
                      <div className={`w-2 h-2 rounded-full ${role.color}`} />
                      <span>{role.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {user && <NotificationBell onOrderClick={(orderId) => onNavigate('orders', { orderId })} />}

            {/* Cart Icon (For Students or Guests) */}
            {(!user || isStudent) && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-scale shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth Buttons or User Menu */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                    {user.role === 'shop_owner' ? user.shop?.name || 'Shop Owner' : user.role}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('profile')}
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                  title="My Profile"
                >
                  <User className="w-5 h-5" />
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2">
          {(!user || isStudent) && (
            <>
              <button
                onClick={() => { onNavigate('shops'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-50"
              >
                Campus Shops
              </button>
              {user && (
                <button
                  onClick={() => { onNavigate('orders'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-50"
                >
                  My Orders
                </button>
              )}
            </>
          )}

          {isShopOwner && (
            <>
              <button
                onClick={() => { onNavigate('owner-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-50"
              >
                Kitchen Orders
              </button>
              <button
                onClick={() => { onNavigate('owner-products'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-50"
              >
                Menu & Prices
              </button>
              <button
                onClick={() => { onNavigate('owner-reports'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-50"
              >
                Sales Reports
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => { onNavigate('admin-dashboard'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-50"
            >
              Admin Console
            </button>
          )}

          <div className="pt-2 border-t text-xs">
            <span className="font-bold text-slate-400 block px-3 py-1">Quick Switch Demo Account</span>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {demoRoles.slice(0, 4).map(r => (
                <button
                  key={r.email}
                  onClick={() => { handleRoleSwitch(r.email, r.pass); setMobileMenuOpen(false); }}
                  className="text-left px-2 py-1.5 text-[11px] rounded bg-slate-50 hover:bg-emerald-50 truncate"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
