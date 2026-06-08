import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import API from '../services/api';
import { 
  Filter, SlidersHorizontal, ArrowUpDown, RefreshCw, ChevronLeft, ChevronRight, 
  Sparkles, ArrowRight, Eye, Star, ShoppingBag, Truck, ShieldCheck, RotateCcw, 
  Headset, ShoppingCart, User, Gift, Percent, Compass, Heart
} from 'lucide-react';


export const Home = () => {
  const shopContextData = useContext(ShopContext) || {};
  const {
    products = [],
    categories = [],
    loading = false,
    filters = {},
    paginationInfo = {},
    updateFilters = () => {},
    resetFilters = () => {},
    wishlist = { products: [] },
  } = shopContextData;

  const { user } = useContext(AuthContext) || {};
  const { getCartCount } = useContext(CartContext) || {};
  
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeFilters = filters || {};
  const safePagination = {
    pages: typeof paginationInfo?.pages === 'number' ? paginationInfo.pages : 1,
    currentPage: typeof paginationInfo?.currentPage === 'number' ? paginationInfo.currentPage : 1,
    total: typeof paginationInfo?.total === 'number' ? paginationInfo.total : 0,
  };

  const wishlistCount = Array.isArray(wishlist?.products) ? wishlist.products.filter(Boolean).length : 0;
  const cartCount = typeof getCartCount === 'function' ? getCartCount() : 0;

  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const dealsScrollRef = useRef(null);
  const safeRecentlyViewed = Array.isArray(recentlyViewed) ? recentlyViewed.filter(Boolean) : [];

  const [aiChat, setAiChat] = useState([
    { sender: 'ai', text: `Hi ${user ? user.name.split(' ')[0] : 'there'}! I'm your AI Shopping Copilot. What can I find for you today?` }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiPrompt = async (promptText) => {
    if (!promptText.trim()) return;
    
    setAiChat(prev => [...prev, { sender: 'user', text: promptText }]);
    setAiLoading(true);

    try {
      const chatHistory = aiChat.map(c => ({
        role: c.sender === 'user' ? 'user' : 'model',
        parts: [{ text: c.text }]
      }));

      const response = await API.post('/ai/chat', {
        message: promptText,
        history: chatHistory
      });

      if (response.data && response.data.success) {
        setAiChat(prev => [...prev, { 
          sender: 'ai', 
          text: response.data.reply, 
          recommendations: response.data.recommendations 
        }]);
      } else {
        setAiChat(prev => [...prev, { 
          sender: 'ai', 
          text: "I'm sorry, I'm having trouble processing that request right now." 
        }]);
      }
    } catch (err) {
      console.error('AI chat failed:', err);
      setAiChat(prev => [...prev, { 
        sender: 'ai', 
        text: "I'm sorry, I couldn't reach the AI service right now. Please try again later." 
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const text = aiInput;
    setAiInput('');
    handleAiPrompt(text);
  };

  // Extract unique brands for filtering
  const brandsList = [
    'Apple', 'Samsung', 'OnePlus', 'Google', 'Sony', 'boAt', 'JBL', 'Anker',
    'Logitech', 'Dell', 'HP', 'Lenovo', 'SanDisk', 'Levi\'s', 'Zara', 'H&M',
    'Nike', 'Adidas', 'Puma', 'Bata', 'Fossil', 'Casio', 'Titan', 'Ray-Ban',
    'American Tourister', 'Philips', 'Prestige', 'Milton', 'Borosil', 'IKEA',
    'Dyson', 'Xiaomi', 'Penguin', 'O\'Reilly', 'Cetaphil', 'L\'Oreal',
    'Mamaearth', 'Lakme', 'Maybelline', 'Gillette'
  ];

  const promoSlides = [
    {
      title: "Discover the Future of Smart Commerce",
      subtitle: "Special Inaugural Launch Sale",
      desc: "Explore top-tier premium gadgets, smart electronics, and futuristic tech accessories at exclusive prices.",
      cta: "Shop Electronics",
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Elevate Your Styling Details",
      subtitle: "Express Your Style Daily",
      desc: "Find modern, premium threads designed with breathable fabrics and modern visual textures.",
      cta: "Shop Apparel",
      category: "Apparel",
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Upgrade Culinary Essentials",
      subtitle: "Chef-Grade Cooking Gear",
      desc: "Upgrade your culinary tools with cast irons, sustainable bamboo boards, and organic cookware.",
      cta: "Shop Home & Kitchen",
      category: "Home & Kitchen",
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800",
    }
  ];

  // Safely grab the current active promo slide
  const currentPromo = promoSlides[activeSlide] || promoSlides[0];

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      if (Array.isArray(ids) && ids.length > 0) {
        const items = ids
          .map((id) => safeProducts.find((prod) => prod && prod._id === id))
          .filter(Boolean);
        setRecentlyViewed(items);
      }
    } catch (err) {
      console.error('Failed to parse recentlyViewed:', err);
    }
  }, [safeProducts]);

  const handleCategorySelect = (categoryName) => {
    const nextCategory = safeFilters.category === categoryName ? '' : categoryName;
    updateFilters({ category: nextCategory, page: 1 });
  };

  const handleSortChange = (e) => {
    updateFilters({ sort: e.target.value, page: 1 });
  };

  const handlePriceFilterSubmit = (e) => {
    e.preventDefault();
    const min = e.target.elements.minPrice.value;
    const max = e.target.elements.maxPrice.value;
    updateFilters({ minPrice: min, maxPrice: max, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > safePagination.pages) return;
    updateFilters({ page: newPage });
  };

  const scrollDeals = (direction) => {
    if (dealsScrollRef.current) {
      const { scrollLeft, clientWidth } = dealsScrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      dealsScrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Helper to safely extract dynamic product images
  const getProductImage = (prod) => {
    return prod && prod.images && prod.images[0]
      ? prod.images[0]
      : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800';
  };

  // Helper to safely extract user profile information
  const getUserFirstName = () => {
    if (!user || !user.name) return 'User';
    return user.name.split(' ')[0];
  };

  const getUserInitial = () => {
    if (!user || !user.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  // Helper to safely extract exactly 4 items for 2x2 grids, falling back elegantly if database is sparsely seeded
  const get2x2Products = (categoryName) => {
    if (safeProducts.length === 0) return [];
    
    let matched = safeProducts.filter((prod) => {
      if (!prod || !prod.category) return false;
      const catStr = typeof prod.category === 'object' 
        ? (prod.category.name || '') 
        : String(prod.category);
      return catStr.toLowerCase().includes(categoryName.toLowerCase());
    });
    
    if (matched.length >= 4) {
      return matched.slice(0, 4);
    }
    
    const remaining = safeProducts.filter((p) => p && !matched.some((m) => m && p && m._id === p._id));
    const combined = [...matched, ...remaining].slice(0, 4);
    
    if (combined.length < 4) {
      return safeProducts.slice(0, 4);
    }
    return combined;
  };

  const getDiscountedProducts = () => {
    if (safeProducts.length === 0) return [];
    let matched = safeProducts.filter((prod) => prod && typeof prod.discountPrice === 'number' && prod.discountPrice > 0);
    if (matched.length >= 4) {
      return matched.slice(0, 4);
    }
    const remaining = safeProducts.filter((p) => p && !matched.some((m) => m && p && m._id === p._id));
    const combined = [...matched, ...remaining].slice(0, 4);
    return combined.length < 4 ? safeProducts.slice(0, 4) : combined;
  };

  // Evaluate dynamic sections data
  const featured = safeProducts.filter((prod) => prod && typeof prod.rating === 'number' && prod.rating >= 4.0).slice(0, 4);
  const featuredProducts = featured.length > 0 ? featured : safeProducts.slice(0, 4);

  const electronics2x2 = get2x2Products('electronics');
  const fashion2x2 = get2x2Products('fashion');
  const discounted2x2 = getDiscountedProducts();

  const newArrivals = safeProducts.slice(0, 4);

  // Check if search, category, brand, or price constraints are active
  const isFilterActive = !!(
    safeFilters.keyword ||
    safeFilters.category ||
    safeFilters.brand ||
    safeFilters.minPrice ||
    safeFilters.maxPrice ||
    safeFilters.page > 1
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex-1">
      
      {/* Category selection quick scroll header */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-slate-405 dark:text-slate-400 uppercase tracking-widest">Browse Categories</h2>
        <div className="flex items-center gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {safeCategories.map((cat) => {
            if (!cat) return null;
            const isSelected = safeFilters.category === cat.name;
            return (
              <button
                key={cat._id || cat.name || Math.random()}
                onClick={() => handleCategorySelect(cat.name)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-200 flex-shrink-0 text-xs font-semibold shadow-sm active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500 text-white shadow-sky-100 dark:shadow-none'
                    : 'border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800 text-slate-650 dark:text-slate-350 hover:border-slate-350 dark:hover:border-slate-600'
                }`}
              >
                <img src={cat.image} alt={cat.name || 'Category'} className="w-5 h-5 rounded-lg object-cover" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* RENDER OPTION A: Curated Visual Landing Page Feed */}
      {!isFilterActive && (
        <div className="space-y-12 animate-fade-in">
          
          {/* Promo Slider Hero Banner */}
          <div className="relative group overflow-hidden bg-gradient-to-r from-slate-900 via-slate-855 to-indigo-950 rounded-[32px] text-white py-14 px-6 sm:px-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800/80 transition-all duration-300 pb-20 md:pb-28">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-5 max-w-xl text-center md:text-left z-10">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-sky-500/15 border border-sky-500/25 text-sky-400 rounded-full text-[10px] font-extrabold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                {currentPromo.subtitle}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight transition-all duration-300">
                {currentPromo.title}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed transition-all duration-300">
                {currentPromo.desc}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handleCategorySelect(currentPromo.category)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md hover:shadow-sky-550/20 active:scale-95 cursor-pointer"
                >
                  {currentPromo.cta} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slider image view box */}
            <div className="relative w-full max-w-[290px] sm:max-w-[340px] aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10 bg-slate-800">
              <img
                src={currentPromo.image}
                alt="Promo banner slide"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              
              {/* Active Slider Dots */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                {promoSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      activeSlide === idx ? 'bg-sky-400 w-4' : 'bg-white/40'
                    }`}
                  ></button>
                ))}
              </div>
            </div>

            {/* Left and Right slide triggers */}
            <button
              onClick={() => setActiveSlide((prev) => (prev === 0 ? promoSlides.length - 1 : prev - 1))}
              className="absolute left-4 top-[40%] md:top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/15 text-white/80 p-2.5 rounded-full border border-white/10 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100 hidden sm:block cursor-pointer backdrop-blur-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveSlide((prev) => (prev === promoSlides.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-[40%] md:top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/15 text-white/85 p-2.5 rounded-full border border-white/10 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100 hidden sm:block cursor-pointer backdrop-blur-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dashboard Overlay Grid (Amazon-Style Overlap) */}
          <div className="relative -mt-12 sm:-mt-20 lg:-mt-28 z-20 px-2 sm:px-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Electronics Hub */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:shadow-xl hover:border-sky-100 dark:hover:border-slate-700 transition-all duration-300 group">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-855 dark:text-slate-100 tracking-tight mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    Best Selling Electronics
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {electronics2x2.map((prod) => {
                      if (!prod) return null;
                      const activePrice = prod.discountPrice > 0 ? prod.discountPrice : prod.price;
                      return (
                        <button
                          key={prod._id || Math.random()}
                          onClick={() => navigate(`/products/${prod._id}`)}
                          className="flex flex-col text-left group/item focus:outline-none cursor-pointer"
                        >
                          <div className="aspect-square w-full rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-750 overflow-hidden relative mb-1.5 shadow-sm">
                            <img
                              src={getProductImage(prod)}
                              alt={prod.name || 'Product'}
                              className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-350"
                            />
                            {prod.discountPrice > 0 && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[8px] font-bold text-white bg-rose-500 rounded-md">
                                Deal
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-full leading-tight">
                            {prod.name}
                          </span>
                          <span className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400 mt-0.5">
                            ₹{activePrice ? activePrice.toLocaleString('en-IN') : '0'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => handleCategorySelect('Electronics')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-750 dark:hover:text-sky-300 mt-2 hover:translate-x-1 transition-transform cursor-pointer focus:outline-none"
                >
                  Explore Smart Tech <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 2: Modern Styling Apparel */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:shadow-xl hover:border-sky-100 dark:hover:border-slate-700 transition-all duration-300 group">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-855 dark:text-slate-100 tracking-tight mb-4 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-500" />
                    Premium Style & Apparel
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {fashion2x2.map((prod) => {
                      if (!prod) return null;
                      const activePrice = prod.discountPrice > 0 ? prod.discountPrice : prod.price;
                      return (
                        <button
                          key={prod._id || Math.random()}
                          onClick={() => navigate(`/products/${prod._id}`)}
                          className="flex flex-col text-left group/item focus:outline-none cursor-pointer"
                        >
                          <div className="aspect-square w-full rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-750 overflow-hidden relative mb-1.5 shadow-sm">
                            <img
                              src={getProductImage(prod)}
                              alt={prod.name || 'Product'}
                              className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-350"
                            />
                            {prod.discountPrice > 0 && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[8px] font-bold text-white bg-rose-500 rounded-md">
                                Sale
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-full leading-tight">
                            {prod.name}
                          </span>
                          <span className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400 mt-0.5">
                            ₹{activePrice ? activePrice.toLocaleString('en-IN') : '0'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => handleCategorySelect('Fashion')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-755 dark:hover:text-sky-300 mt-2 hover:translate-x-1 transition-transform cursor-pointer focus:outline-none"
                >
                  Explore Modern Styling <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 3: Discount clearance */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:shadow-xl hover:border-sky-100 dark:hover:border-slate-700 transition-all duration-300 group">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-855 dark:text-slate-100 tracking-tight mb-4 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-rose-500" />
                    Unbeatable Clearance Deals
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {discounted2x2.map((prod) => {
                      if (!prod) return null;
                      const activePrice = prod.discountPrice > 0 ? prod.discountPrice : prod.price;
                      const savePercent = prod.discountPrice > 0 && prod.price > 0 ? Math.round(((prod.price - prod.discountPrice) / prod.price) * 100) : 0;
                      return (
                        <button
                          key={prod._id || Math.random()}
                          onClick={() => navigate(`/products/${prod._id}`)}
                          className="flex flex-col text-left group/item focus:outline-none cursor-pointer"
                        >
                          <div className="aspect-square w-full rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-750 overflow-hidden relative mb-1.5 shadow-sm">
                            <img
                              src={getProductImage(prod)}
                              alt={prod.name || 'Product'}
                              className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-350"
                            />
                            {savePercent > 0 && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[8px] font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-md">
                                {savePercent}% OFF
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-full leading-tight">
                            {prod.name}
                          </span>
                          <span className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                            ₹{activePrice ? activePrice.toLocaleString('en-IN') : '0'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => updateFilters({ sort: 'priceAsc', page: 1 })}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-750 dark:hover:text-sky-300 mt-2 hover:translate-x-1 transition-transform cursor-pointer focus:outline-none"
                >
                  See All Bargain Deals <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 4: AI Shopping Copilot Widget */}
              <div className="bg-gradient-to-b from-slate-900 to-indigo-950 dark:from-slate-900 dark:to-slate-950 border border-indigo-500/20 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative overflow-hidden h-[380px] text-white">
                {/* Background glow effects */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute"></span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full relative"></span>
                    </div>
                    <span className="text-[10px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">AI Shopping Copilot</span>
                  </div>
                  {aiChat.length > 1 && (
                    <button
                      onClick={() => setAiChat([{ sender: 'ai', text: `Hi ${user ? user.name.split(' ')[0] : 'there'}! I'm your AI Shopping Copilot. What can I find for you today?` }])}
                      className="text-[9px] text-slate-400 hover:text-white transition-colors uppercase font-bold cursor-pointer"
                    >
                      Clear Chat
                    </button>
                  )}
                </div>

                {/* Chat Log Body */}
                <div className="flex-1 overflow-y-auto my-3 space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scroll-smooth">
                  {aiChat.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}>
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-sky-500 text-white rounded-tr-none shadow-sm shadow-sky-500/25'
                          : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                      }`}>
                        <div className="whitespace-pre-line">{msg.text}</div>
                        
                        {/* Interactive recommendations */}
                        {msg.recommendations && msg.recommendations.length > 0 && (
                          <div className="mt-3 grid grid-cols-1 gap-2.5">
                            {msg.recommendations.map((prod) => {
                              if (!prod) return null;
                              const priceVal = prod.discountPrice > 0 ? prod.discountPrice : prod.price;
                              const imageSrc = prod.images && prod.images[0] ? prod.images[0] : '';
                              return (
                                <Link
                                  key={prod._id}
                                  to={`/products/${prod._id}`}
                                  className="flex items-center gap-2 bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 hover:border-sky-500/40 p-2 rounded-xl transition-all text-decoration-none group"
                                >
                                  <img
                                    src={imageSrc || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'}
                                    alt={prod.name}
                                    className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-[10px] font-bold text-slate-100 truncate group-hover:text-sky-400 transition-colors">
                                      {prod.name}
                                    </h4>
                                    <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">
                                      {prod.brand} | <span className="text-sky-400 font-bold">₹{priceVal.toLocaleString('en-IN')}</span>
                                    </p>
                                  </div>
                                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-sky-400 transition-colors flex-shrink-0" />
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none px-3 py-2 w-max animate-pulse">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      Thinking...
                    </div>
                  )}
                </div>

                {/* Quick Recommendation Chips */}
                {aiChat.length === 1 && !aiLoading && (
                  <div className="flex flex-wrap gap-1.5 mb-3 flex-shrink-0 animate-fade-in">
                    <button
                      onClick={() => handleAiPrompt('Suggest smart tech')}
                      className="text-[10px] font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer hover:border-sky-400/30"
                    >
                      ⚡ Tech Deals
                    </button>
                    <button
                      onClick={() => handleAiPrompt('Trending styles')}
                      className="text-[10px] font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer hover:border-sky-400/30"
                    >
                      👕 Style Guide
                    </button>
                    <button
                      onClick={() => handleAiPrompt('Deals under ₹1,500')}
                      className="text-[10px] font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer hover:border-sky-400/30"
                    >
                      🔥 Under ₹1,500
                    </button>
                    <button
                      onClick={() => handleAiPrompt('Track my order')}
                      className="text-[10px] font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer hover:border-sky-400/30"
                    >
                      📦 Track Orders
                    </button>
                  </div>
                )}

                {/* Mock Input Form Bar */}
                <form onSubmit={handleAiSubmit} className="flex items-center gap-2 border-t border-white/10 pt-3 flex-shrink-0">
                  <input
                    type="text"
                    placeholder="Ask AI Copilot..."
                    className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-sky-500 focus:outline-none rounded-xl px-3 py-2 text-[11px] text-white placeholder-slate-500 transition-all focus:ring-1 focus:ring-sky-500"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    disabled={aiLoading}
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiInput.trim()}
                    className="p-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>
          </div>

          {/* Why Shop With Us Trust Badges */}
          <section className="py-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gradient-to-tr from-slate-50 to-white dark:from-slate-800 dark:to-slate-850 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-4.5 flex items-center gap-3.5 shadow-sm hover:scale-[1.02] transition-transform duration-300">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-sky-500 flex-shrink-0">
                  <Truck className="w-5 h-5 animate-bounce" style={{ animationDuration: '3s' }} />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-255 leading-tight">Free & Fast Delivery</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 leading-tight">On all orders above ₹499</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-tr from-slate-50 to-white dark:from-slate-800 dark:to-slate-850 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-4.5 flex items-center gap-3.5 shadow-sm hover:scale-[1.02] transition-transform duration-300">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-855 dark:text-slate-250 leading-tight">100% Secure Checkout</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 leading-tight">Fully encrypted transactions</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-tr from-slate-50 to-white dark:from-slate-800 dark:to-slate-855 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-4.5 flex items-center gap-3.5 shadow-sm hover:scale-[1.02] transition-transform duration-300">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500 flex-shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-855 dark:text-slate-250 leading-tight">7-Day Easy Returns</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 leading-tight">Hassle-free refunds process</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-tr from-slate-50 to-white dark:from-slate-800 dark:to-slate-855 border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-4.5 flex items-center gap-3.5 shadow-sm hover:scale-[1.02] transition-transform duration-300">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500 flex-shrink-0">
                  <Headset className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-855 dark:text-slate-255 leading-tight">Dedicated Support</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 leading-tight">Help center & chat access</p>
                </div>
              </div>
            </div>
          </section>

          {/* Visual Round Category Grid */}
          <section className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-850 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-500" />
              Explore Collections
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {safeCategories.map((cat) => {
                if (!cat) return null;
                return (
                  <div
                    key={cat._id || cat.name || Math.random()}
                    onClick={() => handleCategorySelect(cat.name)}
                    className="group bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-[24px] p-4.5 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:shadow-md dark:hover:shadow-none hover:border-sky-200 dark:hover:border-slate-700 hover:scale-[1.02] active:scale-95"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border border-slate-100 dark:border-slate-750 bg-slate-50 dark:bg-slate-900 group-hover:scale-110 transition-transform duration-300 shadow-sm flex items-center justify-center">
                      <img src={cat.image} alt={cat.name || 'Category'} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-350 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-tight">
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Dynamic Trending Clearance Deals Carousel */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-850 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                  <Percent className="w-5 h-5 text-rose-500 animate-pulse" />
                  Trending Clearance Deals
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Shop hot price-drops and clearance deals before they are sold out</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollDeals('left')}
                  className="p-2 border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-855 rounded-xl shadow-sm text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors focus:outline-none cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollDeals('right')}
                  className="p-2 border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-855 rounded-xl shadow-sm text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors focus:outline-none cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div
              ref={dealsScrollRef}
              className="flex items-stretch gap-6 overflow-x-auto pb-4 scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
            >
              {safeProducts.filter((p) => p && p.discountPrice > 0).length > 0 ? (
                safeProducts.filter((p) => p && p.discountPrice > 0).map((prod) => {
                  if (!prod) return null;
                  return (
                    <div key={prod._id || Math.random()} className="w-72 flex-shrink-0 flex flex-col">
                      <ProductCard product={prod} />
                    </div>
                  );
                })
              ) : (
                safeProducts.slice(4, 12).map((prod) => {
                  if (!prod) return null;
                  return (
                    <div key={prod._id || Math.random()} className="w-72 flex-shrink-0 flex flex-col">
                      <ProductCard product={prod} />
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Dynamic Featured Collection Grid */}
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-855 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                Featured Master Collection
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Explore our most popular, highly-rated selection curated by smart customers</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((prod) => {
                if (!prod) return null;
                return <ProductCard key={prod._id || Math.random()} product={prod} />;
              })}
            </div>
          </section>

          {/* New Arrivals Section */}
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-855 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-sky-500" />
                New Arrivals
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Check out the latest incoming inventory launched in the store catalog</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {newArrivals.map((prod) => {
                if (!prod) return null;
                return <ProductCard key={prod._id || Math.random()} product={prod} />;
              })}
            </div>
          </section>

          {/* Recently Viewed Products Section */}
          {safeRecentlyViewed.length > 0 && (
            <section className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-8 animate-fade-in">
              <div>
                <h2 className="text-base font-extrabold text-slate-855 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                  <Eye className="w-5 h-5 text-indigo-500" />
                  Recently Viewed Products
                </h2>
                <p className="text-[11px] text-slate-450 mt-0.5">Pick up right where you left off with items you recently looked at</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {safeRecentlyViewed.slice(0, 4).map((prod) => {
                  if (!prod) return null;
                  return <ProductCard key={prod._id || Math.random()} product={prod} />;
                })}
              </div>
            </section>
          )}

        </div>
      )}

      {/* RENDER OPTION B: Filterable search catalog directory grid */}
      {isFilterActive && (
        <div className="space-y-6 w-full animate-fade-in">
          
          {/* Back button */}
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 px-4 py-2.5 rounded-xl shadow-sm cursor-pointer active:scale-95 animate-fade-in"
          >
            <ChevronLeft className="w-4 h-4 text-sky-500" />
            Back to Home Feed
          </button>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm space-y-6 flex-shrink-0 lg:sticky lg:top-20">
            
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-sky-500" />
                Filter Catalog
              </h3>
              <button
                onClick={resetFilters}
                className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Reset All
              </button>
            </div>

            {/* Pricing bounds form */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Price Range (₹)</h4>
              <form onSubmit={handlePriceFilterSubmit} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    defaultValue={safeFilters.minPrice}
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    defaultValue={safeFilters.maxPrice}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-650 text-white rounded-lg text-xs font-semibold transition-colors animate-fade-in"
                >
                  Apply Range
                </button>
              </form>
            </div>

            {/* Brand select filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Select Brand</h4>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {brandsList.map((brand) => {
                  const isSelected = safeFilters.brand === brand;
                  return (
                    <button
                      key={brand}
                      onClick={() => updateFilters({ brand: isSelected ? '' : brand, page: 1 })}
                      className={`px-3 py-1.5 rounded-lg text-xs text-left transition-colors font-medium cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-bold border-l-2 border-sky-500'
                          : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Availability</h4>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-650 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!safeFilters.inStock}
                  onChange={(e) => updateFilters({ inStock: e.target.checked, page: 1 })}
                  className="rounded text-sky-500 focus:ring-sky-400 h-4 w-4 border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                />
                In Stock Only
              </label>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Customer Rating</h4>
              <div className="flex flex-col gap-1.5">
                {[4, 3, 2].map((num) => {
                  const isSelected = safeFilters.minRating === String(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => updateFilters({ minRating: isSelected ? '' : String(num), page: 1 })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-bold border-l-2 border-sky-500'
                          : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < num ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-750'
                            }`}
                          />
                        ))}
                      </div>
                      <span>& Above</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </aside>

          {/* Catalog items results grid */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Top catalog sorting and summary header */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-slate-500 dark:text-slate-400 text-xs text-center sm:text-left">
                Showing <span className="font-bold text-slate-800 dark:text-slate-200">{safeProducts.length}</span> of{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">{safePagination.total}</span> products{' '}
                {safeFilters.keyword && (
                  <>
                    for "<span className="font-bold text-sky-600">{safeFilters.keyword}</span>"
                  </>
                )}
              </div>

              {/* Sorting options */}
              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  Sort By:
                </label>
                <select
                  className="px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none bg-slate-50 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-350"
                  value={safeFilters.sort || 'newest'}
                  onChange={handleSortChange}
                >
                  <option value="newest">Newest First</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Best Rated</option>
                  <option value="mostPopular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Grid list of Products */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : safeProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {safeProducts.map((prod) => {
                  if (!prod) return null;
                  return <ProductCard key={prod._id || Math.random()} product={prod} />;
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-200/60 rounded-2xl py-20 px-6 text-center space-y-3">
                <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-sm">No Products Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  We couldn't find any products matching your current selections. Try relaxing filters or search terms.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-sky-100 cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination controls */}
            {safePagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={safePagination.currentPage === 1}
                  onClick={() => handlePageChange(safePagination.currentPage - 1)}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-slate-500 hover:bg-slate-55 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: safePagination.pages }, (_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === safePagination.currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-9 w-9 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'border-sky-500 bg-sky-500 text-white'
                          : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  disabled={safePagination.currentPage === safePagination.pages}
                  onClick={() => handlePageChange(safePagination.currentPage + 1)}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-slate-500 hover:bg-slate-55 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
      )}

    </div>
  );
};

export default Home;
