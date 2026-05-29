import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShopContext } from '../context/ShopContext';
import { ShoppingCart, Heart, Search, User as UserIcon, LogOut, LayoutDashboard, ShoppingBag, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const { wishlist, filters, updateFilters } = useContext(ShopContext);
  const [searchInput, setSearchInput] = useState(filters.keyword || '');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
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

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-tr from-sky-500 to-blue-600 p-2 rounded-xl text-white shadow-md shadow-sky-100 group-hover:scale-105 transition-transform duration-200">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
                Smart<span className="text-sky-600">Commerce</span>
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative items-center">
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              className="w-full px-4 py-2 pl-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 bg-slate-50 hover:bg-slate-100/50 transition-colors placeholder:text-slate-400"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <button type="submit" className="hidden"></button>
          </form>

          {/* Right Navigation Controls */}
          <nav className="hidden md:flex items-center gap-3">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-slate-600 hover:text-rose-600 rounded-xl hover:bg-slate-50 transition-all relative"
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
              className="p-2 text-slate-600 hover:text-sky-600 rounded-xl hover:bg-slate-50 transition-all relative"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <span className="w-px h-6 bg-slate-200 mx-1"></span>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-50 focus:outline-none transition-colors border border-transparent hover:border-slate-100"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-inner">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-100 shadow-xl py-2 z-20 transition-all duration-100 transform origin-top-right">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-sky-500" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <UserIcon className="w-4 h-4 text-sky-500" />
                        My Profile
                      </Link>

                      <Link
                        to="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-500" />
                        My Orders
                      </Link>

                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1"
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-sky-700 hover:to-blue-700 shadow-md shadow-sky-100 transition-all duration-200"
              >
                <UserIcon className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-3">
            {/* Cart Icon in mobile header */}
            <Link to="/cart" className="p-2 text-slate-600 relative">
              <ShoppingCart className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-sky-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-4 shadow-inner">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 pl-10 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          </form>

          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home / Products
            </Link>

            <Link
              to="/wishlist"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700"
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
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-500" />
                    Admin Dashboard
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon className="w-4 h-4 text-sky-500" />
                  My Profile
                </Link>

                <Link
                  to="/orders"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-500" />
                  My Orders
                </Link>

                <div className="border-t border-slate-100 my-1 pt-2">
                  <div className="flex items-center gap-3 px-3 py-1">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{user.email}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 mt-2 text-left"
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
