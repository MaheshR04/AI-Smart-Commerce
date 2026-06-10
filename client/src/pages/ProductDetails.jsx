import { useContext, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import ReviewSection from '../components/ReviewSection';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingCart, Star, ShieldCheck, Truck, RefreshCw, ChevronLeft, Eye, Sparkles, Share2, Scale, MessageSquare } from 'lucide-react';
import { ToastContext } from '../context/ToastContext';
import API from '../services/api';

export const ProductDetails = () => {
  const { id } = useParams();
  const { toggleWishlist, isInWishlist, products } = useContext(ShopContext);
  const { addToCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  
  const [reviewSummary, setReviewSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  const navigate = useNavigate();

  // Load review summary
  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const response = await API.get(`/ai/reviews/summary/${id}`);
        if (response.data && response.data.success) {
          setReviewSummary(response.data.summary);
        }
      } catch (err) {
        console.error('Failed to fetch review summary:', err.message);
      } finally {
        setSummaryLoading(false);
      }
    };
    if (id) {
      fetchSummary();
    }
  }, [id]);

  // Load single product details
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/products/${id}`);
        const prod = response.data.data;
        setProduct(prod);
        setActiveImage(prod.images[0] || '');
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Failed to load product:', error.message);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Log viewed product to local storage
  useEffect(() => {
    if (product?._id) {
      let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      viewed = viewed.filter((vid) => vid !== product._id);
      viewed.unshift(product._id);
      localStorage.setItem('recentlyViewed', JSON.stringify(viewed.slice(0, 10)));
    }
  }, [product]);

  // Load related products (same category, excluding current product)
  useEffect(() => {
    const fetchRelated = async () => {
      if (!product?.category) return;
      try {
        const response = await API.get('/products', {
          params: { category: product.category, limit: 5 }
        });
        const filtered = response.data.data.filter((p) => p._id !== product._id);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error('Failed to load related products:', err.message);
      }
    };
    fetchRelated();
  }, [product]);

  // Load recently viewed products details
  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    if (ids.length > 0 && products.length > 0) {
      const items = ids
        .filter((vid) => vid !== product?._id)
        .map((vid) => products.find((p) => p._id === vid))
        .filter(Boolean);
      setRecentItems(items.slice(0, 4));
    }
  }, [products, product]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full animate-pulse space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Product Images Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square w-full bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              ))}
            </div>
          </div>
          {/* Right: Product Details Skeleton */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="h-8 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
            <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-xl py-2"></div>
            <div className="space-y-2.5">
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="h-12 w-28 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="h-12 flex-1 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4 flex-1">
        <h3 className="text-lg font-bold text-slate-700">Product Not Found</h3>
        <p className="text-xs text-slate-400">The product you are trying to view does not exist or has been removed.</p>
        <Link to="/" className="inline-flex items-center gap-1 text-xs font-bold text-sky-600">
          <ChevronLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const { name, brand, category, description, price, discountPrice, stock, images, rating, specifications } = product;

  const isProductInWishlist = isInWishlist(id);
  const activePrice = discountPrice > 0 ? discountPrice : price;
  const saving = discountPrice > 0 ? price - discountPrice : 0;
  const savingPercent = discountPrice > 0 ? Math.round((saving / price) * 100) : 0;

  const handleWishlistClick = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      await toggleWishlist(id);
    } catch (error) {
      console.error(error.message);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (stock < 1) return;

    setAddingToCart(true);
    try {
      await addToCart(id, quantity, product);
    } catch (error) {
      console.error(error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (stock < 1) return;

    setAddingToCart(true);
    try {
      await addToCart(id, quantity, product);
      navigate('/checkout');
    } catch (error) {
      console.error(error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast('Product link copied to clipboard.', 'success');
    } catch (err) {
      addToast('Failed to copy product link.', 'error');
    }
  };

  const renderStars = (ratingVal) => {
    const stars = [];
    const floorRating = Math.floor(ratingVal || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= floorRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-10">
      
      {/* Back button */}
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>

      {/* Main product visual grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start animate-fade-in">
        
        {/* Left Side: Product Gallery */}
        <div className="space-y-4">
          
          {/* Main active image preview box */}
          <div className="aspect-square bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm relative group">
            <img src={activeImage} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            
            {/* Floating Wishlist Heart */}
            <button
              disabled={wishlistLoading}
              onClick={handleWishlistClick}
              className={`absolute top-4 right-4 z-10 p-3 rounded-full border shadow-sm transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer focus:outline-none ${
                isProductInWishlist
                  ? 'border-rose-100 bg-rose-500 text-white hover:bg-rose-600 shadow-rose-100'
                  : 'border-slate-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-400 dark:text-slate-500 hover:text-rose-500 backdrop-blur-md animate-fade-in'
              }`}
              title={isProductInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-5 h-5 ${isProductInWishlist ? 'fill-current' : ''}`} />
            </button>

            {/* Floating Share Button */}
            <button
              onClick={handleShareClick}
              className="absolute top-20 right-4 z-10 p-3 rounded-full border border-slate-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 shadow-sm transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer focus:outline-none backdrop-blur-md animate-fade-in"
              title="Share Product"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {discountPrice > 0 && (
              <span className="absolute top-4 left-4 z-10 px-2.5 py-1 text-xs font-bold text-white bg-rose-500 rounded-lg shadow-sm">
                {savingPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail strip selection */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square w-20 rounded-xl border overflow-hidden flex-shrink-0 bg-white transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                    activeImage === img ? 'border-sky-500 ring-2 ring-sky-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details Column */}
        <div className="space-y-6">
          
          {/* Catalog headers */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100 rounded-lg px-2.5 py-1 uppercase tracking-wider">
                {brand}
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-lg px-2.5 py-1 uppercase tracking-wider">
                {category}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-snug">
              {name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(rating)}</div>
              <span className="text-xs font-semibold text-slate-500">{rating > 0 ? `${rating.toFixed(1)} Out of 5 Stars` : 'No reviews yet'}</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 space-y-1">
            <p className="text-xs font-semibold text-slate-400">Total Price</p>
            <div className="flex items-baseline gap-3">
              {discountPrice > 0 ? (
                <>
                  <span className="text-3xl font-extrabold text-slate-900">₹{discountPrice.toLocaleString('en-IN')}</span>
                  <span className="text-sm text-slate-400 line-through">₹{price.toLocaleString('en-IN')}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-0.5 ml-2">
                    Save ₹{saving.toLocaleString('en-IN')} ({savingPercent}%)
                  </span>
                </>
              ) : (
                <span className="text-3xl font-extrabold text-slate-900">₹{price.toLocaleString('en-IN')}</span>
              )}
            </div>

            {/* Stock status indicator */}
            <div className="pt-3">
              {stock > 0 ? (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1">
                  In Stock (Available: {stock} units)
                </span>
              ) : (
                <span className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1">
                  Temporarily Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-700">Product Description</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Purchase Actions (Quantity selector & Cart/Wishlist trigger) */}
          {stock > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-500">Select Quantity:</span>
                
                {/* Quantity Editor buttons */}
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((prev) => prev - 1)}
                    className="px-3 py-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border-x border-slate-100">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= stock}
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="px-3 py-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl font-bold shadow-sm active:scale-95 disabled:opacity-50 transition-all duration-200 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-md shadow-sky-100 active:scale-95 disabled:opacity-50 transition-all duration-200 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Buy Now
                </button>
              </div>
              
              <button
                onClick={() => navigate(`/compare?ids=${id}`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-200 rounded-xl font-bold text-xs shadow-sm transition-all duration-200 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                Compare with Similar
              </button>
            </div>
          )}

          {/* Secure details tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-slate-500 text-[11px] font-medium">
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>100% Authentic Products</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <Truck className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <span>Free Delivery Available</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <RefreshCw className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>7-Day Return Policy</span>
            </div>
          </div>

        </div>

      </div>

      {/* Specifications list section */}
      {specifications && specifications.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-100 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Product Specifications</h3>
          <div className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {specifications.map((spec, idx) => (
                <div key={idx} className="grid grid-cols-3 p-3.5 text-xs">
                  <div className="font-semibold text-slate-400 uppercase tracking-wider">{spec.key}</div>
                  <div className="col-span-2 font-bold text-slate-700">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-slate-100 animate-fade-in">
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-500" />
            Related Products
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products Section */}
      {recentItems.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-slate-100 animate-fade-in">
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-500" />
            Recently Viewed
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recentItems.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* AI Review Summary panel */}
      {summaryLoading ? (
        <div className="bg-white/85 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm animate-pulse space-y-4">
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>
      ) : reviewSummary ? (
        <section className="bg-gradient-to-r from-indigo-50/50 to-sky-50/50 dark:from-slate-850 dark:to-slate-800 border border-indigo-100/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
              AI Review Summary
            </h3>
            <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 px-2 py-0.5 rounded-full">
              Gemini Synthesized
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pros */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Pros (Key Strengths)
              </h4>
              <ul className="space-y-1.5">
                {reviewSummary.pros && reviewSummary.pros.map((pro, index) => (
                  <li key={index} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold text-red-500 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                Cons (Reported Drawbacks)
              </h4>
              <ul className="space-y-1.5">
                {reviewSummary.cons && reviewSummary.cons.map((con, index) => (
                  <li key={index} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Verdict and Opinions grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* AI Verdict */}
            <div className="bg-white/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-indigo-50/50 dark:border-slate-750 flex flex-col justify-between">
              <div>
                <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Overall Verdict</h5>
                <p className="text-xs text-slate-755 dark:text-slate-300 mt-1.5 leading-relaxed italic">
                  "{reviewSummary.verdict}"
                </p>
              </div>
            </div>

            {/* Common customer opinions */}
            {reviewSummary.opinions && reviewSummary.opinions.length > 0 && (
              <div className="bg-white/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-indigo-50/50 dark:border-slate-750">
                <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                  Common Customer Opinions
                </h5>
                <ul className="space-y-1.5 mt-2">
                  {reviewSummary.opinions.map((opinion, idx) => (
                    <li key={idx} className="text-xs text-slate-650 dark:text-slate-350 flex items-start gap-2">
                      <span className="text-sky-500 font-bold mt-0.5">•</span>
                      <span>{opinion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* Reviews section wrapper */}
      <ReviewSection productId={id} />

    </div>
  );
};

export default ProductDetails;
