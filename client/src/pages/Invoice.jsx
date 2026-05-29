import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle } from 'lucide-react';
import API from '../services/api';

export const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await API.get('/orders/myorders');
      const matched = response.data.data.find((o) => o._id === id);
      setOrder(matched);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Failed to load invoice details:', error.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  // Trigger print dialogue automatically when order data is ready
  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [order]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-sky-500"></div>
        <p className="text-slate-400 mt-4 text-xs font-semibold">Generating invoice receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white">
        <h3 className="text-base font-bold text-slate-700">Invoice Not Found</h3>
        <button onClick={() => navigate('/orders')} className="text-xs font-bold text-sky-500 underline">
          Back to Orders
        </button>
      </div>
    );
  }

  const { _id, products, shippingAddress, paymentMethod, totalAmount, discountAmount, orderStatus, createdAt } = order;

  // Invoice calculations
  // Since active order totals inside DB include dynamic shipping and discount subtraction, let's reverse compute subtotals
  const finalPayable = totalAmount;
  const discount = discountAmount || 0;
  
  // Calculate raw items subtotal before coupon and shipping
  const rawItemsTotal = products.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const afterDiscount = rawItemsTotal - discount;
  const shippingCharges = finalPayable - afterDiscount;

  // Estimated 18% inclusive GST from items total
  const estimatedTax = rawItemsTotal - (rawItemsTotal / 1.18);

  return (
    <div className="min-h-screen bg-slate-50 py-10 print:bg-white print:py-0">
      
      {/* Print Controls Header Bar (hidden during printing) */}
      <div className="max-w-4xl mx-auto mb-6 px-4 flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print Invoice
        </button>
      </div>

      {/* Styled Printable Invoice Document */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200/50 rounded-3xl p-8 sm:p-12 shadow-sm print:shadow-none print:border-none print:rounded-none print:p-0 space-y-8">
        
        {/* Invoice Header details */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <span className="bg-sky-500 text-white rounded-lg h-7 w-7 flex items-center justify-center text-sm font-black">S</span>
              SmartCommerce
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Invoice Billing Statement</p>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-500">
            <h3 className="font-extrabold text-slate-800 text-sm">INVOICE #: INV-{_id.slice(-8).toUpperCase()}</h3>
            <p className="mt-1 font-semibold">Date: {new Date(createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</p>
            <p className="font-semibold uppercase tracking-wider text-[9px] text-emerald-600 mt-1 flex items-center sm:justify-end gap-1 font-bold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" />
              {orderStatus === 'Delivered' ? 'Transaction Complete' : 'Order Placed / Paid'}
            </p>
          </div>
        </div>

        {/* Billing party logistics information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs leading-relaxed text-slate-600 border-b border-slate-100 pb-8">
          
          {/* Supplier logistics */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400">Sold By</h4>
            <div className="font-semibold text-slate-700">
              <p className="font-extrabold text-slate-800 text-sm">SmartCommerce Retail Inc.</p>
              <p>H-Block, Sector 5, Electronics City Phase 1</p>
              <p>Bengaluru, Karnataka - 560100</p>
              <p className="mt-1.5 font-bold text-slate-500">GSTIN: 29AAAAA1111A1Z0</p>
            </div>
          </div>

          {/* Customer destination address */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400">Billing / Shipping To</h4>
            <div className="font-semibold text-slate-700">
              <p className="font-extrabold text-slate-800 text-sm">{shippingAddress.street}</p>
              <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
              <p>Country: {shippingAddress.country}</p>
              <p className="mt-1.5 font-bold text-slate-500">Phone: {shippingAddress.phone}</p>
            </div>
          </div>

        </div>

        {/* Tabular items mapping */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] text-slate-400">Itemized Purchases</h4>
          
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-2">
                <th className="py-2.5">Brand</th>
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5 text-right">Price</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {products.map((item, index) => (
                <tr key={index}>
                  <td className="py-3.5 font-bold text-slate-400 uppercase text-[10px]">{item.brand || 'Retail'}</td>
                  <td className="py-3.5 font-extrabold text-slate-800 max-w-[250px]">{item.name}</td>
                  <td className="py-3.5 text-right">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 text-center font-bold">{item.quantity}</td>
                  <td className="py-3.5 text-right font-extrabold text-slate-800">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations math summary statement */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <div className="w-full sm:w-80 space-y-2.5 text-xs font-semibold text-slate-500">
            
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-800">₹{rawItemsTotal.toLocaleString('en-IN')}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Savings</span>
                <span>- ₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Estimated GST (18% Included)</span>
              <span className="font-bold text-slate-600">₹{Math.round(estimatedTax).toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Charges</span>
              {shippingCharges > 0 ? (
                <span className="font-bold text-slate-800">₹{shippingCharges}</span>
              ) : (
                <span className="text-emerald-600 font-bold uppercase tracking-wider text-[10px]">FREE Shipping</span>
              )}
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between font-black text-sm text-slate-800">
              <span>Total Grand Amount</span>
              <span className="text-sky-600">₹{finalPayable.toLocaleString('en-IN')}</span>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-3.5 text-center text-[10px] text-slate-400 leading-snug">
              <p>Paid via: <span className="font-bold uppercase">{paymentMethod}</span></p>
              <p className="mt-0.5">This is a computer-generated invoice document receipt. No signature is required.</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Invoice;
