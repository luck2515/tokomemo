import React from 'react';
import { Icon } from '../constants';

interface UndoToastProps {
  isVisible: boolean;
  onUndo: () => void;
  message: string;
}

const UndoToast: React.FC<UndoToastProps> = ({ isVisible, onUndo, message }) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md p-3 bg-neutral-800 text-white rounded-xl shadow-2xl flex items-center justify-between animate-slide-up-then-fade"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onUndo}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 transition-colors text-sm font-semibold"
      >
        <Icon name="arrow-uturn-left" className="w-4 h-4" />
        元に戻す
      </button>
      <style>{`
        @keyframes slideUpAndFade {
          0% { opacity: 0; transform: translate(-50%, 20px); }
          10% { opacity: 1; transform: translate(-50%, 0); }
          90% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, 20px); }
        }
        .animate-slide-up-then-fade {
          animation: slideUpAndFade 10s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default UndoToast;