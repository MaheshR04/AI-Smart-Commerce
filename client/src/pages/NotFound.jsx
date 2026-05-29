import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 text-center space-y-6 animate-fade-in dark:bg-slate-900 transition-colors duration-200">
      
      {/* Animated Visual Card */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-3xl blur opacity-25 dark:opacity-40 animate-pulse"></div>
        <div className="relative bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-8 rounded-3xl shadow-xl flex items-center justify-center">
          <FileQuestion className="w-16 h-16 text-sky-500 dark:text-sky-400" />
        </div>
      </div>

      {/* Error message logs */}
      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-50 tracking-tight leading-snug">Page Not Found</h1>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Error Code: 404</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-2">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
      </div>

      {/* Navigation redirects */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
        <button
          onClick={() => window.history.back()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-100 dark:shadow-none transition-all active:scale-95"
        >
          <Home className="w-4 h-4" />
          Return Home
        </Link>
      </div>

    </div>
  );
};

export default NotFound;
