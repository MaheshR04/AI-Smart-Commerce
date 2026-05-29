import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { ShopContext } from '../context/ShopContext';
import { AuthContext } from '../context/AuthContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(ShopContext);
  const { token } = useContext(AuthContext);
  
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const navigate = useNavigate();

  const { _id, name, brand, price, discountPrice, stock, images, rating } = product;

  const isProductInWishlist = isInWishlist(_id);
  const discountPercent = discountPrice > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const activePrice = discountPrice > 0 ? discountPrice : price;

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!token) {
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      await toggleWishlist(_id);
    } catch (error) {
      console.error(error.message);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      navigate('/login');
      return;
    }

    if (stock < 1) return;

    setAddingToCart(true);
    try {
      await addToCart(_id, 1);
    } catch (error) {
      console.error(error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  // Render static/active stars based on rating
  const renderStars = (ratingVal) => {
    const stars = [];
    const floorRating = Math.floor(ratingVal || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= floorRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="group relative bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      
      {/* Absolute Wishlist Button */}
      <button
        disabled={wishlistLoading}
        onClick={handleWishlistClick}
        className={`absolute top-3 right-3 z-10 p-2.5 rounded-full border border-slate-100 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-200 active:scale-90 hover:scale-105 ${
          isProductInWishlist
            ? 'text-rose-500 hover:text-rose-600 border-rose-50'
            : 'text-slate-400 hover:text-rose-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${isProductInWishlist ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image Link */}
      <Link to={`/products/${_id}`} className="block relative aspect-square overflow-hidden bg-slate-50">
        {discountPrice > 0 && (
          <span className="absolute top-3 left-3 z-10 px-2 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        <img
          src={images[0]}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1 text-xs font-bold text-white bg-slate-800 rounded-full border border-slate-700 tracking-wider uppercase">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Information Body */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{brand}</span>
        
        <Link to={`/products/${_id}`} className="block mt-1 flex-1">
          <h3 className="text-sm font-semibold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2 leading-tight">
            {name}
          </h3>
        </Link>

        {/* Rating Row */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex">{renderStars(rating)}</div>
          <span className="text-[11px] font-semibold text-slate-500">{rating > 0 ? rating.toFixed(1) : 'No ratings'}</span>
        </div>

        {/* Pricing & Add to Cart action */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
          <div className="flex flex-col">
            {discountPrice > 0 ? (
              <>
                <span className="text-xs text-slate-400 line-through">₹{price.toLocaleString('en-IN')}</span>
                <span className="text-base font-extrabold text-slate-900">₹{discountPrice.toLocaleString('en-IN')}</span>
              </>
            ) : (
              <span className="text-base font-extrabold text-slate-900">₹{price.toLocaleString('en-IN')}</span>
            )}
          </div>

          <button
            disabled={stock === 0 || addingToCart}
            onClick={handleAddToCartClick}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 duration-200 ${
              stock === 0
                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                : 'bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white hover:shadow-md hover:shadow-sky-100 border-sky-100 hover:border-sky-500'
            }`}
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
