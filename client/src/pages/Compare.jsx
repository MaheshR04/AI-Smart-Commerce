import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import { Sparkles, ArrowLeft, RefreshCw, Plus, Trash2, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

export const Compare = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState('');

  // Read initial product IDs from URL query params (e.g. ?ids=id1,id2)
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await API.get('/products', { params: { limit: 100 } });
        setAllProducts(response.data.data || []);
        setProductsLoading(false);
      } catch (err) {
        console.error('Failed to load products list:', err.message);
        setProductsLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const urlIds = searchParams.get('ids');
    if (urlIds) {
      const ids = urlIds.split(',').filter(Boolean);
      setSelectedIds(ids);
    } else {
      setSelectedIds([]);
      setComparison(null);
    }
  }, [searchParams]);

  // Trigger comparison when selected IDs change
  useEffect(() => {
    const fetchComparison = async () => {
      if (selectedIds.length === 0) {
        setComparison(null);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const response = await API.post('/ai/compare', { productIds: selectedIds });
        if (response.data && response.data.success) {
          setComparison(response.data);
        } else {
          setError('Failed to generate product comparison.');
        }
      } catch (err) {
        console.error('Comparison API failed:', err.message);
        setError('Failed to reach AI Product Comparison service. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (selectedIds.length > 0) {
      fetchComparison();
    }
  }, [selectedIds]);

  const updateUrl = (ids) => {
    if (ids.length > 0) {
      setSearchParams({ ids: ids.join(',') });
    } else {
      setSearchParams({});
    }
  };

  const addProductId = (id) => {
    if (selectedIds.includes(id)) return;
    if (selectedIds.length >= 3) {
      alert('You can compare a maximum of 3 products at a time.');
      return;
    }
    const nextIds = [...selectedIds, id];
    setSelectedIds(nextIds);
    updateUrl(nextIds);
  };

  const removeProductId = (id) => {
    const nextIds = selectedIds.filter(item => item !== id);
    setSelectedIds(nextIds);
    updateUrl(nextIds);
  };

  const handleProductSelect = (e) => {
    const id = e.target.value;
    if (id) {
      addProductId(id);
      e.target.value = ''; // Reset select dropdown
    }
  };

  const renderStars = (rating) => {
    const floorRating = Math.floor(rating || 0);
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`text-sm ${
          i < floorRating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8 dark:text-slate-100">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-sky-500" />
            AI Product Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Select up to 3 products to compare technical specifications, customer pros & cons, and get an AI recommendation.
          </p>
        </div>

        {/* Dropdown product selector */}
        {!productsLoading && (
          <div className="w-full sm:w-72">
            <select
              onChange={handleProductSelect}
              defaultValue=""
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-950/20 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100"
            >
              <option value="" disabled>+ Add Product to Compare...</option>
              {allProducts
                .filter(p => !selectedIds.includes(p._id.toString()))
                .map(p => (
                  <option key={p._id} value={p._id.toString()}>
                    [{p.category}] {p.brand} - {p.name.substring(0, 45)}...
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Selected products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedIds.map(id => {
          const prod = allProducts.find(p => p._id.toString() === id);
          if (!prod) return null;
          const priceStr = prod.discountPrice > 0 
            ? `₹${prod.discountPrice.toLocaleString('en-IN')}`
            : `₹${prod.price.toLocaleString('en-IN')}`;
          return (
            <div
              key={id}
              className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm flex items-center gap-4 relative hover:shadow-md transition-shadow"
            >
              <img
                src={prod.images && prod.images[0] ? prod.images[0] : ''}
                alt={prod.name}
                className="w-16 h-16 object-cover rounded-xl border border-slate-100 dark:border-slate-750 flex-shrink-0"
              />
              <div className="flex-1 min-w-0 pr-6">
                <span className="text-[9px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 px-2 py-0.5 rounded uppercase">
                  {prod.brand}
                </span>
                <h3 className="text-xs font-bold text-slate-800 dark:text-white truncate mt-1.5 leading-tight">
                  {prod.name}
                </h3>
                <p className="text-sm font-extrabold text-slate-900 dark:text-sky-400 mt-1">
                  {priceStr}
                </p>
              </div>
              <button
                onClick={() => removeProductId(id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer focus:outline-none transition-colors"
                title="Remove product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {/* Placeholder cards if less than 3 products selected */}
        {selectedIds.length < 3 && Array.from({ length: 3 - selectedIds.length }).map((_, i) => (
          <div
            key={i}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-slate-400 min-h-[98px]"
          >
            <Plus className="w-5 h-5 text-slate-350 mb-1" />
            <p className="text-[11px] font-semibold">Empty comparison slot</p>
          </div>
        ))}
      </div>

      {/* Main loading and error states */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-xs text-slate-500 font-bold tracking-wider animate-pulse uppercase">AI Engine analyzing specifications...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-red-650 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs font-bold">{error}</span>
        </div>
      )}

      {/* Comparison results */}
      {!loading && comparison && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Side-by-side Specifications Table */}
          <section className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Specifications Comparison</h3>
            <div className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                      <th className="p-4 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-1/4">Feature</th>
                      {comparison.products.map(p => (
                        <th key={p._id} className="p-4 font-extrabold text-slate-700 dark:text-slate-200">
                          {p.name.substring(0, 35)}...
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="p-4 font-semibold text-slate-400 uppercase tracking-wider">Price</td>
                      {comparison.products.map(p => (
                        <td key={p._id} className="p-4 font-bold text-slate-800 dark:text-white">
                          ₹{p.price.toLocaleString('en-IN')}
                          {p.discountPrice > 0 && (
                            <span className="block text-[10px] text-emerald-600 mt-0.5">
                              On sale for ₹{p.discountPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="p-4 font-semibold text-slate-400 uppercase tracking-wider">Rating</td>
                      {comparison.products.map(p => (
                        <td key={p._id} className="p-4 font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                          <div className="flex">{renderStars(p.rating)}</div>
                          <span className="text-[10px] text-slate-500">({p.rating})</span>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Dynamic AI specifications comparison rows */}
                    {comparison.comparison.specsComparison && comparison.comparison.specsComparison.map((spec, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="p-4 font-semibold text-slate-400 uppercase tracking-wider">{spec.key}</td>
                        {comparison.products.map(p => (
                          <td key={p._id} className="p-4 font-bold text-slate-700 dark:text-slate-300">
                            {spec.values[p._id.toString()] || 'N/A'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Pros & Cons comparison list */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparison.products.map(p => {
              const pId = p._id.toString();
              const analysis = comparison.comparison.prosCons && comparison.comparison.prosCons[pId];
              if (!analysis) return null;
              return (
                <div
                  key={pId}
                  className="bg-white dark:bg-slate-850 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <img
                      src={p.images && p.images[0] ? p.images[0] : ''}
                      alt={p.name}
                      className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate leading-tight">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{p.brand}</p>
                    </div>
                  </div>

                  {/* Pros list */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Key Advantages
                    </h5>
                    <ul className="space-y-1.5">
                      {analysis.pros && analysis.pros.map((pro, index) => (
                        <li key={index} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <span className="text-emerald-500 font-bold mt-0.5">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons list */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-extrabold text-red-500 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Key Tradeoffs
                    </h5>
                    <ul className="space-y-1.5">
                      {analysis.cons && analysis.cons.map((con, index) => (
                        <li key={index} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <span className="text-red-400 font-bold mt-0.5">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </section>

          {/* AI Recommendation Verdict Box */}
          <section className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/20 dark:to-indigo-950/20 border border-sky-100/60 dark:border-sky-900/40 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-gradient-to-tr from-sky-500 to-indigo-500 p-3.5 rounded-2xl text-white shadow-md flex-shrink-0 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2.5">
              <h3 className="text-sm font-extrabold text-sky-850 dark:text-sky-400 uppercase tracking-wider">AI Recommendation Verdict</h3>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line prose dark:prose-invert">
                {comparison.comparison.verdict}
              </div>
            </div>
          </section>

        </div>
      )}

      {/* Initial empty state instruction */}
      {!loading && !comparison && selectedIds.length === 0 && (
        <div className="py-24 border border-slate-200/50 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center max-w-xl mx-auto p-6 space-y-4 shadow-sm bg-white dark:bg-slate-850">
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full border border-slate-100 dark:border-slate-750">
            <Scale className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">No products selected for comparison</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-sm">
              Choose products from the search selector in the top-right corner to load their specifications, details, and get real-time AI summaries.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Compare;
