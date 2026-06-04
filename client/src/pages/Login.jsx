import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { ShoppingBag, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const { login, token, error: authError } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  // Determine redirect route (e.g. if they were guarded from /checkout, redirect to /checkout after login)
  const fromRoute = location.state?.from?.pathname || '/';

  useEffect(() => {
    // If already logged in, redirect home
    if (token) {
      navigate(fromRoute, { replace: true });
    }
  }, [token, navigate, fromRoute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all input fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      addToast('Signed in successfully.', 'success');
    } catch (err) {
      const errMsg = err.message || 'Invalid email or password.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-card p-8 border border-slate-200/80 bg-white shadow-xl rounded-3xl relative overflow-hidden">
        
        {/* Decorative ambient color spots */}
        <div className="absolute -top-10 -right-10 bg-sky-500/10 h-32 w-32 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 bg-indigo-500/10 h-32 w-32 rounded-full blur-2xl"></div>

        {/* Brand Header */}
        <div className="text-center space-y-3 relative">
          <Link to="/" className="inline-flex items-center justify-center bg-gradient-to-tr from-sky-500 to-blue-600 p-2.5 rounded-2xl text-white shadow-md shadow-sky-100 mb-2">
            <ShoppingBag className="w-6 h-6" />
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Sign In to Your Account</h2>
          <p className="text-slate-400 text-xs font-semibold">Welcome back! Please enter your details below.</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5 relative">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Email Address</label>
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="Enter your email address"
                className="input-field pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-bold text-sky-600 hover:text-sky-700">Forgot Password?</Link>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="input-field pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
              <button
                type="button"
                className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {(error || authError) && (
            <p className="text-xs font-semibold text-red-500">{error || authError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-md shadow-sky-100 disabled:opacity-50 transition-all duration-200 active:scale-[0.99] mt-6"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-slate-300"></div>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Redirect toggle footer */}
        <p className="text-xs text-center text-slate-400 mt-6 relative">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700">
            Create account
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
