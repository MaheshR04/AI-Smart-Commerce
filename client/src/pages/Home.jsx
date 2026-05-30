import { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { Filter, SlidersHorizontal, ArrowUpDown, RefreshCw, ChevronLeft, ChevronRight, Sparkles, ArrowRight, Eye, Star, ShoppingBag } from 'lucide-react';

export const Home = () => {
  const {
    products,
    categories,
    loading,
    filters,
    paginationInfo,
    updateFilters,
    resetFilters,
  } = useContext(ShopContext);

  const [activeSlide, setActiveSlide] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Extract unique brands for filtering
  const brandsList = ['SonicSound', 'AuraTech', 'ThreadCraft', 'Cafeteria', 'Penguin Publishing'];

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

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    if (ids.length > 0) {
      const items = ids
        .map((id) => products.find((prod) => prod._id === id))
        .filter(Boolean);
      setRecentlyViewed(items);
    }
  }, [products]);

  const handleCategorySelect = (categoryName) => {
    const nextCategory = filters.category === categoryName ? '' : categoryName;
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
    if (newPage < 1 || newPage > paginationInfo.pages) return;
    updateFilters({ page: newPage });
  };

  // Evaluate dynamic sections data
  const featured = products.filter((prod) => prod.rating >= 4.0).slice(0, 4);
  const featuredProducts = featured.length > 0 ? featured : products.slice(0, 4);

  const trending = products.filter((prod) => prod.discountPrice > 0).slice(0, 4);
  const trendingProducts = trending.length > 0 ? trending : products.slice(4, 8);

  const newArrivals = products.slice(0, 4);

  // Check if search, category, brand, or price constraints are active
  const isFilterActive = !!(
    filters.keyword ||
    filters.category ||
    filters.brand ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.page > 1
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex-1">
      
      {/* Category selection quick scroll header */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Browse Categories</h2>
        <div className="flex items-center gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = filters.category === cat.name;
            return (
              <button
                key={cat._id}
                onClick={() => handleCategorySelect(cat.name)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-200 flex-shrink-0 text-xs font-semibold shadow-sm active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500 text-white shadow-sky-100'
                    : 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <img src={cat.image} alt={cat.name} className="w-5 h-5 rounded-lg object-cover" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* RENDER OPTION A: Curated Visual Landing Page Feed */}
      {!isFilterActive ? (
        <div className="space-y-12 animate-fade-in">
          
          {/* Promo Slider Hero Banner */}
          <div className="relative group overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl text-white py-12 px-6 sm:px-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800/80 transition-all duration-300">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-8 -left-8 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-5 max-w-xl text-center md:text-left z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-[10px] font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                {promoSlides[activeSlide].subtitle}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight transition-all duration-300">
                {promoSlides[activeSlide].title}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed transition-all duration-300">
                {promoSlides[activeSlide].desc}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handleCategorySelect(promoSlides[activeSlide].category)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {promoSlides[activeSlide].cta} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slider image view box */}
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10 bg-slate-800">
              <img
                src={promoSlides[activeSlide].image}
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
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/15 text-white/80 p-2 rounded-full border border-white/10 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100 hidden sm:block cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveSlide((prev) => (prev === promoSlides.length - 1 ? 0 : prev + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/15 text-white/85 p-2 rounded-full border border-white/10 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100 hidden sm:block cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Visual Round Category Grid */}
          <section className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-500" />
              Explore Collections
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  onClick={() => handleCategorySelect(cat.name)}
                  className="group bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:shadow-md hover:border-sky-200 hover:scale-[1.02] active:scale-95"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border border-slate-100 bg-slate-50 group-hover:scale-105 transition-transform duration-300">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-sky-600 transition-colors leading-tight">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Curated Grid Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Featured Section */}
            <section className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Featured Collection
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Rated</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featuredProducts.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            </section>

            {/* Trending Hot Deals Section */}
            <section className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-rose-500 fill-rose-50" />
                  Trending Hot Deals
                </h3>
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg uppercase tracking-wider animate-pulse">Deals</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trendingProducts.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            </section>
          </div>

          {/* New Arrivals Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-sky-500" />
                New Arrivals
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {newArrivals.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </section>

          {/* Recently Viewed Products Section */}
          {recentlyViewed.length > 0 && (
            <section className="space-y-4 border-t border-slate-100 pt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                  <Eye className="w-5 h-5 text-indigo-500" />
                  Recently Viewed Products
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
                {recentlyViewed.slice(0, 4).map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            </section>
          )}

        </div>
      ) : (
        /* RENDER OPTION B: Filterable search catalog directory grid */
        <div className="flex flex-col lg:flex-row gap-8 items-start animate-fade-in">
          
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
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Price Range (₹)</h4>
              <form onSubmit={handlePriceFilterSubmit} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    defaultValue={filters.minPrice}
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    defaultValue={filters.maxPrice}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-650 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Apply Range
                </button>
              </form>
            </div>

            {/* Brand select filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Select Brand</h4>
              <div className="flex flex-col gap-1.5">
                {brandsList.map((brand) => {
                  const isSelected = filters.brand === brand;
                  return (
                    <button
                      key={brand}
                      onClick={() => updateFilters({ brand: isSelected ? '' : brand, page: 1 })}
                      className={`px-3 py-1.5 rounded-lg text-xs text-left transition-colors font-medium cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-bold border-l-2 border-sky-500'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
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
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Availability</h4>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => updateFilters({ inStock: e.target.checked, page: 1 })}
                  className="rounded text-sky-500 focus:ring-sky-400 h-4 w-4 border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                />
                In Stock Only
              </label>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Customer Rating</h4>
              <div className="flex flex-col gap-1.5">
                {[4, 3, 2].map((num) => {
                  const isSelected = filters.minRating === String(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => updateFilters({ minRating: isSelected ? '' : String(num), page: 1 })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-bold border-l-2 border-sky-500'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
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
                Showing <span className="font-bold text-slate-800 dark:text-slate-200">{products.length}</span> of{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">{paginationInfo.total}</span> products{' '}
                {filters.keyword && (
                  <>
                    for "<span className="font-bold text-sky-600">{filters.keyword}</span>"
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
                  className="px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none bg-slate-50 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300"
                  value={filters.sort}
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
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
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
            {paginationInfo.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={paginationInfo.currentPage === 1}
                  onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: paginationInfo.pages }, (_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === paginationInfo.currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-9 w-9 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'border-sky-500 bg-sky-500 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  disabled={paginationInfo.currentPage === paginationInfo.pages}
                  onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default Home;
