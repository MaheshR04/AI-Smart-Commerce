import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShopContext } from '../context/ShopContext';
import { ShoppingCart, Heart, Search, User as UserIcon, LogOut, LayoutDashboard, ShoppingBag, Menu, X, Sun, Moon } from 'lucide-react';
import API from '../services/api';

export const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const { wishlist, filters, updateFilters, resetFilters } = useContext(ShopContext);
  const [searchInput, setSearchInput] = useState(filters.keyword || '');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Theme support
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Suggestions dropdown states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Search input typing debounce effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchInput.trim().length >= 2) {
        try {
          const response = await API.get('/products', {
            params: { keyword: searchInput.trim(), limit: 5 }
          });
          setSuggestions(response.data.data || []);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Failed to load suggestions:', err.message);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    updateFilters({ keyword: searchInput });
    navigate('/');
  };

  const handleLogoutClick = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const wishlistCount = wishlist?.products?.length || 0;
  const cartCount = getCartCount();

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/85 dark:border-slate-800/80 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              onClick={() => resetFilters && resetFilters()}
              className="flex items-center gap-2 group text-decoration-none"
            >
              <div className="bg-gradient-to-tr from-sky-500 to-blue-600 p-2 rounded-xl text-white shadow-md shadow-sky-100 dark:shadow-none group-hover:scale-105 transition-transform duration-200">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
                Smart<span className="text-sky-600">Commerce</span>
              </span>
            </Link>
          </div>

          {/* Search Bar & Auto-Complete suggestions list */}
          {!isAuthPage && (
            <div className="hidden md:flex flex-1 max-w-md relative flex-col">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  className="w-full px-4 py-2 pl-10 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 dark:focus:ring-sky-950/20 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-750 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-slate-100"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => searchInput.trim().length >= 2 && setShowSuggestions(true)}
                />
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 pointer-events-none" />
                <button type="submit" className="hidden"></button>
              </form>

              {/* Suggestions dropdown overlay */}
              {showSuggestions && suggestions.length > 0 && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)}></div>
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl shadow-xl z-25 py-2 divide-y divide-slate-50 dark:divide-slate-700 transition-all">
                    {suggestions.map((prod) => {
                      const activePrice = prod.discountPrice > 0 ? prod.discountPrice : prod.price;
                      return (
                        <div
                          key={prod._id}
                          onClick={() => {
                            setShowSuggestions(false);
                            setSearchInput('');
                            navigate(`/products/${prod._id}`);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                        >
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-9 h-9 object-cover rounded-lg border border-slate-100 dark:border-slate-750 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
                                {prod.name}
                              </h4>
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded uppercase flex-shrink-0">
                                {prod.brand}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-extrabold text-sky-600 dark:text-sky-400">
                                ₹{activePrice.toLocaleString('en-IN')}
                              </span>
                              {prod.discountPrice > 0 && (
                                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 line-through">
                                  ₹{prod.price.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Right Navigation Controls */}
          {!isAuthPage && (
            <nav className="hidden md:flex items-center gap-3">
              {/* Home option */}
              <Link
                to="/"
                onClick={() => resetFilters && resetFilters()}
                className="px-3 py-2 text-slate-600 dark:text-slate-350 hover:text-sky-600 dark:hover:text-sky-400 text-xs font-bold transition-all cursor-pointer"
                title="Home Feed"
              >
                Home
              </Link>

              {/* Theme Toggler */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-350 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer focus:outline-none"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2 text-slate-600 dark:text-slate-350 hover:text-rose-600 dark:hover:text-rose-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all relative"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="p-2 text-slate-600 dark:text-slate-350 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all relative"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <span className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></span>

              {/* User Dropdown */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-850 focus:outline-none transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-750"
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-750"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-inner">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl py-2 z-20 transition-all duration-100 transform origin-top-right">
                        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                          <p className="text-xs text-slate-400">Signed in as</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        </div>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 text-sky-500" />
                            Admin Dashboard
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <UserIcon className="w-4 h-4 text-sky-500" />
                          My Profile
                        </Link>

                        <Link
                          to="/orders"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <ShoppingBag className="w-4 h-4 text-emerald-500" />
                          My Orders
                        </Link>

                        <button
                          onClick={handleLogoutClick}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border-t border-slate-100 dark:border-slate-700 mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-sky-700 hover:to-blue-700 shadow-md shadow-sky-100 dark:shadow-none transition-all duration-200"
                >
                  <UserIcon className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </nav>
          )}

          {/* Mobile menu trigger */}
          {!isAuthPage && (
            <div className="flex md:hidden items-center gap-3">
              {/* Theme toggler for mobile header */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-350 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl transition-all cursor-pointer focus:outline-none"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* Cart Icon in mobile header */}
              <Link to="/cart" className="p-2 text-slate-600 dark:text-slate-355 relative">
                <ShoppingCart className="w-5.5 h-5.5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-sky-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-4 shadow-inner animate-fade-in transition-all">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 pl-10 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none bg-slate-50 dark:bg-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 pointer-events-none" />
          </form>

          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200"
              onClick={() => {
                resetFilters && resetFilters();
                setMobileMenuOpen(false);
              }}
            >
              Home
            </Link>

            <Link
              to="/wishlist"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-rose-500" /> My Wishlist</span>
              {wishlistCount > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{wishlistCount}</span>}
            </Link>

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-500" />
                    Admin Dashboard
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon className="w-4 h-4 text-sky-500" />
                  My Profile
                </Link>

                <Link
                  to="/orders"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-500" />
                  My Orders
                </Link>

                <div className="border-t border-slate-100 dark:border-slate-850 my-1 pt-2">
                  <div className="flex items-center gap-3 px-3 py-1">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-850 dark:text-slate-100">{user.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[200px]">{user.email}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 mt-2 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl text-sm font-bold shadow-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserIcon className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
