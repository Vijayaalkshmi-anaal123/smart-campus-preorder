import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ShopDetailsPage = ({ shopId, onBack, onCheckoutClick }) => {
  const { addToCart, items, cartCount, finalTotal, setIsCartOpen } = useCart();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchShopAndProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/shops/${shopId}/products`);
        if (res.data.success) {
          setShop(res.data.shop);
          setProducts(res.data.products);
          setCategories(['ALL', ...res.data.categories]);
        }
      } catch (err) {
        console.error("Failed to load shop products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShopAndProducts();
  }, [shopId]);

  const handleQtyChange = (productId, delta) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleAdd = (product) => {
    const qty = quantities[product.id] || 1;
    const added = addToCart(product, shop, qty);
    if (added) {
      // Reset local quantity to 1
      setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading shop menu...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-600">Shop not found.</p>
        <button onClick={onBack} className="mt-4 text-emerald-600 font-bold underline">
          Go back to shops
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Shops
      </button>

      {/* Shop Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl min-h-[220px] flex flex-col justify-end p-6 sm:p-10">
        <img
          src={shop.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&q=80'}
          alt={shop.name}
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black uppercase tracking-wider">
            <span>{shop.type} OUTLET</span>
            <span>•</span>
            <span>OPEN NOW</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{shop.name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {shop.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-300 pt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {shop.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Pre-Order & Pickup Ready
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat === 'ALL' ? '🍽️ All Products' : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search items in menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 pl-9 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((prod) => {
          const isOutOfStock = prod.stock_status === 'out_of_stock';
          const qty = quantities[prod.id] || 1;

          return (
            <div
              key={prod.id}
              className={`bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between ${
                isOutOfStock ? 'opacity-60 bg-slate-50' : ''
              }`}
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={prod.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {isOutOfStock ? (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-rose-600 text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow">
                        Out of Stock
                      </span>
                    </div>
                  ) : (
                    <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-slate-700 px-2.5 py-0.5 rounded-full">
                      {prod.category}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="text-base font-bold text-slate-800 leading-snug line-clamp-1">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                </div>
              </div>

              {/* Price and Cart Actions */}
              <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Price</span>
                    <span className="text-lg font-black text-slate-900">
                      ₹{prod.price}
                    </span>
                  </div>

                  {!isOutOfStock ? (
                    <div className="flex items-center gap-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => handleQtyChange(prod.id, -1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">{qty}</span>
                        <button
                          onClick={() => handleQtyChange(prod.id, 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => handleAdd(prod)}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 hover:scale-105 transition"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">Unavailable</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100">
          <p className="text-base font-bold text-slate-700">No items match your filter</p>
          <p className="text-xs text-slate-400 mt-1">Try searching with a different keyword or category.</p>
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-lg w-[90%] sm:w-full">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-800 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                {cartCount}
              </div>
              <div>
                <span className="text-xs text-slate-300 block">Total ({cartCount} items)</span>
                <span className="text-base font-extrabold text-white">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-3 py-2 text-xs font-bold text-slate-300 hover:text-white"
              >
                View Cart
              </button>
              <button
                onClick={onCheckoutClick}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Checkout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopDetailsPage;
