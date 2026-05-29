import { useState, useEffect } from 'react';
import { Truck, CreditCard, DollarSign } from 'lucide-react';

export const CheckoutForm = ({ onSubmit, isSubmitting, initialAddress }) => {
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
  });

  useEffect(() => {
    if (initialAddress) {
      setFormData({
        street: initialAddress.street || '',
        city: initialAddress.city || '',
        state: initialAddress.state || '',
        postalCode: initialAddress.postalCode || '',
        country: initialAddress.country || 'India',
        phone: initialAddress.phone || '',
      });
    }
  }, [initialAddress]);

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Quick Validation
    const { street, city, state, postalCode, country, phone } = formData;
    if (!street || !city || !state || !postalCode || !country || !phone) {
      setError('Please fill in all shipping details fields.');
      return;
    }

    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    onSubmit({
      shippingAddress: formData,
      paymentMethod,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Shipping Address Section */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Truck className="w-5 h-5 text-sky-500" />
          Shipping Address
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Street Address</label>
            <input
              type="text"
              name="street"
              placeholder="House No, Apartment, Street, Locality"
              className="input-field"
              value={formData.street}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">City</label>
            <input
              type="text"
              name="city"
              placeholder="City"
              className="input-field"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">State</label>
            <input
              type="text"
              name="state"
              placeholder="State"
              className="input-field"
              value={formData.state}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Postal Code (PIN)</label>
            <input
              type="text"
              name="postalCode"
              placeholder="6-digit PIN code"
              className="input-field"
              value={formData.postalCode}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Country</label>
            <input
              type="text"
              name="country"
              placeholder="Country"
              className="input-field"
              value={formData.country}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Phone Number</label>
            <input
              type="tel"
              name="phone"
              maxLength="10"
              placeholder="10-digit mobile number"
              className="input-field"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-sky-500" />
          Select Payment Method
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* COD card option */}
          <label
            className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
              paymentMethod === 'COD'
                ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-100'
                : 'border-slate-200'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === 'COD'}
              onChange={() => setPaymentMethod('COD')}
              className="hidden"
            />
            <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-slate-800">Cash On Delivery (COD)</h4>
              <p className="text-[11px] text-slate-400">Pay inside cash upon items home arrival.</p>
            </div>
          </label>

          {/* Razorpay card option */}
          <label
            className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
              paymentMethod === 'Razorpay'
                ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-100'
                : 'border-slate-200'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="Razorpay"
              checked={paymentMethod === 'Razorpay'}
              onChange={() => setPaymentMethod('Razorpay')}
              className="hidden"
            />
            <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-slate-800">Razorpay (Cards/UPI/NetBanking)</h4>
              <p className="text-[11px] text-slate-400">Pay instantly using Razorpay gateway.</p>
            </div>
          </label>
        </div>
      </div>

      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

      {/* Checkout Submit trigger */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-md shadow-sky-100 disabled:opacity-50 transition-all duration-200 active:scale-[0.99]"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-slate-300"></div>
            Processing Order Check...
          </>
        ) : (
          `Place Order & Proceed`
        )}
      </button>

    </form>
  );
};

export default CheckoutForm;
