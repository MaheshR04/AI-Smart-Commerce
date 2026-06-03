import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { CartContext } from '../context/CartContext';
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';

export const Wishlist = () => {
  const { wishlist, toggleWishlist, loading } = useContext(ShopContext);
  const { addToCart } = useContext(CartContext);

  const wishlistCount = wishlist?.products?.length || 0;

  const handleRemove = async (productId) => {
    try {
      await toggleWishlist(productId);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleAddToCart = async (productId, productDetails) => {
    try {
      await addToCart(productId, 1, productDetails);
      // Remove from wishlist upon adding to cart
      await toggleWishlist(productId);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading && wishlistCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-sky-500"></div>
        <p className="text-slate-400 mt-4 text-xs font-semibold">Updating saved items...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
      <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
        My Wishlist ({wishlistCount} {wishlistCount === 1 ? 'item' : 'items'})
      </h1>

      {wishlistCount > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.products.map((item) => {
            const { _id, name, brand, images, price, discountPrice, stock } = item;
            const activePrice = discountPrice > 0 ? discountPrice : price;
            
            return (
              <div
                key={_id}
                className="group bg-white border border-slate-200/60 rounded-2xl p-4 relative shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
              >
                {/* Delete button top right */}
                <button
                  onClick={() => handleRemove(_id)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full border border-slate-100 bg-white/90 text-slate-400 hover:text-red-500 shadow-sm transition-all duration-200 hover:scale-105 active:scale-90"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Product image link */}
                <Link to={`/products/${_id}`} className="block relative aspect-square overflow-hidden bg-slate-50 rounded-xl">
                  <img src={images[0]} alt={name} className="w-full h-full object-cover" />
                </Link>

                {/* Product details */}
                <div className="flex flex-col flex-1 mt-4">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{brand}</span>
                  
                  <Link to={`/products/${_id}`} className="block mt-1 flex-1">
                    <h3 className="text-xs font-semibold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2 leading-tight">
                      {name}
                    </h3>
                  </Link>

                  <div className="flex items-baseline gap-2 pt-2 pb-4">
                    <span className="text-sm font-bold text-slate-800">₹{activePrice.toLocaleString('en-IN')}</span>
                    {discountPrice > 0 && (
                      <span className="text-[10px] text-slate-400 line-through">₹{price.toLocaleString('en-IN')}</span>
                    )}
                  </div>

                  {/* Quick Cart trigger */}
                  <button
                    onClick={() => handleAddToCart(_id, item)}
                    disabled={stock === 0}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-sky-100 disabled:opacity-50 active:scale-95 duration-200"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Saved list state layout */
        <div className="bg-white border border-slate-200/60 rounded-3xl py-16 px-6 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="bg-rose-50 rounded-full h-16 w-16 flex items-center justify-center text-rose-500 mx-auto border border-rose-100">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <h2 className="font-bold text-slate-700 text-base">Your Wishlist is Empty</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You haven't saved any items yet. When you discover products you love, click the heart button to save them here!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Browsing
          </Link>
        </div>
      )}

    </div>
  );
};

export default Wishlist;
