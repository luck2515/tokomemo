
import React from 'react';
import { Icon } from '../constants';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  platform: 'ios' | 'android' | 'desktop';
}

const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose, onInstall, platform }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-up relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
             <Icon name="x-mark" className="w-6 h-6" />
        </button>

        <div className="text-center">
             <div className="w-16 h-16 bg-gradient-to-tr from-[#FF5252] to-[#ff8a80] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/30">
                <Icon name="heart" className="w-8 h-8 text-white fill-white" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">アプリをインストール</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
                ホーム画面に追加して、<br/>オフラインでも快適に利用しましょう。
            </p>

            {platform === 'ios' ? (
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 text-left text-sm text-neutral-700 dark:text-neutral-300 space-y-3 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-300 dark:bg-neutral-600 text-xs font-bold">1</span>
                        <span>画面下部の共有ボタン <Icon name="share" className="w-4 h-4 inline mx-1" /> をタップ</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-300 dark:bg-neutral-600 text-xs font-bold">2</span>
                        <span>「ホーム画面に追加」を選択</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-300 dark:bg-neutral-600 text-xs font-bold">3</span>
                        <span>右上の「追加」をタップ</span>
                    </div>
                </div>
            ) : (
                 <button
                    onClick={onInstall}
                    className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-lg hover:scale-[1.02] transition-all active:scale-95"
                >
                    インストールする
                </button>
            )}
             
             <button onClick={onClose} className="mt-4 text-sm text-neutral-400 font-medium hover:text-neutral-600 dark:hover:text-neutral-200">
                 今はしない
             </button>
        </div>
      </div>
      <style>{`
        .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default PwaInstallModal;
