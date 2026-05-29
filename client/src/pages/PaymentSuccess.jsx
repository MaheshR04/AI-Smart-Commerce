import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, CreditCard, MapPin, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';

export const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve the order details passed from checkout navigation state
  const order = location.state?.order;

  useEffect(() => {
    // If someone visits /checkout/success directly without completing checkout, redirect to home
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  if (!order) return null;

  const { _id, totalAmount, paymentMethod, shippingAddress, createdAt } = order;

  // Calculate estimated delivery date ranges (3 to 5 business days from today)
  const getDeliveryDateRange = (startDateStr) => {
    const start = new Date(startDateStr);
    
    const format = (date) => date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    return `${format(addDays(start, 3))} - ${format(addDays(start, 5))}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center items-center">
      
      {/* Premium Celebratory Success Wrapper */}
      <div className="w-full bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 animate-fade-in relative overflow-hidden">
        
        {/* Background decorative accent circles */}
        <div className="absolute -top-10 -right-10 bg-sky-50 h-32 w-32 rounded-full -z-10 opacity-60"></div>
        <div className="absolute -bottom-10 -left-10 bg-emerald-50 h-32 w-32 rounded-full -z-10 opacity-60"></div>

        {/* Celebratory Icon Header Block */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-500 shadow-sm animate-bounce mb-2">
            <CheckCircle className="w-12 h-12 fill-emerald-500/10" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Thank you for shopping with us. Your payment has been processed, and your order has been securely registered in our system.
          </p>
        </div>

        {/* Estimated Delivery visual card */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500/10 p-2.5 rounded-xl text-sky-600 border border-sky-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Delivery</p>
              <h3 className="text-sm font-extrabold text-slate-800 mt-0.5">
                {getDeliveryDateRange(createdAt || new Date())}
              </h3>
            </div>
          </div>
          <span className="text-[9px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-md self-start sm:self-auto">
            On Schedule
          </span>
        </div>

        {/* Itemized Order Receipt Details grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2.5">
            Order Summary Receipt
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
            
            {/* Left Box: Transaction identifiers */}
            <div className="space-y-3 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100">
              <div className="flex justify-between border-b border-slate-100/60 pb-2">
                <span className="font-semibold text-slate-400">Order ID</span>
                <span className="font-bold text-slate-800">#{_id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100/60 pb-2">
                <span className="font-semibold text-slate-400">Payment Method</span>
                <span className="font-bold text-slate-800">{paymentMethod}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100/60 pb-2">
                <span className="font-semibold text-slate-400">Status</span>
                <span className="font-bold text-emerald-600">Paid / Pending Dispatch</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-slate-800 text-sm">
                <span>Amount Paid</span>
                <span className="text-sky-600">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Right Box: Delivery snapshot */}
            <div className="space-y-3 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  Shipping Destination
                </span>
                <div className="font-semibold text-slate-700 leading-relaxed text-xs">
                  <p className="font-bold text-slate-800">{shippingAddress.street}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
                  <p className="mt-1.5 text-[10px] text-slate-400 font-bold">Contact: {shippingAddress.phone}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Quick redirect buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
          
          <Link
            to="/orders"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-md shadow-sky-100 transition-all duration-200 active:scale-95 text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Track Order Status
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all duration-200 active:scale-95 text-sm"
          >
            Continue Shopping
            <ChevronRight className="w-4 h-4" />
          </Link>
          
        </div>

      </div>

    </div>
  );
};

export default PaymentSuccess;
