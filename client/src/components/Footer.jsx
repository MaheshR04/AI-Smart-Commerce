import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-sky-500 p-1.5 rounded-lg text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Smart<span className="text-sky-400">Commerce</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              A premium, high-performance shopping engine designed with advanced technical integrations, offering a modern retail experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Catalog / Shop</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">My Wishlist</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">Order History</Link>
              </li>
            </ul>
          </div>

          {/* Support / Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Customer Support</h4>
            <ul className="space-y-2 text-xs">
              <li>Contact Support</li>
              <li>Returns & Exchanges</li>
              <li>Shipping Information</li>
              <li>Privacy Policy & Terms</li>
            </ul>
          </div>

          {/* Mock Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Join Our Newsletter</h4>
            <p className="text-xs text-slate-400">Get updates on new product launches, special offers, and early discounts.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-l-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-r-lg flex-shrink-0 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} SmartCommerce Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Security Guarantee</span>
            <span>Razorpay Payments</span>
            <span>COD Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
