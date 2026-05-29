import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, ShoppingBag, ChevronRight, ArrowLeft } from 'lucide-react';

export const Cart = () => {
  const {
    cart,
    loading,
    updateCartItemQuantity,
    removeFromCart,
    getCartTotal,
  } = useContext(CartContext);

  const navigate = useNavigate();

  const cartTotal = getCartTotal();
  const cartItemsCount = cart?.products?.length || 0;

  const handleQuantityAdjust = async (productId, currentQty, amount) => {
    const nextQty = currentQty + amount;
    if (nextQty < 1) return;
    try {
      await updateCartItemQuantity(productId, nextQty);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error(error.message);
    }
  };

  if (loading && cartItemsCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-sky-500"></div>
        <p className="text-slate-400 mt-4 text-xs font-semibold">Updating cart items...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
      <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-sky-500" />
        Shopping Cart ({cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'})
      </h1>

      {cartItemsCount > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-6 shadow-sm divide-y divide-slate-100">
              {cart.products.map((item) => {
                if (!item.productId) return null;
                const { _id, name, brand, images, price, discountPrice, stock } = item.productId;
                
                const activePrice = discountPrice > 0 ? discountPrice : price;
                const itemTotal = activePrice * item.quantity;

                return (
                  <div key={_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 first:pt-0 last:pb-0">
                    
                    {/* Item graphics & info */}
                    <div className="flex items-center gap-4 flex-1">
                      <Link to={`/products/${_id}`} className="aspect-square w-16 sm:w-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                        <img src={images[0]} alt={name} className="w-full h-full object-cover" />
                      </Link>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{brand}</span>
                        <Link to={`/products/${_id}`} className="block">
                          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 hover:text-sky-600 transition-colors line-clamp-2 leading-tight">
                            {name}
                          </h3>
                        </Link>
                        
                        {/* Prices */}
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-xs sm:text-sm font-bold text-slate-800">₹{activePrice.toLocaleString('en-IN')}</span>
                          {discountPrice > 0 && (
                            <span className="text-[10px] text-slate-400 line-through">₹{price.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity controls & Delete Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                      
                      {/* Quantity editors */}
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <button
                          disabled={item.quantity <= 1}
                          onClick={() => handleQuantityAdjust(_id, item.quantity, -1)}
                          className="px-2.5 py-1 text-slate-500 hover:bg-slate-50 disabled:opacity-30 font-bold text-sm"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-slate-700 bg-slate-50 border-x border-slate-100">
                          {item.quantity}
                        </span>
                        <button
                          disabled={item.quantity >= stock}
                          onClick={() => handleQuantityAdjust(_id, item.quantity, 1)}
                          className="px-2.5 py-1 text-slate-500 hover:bg-slate-50 disabled:opacity-30 font-bold text-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Item Aggregate sum */}
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Remove item button */}
                      <button
                        onClick={() => handleRemove(_id)}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>

            {/* Back button shortcut */}
            <div>
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right Column: Pricing Breakdown Card */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Price Summary</h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-700">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated GST (18% Included)</span>
                <span className="font-semibold text-slate-500">₹{Math.round(cartTotal - (cartTotal / 1.18)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charges</span>
                {cartTotal > 0 && cartTotal < 1000 ? (
                  <span className="font-bold text-slate-700">₹99</span>
                ) : (
                  <span className="text-emerald-600 font-bold">FREE Delivery</span>
                )}
              </div>
              {cartTotal > 0 && cartTotal < 1000 && (
                <p className="text-[10px] text-slate-400 font-semibold leading-snug">
                  Add <span className="text-sky-500 font-bold">₹{1000 - cartTotal}</span> more to qualify for <span className="text-emerald-600 font-bold">FREE Delivery</span>!
                </p>
              )}
              
              <div className="border-t border-slate-100 pt-3 flex justify-between text-slate-800 text-sm font-extrabold">
                <span>Order Total</span>
                <span className="text-sky-600">₹{(cartTotal + (cartTotal > 0 && cartTotal < 1000 ? 99 : 0)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-md shadow-sky-100 transition-all duration-200 active:scale-[0.99] cursor-pointer"
            >
              Proceed to Checkout
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        /* Empty Cart State layout */
        <div className="bg-white border border-slate-200/60 rounded-3xl py-16 px-6 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="bg-sky-50 rounded-full h-16 w-16 flex items-center justify-center text-sky-500 mx-auto border border-sky-100">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-bold text-slate-700 text-base">Your Cart is Empty</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You haven't added any products to your shopping cart yet. Browse our catalog to discover incredible items!
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-100 transition-all active:scale-95"
          >
            Start Shopping
          </Link>
        </div>
      )}

    </div>
  );
};

export default Cart;
