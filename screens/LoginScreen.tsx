import React, { useState } from 'react';
import { Icon } from '../constants';
import { AppScreen } from '../types';
import { supabase } from '../lib/supabase';

interface LoginScreenProps {
  onLogin: () => void;
  onNavigate: (screen: AppScreen) => void;
}

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
        {...props} 
        className={`w-full h-12 px-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition duration-200 ${props.className}`} 
    />
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        alert('ログインに失敗しました: ' + error.message);
    } else {
        // Auth state listener in App.tsx will handle navigation
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 animate-fade-in">
      <header className="flex-shrink-0 flex items-center p-2" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
        <button onClick={() => onNavigate({ view: 'welcome' })} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Icon name="arrow-left" className="w-6 h-6" />
        </button>
      </header>
      
      <main className="flex-1 flex flex-col justify-center p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">ログイン</h1>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400">メールアドレス</label>
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400">パスワード</label>
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-2"
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-br from-[#FF5252] to-[#E63946] text-white font-semibold shadow-lg shadow-[#FF5252]/30 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!email || !password || loading}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </form>
        
        <p className="text-sm text-center text-neutral-500 mt-8">
          アカウントをお持ちでないですか？{' '}
          <button onClick={() => onNavigate({ view: 'signup' })} className="font-semibold text-[#FF5252] hover:underline">
            新規登録
          </button>
        </p>
      </main>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default LoginScreen;