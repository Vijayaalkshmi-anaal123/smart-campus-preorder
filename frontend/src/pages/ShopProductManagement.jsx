import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Store, Search, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

const ShopProductManagement = () => {
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: '',
    stock_status: 'available',
  });

  const fetchShopProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shops/my-shop');
      if (res.data.success) {
        setShop(res.data.shop);
        setProducts(res.data.shop.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopProducts();
  }, []);

  const handleToggleStock = async (product) => {
    const nextStatus = product.stock_status === 'available' ? 'out_of_stock' : 'available';
    try {
      const res = await api.put(`/shops/${shop.id}/products/${product.id}`, {
        stock_status: nextStatus
      });
      if (res.data.success) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock_status: nextStatus } : p));
      }
    } catch (err) {
      alert("Failed to update stock status");
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await api.delete(`/shops/${shop.id}/products/${productId}`);
      if (res.data.success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      }
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Edit existing
        const res = await api.put(`/shops/${shop.id}/products/${editingProduct.id}`, formData);
        if (res.data.success) {
          setProducts(prev => prev.map(p => p.id === editingProduct.id ? res.data.product : p));
          setEditingProduct(null);
        }
      } else {
        // Add new
        const res = await api.post(`/shops/${shop.id}/products`, formData);
        if (res.data.success) {
          setProducts(prev => [res.data.product, ...prev]);
          setIsAddModalOpen(false);
        }
      }
      setFormData({ name: '', category: '', price: '', description: '', image: '', stock_status: 'available' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category || '',
      price: p.price,
      description: p.description || '',
      image: p.image || '',
      stock_status: p.stock_status || 'available',
    });
    setIsAddModalOpen(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Menu & Inventory Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Outlet: {shop?.name} • Manage pricing, products, and out-of-stock toggles.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', category: 'General', price: '', description: '', image: '', stock_status: 'available' });
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="max-w-sm relative">
        <input
          type="text"
          placeholder="Search products in your menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3.5 py-2 pl-9 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Item Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80'}
                      alt={p.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">{p.name}</span>
                      <span className="text-[11px] text-slate-400 line-clamp-1">{p.description}</span>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-600">{p.category}</td>
                  <td className="p-4 font-black text-slate-900 text-sm">₹{p.price}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStock(p)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition ${
                        p.stock_status === 'available'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {p.stock_status === 'available' ? 'In Stock (Active)' : 'Out of Stock'}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      title="Edit Product & Price"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 animate-in fade-in">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-4">
              {editingProduct ? 'Edit Product Details' : 'Add New Product to Menu'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Dosa / Kurkure Munch"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Snacks, Juices"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    placeholder="e.g. 40"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Brief item ingredients or flavour..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopProductManagement;
