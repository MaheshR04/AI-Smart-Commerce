import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, Lock, Mail, User, ArrowRight } from 'lucide-react';

export const Register = () => {
  const { register, token, error: authError } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect home
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all input fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-card p-8 border border-slate-200/80 bg-white shadow-xl rounded-3xl relative overflow-hidden">
        
        {/* Decorative background spots */}
        <div className="absolute -top-10 -right-10 bg-sky-500/10 h-32 w-32 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 bg-indigo-500/10 h-32 w-32 rounded-full blur-2xl"></div>

        {/* Header */}
        <div className="text-center space-y-3 relative">
          <Link to="/" className="inline-flex items-center justify-center bg-gradient-to-tr from-sky-500 to-blue-600 p-2.5 rounded-2xl text-white shadow-md shadow-sky-100 mb-2">
            <ShoppingBag className="w-6 h-6" />
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Create a New Account</h2>
          <p className="text-slate-400 text-xs font-semibold">Join us today to begin your premium shopping journey.</p>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 relative">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Full Name</label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="John Doe"
                className="input-field pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Email Address</label>
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="customer@example.com"
                className="input-field pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Password</label>
            <div className="relative flex items-center">
              <input
                type="password"
                placeholder="At least 6 characters"
                className="input-field pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Confirm Password</label>
            <div className="relative flex items-center">
              <input
                type="password"
                placeholder="Confirm password"
                className="input-field pl-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
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
                Register Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Redirect Footer */}
        <p className="text-xs text-center text-slate-400 mt-6 relative">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-sky-600 hover:text-sky-700">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
