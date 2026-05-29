import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import CheckoutForm from '../components/CheckoutForm';
import { ShieldAlert, CreditCard, ArrowLeft, MapPin, Tag, Plus } from 'lucide-react';
import API from '../services/api';

export const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useContext(CartContext);
  const { user, updateUserAddresses } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Coupon state fields
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Saved Addresses
  const savedAddresses = user?.addresses || [];
  const [selectedAddress, setSelectedAddress] = useState(null);

  const navigate = useNavigate();

  const cartTotal = getCartTotal();
  const cartItemsCount = cart?.products?.length || 0;

  useEffect(() => {
    // If cart is empty, redirect back to cart
    if (cartItemsCount === 0) {
      navigate('/cart');
    }
  }, [cartItemsCount, navigate]);

  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddress) {
      const defaultAddr = savedAddresses.find((addr) => addr.isDefault);
      setSelectedAddress(defaultAddr || savedAddresses[0]);
    }
  }, [user, savedAddresses, selectedAddress]);

  // Load Razorpay Script dynamically on client
  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const response = await API.post('/coupons/apply', {
        code: couponInput.trim(),
        orderTotal: cartTotal,
      });
      setAppliedCoupon(response.data.data);
      setCouponSuccess(response.data.message);
      addToast('Coupon code applied successfully.', 'success');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to apply coupon.';
      setCouponError(errMsg);
      setAppliedCoupon(null);
      addToast(errMsg, 'error');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponSuccess('');
    setCouponError('');
    addToast('Coupon code removed.', 'info');
  };

  const handleCheckoutSubmit = async ({ shippingAddress, paymentMethod, saveAddress }) => {
    setSubmitting(true);
    setError('');

    try {
      // 0. Auto-save shipping address if checked
      if (saveAddress) {
        try {
          const res = await API.post('/users/address', shippingAddress);
          updateUserAddresses(res.data.data);
        } catch (addrErr) {
          console.error('Failed to auto-save address to user profile book:', addrErr.message);
        }
      }

      // Map products to order requirements
      const orderProducts = cart.products.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      }));

      // 1. Create order on Express backend
      const response = await API.post('/orders', {
        products: orderProducts,
        shippingAddress,
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      });

      const { data: order } = response.data;

      // 2. COD Flow vs Razorpay Flow
      if (paymentMethod === 'COD') {
        // Complete transaction immediately
        await clearCart();
        setSubmitting(false);
        navigate('/checkout/success', { state: { order } });
      } else {
        // Razorpay Flow
        const sdkLoaded = await loadRazorpaySDK();
        const razorpayOrderId = order.paymentDetails?.razorpayOrderId;

        if (!sdkLoaded) {
          setError('Failed to load Razorpay SDK. Check your internet connection.');
          setSubmitting(false);
          return;
        }

        // Check if server is running in simulated payments mode
        if (razorpayOrderId && razorpayOrderId.startsWith('order_mock_')) {
          // Trigger a simulated browser popup
          const confirmPayment = window.confirm(
            `[Payments Sandbox] Order ${order._id} created successfully.\n\nTotal: ₹${order.totalAmount.toLocaleString('en-IN')}\n\nWould you like to simulate a successful Razorpay transaction?`
          );

          if (confirmPayment) {
            // Verify simulated checkout on backend
            const verifyResponse = await API.post('/orders/verify', {
              orderId: order._id,
              razorpayOrderId: razorpayOrderId,
              razorpayPaymentId: `pay_mock_${Date.now()}`,
              razorpaySignature: 'mock_signature_verified',
            });

            await clearCart();
            setSubmitting(false);
            navigate('/checkout/success', { state: { order: verifyResponse.data.data } });
          } else {
            // Simulated payment cancelled
            setSubmitting(false);
          }
          return;
        }

        // Live/Test Mode Razorpay overlays options
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock_id_123',
          amount: order.totalAmount * 100, // paise
          currency: 'INR',
          name: 'SmartCommerce',
          description: 'Secure Payment Transaction',
          order_id: razorpayOrderId,
          handler: async function (paymentResponse) {
            try {
              // 3. Verify Razorpay signatures on server
              const verifyResponse = await API.post('/orders/verify', {
                orderId: order._id,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              });

              await clearCart();
              setSubmitting(false);
              navigate('/checkout/success', { state: { order: verifyResponse.data.data } });
            } catch (err) {
              setError(err.response?.data?.message || 'Payment signature verification failed.');
              setSubmitting(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: shippingAddress.phone || '',
          },
          theme: {
            color: '#0ea5e9', // primary sky color code
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
      setSubmitting(false);
    }
  };

  const subtotal = cartTotal;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const afterDiscount = subtotal - discount;
  const shippingCharges = afterDiscount > 0 && afterDiscount < 1000 ? 99 : 0;
  const taxAmount = afterDiscount - (afterDiscount / 1.18); // 18% inclusive GST
  const finalPayable = afterDiscount + shippingCharges;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
      
      <div>
        <button
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
        </button>
      </div>

      <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-sky-500" />
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Saved Addresses selection & Form inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Saved Addresses quick selection */}
          {savedAddresses.length > 0 && (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-500" />
                Select Saved Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddress(addr)}
                    className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 text-xs font-semibold text-slate-600 leading-relaxed hover:bg-slate-50 flex flex-col justify-between ${
                      selectedAddress?._id === addr._id
                        ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-100'
                        : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-slate-800 truncate max-w-[120px]">{addr.street}</span>
                        {addr.isDefault && (
                          <span className="text-[8px] font-extrabold uppercase bg-sky-50 text-sky-600 border border-sky-100 px-1.5 py-0.5 rounded-md">
                            Default
                          </span>
                        )}
                      </div>
                      <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                      <p className="mt-1 text-[10px] text-slate-400 font-bold">{addr.phone}</p>
                    </div>
                  </div>
                ))}

                {/* Enter New Address Card option */}
                <div
                  onClick={() => setSelectedAddress(null)}
                  className={`border border-dashed rounded-xl p-4 cursor-pointer transition-all duration-200 text-xs font-bold hover:bg-slate-50 flex flex-col justify-center items-center gap-1.5 min-h-[90px] ${
                    selectedAddress === null
                      ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-100 text-sky-600'
                      : 'border-slate-300 text-slate-400 hover:text-slate-505'
                  }`}
                >
                  <Plus className="w-5 h-5 text-sky-500" />
                  Enter New Address
                </div>
              </div>
            </div>
          )}

          <CheckoutForm
            onSubmit={handleCheckoutSubmit}
            isSubmitting={submitting}
            initialAddress={selectedAddress}
          />
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 space-y-4 mt-4 animate-fade-in">
              <div className="flex gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">Payment Transaction Declined</h4>
                  <p className="text-xs text-rose-600 font-semibold leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-rose-100/40">
                <button
                  onClick={() => {
                    const codRadio = document.querySelector('input[value="COD"]');
                    if (codRadio) {
                      codRadio.click();
                    }
                    setError('');
                  }}
                  className="flex-1 px-3.5 py-2.5 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-xl text-[10px] font-bold tracking-wide uppercase transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  Pay with Cash On Delivery (COD) Instead
                </button>
                <button
                  onClick={() => setError('')}
                  className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-bold tracking-wide uppercase transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order items details summary */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Order Summary</h3>

            {/* Selected items strip */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-50">
              {cart?.products?.map((item) => {
                if (!item.productId) return null;
                const { _id, name, price, discountPrice, images } = item.productId;
                const activePrice = discountPrice > 0 ? discountPrice : price;
                return (
                  <div key={_id} className="flex items-center justify-between gap-3 pt-3 first:pt-0">
                    <div className="flex items-center gap-2.5">
                      <img src={images[0]} alt={name} className="w-9 h-9 object-cover rounded-lg border border-slate-100" />
                      <div className="max-w-[150px]">
                        <h4 className="text-xs font-semibold text-slate-700 truncate leading-tight">{name}</h4>
                        <span className="text-[10px] font-bold text-slate-400">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      ₹{(activePrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code section */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-500" />
                Apply Coupon
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. WELCOME10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  disabled={!!appliedCoupon}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 uppercase font-semibold"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold rounded-xl border border-red-100 transition-colors"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                )}
              </div>
              {couponError && <p className="text-[10px] font-bold text-red-500">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] font-bold text-emerald-600">{couponSuccess}</p>}
            </div>

            {/* Calculations summaries */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-600">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Estimated GST (18% Included)</span>
                <span className="font-semibold text-slate-500">₹{Math.round(taxAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Charges</span>
                {shippingCharges > 0 ? (
                  <span className="font-bold text-slate-700">₹{shippingCharges}</span>
                ) : (
                  <span className="text-emerald-600 font-bold">FREE Delivery</span>
                )}
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-extrabold text-slate-800">
                <span>Total Payable</span>
                <span className="text-sky-600">₹{finalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

          {/* Secure transaction notice */}
          <div className="flex gap-2 p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-[10px] text-slate-500 font-medium">
            <ShieldAlert className="w-5 h-5 text-sky-500 flex-shrink-0" />
            <p>
              Your transaction is encrypted securely. Standard gateway certifications apply. Payments are verified in safe environments.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Checkout;

