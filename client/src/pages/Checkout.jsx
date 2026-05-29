import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import CheckoutForm from '../components/CheckoutForm';
import { ShieldAlert, CreditCard, ArrowLeft } from 'lucide-react';
import API from '../services/api';

export const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const cartTotal = getCartTotal();
  const cartItemsCount = cart?.products?.length || 0;

  useEffect(() => {
    // If cart is empty, redirect back to cart
    if (cartItemsCount === 0) {
      navigate('/cart');
    }
  }, [cartItemsCount, navigate]);

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

  const handleCheckoutSubmit = async ({ shippingAddress, paymentMethod }) => {
    setSubmitting(true);
    setError('');

    try {
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
      });

      const { data: order } = response.data;

      // 2. COD Flow vs Razorpay Flow
      if (paymentMethod === 'COD') {
        // Complete transaction immediately
        await clearCart();
        setSubmitting(false);
        navigate('/orders', { state: { orderSuccess: true } });
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
            `[Payments Sandbox] Order ${order._id} created successfully.\n\nTotal: ₹${cartTotal.toLocaleString('en-IN')}\n\nWould you like to simulate a successful Razorpay transaction?`
          );

          if (confirmPayment) {
            // Verify simulated checkout on backend
            await API.post('/orders/verify', {
              orderId: order._id,
              razorpayOrderId: razorpayOrderId,
              razorpayPaymentId: `pay_mock_${Date.now()}`,
              razorpaySignature: 'mock_signature_verified',
            });

            await clearCart();
            setSubmitting(false);
            navigate('/orders', { state: { orderSuccess: true } });
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
              await API.post('/orders/verify', {
                orderId: order._id,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              });

              await clearCart();
              setSubmitting(false);
              navigate('/orders', { state: { orderSuccess: true } });
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
        
        {/* Left Column: Form inputs */}
        <div className="lg:col-span-2">
          <CheckoutForm onSubmit={handleCheckoutSubmit} isSubmitting={submitting} />
          {error && <p className="text-xs font-bold text-red-500 mt-4">{error}</p>}
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

            {/* Calculations summaries */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-600">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Charges</span>
                <span className="text-emerald-600 font-bold">FREE Delivery</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-extrabold text-slate-800">
                <span>Total Payable</span>
                <span className="text-sky-600">₹{cartTotal.toLocaleString('en-IN')}</span>
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
