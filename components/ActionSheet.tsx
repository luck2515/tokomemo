import React from 'react';
import { Icon } from '../constants';

interface ActionSheetItem {
  label: string;
  icon: string;
  onClick: () => void;
  danger?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: ActionSheetItem[];
}

const ActionSheet: React.FC<ActionSheetProps> = ({ isOpen, onClose, items }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up-fast"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`w-full flex items-center p-4 text-lg font-medium transition-colors ${item.danger ? 'text-red-500 hover:bg-red-500/10' : 'text-blue-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50'} ${index > 0 ? 'border-t border-neutral-200/50 dark:border-neutral-700/50' : ''}`}
            >
              <Icon name={item.icon} className="w-6 h-6 mr-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-3 p-4 bg-white dark:bg-neutral-800 rounded-2xl text-lg font-bold text-blue-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          キャンセル
        </button>
      </div>
       <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slide-up-fast { animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default ActionSheet;
