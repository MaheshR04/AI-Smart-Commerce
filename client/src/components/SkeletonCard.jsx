import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="relative bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-0 overflow-hidden flex flex-col h-full shadow-sm animate-pulse">
      
      {/* Visual Image Box Mock */}
      <div className="aspect-square bg-slate-100 dark:bg-slate-700 w-full"></div>

      {/* Visual Info Block */}
      <div className="p-4 flex flex-col flex-1 space-y-3">
        {/* Brand placeholder */}
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>

        {/* Title placeholder */}
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        {/* Stars placeholder */}
        <div className="flex gap-1 py-1">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-3.5 w-3.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          ))}
        </div>

        {/* Actions/Price row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="space-y-1">
            <div className="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          </div>
          <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>

    </div>
  );
};

export default SkeletonCard;
