import { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, Trash2, ListOrdered, FolderPlus, ShoppingBag, RefreshCw, PenSquare, Eye, X, Settings } from 'lucide-react';
import API from '../services/api';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [loading, setLoading] = useState(false);
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
    images: '', // parsed as comma-separated values or single image URLs
  });
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editProductId, setEditProductId] = useState('');

  // 2. Add Category Form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');

  // Fetch all products for admin list
  const fetchProducts = async () => {
    try {
      const response = await API.get('/products?limit=100');
      setProducts(response.data.data);
    } catch (err) {
      console.error('Failed to fetch admin products:', err.message);
    }
  };

  // Fetch all categories for admin list
  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories');
      setCategories(response.data.data);
    } catch (err) {
      console.error('Failed to fetch admin categories:', err.message);
    }
  };

  // Fetch all orders for admin tracker
  const fetchOrders = async () => {
    try {
      const response = await API.get('/orders');
      setOrders(response.data.data);
    } catch (err) {
      console.error('Failed to fetch admin orders:', err.message);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchCategories(), fetchOrders()]);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const clearSuccess = () => setTimeout(() => setSuccess(''), 3000);

  // Specifications management helper hooks
  const handleAddSpecField = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const handleRemoveSpecField = (idx) => {
    setSpecifications(specifications.filter((_, i) => i !== idx));
  };

  const handleSpecFieldChange = (idx, field, val) => {
    const updated = [...specifications];
    updated[idx][field] = val;
    setSpecifications(updated);
  };

  // Product CRUD Handlers
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

    setLoading(true);
    try {
      if (isEditingProduct) {
        // Edit flow
        await API.put(`/products/${editProductId}`, payload);
        setSuccess('Product updated successfully!');
      } else {
        // Create flow
        await API.post('/products', payload);
        setSuccess('Product created successfully!');
      }

      // Reset
      setProductForm({
        name: '',
        brand: '',
        category: '',
        description: '',
        price: '',
        discountPrice: '',
        stock: '',
        images: '',
      });
      setSpecifications([{ key: '', value: '' }]);
      setIsEditingProduct(false);
      setEditProductId('');
      
      await fetchProducts();
      clearSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
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
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/products/${prodId}`);
      setSuccess('Product deleted successfully.');
      await fetchProducts();
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
      setError('Please fill in both category fields.');
      return;
    }

    try {
      await API.post('/categories', {
        name: categoryName,
        image: categoryImage,
      });

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
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await API.delete(`/categories/${catId}`);
      setSuccess('Category removed successfully.');
      await fetchCategories();
      clearSuccess();
    } catch (err) {
      setError('Failed to remove category.');
    }
  };

  // Order status updates trackers
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      setSuccess(`Order status updated to ${newStatus}`);
      await fetchOrders();
      clearSuccess();
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 tracking-tight">
          <LayoutDashboard className="w-5.5 h-5.5 text-sky-500" />
          Admin Control Center
        </h1>
        
        <button
          onClick={loadDashboardData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Dashboard Data
        </button>
      </div>

      {/* Tabs navigation panel */}
      <div className="flex gap-2 border-b border-slate-100 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 cursor-pointer ${
            activeTab === 'products'
              ? 'border-sky-500 bg-sky-50 text-sky-600'
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Manage Products ({products.length})
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
          Orders Tracker ({orders.length})
        </button>
      </div>

      {/* Dynamic Alerts */}
      {error && <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 p-3.5 rounded-xl">{error}</p>}
      {success && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl animate-fade-in">{success}</p>}

      {/* Dynamic Dashboard content depending on tabs selection */}
      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-sky-500"></div>
        </div>
      ) : (
        <>
          {/* TAB 1: PRODUCTS CRUD */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Product addition Form panel */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4.5 h-4.5 text-sky-500" />
                  {isEditingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>

                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Wireless Headset"
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

                  {/* Specifications sub-fields forms */}
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

                  {/* Submit and cancel triggers */}
                  <div className="flex gap-2.5 pt-4">
                    <button
                      type="submit"
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
                          setProductForm({
                            name: '',
                            brand: '',
                            category: '',
                            description: '',
                            price: '',
                            discountPrice: '',
                            stock: '',
                            images: '',
                          });
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

              {/* Products list viewer */}
              <div className="lg:col-span-2 space-y-4 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm overflow-hidden">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Product Inventory</h3>
                
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
                              <span className="text-emerald-600 font-bold text-xs">{prod.stock}</span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-1.5 flex justify-end items-center h-16">
                            <button
                              onClick={() => handleEditInit(prod)}
                              className="p-1.5 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                              title="Edit item"
                            >
                              <PenSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete item"
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

            </div>
          )}

          {/* TAB 2: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Category creation form panel */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderPlus className="w-4.5 h-4.5 text-sky-500" />
                  Add Category
                </h3>

                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Appliances"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category Image URL *</label>
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

              {/* Categories list panel */}
              <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Category Directory</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((c) => (
                    <div key={c._id} className="flex items-center justify-between border border-slate-100 p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={c.image} alt={c.name} className="w-10 h-10 object-cover rounded-xl border border-slate-200" />
                        <span className="text-xs font-bold text-slate-700">{c.name}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(c._id)}
                        className="text-slate-400 hover:text-red-500 p-2 hover:bg-white rounded-xl transition-all"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ORDERS TRACKER */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4 overflow-hidden">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Global Orders List</h3>

              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-left text-xs divide-y divide-slate-100 border-t border-slate-100 min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold">
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Order Items</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Order Status</th>
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
                        <td className="p-3 max-w-[200px]">
                          <span className="line-clamp-1 text-slate-500" title={ord.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}>
                            {ord.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}
                          </span>
                        </td>
                        <td className="p-3 font-extrabold text-slate-800">₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                        <td className="p-3 font-bold text-slate-500">{ord.paymentMethod}</td>
                        <td className="p-3">
                          <select
                            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold focus:outline-none ${
                              ord.orderStatus === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : ord.orderStatus === 'Cancelled'
                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}
                            value={ord.orderStatus}
                            onChange={(e) => handleOrderStatusChange(ord._id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
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
        </>
      )}

    </div>
  );
};

export default AdminDashboard;
