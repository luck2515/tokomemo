import React from 'react';

const SpotCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-md animate-pulse">
      <div className="aspect-[4/3] bg-neutral-200 dark:bg-neutral-700"></div>
      <div className="p-3 flex flex-col gap-2">
        <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded-md w-3/4 mb-1"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md w-1/4"></div>
        <div className="flex gap-2 mt-1">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full w-12"></div>
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full w-16"></div>
        </div>
         <div className="h-px bg-neutral-100 dark:bg-neutral-700/50 my-1"></div>
        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-md w-1/2"></div>
      </div>
    </div>
  );
};

export default SpotCardSkeleton;