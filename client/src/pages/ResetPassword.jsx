import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../services/api';
import { ToastContext } from '../context/ToastContext';
import { useContext } from 'react';
import { ShoppingBag, Lock, ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const ResetPassword = () => {
  const { token } = useParams();
  const { addToast } = useContext(ToastContext);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await API.put(`/users/resetpassword/${token}`, { password });
      setSuccess(true);
      addToast(response.data.message || 'Password reset successfully.', 'success');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to reset password. Link may be invalid or expired.';
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
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Reset Password</h2>
          <p className="text-slate-400 text-xs font-semibold">Please enter your new password below.</p>
        </div>

        {success ? (
          <div className="space-y-6 text-center relative py-4">
            <div className="inline-flex items-center justify-center bg-emerald-100 text-emerald-600 p-4 rounded-full shadow-inner animate-pulse">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Password Reset Successful!</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto font-medium">
                Your password has been successfully updated. You can now use your new credentials to log into your account.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95 mt-4"
            >
              Sign In Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5 relative">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">New Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password (min. 6 chars)"
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Confirm New Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  className="input-field pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-500">{error}</p>
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
                  Reset Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-xs text-center text-slate-400 mt-6">
              <Link to="/login" className="inline-flex items-center gap-1.5 font-bold text-sky-600 hover:text-sky-700">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
