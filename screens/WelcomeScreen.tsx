
import React from 'react';
import { Icon } from '../constants';
import { AppScreen } from '../types';

interface WelcomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="h-[100svh] flex flex-col items-center relative overflow-hidden bg-neutral-50 dark:bg-neutral-900 p-6 text-center">
      
      {/* Mesh Gradient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[60%] bg-rose-300/20 dark:bg-rose-500/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[50%] bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-[80px] animate-pulse delay-1000" />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-sm mx-auto">
        <div className="relative mb-8">
            <div className="w-28 h-28 flex items-center justify-center bg-gradient-to-tr from-[#FF5252] to-[#ff8a80] rounded-[2rem] shadow-2xl shadow-rose-500/30 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                <Icon name="heart" className="w-14 h-14 text-white fill-white drop-shadow-md" />
            </div>
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                 <Icon name="sparkles" className="w-5 h-5 text-amber-400" />
            </div>
        </div>

        <h1 className="text-4xl font-extrabold text-neutral-800 dark:text-white tracking-tight mb-4">
          とこメモ
        </h1>
        <p className="text-base text-neutral-500 dark:text-neutral-300 leading-relaxed font-medium">
          ふたりの思い出も、<br/>これからの予定も、これひとつ。
        </p>
      </div>

      <div className="w-full max-w-sm relative z-10 space-y-3 pb-8">
        <button
          onClick={() => onNavigate({ view: 'signup' })}
          className="w-full px-6 py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-xl shadow-neutral-500/20 hover:scale-[1.02] transition-all active:scale-95"
        >
          はじめる
        </button>
        <button
          onClick={() => onNavigate({ view: 'login' })}
          className="w-full px-6 py-4 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-white font-bold hover:bg-white dark:hover:bg-neutral-800 transition-colors active:scale-95"
        >
          ログイン
        </button>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-6 font-medium px-4">
          利用を開始することで、<a href="#" className="underline hover:text-neutral-600">利用規約</a>と<a href="#" className="underline hover:text-neutral-600">プライバシーポリシー</a>に同意したことになります。
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
