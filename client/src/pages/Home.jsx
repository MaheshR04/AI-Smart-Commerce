import { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, ArrowUpDown, RefreshCw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

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

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleCategorySelect = (categoryName) => {
    // Toggle category selection
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

  // Extract unique brands for filtering (from current products list as a fallback, or seed standard brands list)
  const brandsList = ['SonicSound', 'AuraTech', 'ThreadCraft', 'Cafeteria', 'Penguin Publishing'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
      
      {/* Premium Hero Promo Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl text-white py-12 px-6 sm:px-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800/80">
        <div className="space-y-4 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-xs font-semibold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Special Inaugural Launch Sale
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Discover the Future of <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Smart E-Commerce</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md">
            Explore curated tech gadgets, modern apparel, organic cookware, and standard publications, fully optimized with high performance.
          </p>
        </div>

        {/* Mock Graphic representation */}
        <div className="hidden lg:flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md w-72 h-44 shadow-2xl relative">
          <div className="absolute top-4 left-4 bg-sky-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-lg">AI Ready</div>
          <p className="text-xs font-bold text-slate-300">Catalog Engine Loaded</p>
          <div className="absolute -bottom-4 -right-4 bg-gradient-to-tr from-sky-400 to-indigo-500 text-white rounded-full p-4 shadow-xl">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">Browse Product Categories</h2>
        <div className="flex items-center gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = filters.category === cat.name;
            return (
              <button
                key={cat._id}
                onClick={() => handleCategorySelect(cat.name)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-200 flex-shrink-0 text-xs font-semibold shadow-sm active:scale-95 ${
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

      {/* Main Search Results and Filter Container */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Filters (Desktop only) */}
        <aside className="hidden lg:block w-64 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-6 flex-shrink-0 sticky top-20">
          
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-sky-500" />
              Filter Catalog
            </h3>
            <button
              onClick={resetFilters}
              className="text-[10px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              Reset All
            </button>
          </div>

          {/* Pricing bounds form */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Price Range (₹)</h4>
            <form onSubmit={handlePriceFilterSubmit} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                  defaultValue={filters.minPrice}
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                  defaultValue={filters.maxPrice}
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Apply Range
              </button>
            </form>
          </div>

          {/* Brand select filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Brand</h4>
            <div className="flex flex-col gap-1.5">
              {brandsList.map((brand) => {
                const isSelected = filters.brand === brand;
                return (
                  <button
                    key={brand}
                    onClick={() => updateFilters({ brand: isSelected ? '' : brand, page: 1 })}
                    className={`px-3 py-1.5 rounded-lg text-xs text-left transition-colors font-medium ${
                      isSelected
                        ? 'bg-sky-50 text-sky-600 font-bold border-l-2 border-sky-500'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>

        </aside>

        {/* Content list body */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Top catalog sorting and summary header */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-slate-500 text-xs text-center sm:text-left">
              Showing <span className="font-bold text-slate-800">{products.length}</span> of{' '}
              <span className="font-bold text-slate-800">{paginationInfo.total}</span> products{' '}
              {filters.keyword && (
                <>
                  for "<span className="font-bold text-sky-600">{filters.keyword}</span>"
                </>
              )}
            </div>

            {/* Sorting selectors */}
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-start">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort By:
              </label>
              <select
                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none bg-slate-50 font-semibold text-slate-700"
                value={filters.sort}
                onChange={handleSortChange}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
              </select>
            </div>
          </div>

          {/* Grid list of Products */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/60 rounded-2xl">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500"></div>
              <p className="text-xs font-medium text-slate-400 mt-4">Refreshing catalog list...</p>
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

          {/* Pagination Footer */}
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
                    className={`h-9 w-9 text-xs font-bold rounded-xl border transition-all ${
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

    </div>
  );
};

export default Home;
