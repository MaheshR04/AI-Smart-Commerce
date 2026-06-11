import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { Sparkles, Plus, TrendingUp, Info, ShieldCheck, ChevronRight, HelpCircle, Check, AlertCircle } from 'lucide-react';

export const BudgetAdvisor = () => {
  const { addToCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);

  const [budget, setBudget] = useState(30000);
  const [category, setCategory] = useState('All');
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addedItemIds, setAddedItemIds] = useState(new Set());

  const categories = ['All', 'Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Beauty'];

  // Quick select budget presets
  const budgetPresets = [1500, 5000, 15000, 30000, 50000, 100000];

  const fetchBudgetAdvice = async () => {
    setLoading(true);
    setError('');
    setAdvice(null);
    try {
      const response = await API.post('/ai/budget-advisor', {
        budget: Number(budget),
        category: category
      });
      if (response.data && response.data.success) {
        setAdvice(response.data);
      } else {
        setError('Failed to generate budget advice.');
      }
    } catch (err) {
      console.error(err);
      setError('Error communicating with the AI Budget Advisor service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (preset) => {
    setBudget(preset);
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id, 1, product);
      setAddedItemIds((prev) => {
        const next = new Set(prev);
        next.add(product._id);
        return next;
      });
      // Clear success feedback after 2 seconds
      setTimeout(() => {
        setAddedItemIds((prev) => {
          const next = new Set(prev);
          next.delete(product._id);
          return next;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to add item to cart:', err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8 dark:text-slate-100 dark:bg-slate-900">
      
      {/* Header section */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-6 text-center max-w-2xl mx-auto">
        <div className="inline-flex bg-gradient-to-tr from-indigo-500 to-sky-500 p-3 rounded-2xl text-white shadow-md mb-3">
          <TrendingUp className="w-6 h-6 animate-pulse" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
          AI Budget Advisor
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          Enter your budget, and our AI will recommend the best items matching your price range and identify slightly more premium upgrades worth stretching for.
        </p>
      </div>

      {/* Inputs controls card */}
      <div className="bg-white dark:bg-slate-855 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 max-w-4xl mx-auto">
        
        {/* Budget selector */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Set Your Budget</label>
            <span className="text-lg font-extrabold text-indigo-650 dark:text-sky-400">
              ₹{Number(budget).toLocaleString('en-IN')}
            </span>
          </div>
          
          <input
            type="range"
            min="500"
            max="150000"
            step="500"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-650"
          />

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 pt-1">
            {budgetPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  budget === preset
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200/80 dark:border-slate-750 text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                ₹{preset.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        {/* Category selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Select Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-sky-950/20 dark:border-sky-900/60 dark:text-sky-400 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-750 text-slate-650 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Submit action */}
        <div className="pt-2">
          <button
            onClick={fetchBudgetAdvice}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg active:scale-99 transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            Get AI Budget Advice
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider animate-pulse">Analyzing price thresholds & catalogs...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/40 text-red-650 dark:text-red-400 p-4 rounded-2xl text-center text-xs font-bold max-w-md mx-auto flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Advice layout panel */}
      {!loading && advice && (
        <div className="space-y-10 animate-fade-in">

          {/* SECTION 1: Within Budget options */}
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Best Matches Within Budget (Under ₹{Number(budget).toLocaleString('en-IN')})
            </h2>

            {advice.withinBudget.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {advice.withinBudget.map((item) => {
                  const p = item.product;
                  const activePrice = p.discountPrice > 0 ? p.discountPrice : p.price;
                  const isAdded = addedItemIds.has(p._id);

                  return (
                    <div key={p._id} className="bg-white dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
                      <div className="space-y-3">
                        <Link to={`/products/${p._id}`} className="aspect-square block overflow-hidden rounded-xl border border-slate-100 dark:border-slate-750 bg-slate-50 dark:bg-slate-900">
                          <img src={p.images && p.images[0] ? p.images[0] : ''} alt={p.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                        </Link>
                        
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{p.brand}</span>
                          <Link to={`/products/${p._id}`} className="block">
                            <h3 className="text-xs font-bold text-slate-800 dark:text-white hover:text-indigo-650 transition-colors line-clamp-2 leading-tight">
                              {p.name}
                            </h3>
                          </Link>
                          <div className="flex items-baseline gap-1.5 pt-0.5">
                            <span className="text-xs font-extrabold text-slate-850 dark:text-slate-200">₹{activePrice.toLocaleString('en-IN')}</span>
                            {p.discountPrice > 0 && (
                              <span className="text-[9px] text-slate-400 line-through">₹{p.price.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>

                        {/* AI Fit explanation */}
                        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-3 rounded-xl flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <p className="text-[10px] text-slate-650 dark:text-slate-400 leading-normal">
                            {item.reason}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(p)}
                        className={`w-full mt-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 transition-all duration-200 active:scale-97 cursor-pointer border ${
                          isAdded
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50'
                            : 'bg-indigo-50 hover:bg-indigo-650 hover:text-white border-indigo-100 hover:border-indigo-600 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center text-xs text-slate-400">
                No products found in this category matching or below your budget. Try adjusting selectors.
              </div>
            )}
          </div>

          {/* SECTION 2: Stretch alternatives */}
          {advice.alternatives.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                Slightly Better Alternatives (Budget Stretch Up To +40%)
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {advice.alternatives.map((altItem) => {
                  const p = altItem.product;
                  const activePrice = p.discountPrice > 0 ? p.discountPrice : p.price;
                  const isAdded = addedItemIds.has(p._id);

                  return (
                    <div key={p._id} className="bg-gradient-to-tr from-indigo-50/[0.15] to-sky-50/[0.15] dark:from-slate-850 dark:to-slate-800 border border-indigo-100/40 dark:border-slate-750 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between group hover:shadow-md transition-shadow animate-fade-in">
                      
                      {/* Left: Product graphics & summary */}
                      <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <Link to={`/products/${p._id}`} className="aspect-square w-24 sm:w-28 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex-shrink-0">
                          <img src={p.images && p.images[0] ? p.images[0] : ''} alt={p.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-355" />
                        </Link>
                        
                        <div className="space-y-2 min-w-0">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded uppercase">
                              {p.brand}
                            </span>
                            <Link to={`/products/${p._id}`} className="block mt-1">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white hover:text-indigo-650 transition-colors line-clamp-2 leading-tight">
                                {p.name}
                              </h3>
                            </Link>
                          </div>
                          
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-extrabold text-slate-850 dark:text-slate-200">₹{activePrice.toLocaleString('en-IN')}</span>
                            {p.discountPrice > 0 && (
                              <span className="text-[9px] text-slate-400 line-through">₹{p.price.toLocaleString('en-IN')}</span>
                            )}
                          </div>

                          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider pt-1">
                            Upgrade from: <span className="text-slate-600 dark:text-slate-300 italic">"{altItem.upgradeFromName}"</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Value description & Cart Action */}
                      <div className="md:w-72 flex flex-col justify-between gap-4 border-t md:border-t-0 md:border-l border-slate-200/60 dark:border-slate-700/50 pt-4 md:pt-0 md:pl-6 flex-shrink-0">
                        <div className="bg-white dark:bg-slate-900/40 border border-indigo-50 dark:border-slate-800 p-3 rounded-2xl flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="text-[9px] font-bold text-indigo-600 dark:text-sky-400 uppercase tracking-wider">AI Upgrade Advice</h4>
                            <p className="text-[10px] text-slate-550 dark:text-slate-450 leading-relaxed italic">
                              "{altItem.valueDifference}"
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddToCart(p)}
                          className={`w-full py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 transition-all duration-200 active:scale-97 cursor-pointer border ${
                            isAdded
                              ? 'bg-emerald-50 border-emerald-250 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50'
                              : 'bg-indigo-600 hover:bg-indigo-750 text-white border-indigo-650 shadow-sm shadow-indigo-100 dark:shadow-none'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Added to Cart
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" /> Grab Upgrade
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Intro empty instruction state */}
      {!loading && !advice && (
        <div className="py-24 border border-slate-200/50 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center max-w-xl mx-auto p-6 space-y-4 shadow-sm bg-white dark:bg-slate-850">
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full border border-slate-100 dark:border-slate-750">
            <TrendingUp className="w-8 h-8 text-slate-450 dark:text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">Find the best value for your budget</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-sm">
              Adjust the slider and select a shopping category to let our AI Advisor find optimal choices and trace potential high-value upgrades.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default BudgetAdvisor;
