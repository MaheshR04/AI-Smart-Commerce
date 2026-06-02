import { useContext, useState, useEffect } from 'react';
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

  const [imgSrc, setImgSrc] = useState(images && images[0] ? images[0] : '');

  useEffect(() => {
    setImgSrc(images && images[0] ? images[0] : '');
  }, [images]);

  const safePrice = typeof price === 'number' ? price : 0;
  const safeDiscountPrice = typeof discountPrice === 'number' ? discountPrice : 0;
  const isProductInWishlist = typeof isInWishlist === 'function' && _id ? isInWishlist(_id) : false;
  const discountPercent = safeDiscountPrice > 0 && safePrice > 0 ? Math.round(((safePrice - safeDiscountPrice) / safePrice) * 100) : 0;
  const activePrice = safeDiscountPrice > 0 ? safeDiscountPrice : safePrice;

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
    <div className="group relative bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-sm hover:shadow-md dark:shadow-none hover:border-sky-200 dark:hover:border-slate-600/50 transition-all duration-300 overflow-hidden flex flex-col h-full">
      
      {/* Absolute Wishlist Button */}
      <button
        disabled={wishlistLoading}
        onClick={handleWishlistClick}
        className={`absolute top-3 right-3 z-10 p-2.5 rounded-full border border-slate-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-sm transition-all duration-200 active:scale-90 hover:scale-105 ${
          isProductInWishlist
            ? 'text-rose-500 hover:text-rose-600 border-rose-50'
            : 'text-slate-400 dark:text-slate-500 hover:text-rose-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${isProductInWishlist ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image Link */}
      <Link to={`/products/${_id}`} className="block relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-900/40">
        {discountPrice > 0 && (
          <span className="absolute top-3 left-3 z-10 px-2 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        <img
          src={imgSrc || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800'}
          alt={name}
          onError={() => setImgSrc('https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800')}
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
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{brand}</span>
        
        <Link to={`/products/${_id}`} className="block mt-1 flex-1">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-tight">
            {name}
          </h3>
        </Link>

        {/* Rating Row */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex">{renderStars(rating)}</div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{rating > 0 ? rating.toFixed(1) : 'No ratings'}</span>
        </div>

        {/* Pricing & Add to Cart action */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex flex-col">
            {safeDiscountPrice > 0 ? (
              <>
                <span className="text-xs text-slate-400 dark:text-slate-500 line-through">₹{safePrice.toLocaleString('en-IN')}</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">₹{safeDiscountPrice.toLocaleString('en-IN')}</span>
              </>
            ) : (
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">₹{safePrice.toLocaleString('en-IN')}</span>
            )}
          </div>

          <button
            disabled={stock === 0 || addingToCart}
            onClick={handleAddToCartClick}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 duration-200 ${
              stock === 0
                ? 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800 cursor-not-allowed'
                : 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-500 dark:hover:bg-sky-500 hover:text-white border-sky-100 dark:border-sky-900/40 hover:border-sky-500 dark:hover:border-sky-500'
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
