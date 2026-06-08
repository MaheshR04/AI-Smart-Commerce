import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, ShoppingBag, Plus, CheckCircle, Scale, ChevronRight, Volume2, ShoppingCart, RefreshCw, Layers } from 'lucide-react';

export const GoalPlanner = () => {
  const { addBulkToCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [customGoal, setCustomGoal] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);

  // Pre-configured popular goals
  const presetGoals = [
    { id: 'gaming', title: 'Build Gaming Setup', desc: 'Consoles, high-fidelity sound, and controllers.', emoji: '🎮' },
    { id: 'youtube', title: 'Start YouTube Channel', desc: 'Cinematic recording cameras, editing laptops, and audio gear.', emoji: '📹' },
    { id: 'gym', title: 'Home Gym Setup', desc: 'Footwear, high-comfort active gear, and hygienic cleaners.', emoji: '🏋️' },
    { id: 'coding', title: 'Programming Setup', desc: 'Apple silicon processing power, ANC focus, and productivity books.', emoji: '💻' }
  ];

  const fetchGoalPlan = async (goalText) => {
    setLoading(true);
    setError('');
    setPlan(null);
    try {
      const response = await API.post('/ai/plan-goal', { goal: goalText });
      if (response.data && response.data.success) {
        setPlan(response.data);
        // Pre-select all recommendations by default
        const ids = response.data.recommendations.map(r => r.product._id);
        setSelectedProductIds(ids);
      } else {
        setError('Failed to generate goal plan.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to reach AI Shopping Planner service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (goal) => {
    setSelectedGoal(goal.id);
    fetchGoalPlan(goal.title);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customGoal.trim()) return;
    setSelectedGoal('custom');
    fetchGoalPlan(customGoal.trim());
  };

  const toggleProductSelection = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(pid => pid !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const handleAddBundleToCart = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (selectedProductIds.length === 0) return;

    setAddingToCart(true);
    try {
      const items = selectedProductIds.map(id => ({ productId: id, quantity: 1 }));
      await addBulkToCart(items);
      navigate('/cart');
    } catch (err) {
      console.error('Failed to add bulk items:', err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  // Calculated totals
  const getBundleTotals = () => {
    if (!plan || !plan.recommendations) return { original: 0, active: 0, savings: 0 };
    return plan.recommendations.reduce((acc, item) => {
      const p = item.product;
      if (!selectedProductIds.includes(p._id)) return acc;
      
      const originalPrice = p.price || 0;
      const activePrice = p.discountPrice > 0 ? p.discountPrice : originalPrice;
      
      return {
        original: acc.original + originalPrice,
        active: acc.active + activePrice,
        savings: acc.savings + (originalPrice - activePrice)
      };
    }, { original: 0, active: 0, savings: 0 });
  };

  const totals = getBundleTotals();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8 dark:text-slate-100 dark:bg-slate-900">
      
      {/* Page Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-6 text-center max-w-2xl mx-auto">
        <div className="inline-flex bg-gradient-to-tr from-sky-500 to-indigo-500 p-3 rounded-2xl text-white shadow-md mb-3">
          <Layers className="w-6 h-6 animate-pulse" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
          AI Goal-Based Shopping Planner
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          Tell us your goals, and our AI engine will automatically plan a tailored package bundle using actual items from our e-commerce catalog.
        </p>
      </div>

      {/* Preset Shopping Goals grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {presetGoals.map(goal => (
          <button
            key={goal.id}
            onClick={() => handlePresetClick(goal)}
            className={`text-left p-5 rounded-2xl border transition-all duration-300 relative group cursor-pointer focus:outline-none ${
              selectedGoal === goal.id
                ? 'border-sky-500 bg-sky-500/5 dark:bg-sky-500/10 shadow-md ring-2 ring-sky-100 dark:ring-sky-950/20'
                : 'border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850 hover:shadow-sm'
            }`}
          >
            <span className="text-3xl block mb-2">{goal.emoji}</span>
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors uppercase tracking-wider">
              {goal.title}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
              {goal.desc}
            </p>
          </button>
        ))}
      </section>

      {/* Custom Goal Input form bar */}
      <form onSubmit={handleCustomSubmit} className="max-w-xl mx-auto flex gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
        <input
          type="text"
          placeholder="Or type custom goal (e.g. Setup Coffee Bar, Travel Vlog setup)..."
          className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-950/20 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 placeholder:text-slate-400"
          value={customGoal}
          onChange={(e) => setCustomGoal(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !customGoal.trim()}
          className="px-5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:from-sky-700 hover:to-blue-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
        >
          Plan Setup
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
          <p className="text-xs text-slate-500 font-bold tracking-wider animate-pulse uppercase">AI curation engine drafting items setup...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-red-650 dark:text-red-400 p-4 rounded-2xl text-center text-xs font-bold max-w-md mx-auto">
          {error}
        </div>
      )}

      {/* Plan Results Layout */}
      {!loading && plan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
          
          {/* Left: Setup Plan Description & Pricing Overview */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-tr from-sky-50 to-indigo-50 dark:from-slate-850 dark:to-slate-800 border border-sky-100/50 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-500" />
                <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                  {plan.goalName}
                </h2>
              </div>
              
              <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {plan.intro}
              </p>

              {/* Pricing breakdown summary */}
              <div className="border-t border-slate-200/50 dark:border-slate-700 pt-4 space-y-2.5">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Setup Pricing</h4>
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Subtotal Price</span>
                  <span className="line-through">₹{totals.original.toLocaleString('en-IN')}</span>
                </div>
                {totals.savings > 0 && (
                  <div className="flex justify-between text-xs font-bold text-emerald-600">
                    <span>Bundle Savings</span>
                    <span>- ₹{totals.savings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-750 pt-2.5 items-baseline">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Total Setup Cost</span>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-sky-400">
                    ₹{totals.active.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleAddBundleToCart}
                disabled={addingToCart || selectedProductIds.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-2xl font-bold shadow-md shadow-sky-100 dark:shadow-none active:scale-95 disabled:opacity-50 transition-all cursor-pointer text-xs"
              >
                <ShoppingCart className="w-4 h-4" />
                {addingToCart ? 'Adding Setup to Cart...' : 'Add Selected to Cart'}
              </button>
            </div>
          </div>

          {/* Right: Recommendations checklist */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider px-1">Planned Recommendations Checklist</h3>
            <div className="space-y-4">
              {plan.recommendations.map((item, index) => {
                const p = item.product;
                const isSelected = selectedProductIds.includes(p._id);
                const priceVal = p.discountPrice > 0 ? p.discountPrice : p.price;

                return (
                  <div
                    key={p._id}
                    className={`bg-white dark:bg-slate-850 border rounded-2xl p-5 shadow-sm transition-all flex items-start gap-4 ${
                      isSelected 
                        ? 'border-sky-500/70 bg-sky-500/[0.01] dark:bg-sky-500/[0.02]' 
                        : 'border-slate-200/80 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    {/* Checkbox wrapper */}
                    <div className="pt-1 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProductSelection(p._id)}
                        className="w-4.5 h-4.5 rounded-md border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                    </div>

                    {/* Product Image */}
                    <img
                      src={p.images && p.images[0] ? p.images[0] : ''}
                      alt={p.name}
                      className="w-20 h-20 object-cover rounded-xl border border-slate-100 dark:border-slate-750 flex-shrink-0"
                    />

                    {/* Details and AI reason */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[9px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 px-2 py-0.5 rounded uppercase">
                            {p.brand}
                          </span>
                          <h4 className="text-xs font-bold text-slate-850 dark:text-white mt-1.5 leading-snug">
                            {p.name}
                          </h4>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-sky-400 whitespace-nowrap">
                          ₹{priceVal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* AI Curation Reason */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150/50 dark:border-slate-800 p-3 rounded-xl flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-sky-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal italic">
                          "{item.reason}"
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Empty Instruction State */}
      {!loading && !plan && (
        <div className="py-28 border border-slate-200/50 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center max-w-xl mx-auto p-6 space-y-4 shadow-sm bg-white dark:bg-slate-850">
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full border border-slate-100 dark:border-slate-750">
            <Layers className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">Choose a setup to start planning</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-sm">
              Click one of the pre-configured goal templates above or type your own custom goal to generate a curated shopping package.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default GoalPlanner;
