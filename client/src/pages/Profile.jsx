import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import TrackOrder from '../components/TrackOrder';
import { User, ShieldCheck, Mail, Lock, Settings, KeyRound, CheckCircle, ShoppingBag, MapPin, MessageSquare, Plus, Trash2, Home, Building, Phone, Calendar, Heart, Edit3, Star, X } from 'lucide-react';
import API from '../services/api';

export const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('settings');

  // Customer state hooks
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Tracked order details expansion
  const [expandedOrderId, setExpandedOrderId] = useState('');

  // 1. Profile / Password Forms State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  // 2. Saved Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
    isDefault: false,
  });

  // 3. Edit Review Modal State
  const [editingReviewId, setEditingReviewId] = useState('');
  const [editingComment, setEditingComment] = useState('');
  const [editingRating, setEditingRating] = useState(5);

  // Sync saved details on user context updates
  useEffect(() => {
    if (user) {
      setAddresses(user.addresses || []);
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Load orders, addresses, and reviews on demand
  const loadTabDetails = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'orders') {
        const response = await API.get('/orders/myorders');
        setOrders(response.data.data);
      } else if (activeTab === 'reviews') {
        const response = await API.get('/reviews/myreviews');
        setMyReviews(response.data.data);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabDetails();
  }, [activeTab]);

  const clearSuccess = () => setTimeout(() => setSuccess(''), 3000);

  // Profile and Password change submit handlers
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!profileForm.name || !profileForm.email) {
      setError('Name and email address fields are required.');
      return;
    }

    try {
      await updateProfile(profileForm);
      setSuccess('Profile details updated successfully!');
      clearSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await updateProfile({ password: newPassword });
      setSuccess('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      clearSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  // Saved Addresses Handlers
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { street, city, state, postalCode, country, phone } = addressForm;
    if (!street || !city || !state || !postalCode || !country || !phone) {
      setError('Please fill in all shipping fields.');
      return;
    }

    try {
      const response = await API.post('/users/address', addressForm);
      setAddresses(response.data.data);
      
      // Update local storage user profile addresses to stay in sync
      const stored = JSON.parse(localStorage.getItem('user'));
      if (stored) {
        stored.addresses = response.data.data;
        localStorage.setItem('user', JSON.stringify(stored));
      }

      setSuccess('Shipping address added successfully!');
      setShowAddressForm(false);
      setAddressForm({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        phone: '',
        isDefault: false,
      });
      clearSuccess();
    } catch (err) {
      setError('Failed to save shipping address.');
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const response = await API.delete(`/users/address/${addrId}`);
      setAddresses(response.data.data);

      const stored = JSON.parse(localStorage.getItem('user'));
      if (stored) {
        stored.addresses = response.data.data;
        localStorage.setItem('user', JSON.stringify(stored));
      }

      setSuccess('Address deleted.');
      clearSuccess();
    } catch (err) {
      setError('Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    try {
      const response = await API.put(`/users/address/${addrId}/default`);
      setAddresses(response.data.data);

      const stored = JSON.parse(localStorage.getItem('user'));
      if (stored) {
        stored.addresses = response.data.data;
        localStorage.setItem('user', JSON.stringify(stored));
      }

      setSuccess('Default address updated.');
      clearSuccess();
    } catch (err) {
      setError('Failed to set default address.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock levels will be restored and any online payments will be refunded.')) return;
    try {
      await API.put(`/orders/${orderId}/cancel`);
      alert('Order cancelled successfully.');
      loadTabDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  // Review Management Handlers
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await API.delete(`/reviews/${reviewId}`);
      setSuccess('Review deleted.');
      // Refresh reviews list
      const response = await API.get('/reviews/myreviews');
      setMyReviews(response.data.data);
      clearSuccess();
    } catch (err) {
      setError('Failed to delete review.');
    }
  };

  const handleEditReviewInit = (rev) => {
    setEditingReviewId(rev._id);
    setEditingComment(rev.comment);
    setEditingRating(rev.rating);
  };

  const handleEditReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/reviews', {
        productId: myReviews.find((r) => r._id === editingReviewId)?.productId?._id,
        rating: editingRating,
        comment: editingComment,
      });

      setSuccess('Review updated successfully.');
      setEditingReviewId('');
      
      const response = await API.get('/reviews/myreviews');
      setMyReviews(response.data.data);
      clearSuccess();
    } catch (err) {
      setError('Failed to update review.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
      
      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-sky-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-md shadow-sky-100">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-snug">{user?.name}</h1>
            <p className="text-xs text-slate-400 font-semibold">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase bg-sky-50 text-sky-600 border border-sky-100 px-3 py-1 rounded-full tracking-wider">
            {user?.role === 'admin' ? 'Administrator' : 'Customer Profile'}
          </span>
        </div>
      </div>

      {/* Tabs Layout navigation */}
      <div className="flex gap-2 border-b border-slate-100 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 cursor-pointer ${
            activeTab === 'settings'
              ? 'border-sky-500 bg-sky-50 text-sky-600'
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          Profile Settings
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-sky-500 bg-sky-50 text-sky-600'
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          My Orders ({orders.length || user?.orders?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 cursor-pointer ${
            activeTab === 'addresses'
              ? 'border-sky-500 bg-sky-50 text-sky-600'
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Saved Addresses ({addresses.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-sky-500 bg-sky-50 text-sky-600'
              : 'border-transparent text-slate-500 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          My Reviews ({myReviews.length})
        </button>
      </div>

      {/* Message Notifications */}
      {error && <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 p-3 rounded-xl">{error}</p>}
      {success && <p className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">{success}</p>}

      {/* Dynamic Tab Contents */}
      <div className="min-h-[40vh]">

        {/* TAB 1: PROFILE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Edit details form */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <User className="w-4.5 h-4.5 text-sky-500" />
                Edit Profile Details
              </h3>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Email Address</label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      name="email"
                      className="input-field pl-10"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Save Profile Details
                </button>
              </form>
            </div>

            {/* Change Password form */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <KeyRound className="w-4.5 h-4.5 text-sky-500" />
                Change Account Password
              </h3>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Current Password</label>
                  <div className="relative flex items-center">
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="••••••••"
                      className="input-field pl-10"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">New Password</label>
                  <div className="relative flex items-center">
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="At least 6 characters"
                      className="input-field pl-10"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Confirm New Password</label>
                  <div className="relative flex items-center">
                    <input
                      type="password"
                      name="confirmNewPassword"
                      placeholder="Confirm password"
                      className="input-field pl-10"
                      value={passwordForm.confirmNewPassword}
                      onChange={handlePasswordChange}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Update Password
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 2: MY ORDERS & PROGRESS TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-sky-500"></div>
              </div>
            ) : orders.length > 0 ? (
              orders.map((ord) => (
                <div
                  key={ord._id}
                  className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 transition-all hover:shadow-md"
                >
                  {/* Order header summary */}
                  <div className="p-4 sm:p-5 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-4 sm:gap-8 text-xs text-slate-400">
                      <div className="space-y-1">
                        <p className="font-semibold uppercase tracking-wider text-[9px]">Registered</p>
                        <p className="font-bold text-slate-700 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-semibold uppercase tracking-wider text-[9px]">Order ID</p>
                        <p className="font-bold text-slate-700 truncate max-w-[100px]" title={ord._id}>
                          #{ord._id.slice(-8).toUpperCase()}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-semibold uppercase tracking-wider text-[9px]">Total Total</p>
                        <p className="font-extrabold text-sky-600">₹{ord.totalAmount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {ord.orderStatus !== 'Cancelled' && (
                        <Link
                          to={`/orders/${ord._id}/invoice`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-all active:scale-95 cursor-pointer"
                        >
                          Invoice
                        </Link>
                      )}
                      
                      {['Pending', 'Confirmed'].includes(ord.orderStatus) && (
                        <button
                          onClick={() => handleCancelOrder(ord._id)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-100 transition-all active:scale-95 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedOrderId(expandedOrderId === ord._id ? '' : ord._id)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-100 transition-all active:scale-95 cursor-pointer"
                      >
                        {expandedOrderId === ord._id ? 'Hide Tracking details' : 'Track Order progress'}
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded progression tracker panel */}
                  {expandedOrderId === ord._id && (
                    <div className="p-5 bg-slate-50/50">
                      <TrackOrder orderStatus={ord.orderStatus} />
                    </div>
                  )}

                  {/* Products logs list */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {ord.products.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-slate-50" />
                          <div>
                            <h4 className="font-bold text-slate-700">{item.name}</h4>
                            <span className="text-[10px] text-slate-400 font-bold">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">No orders found. Begin shopping today.</p>
            )}
          </div>
        )}

        {/* TAB 3: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            
            {/* Top addition controls */}
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Shipping Address Book</h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {showAddressForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showAddressForm ? 'Cancel Form' : 'Add Address'}
              </button>
            </div>

            {/* Address add/edit Form */}
            {showAddressForm && (
              <form onSubmit={handleAddressSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-xl mx-auto space-y-4 shadow-inner">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Shipping Details</h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Street Address</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 102, Blue Heights, Park Street"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">State</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PIN Code</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="PIN"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Contact</label>
                    <input
                      type="tel"
                      maxLength="10"
                      className="input-field"
                      placeholder="10-digit number"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded text-sky-500 focus:ring-sky-400"
                  />
                  Set as default shipping address
                </label>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Save Shipping Address
                </button>
              </form>
            )}

            {/* Address list grids */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all hover:shadow-md ${
                    addr.isDefault ? 'border-sky-500 ring-2 ring-sky-50' : 'border-slate-200/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="bg-slate-100 p-2 rounded-xl text-slate-500">
                        {addr.isDefault ? <ShieldCheck className="w-4.5 h-4.5 text-sky-500 animate-pulse" /> : <Home className="w-4.5 h-4.5" />}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[8px] font-extrabold uppercase bg-sky-50 text-sky-600 border border-sky-100 px-2 py-0.5 rounded-lg tracking-wider">
                          Primary Default
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 leading-relaxed font-semibold">
                      <p className="font-bold text-slate-800">{addr.street}</p>
                      <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                      <p className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-bold">
                        <Phone className="w-3 h-3" /> {addr.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-50 text-[10px] font-bold">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(addr._id)}
                        className="text-sky-600 hover:text-sky-700 cursor-pointer"
                      >
                        Set Default
                      </button>
                    )}
                    <span className="text-slate-200">|</span>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-red-400 hover:text-red-600 flex items-center gap-1 cursor-pointer ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 4: MY REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            
            {/* Edit Review Form Dialog overlay */}
            {editingReviewId && (
              <form onSubmit={handleEditReviewSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 max-w-xl mx-auto space-y-4 shadow-inner">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Edit Review Comment</h4>
                  <button type="button" onClick={() => setEditingReviewId('')}>
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Edit Rating:</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button type="button" key={i} onClick={() => setEditingRating(i)}>
                        <Star className={`w-5 h-5 ${i <= editingRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows="3"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                  value={editingComment}
                  onChange={(e) => setEditingComment(e.target.value)}
                ></textarea>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Save Review Updates
                </button>
              </form>
            )}

            {/* List of customer reviews */}
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-sky-500"></div>
              </div>
            ) : myReviews.length > 0 ? (
              myReviews.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                >
                  <div className="flex gap-3 items-center">
                    <img src={rev.productId?.images[0]} alt={rev.productId?.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-slate-50 flex-shrink-0" />
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{rev.productId?.brand}</span>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{rev.productId?.name}</h4>
                      <p className="text-xs text-slate-500 italic mt-1 font-medium leading-relaxed">"{rev.comment}"</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 gap-3 border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs font-extrabold text-slate-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-0.5">{rev.rating}</span>
                    </div>

                    <div className="flex gap-3 text-[10px] font-bold pt-1">
                      <button
                        onClick={() => handleEditReviewInit(rev)}
                        className="text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="text-red-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">No reviews submitted yet.</p>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

export default Profile;
