import React from 'react';
import { Icon } from '../constants';

interface EmptyStateProps {
  iconName: string;
  title: string;
  message: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ iconName, title, message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 min-h-[calc(100vh-200px)] animate-fade-in">
      <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-full mb-6 shadow-inner">
        <Icon name={iconName} className="w-16 h-16 text-neutral-400 dark:text-neutral-500" />
      </div>
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{title}</h2>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-8 px-6 py-3 rounded-full bg-gradient-to-br from-[#FF5252] to-[#E63946] text-white font-semibold shadow-lg shadow-[#FF5252]/30 transition-transform active:scale-95"
        >
          {action.label}
        </button>
      )}
       <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};
