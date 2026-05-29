import { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, Trash2, ListOrdered, FolderPlus, ShoppingBag, RefreshCw, PenSquare, Eye, X, UserCheck, ShieldAlert, Sparkles, Calendar, Star, Percent, Settings, CheckCircle } from 'lucide-react';
import API from '../services/api';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dashboard Core State
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Add/Edit Product Form state
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    category: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    images: '',
  });
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editProductId, setEditProductId] = useState('');

  // 2. Add Category Form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');

  // 3. Add Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: '',
    minPurchase: '',
    expiryDate: '',
  });

  const clearSuccess = () => setTimeout(() => setSuccess(''), 3000);

  // Fetch Methods
  const fetchAnalytics = async () => {
    try {
      const response = await API.get('/analytics/stats');
      setAnalytics(response.data.data);
    } catch (err) {
      console.error('Failed to load dashboard analytics:', err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await API.get('/products?limit=100');
      setProducts(response.data.data);
    } catch (err) {
      console.error('Failed to load admin products:', err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories');
      setCategories(response.data.data);
    } catch (err) {
      console.error('Failed to load categories:', err.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await API.get('/orders');
      setOrders(response.data.data);
    } catch (err) {
      console.error('Failed to load orders:', err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await API.get('/users');
      setUsers(response.data.data);
    } catch (err) {
      console.error('Failed to load users:', err.message);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await API.get('/reviews');
      setAllReviews(response.data.data);
    } catch (err) {
      console.error('Failed to load reviews:', err.message);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await API.get('/coupons');
      setCoupons(response.data.data);
    } catch (err) {
      console.error('Failed to load coupons:', err.message);
    }
  };

  const loadAllDashboardStats = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        fetchAnalytics(),
        fetchProducts(),
        fetchCategories(),
        fetchOrders(),
        fetchUsers(),
        fetchReviews(),
        fetchCoupons(),
      ]);
    } catch (err) {
      setError('Failed to refresh core stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllDashboardStats();
  }, []);

  // Specifications management helper hooks
  const handleAddSpecField = () => setSpecifications([...specifications, { key: '', value: '' }]);
  const handleRemoveSpecField = (idx) => setSpecifications(specifications.filter((_, i) => i !== idx));
  const handleSpecFieldChange = (idx, field, val) => {
    const updated = [...specifications];
    updated[idx][field] = val;
    setSpecifications(updated);
  };

  // Product CRUD Action Handlers
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, brand, category, description, price, discountPrice, stock, images } = productForm;
    if (!name || !brand || !category || !description || !price || !stock) {
      setError('Please fill in all required product fields.');
      return;
    }

    const filteredSpecs = specifications.filter((s) => s.key && s.value);
    const parsedImages = images.split(',').map((img) => img.trim()).filter(Boolean);

    const payload = {
      name,
      brand,
      category,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      stock: Number(stock),
      images: parsedImages.length > 0 ? parsedImages : undefined,
      specifications: filteredSpecs,
    };

    setActionLoading(true);
    try {
      if (isEditingProduct) {
        await API.put(`/products/${editProductId}`, payload);
        setSuccess('Product updated successfully!');
      } else {
        await API.post('/products', payload);
        setSuccess('Product created successfully!');
      }

      setProductForm({ name: '', brand: '', category: '', description: '', price: '', discountPrice: '', stock: '', images: '' });
      setSpecifications([{ key: '', value: '' }]);
      setIsEditingProduct(false);
      setEditProductId('');
      
      await fetchProducts();
      await fetchAnalytics();
      clearSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditInit = (prod) => {
    setProductForm({
      name: prod.name,
      brand: prod.brand,
      category: prod.category,
      description: prod.description,
      price: prod.price,
      discountPrice: prod.discountPrice || '',
      stock: prod.stock,
      images: prod.images.join(', '),
    });
    setSpecifications(prod.specifications?.length > 0 ? prod.specifications : [{ key: '', value: '' }]);
    setIsEditingProduct(true);
    setEditProductId(prod._id);
    setActiveTab('products'); // redirect to view form if edit pressed from other columns
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${prodId}`);
      setSuccess('Product deleted.');
      await fetchProducts();
      await fetchAnalytics();
      clearSuccess();
    } catch (err) {
      setError('Failed to delete product.');
    }
  };

  // Category CRUD Handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!categoryName || !categoryImage) {
      setError('Name and image fields are required.');
      return;
    }

    try {
      await API.post('/categories', { name: categoryName, image: categoryImage });
      setSuccess('Category created successfully!');
      setCategoryName('');
      setCategoryImage('');
      await fetchCategories();
      clearSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await API.delete(`/categories/${catId}`);
      setSuccess('Category removed.');
      await fetchCategories();
      clearSuccess();
    } catch (err) {
      setError('Failed to remove category.');
    }
  };

  // Order status management
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      setSuccess(`Order status updated to ${newStatus}`);
      await fetchOrders();
      await fetchAnalytics();
      clearSuccess();
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  // Admin User Role Management
  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/users/${userId}/role`, { role: newRole });
      setSuccess(`User role updated to ${newRole}`);
      await fetchUsers();
      await fetchAnalytics();
      clearSuccess();
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user profile?')) return;
    try {
      await API.delete(`/users/${userId}`);
      setSuccess('User profile removed.');
      await fetchUsers();
      await fetchAnalytics();
      clearSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user profile');
    }
  };

  // Global Reviews Deletion Moderation
  const handleDeleteGlobalReview = async (revId) => {
    if (!window.confirm('Are you sure you want to moderate and delete this comment?')) return;
    try {
      await API.delete(`/reviews/${revId}`);
      setSuccess('Review moderated and deleted.');
      await fetchReviews();
      clearSuccess();
    } catch (err) {
      setError('Failed to moderate review.');
    }
  };

  // Coupons CRUD Engine Handlers
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { code, discountType, discountValue, minPurchase, expiryDate } = couponForm;
    if (!code || !discountValue || !expiryDate) {
      setError('Code, Value, and Expiry fields are required.');
      return;
    }

    try {
      await API.post('/coupons', {
        code,
        discountType,
        discountValue,
        minPurchase: minPurchase || 0,
        expiryDate,
      });

      setSuccess('Coupon code created successfully!');
      setCouponForm({ code: '', discountType: 'Percentage', discountValue: '', minPurchase: '', expiryDate: '' });
      await fetchCoupons();
      clearSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create coupon code');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await API.delete(`/coupons/${couponId}`);
      setSuccess('Coupon code removed.');
      await fetchCoupons();
      clearSuccess();
    } catch (err) {
      setError('Failed to delete coupon.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
      
      {/* Top dashboard title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 tracking-tight">
          <LayoutDashboard className="w-5.5 h-5.5 text-sky-500" />
          Admin Workspace Center
        </h1>
        
        <button
          onClick={loadAllDashboardStats}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Tabs navigation list */}
      <div className="flex gap-2 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-sky-500 bg-sky-50 text-sky-600'
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Overview & Analytics
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 cursor-pointer ${
            activeTab === 'products'
              ? 'border-sky-500 bg-sky-50 text-sky-600'
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Inventory ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 cursor-pointer ${
            activeTab === 'categories'
              ? 'border-sky-500 bg-sky-50 text-sky-600'
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-sky-500 bg-sky-50 text-sky-600'
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 cursor-pointer ${
            activeTab === 'users'
              ? 'border-sky-500 bg-sky-50 text-sky-600'
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Users ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-sky-500 bg-sky-50 text-sky-600'
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Star className="w-4 h-4" />
          Reviews ({allReviews.length})
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 cursor-pointer ${
            activeTab === 'coupons'
              ? 'border-sky-500 bg-sky-50 text-sky-600'
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Percent className="w-4 h-4" />
          Coupons ({coupons.length})
        </button>
      </div>

      {/* Dynamic Alerts */}
      {error && <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 p-3.5 rounded-xl">{error}</p>}
      {success && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl">{success}</p>}

      {/* Dashboard tab switches */}
      <div className="min-h-[45vh]">

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8">
            
            {/* Aggregate counters grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                <p className="text-2xl font-extrabold text-slate-800">₹{analytics.counters.totalRevenue.toLocaleString('en-IN')}</p>
                <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">Online/COD Delivered</span>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Volume</span>
                <p className="text-2xl font-extrabold text-slate-800">{analytics.counters.totalOrders}</p>
                <span className="text-[9px] font-semibold text-slate-400 uppercase">Checkouts Placed</span>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Customers</span>
                <p className="text-2xl font-extrabold text-slate-800">{analytics.counters.totalUsers}</p>
                <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">Registered Users</span>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Catalog</span>
                <p className="text-2xl font-extrabold text-slate-800">{analytics.counters.totalProducts}</p>
                <span className="text-[9px] font-semibold text-slate-400 uppercase">Active Inventory</span>
              </div>
            </div>

            {/* Simulated progress charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Category Sales Distribution */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Category Sales Allocations</h3>
                
                <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                  {analytics.categorySales.map((cat, idx) => {
                    const pct = Math.round((cat.revenue / analytics.counters.totalRevenue) * 100) || 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                          <span>{cat.category} ({cat.units} sold)</span>
                          <span>₹{cat.revenue.toLocaleString('en-IN')} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Revenue chart visual items */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Monthly Sales Pipeline</h3>
                
                <div className="flex justify-between items-end h-48 pt-6 border-b border-slate-100">
                  {analytics.monthlySales.map((mon, idx) => {
                    const maxRev = Math.max(...analytics.monthlySales.map((m) => m.revenue)) || 1;
                    const heightPct = Math.round((mon.revenue / maxRev) * 100) || 10;
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 group relative">
                        {/* Hover tooltip */}
                        <span className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 bg-slate-800 text-white text-[9px] font-bold py-1 px-2 rounded shadow-md z-10 transition-opacity whitespace-nowrap">
                          ₹{mon.revenue.toLocaleString('en-IN')}
                        </span>
                        
                        {/* Bar */}
                        <div
                          className="bg-gradient-to-t from-sky-500 to-sky-400 w-10 sm:w-12 rounded-t-lg transition-all duration-700"
                          style={{ height: `${heightPct}%` }}
                        ></div>
                        
                        {/* Label */}
                        <span className="text-[10px] text-slate-400 font-bold mt-2 rotate-12 sm:rotate-0">{mon.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Inventory Alerts section */}
            {analytics.lowStockAlerts.length > 0 && (
              <div className="bg-white border border-rose-200/60 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-rose-100 pb-3">
                  <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />
                  Critical Low-Stock Alerts (Inventory count $\leq$ 5)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {analytics.lowStockAlerts.map((prod) => (
                    <div key={prod._id} className="flex items-center gap-3 border border-rose-100 bg-rose-50/20 p-3 rounded-2xl">
                      <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 object-cover rounded-xl border border-rose-100" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{prod.name}</h4>
                        <span className="text-[9px] font-extrabold text-rose-600 uppercase tracking-wider">
                          Only {prod.stock} units remaining!
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: PRODUCTS CRUD */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Product form panel */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4.5 h-4.5 text-sky-500" />
                {isEditingProduct ? 'Edit Catalog Product' : 'Add New Product'}
              </h3>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Pro Headphones"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Brand *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Brand"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category *</label>
                    <select
                      className="input-field py-2"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      <option value="">Choose...</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description *</label>
                  <textarea
                    rows="3"
                    className="input-field"
                    placeholder="Product details..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price (₹) *</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="₹"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Discount ₹</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="₹"
                      value={productForm.discountPrice}
                      onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stock *</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Qty"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Images (URLs, comma separated)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="URL1, URL2, URL3"
                    value={productForm.images}
                    onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                  />
                </div>

                {/* Specs sub-fields */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Specifications</span>
                    <button
                      type="button"
                      onClick={handleAddSpecField}
                      className="text-[10px] text-sky-600 font-bold hover:text-sky-700"
                    >
                      + Add row
                    </button>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {specifications.map((s, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Key"
                          className="w-1/2 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none"
                          value={s.key}
                          onChange={(e) => handleSpecFieldChange(idx, 'key', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          className="w-1/2 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none"
                          value={s.value}
                          onChange={(e) => handleSpecFieldChange(idx, 'value', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecField(idx)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    {isEditingProduct ? 'Update Product' : 'Create Product'}
                  </button>

                  {isEditingProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProduct(false);
                        setEditProductId('');
                        setProductForm({ name: '', brand: '', category: '', description: '', price: '', discountPrice: '', stock: '', images: '' });
                        setSpecifications([{ key: '', value: '' }]);
                      }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </form>
            </div>

            {/* Inventory table list */}
            <div className="lg:col-span-2 space-y-4 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm overflow-hidden">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Product Inventory ({products.length})</h3>
              
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-left text-xs divide-y divide-slate-100 border-t border-slate-100 min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold">
                      <th className="p-3">Product</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {products.map((prod) => (
                      <tr key={prod._id} className="hover:bg-slate-50/50">
                        <td className="p-3 flex items-center gap-2">
                          <img src={prod.images[0]} alt={prod.name} className="w-9 h-9 object-cover rounded-lg border border-slate-200" />
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{prod.name}</p>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">{prod.brand}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-500">{prod.category}</td>
                        <td className="p-3 text-slate-800 font-bold">
                          ₹{prod.discountPrice > 0 ? prod.discountPrice.toLocaleString('en-IN') : prod.price.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3">
                          {prod.stock === 0 ? (
                            <span className="text-red-500 font-bold uppercase text-[9px] bg-red-50 px-2 py-0.5 rounded-lg">Out</span>
                          ) : (
                            <span className="text-slate-700 text-xs font-bold">{prod.stock}</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1.5 flex justify-end items-center h-16">
                          <button
                            onClick={() => handleEditInit(prod)}
                            className="p-1.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <PenSquare className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod._id)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FolderPlus className="w-4.5 h-4.5 text-sky-500" />
                Add Category
              </h3>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Home Decor"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Image URL *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="https://..."
                    value={categoryImage}
                    onChange={(e) => setCategoryImage(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 mt-4"
                >
                  Create Category
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Categories Directory ({categories.length})</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((c) => (
                  <div key={c._id} className="flex items-center justify-between border border-slate-100 p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={c.image} alt={c.name} className="w-10 h-10 object-cover rounded-xl border border-slate-200" />
                      <span className="text-xs font-bold text-slate-700">{c.name}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(c._id)}
                      className="text-slate-400 hover:text-red-500 p-2 hover:bg-white rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS TRACKER */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4 overflow-hidden">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Global Orders tracker ({orders.length})</h3>

            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left text-xs divide-y divide-slate-100 border-t border-slate-100 min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold">
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Products</th>
                    <th className="p-3">Total Payable</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {orders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">#{ord._id.slice(-8).toUpperCase()}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-700">{ord.userId?.name || 'Customer'}</p>
                        <span className="text-[10px] text-slate-400 leading-tight block">{ord.userId?.email}</span>
                      </td>
                      <td className="p-3 max-w-[200px] truncate">
                        {ord.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}
                      </td>
                      <td className="p-3 font-extrabold text-slate-800 flex flex-col">
                        <span>₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                        {ord.discountAmount > 0 && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-md w-max mt-1">
                            Save ₹{ord.discountAmount.toLocaleString('en-IN')} ({ord.couponCode})
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-slate-500">{ord.paymentMethod}</td>
                      <td className="p-3">
                        <select
                          className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold focus:outline-none ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : ord.orderStatus === 'Cancelled'
                              ? 'bg-rose-50 text-rose-600 border-rose-100'
                              : ord.orderStatus === 'Confirmed'
                              ? 'bg-sky-50 text-sky-700 border-sky-100'
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}
                          value={ord.orderStatus}
                          onChange={(e) => handleOrderStatusChange(ord._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: USERS MANAGER */}
        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4 overflow-hidden">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">User Directory Accounts ({users.length})</h3>

            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left text-xs divide-y divide-slate-100 border-t border-slate-100 min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold">
                    <th className="p-3">User</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Registration Date</th>
                    <th className="p-3">Assign Role</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                  {users.map((usr) => (
                    <tr key={usr._id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                        {usr.profileImage ? (
                          <img src={usr.profileImage} alt={usr.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold">
                            {usr.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {usr.name}
                      </td>
                      <td className="p-3">{usr.email}</td>
                      <td className="p-3 text-slate-400">{new Date(usr.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="p-3">
                        <select
                          className={`px-2 py-1 rounded-lg border text-[10px] font-bold focus:outline-none bg-white ${
                            usr.role === 'admin' ? 'border-sky-200 text-sky-700 bg-sky-50' : 'border-slate-200 text-slate-500'
                          }`}
                          value={usr.role}
                          onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(usr._id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
        )}

        {/* TAB 6: REVIEWS MODERATOR */}
        {activeTab === 'reviews' && (
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4 overflow-hidden">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Reviews Moderation ({allReviews.length})</h3>

            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left text-xs divide-y divide-slate-100 border-t border-slate-100 min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold">
                    <th className="p-3">Customer</th>
                    <th className="p-3">Catalog Product</th>
                    <th className="p-3">Comment Text</th>
                    <th className="p-3">Rating Score</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {allReviews.map((rev) => (
                    <tr key={rev._id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{rev.userId?.name || 'Anonymous'}</p>
                        <span className="text-[9px] text-slate-400 leading-tight block">{rev.userId?.email}</span>
                      </td>
                      <td className="p-3 font-bold text-slate-700">
                        {rev.productId?.name ? (
                          <span>{rev.productId.name} <span className="text-[9px] text-slate-400 uppercase">({rev.productId.brand})</span></span>
                        ) : (
                          <span className="text-slate-400 italic">Deleted Product</span>
                        )}
                      </td>
                      <td className="p-3 italic text-slate-500 max-w-[200px] truncate" title={rev.comment}>"{rev.comment}"</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-extrabold">{rev.rating}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-400">{new Date(rev.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteGlobalReview(rev._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
        )}

        {/* TAB 7: COUPONS ENGINE */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Create Coupon form */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Percent className="w-4.5 h-4.5 text-sky-500" />
                Create Coupon code
              </h3>

              <form onSubmit={handleCouponSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Coupon Code *</label>
                  <input
                    type="text"
                    className="input-field uppercase"
                    placeholder="e.g. FESTIVE20"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Discount Type *</label>
                    <select
                      className="input-field py-2"
                      value={couponForm.discountType}
                      onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    >
                      <option value="Percentage">Percentage %</option>
                      <option value="Fixed">Fixed Amount ₹</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Value *</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Value"
                      value={couponForm.discountValue}
                      onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Min Order ₹</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Min order"
                      value={couponForm.minPurchase}
                      onChange={(e) => setCouponForm({ ...couponForm, minPurchase: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiry Date *</label>
                    <input
                      type="date"
                      className="input-field py-1.5 text-slate-700"
                      value={couponForm.expiryDate}
                      onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 mt-4"
                >
                  Create Promo Coupon
                </button>
              </form>
            </div>

            {/* Coupons list panel */}
            <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Promo Coupon Directories ({coupons.length})</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((c) => {
                  const isExpired = new Date(c.expiryDate) < new Date();
                  return (
                    <div
                      key={c._id}
                      className={`flex flex-col justify-between border p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all ${
                        isExpired ? 'border-red-100 bg-red-50/10' : 'border-slate-100'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-sm text-sky-600 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-xl">
                            {c.code}
                          </span>
                          
                          <button
                            onClick={() => handleDeleteCoupon(c._id)}
                            className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-white rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-[11px] text-slate-500 font-semibold space-y-1">
                          <p className="text-slate-700 font-bold">
                            {c.discountType === 'Percentage' ? `${c.discountValue}% Off Total` : `₹${c.discountValue} Flat Discount`}
                          </p>
                          <p>Min Purchase: ₹{c.minPurchase}</p>
                          <p className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1 font-bold">
                            <Calendar className="w-3.5 h-3.5" />
                            Expires: {new Date(c.expiryDate).toLocaleDateString('en-IN')}
                            {isExpired && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1 rounded ml-1">Expired</span>}
                          </p>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default AdminDashboard;
