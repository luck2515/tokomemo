import React from 'react';
import { Icon } from '../constants';
import { AppScreen } from '../types';

interface WelcomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-8 text-center animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-br from-rose-100 to-red-200 dark:from-rose-800/30 dark:to-red-800/30 rounded-full mb-6 shadow-inner">
            <Icon name="heart" className="w-16 h-16 text-[#FF5252]" />
        </div>
        <h1 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100">Tokomemo</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
          思い出の場所を、もっと簡単に、もっと楽しく。
        </p>
      </div>

      <div className="w-full max-w-sm">
        <button
          onClick={() => onNavigate({ view: 'signup' })}
          className="w-full mb-4 px-6 py-4 rounded-xl bg-gradient-to-br from-[#FF5252] to-[#E63946] text-white font-semibold shadow-lg shadow-[#FF5252]/30 transition-transform active:scale-95"
        >
          新規登録
        </button>
        <button
          onClick={() => onNavigate({ view: 'login' })}
          className="w-full px-6 py-4 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 font-semibold transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 active:scale-95"
        >
          ログイン
        </button>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-6">
          続行することで、<a href="#" className="underline">利用規約</a>と<a href="#" className="underline">プライバシーポリシー</a>に同意したことになります。
        </p>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default WelcomeScreen;