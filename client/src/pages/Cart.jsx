import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { ShopContext } from '../context/ShopContext';
import { Trash2, ShoppingBag, ChevronRight, ArrowLeft, Heart, Sparkles, Plus } from 'lucide-react';
import API from '../services/api';

export const Cart = () => {
  const {
    cart,
    loading,
    updateCartItemQuantity,
    removeFromCart,
    getCartTotal,
    addToCart,
  } = useContext(CartContext);

  const { wishlist, toggleWishlist } = useContext(ShopContext);

  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!cart?.products || cart.products.length === 0) {
        setSuggestions([]);
        return;
      }
      
      const productIds = cart.products
        .map(item => item.productId?._id)
        .filter(Boolean);
        
      if (productIds.length === 0) {
        setSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const response = await API.post('/ai/cart-suggestions', { productIds });
        if (response.data && response.data.success) {
          setSuggestions(response.data.suggestions);
        }
      } catch (err) {
        console.error('Failed to load cart suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [cart?.products]);

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

  const handleSaveForLater = async (productId) => {
    try {
      const inWishlist = wishlist?.products?.some(
        (item) => (item._id || item).toString() === productId.toString()
      );
      if (!inWishlist) {
        await toggleWishlist(productId);
      }
      await removeFromCart(productId);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      const wishlistProduct = wishlist?.products?.find((p) => p && (p._id || p).toString() === productId.toString());
      await addToCart(productId, 1, wishlistProduct);
      await toggleWishlist(productId);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await toggleWishlist(productId);
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

                      {/* Save for later button */}
                      <button
                        onClick={() => handleSaveForLater(_id)}
                        className="text-slate-400 hover:text-sky-500 p-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                        title="Save for Later"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Save for Later</span>
                      </button>

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

            {/* Saved for Later Section */}
            {wishlist?.products?.length > 0 && (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  Saved for Later ({wishlist.products.length} {wishlist.products.length === 1 ? 'item' : 'items'})
                </h3>
                <div className="divide-y divide-slate-100">
                  {wishlist.products.map((item) => {
                    if (!item) return null;
                    const { _id, name, brand, images, price, discountPrice, stock } = item;
                    const activePrice = discountPrice > 0 ? discountPrice : price;
                    return (
                      <div key={_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                        
                        {/* Saved item image & title info */}
                        <div className="flex items-center gap-4 flex-1">
                          <Link to={`/products/${_id}`} className="aspect-square w-14 sm:w-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                            <img src={images[0]} alt={name} className="w-full h-full object-cover" />
                          </Link>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{brand}</span>
                            <Link to={`/products/${_id}`} className="block">
                              <h4 className="text-xs font-semibold text-slate-800 hover:text-sky-600 transition-colors line-clamp-1 leading-tight">
                                {name}
                              </h4>
                            </Link>
                            <div className="flex items-baseline gap-1.5 pt-0.5">
                              <span className="text-xs font-bold text-slate-800">₹{activePrice.toLocaleString('en-IN')}</span>
                              {discountPrice > 0 && (
                                <span className="text-[9px] text-slate-400 line-through">₹{price.toLocaleString('en-IN')}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Move to Cart / Delete actions */}
                        <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 justify-end">
                          <button
                            onClick={() => handleMoveToCart(_id)}
                            disabled={stock === 0}
                            className="px-3 py-1.5 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white rounded-xl text-[10px] font-bold border border-sky-100 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            {stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                          </button>
                          <button
                            onClick={() => handleRemoveFromWishlist(_id)}
                            className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                            title="Remove Saved Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Smart Cart Add-ons */}
            {suggestions.length > 0 && (
              <div className="bg-gradient-to-tr from-sky-50/50 to-indigo-50/50 border border-sky-100/60 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-sky-100 dark:bg-sky-950/40 p-2 rounded-xl text-sky-600 dark:text-sky-400">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1">
                      Smart Cart Add-ons
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Frequently bought together with the items in your cart</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map((suggestion) => {
                    const { product, reason } = suggestion;
                    const { _id, name, brand, images, price, discountPrice } = product;
                    const activePrice = discountPrice > 0 ? discountPrice : price;

                    return (
                      <div key={_id} className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 hover:border-sky-200/70 dark:hover:border-sky-850 rounded-2xl p-4 transition-all duration-300 hover:shadow-sm flex flex-col justify-between gap-3 group">
                        <div className="flex gap-3">
                          <Link to={`/products/${_id}`} className="aspect-square w-16 rounded-xl overflow-hidden border border-slate-150 dark:border-slate-750 bg-slate-50 dark:bg-slate-900 flex-shrink-0">
                            <img src={images[0]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
                          </Link>
                          
                          <div className="space-y-1 min-w-0">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{brand}</span>
                            <Link to={`/products/${_id}`} className="block">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors line-clamp-1 leading-tight">
                                {name}
                              </h4>
                            </Link>
                            <div className="flex items-baseline gap-1.5 pt-0.5">
                              <span className="text-xs font-extrabold text-slate-850 dark:text-slate-200">₹{activePrice.toLocaleString('en-IN')}</span>
                              {discountPrice > 0 && (
                                <span className="text-[9px] text-slate-400 dark:text-slate-550 line-through">₹{price.toLocaleString('en-IN')}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* AI Reason banner */}
                        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-105 dark:border-slate-800 p-3 rounded-xl flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-sky-500 flex-shrink-0 mt-0.5" />
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                            "{reason}"
                          </p>
                        </div>

                        <button
                          onClick={() => addToCart(_id, 1, product)}
                          className="w-full py-2 bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-500 hover:text-white border border-sky-100/50 dark:border-sky-900/45 hover:border-sky-500 text-sky-600 dark:text-sky-400 hover:dark:text-white text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Accessory
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
