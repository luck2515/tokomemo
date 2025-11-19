import React from 'react';

interface StorageMeterProps {
  title: string;
  used: number;
  limit: number;
}

const StorageMeter: React.FC<StorageMeterProps> = ({ title, used, limit }) => {
  const percentage = Math.min((used / limit) * 100, 100);
  const isWarning = percentage > 80;
  const isDanger = percentage >= 100;

  let barColor = 'bg-gradient-to-r from-green-400 to-emerald-500';
  if (isWarning) barColor = 'bg-gradient-to-r from-amber-400 to-orange-500';
  if (isDanger) barColor = 'bg-gradient-to-r from-red-500 to-rose-600';

  return (
    <div className="p-4 bg-white dark:bg-neutral-800 first:rounded-t-xl last:rounded-b-xl">
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{title}</h3>
        <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
          {used} <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">/ {limit} 枚</span>
        </p>
      </div>
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-2 rounded-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default StorageMeter;
