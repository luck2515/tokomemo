
import React from 'react';
import { Spot } from '../types';
import { Icon } from '../constants';

interface AiCompletionModalProps {
  spot: Spot;
  completionData: Partial<Spot>;
  onClose: () => void;
  onApply: (spotId: string, completionData: Partial<Spot>) => void;
}

const DiffRow: React.FC<{ label: string, original?: string | string[] | number, completed?: string | string[] | number }> = ({ label, original, completed }) => {
    const originalText = Array.isArray(original) ? original.join(', ') : original?.toString();
    const completedText = Array.isArray(completed) ? completed.join(', ') : completed?.toString();

    if (!completedText || originalText === completedText) return null;

    return (
        <div className="py-3 border-b border-neutral-200 dark:border-neutral-700">
            <p className="text-xs font-bold uppercase text-neutral-500 tracking-wider">{label}</p>
            {originalText && <p className="text-sm text-neutral-400 line-through mt-1">{originalText}</p>}
            <p className="text-base font-medium text-green-500 mt-1 whitespace-pre-wrap">{completedText}</p>
        </div>
    )
}

const AiCompletionModal: React.FC<AiCompletionModalProps> = ({ spot, completionData, onClose, onApply }) => {
  const changes = Object.keys(completionData).filter(key => {
    const k = key as keyof Spot;
    if (Array.isArray(completionData[k])) {
        return (completionData[k] as any[]).length > 0;
    }
    return !!completionData[k];
  });
  
  if (changes.length === 0) {
      return (
         <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-6 text-center animate-slide-up-fast">
                <Icon name="check-circle" className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold">情報はありません</h2>
                <p className="text-neutral-500 mt-2">URLから新しい情報を取得できませんでした。スポット情報は最新の状態です。</p>
                 <button onClick={onClose} className="mt-6 w-full px-5 py-3 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-semibold transition-transform active:scale-95">
                    閉じる
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-neutral-50 dark:bg-neutral-900 rounded-2xl flex flex-col animate-slide-up-fast overflow-hidden shadow-2xl max-h-[90vh]">
        <header className="flex-shrink-0 flex items-center justify-center p-4 border-b border-neutral-200 dark:border-neutral-700/80">
            <div className="text-center">
                <Icon name="sparkles" className="w-8 h-8 text-rose-500 mx-auto" />
                <h1 className="text-lg font-bold mt-1">AIによる情報補完</h1>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-center text-neutral-500 mb-4">以下の情報がURLから見つかりました。適用しますか？</p>
          <div className="space-y-2">
            <DiffRow label="スポット名" original={spot.name} completed={completionData.name} />
            <DiffRow label="住所" original={spot.address} completed={completionData.address} />
            <DiffRow label="電話番号" original={spot.phone} completed={completionData.phone} />
            <DiffRow label="営業時間" original={spot.openingHours} completed={completionData.openingHours} />
            <DiffRow label="最低予算" original={spot.priceMin} completed={completionData.priceMin} />
            <DiffRow label="最高予算" original={spot.priceMax} completed={completionData.priceMax} />
            <DiffRow label="支払い方法" original={spot.paymentMethods} completed={completionData.paymentMethods} />
            <DiffRow label="メモ" original={spot.memo} completed={completionData.memo} />
            <DiffRow label="タグ" original={spot.tags} completed={completionData.tags} />
          </div>
        </main>
        
        <footer className="p-4 border-t border-neutral-200 dark:border-neutral-700/80 flex gap-3">
            <button onClick={onClose} className="flex-1 px-5 py-3 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-semibold transition-transform active:scale-95">
                キャンセル
            </button>
            <button onClick={() => onApply(spot.id, completionData)} className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-br from-[#FF5252] to-[#E63946] text-white font-semibold shadow-md shadow-[#FF5252]/30 transition-transform active:scale-95">
                適用する
            </button>
        </footer>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slide-up-fast { animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes slideUp { from { transform: translateY(30px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AiCompletionModal;
