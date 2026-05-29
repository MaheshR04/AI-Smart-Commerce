import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShoppingBag, Calendar, MapPin, CreditCard, ChevronRight, Award } from 'lucide-react';
import API from '../services/api';

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Check if checkout just completed
  const orderSuccess = location.state?.orderSuccess || false;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await API.get('/orders/myorders');
      setOrders(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Failed to load orders:', error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Determine badge colors based on order status
  const getStatusBadge = (status) => {
    const base = 'text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ';
    switch (status) {
      case 'Delivered':
        return base + 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Processing':
      case 'Shipped':
        return base + 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Cancelled':
        return base + 'bg-rose-50 text-rose-500 border-rose-100';
      default:
        return base + 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-sky-500"></div>
        <p className="text-slate-400 mt-4 text-xs font-semibold">Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
      
      {/* Checkout Success Banner */}
      {orderSuccess && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-lg max-w-2xl mx-auto border border-emerald-400/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-white/10 h-40 w-40 rounded-full"></div>
          <Award className="w-12 h-12 text-white mx-auto animate-bounce" />
          <h2 className="text-2xl font-extrabold tracking-tight">Order Placed Successfully!</h2>
          <p className="text-emerald-50 text-xs sm:text-sm max-w-md mx-auto">
            Thank you for shopping with us! Your order is logged in our system. You can view its progress status below.
          </p>
        </div>
      )}

      <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-sky-500" />
        Order History ({orders.length})
      </h1>

      {orders.length > 0 ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 transition-all hover:shadow-md"
            >
              
              {/* Order Metadata Top Header */}
              <div className="p-4 sm:p-5 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                <div className="grid grid-cols-2 sm:flex items-center gap-4 sm:gap-6 text-xs text-slate-400">
                  <div className="space-y-1">
                    <p className="font-semibold uppercase tracking-wider text-[10px]">Order Registered</p>
                    <p className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold uppercase tracking-wider text-[10px]">Order Reference</p>
                    <p className="font-bold text-slate-700 truncate max-w-[120px]" title={ord._id}>
                      #{ord._id.slice(-8).toUpperCase()}
                    </p>
                  </div>

                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <p className="font-semibold uppercase tracking-wider text-[10px]">Payment ({ord.paymentMethod})</p>
                    <p className="font-bold text-slate-700 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      {ord.paymentDetails?.paymentStatus === 'Completed' ? (
                        <span className="text-emerald-600">Paid / Completed</span>
                      ) : (
                        <span className="text-slate-500">Pending</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1.5 self-stretch sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                  <span className={getStatusBadge(ord.orderStatus)}>{ord.orderStatus}</span>
                  <span className="text-sm font-extrabold text-slate-800 sm:text-base">
                    Total: ₹{ord.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

              </div>

              {/* Order Items details list */}
              <div className="p-4 sm:p-5 space-y-4">
                {ord.products.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/products/${item.productId}`} className="aspect-square w-12 rounded-lg border overflow-hidden bg-slate-50 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </Link>
                      
                      <div>
                        <Link to={`/products/${item.productId}`} className="block">
                          <h4 className="text-xs font-bold text-slate-700 hover:text-sky-600 transition-colors line-clamp-1">
                            {item.name}
                          </h4>
                        </Link>
                        <span className="text-[10px] text-slate-400 font-bold">
                          Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-800">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping Address Footer strip */}
              <div className="px-4 py-3 bg-slate-50/50 flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">
                  Shipping To: {ord.shippingAddress.street}, {ord.shippingAddress.city}, {ord.shippingAddress.state} ({ord.shippingAddress.phone})
                </span>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Empty Orders State */
        <div className="bg-white border border-slate-200/60 rounded-3xl py-16 px-6 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="bg-sky-50 rounded-full h-16 w-16 flex items-center justify-center text-sky-500 mx-auto border border-sky-100">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-bold text-slate-700 text-base">No Orders Yet</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You haven't placed any orders in our platform yet. Discover products in our catalog and place your first transaction today!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            Start Browsing <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
};

export default OrderHistory;
