import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShopDetailsPage from './pages/ShopDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import StudentProfilePage from './pages/StudentProfilePage';
import ShopOwnerDashboard from './pages/ShopOwnerDashboard';
import ShopProductManagement from './pages/ShopProductManagement';
import ShopReportsPage from './pages/ShopReportsPage';
import AdminDashboard from './pages/AdminDashboard';
import { Bell, X, CheckCircle2, ChefHat, Sparkles } from 'lucide-react';

const MainApp = () => {
  const { user, isStudent, isShopOwner, isAdmin } = useAuth();
  const { setIsCartOpen } = useCart();
  const { activeAlert, setActiveAlert } = useSocket();

  const [currentView, setCurrentView] = useState('home');
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const handleNavigate = (view, params = {}) => {
    if (params.shopId) {
      setSelectedShopId(params.shopId);
    }
    if (params.order) {
      setConfirmedOrder(params.order);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Banner Alert for Live Socket Messages */}
      {activeAlert && (
        <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 shadow-xl flex items-center justify-between z-50 sticky top-0 animate-in slide-in-from-top">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 animate-pulse">
              🔔
            </div>
            <div>
              <h5 className="text-xs font-bold text-emerald-400">{activeAlert.title}</h5>
              <p className="text-xs text-slate-200">{activeAlert.message}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveAlert(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <Navbar onNavigate={handleNavigate} currentTab={currentView} />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onCheckoutClick={() => {
          setIsCartOpen(false);
          handleNavigate('checkout');
        }}
      />

      {/* Dynamic Views */}
      <main className="flex-1">
        {currentView === 'home' && (
          <LandingPage
            onSelectShop={(shop) => {
              setSelectedShopId(shop.id);
              setCurrentView('shop-details');
            }}
            onExploreAllShops={() => {
              const shopElem = document.getElementById('campus-shops');
              if (shopElem) {
                shopElem.scrollIntoView({ behavior: 'smooth' });
              } else {
                setCurrentView('home');
              }
            }}
            onLoginClick={() => setCurrentView('login')}
          />
        )}

        {currentView === 'shops' && (
          <LandingPage
            onSelectShop={(shop) => {
              setSelectedShopId(shop.id);
              setCurrentView('shop-details');
            }}
            onExploreAllShops={() => {}}
            onLoginClick={() => setCurrentView('login')}
          />
        )}

        {currentView === 'shop-details' && selectedShopId && (
          <ShopDetailsPage
            shopId={selectedShopId}
            onBack={() => setCurrentView('home')}
            onCheckoutClick={() => setCurrentView('checkout')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onBack={() => setCurrentView(selectedShopId ? 'shop-details' : 'home')}
            onRequireLogin={() => setCurrentView('login')}
            onOrderSuccess={(order) => {
              setConfirmedOrder(order);
              setCurrentView('order-confirmation');
            }}
          />
        )}

        {currentView === 'order-confirmation' && confirmedOrder && (
          <OrderConfirmationPage
            initialOrder={confirmedOrder}
            onTrackOrder={() => setCurrentView('orders')}
            onHomeClick={() => setCurrentView('home')}
          />
        )}

        {currentView === 'orders' && (
          <OrderHistoryPage
            onViewOrderDetails={(order) => {
              setConfirmedOrder(order);
              setCurrentView('order-confirmation');
            }}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onRegisterClick={() => setCurrentView('register')}
            onSuccess={() => {
              if (user?.role === 'shop_owner') {
                setCurrentView('owner-dashboard');
              } else if (user?.role === 'admin') {
                setCurrentView('admin-dashboard');
              } else {
                setCurrentView('home');
              }
            }}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onLoginClick={() => setCurrentView('login')}
            onSuccess={() => setCurrentView('home')}
          />
        )}

        {currentView === 'profile' && <StudentProfilePage />}

        {/* Shop Owner Views */}
        {currentView === 'owner-dashboard' && <ShopOwnerDashboard />}
        {currentView === 'owner-products' && <ShopProductManagement />}
        {currentView === 'owner-reports' && <ShopReportsPage />}

        {/* Admin Views */}
        {currentView === 'admin-dashboard' && <AdminDashboard />}
      </main>

      {/* University Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-700">
            Smart Campus Multi-Shop Pre-Ordering and Management System
          </p>
          <p className="text-slate-400">
            Eliminating break-time queues across Fruit Shop, Canteen, Text Shop, Cafeteria & Roll Shop.
          </p>
          <p className="text-[11px] text-slate-400 pt-2">
            © 2026 Campus Food & Retail Management Services. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <MainApp />
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  );
}
