
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
        className={`w-full h-12 px-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition duration-200 ${props.className}`} 
    />
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        if (error.message.includes('Invalid login credentials')) {
            setLoginError('メールアドレスまたはパスワードが間違っています。');
        } else {
            setLoginError('ログインに失敗しました: ' + error.message);
        }
    } else {
        // Auth state listener in App.tsx will handle navigation
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.href,
    });

    if (error) {
        alert('送信に失敗しました: ' + error.message);
    } else {
        alert(`${email} 宛にパスワードリセットメールを送信しました。\nメール内のリンクを確認してください。`);
        setIsResetMode(false);
    }
    setLoading(false);
  };

  if (isResetMode) {
      return (
        <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 animate-fade-in">
            <header className="sticky top-0 z-50 flex items-center p-2 bg-gradient-to-r from-[#FF5252] to-[#E63946] shadow-md text-white" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
                <button onClick={() => setIsResetMode(false)} className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/20 active:bg-white/30">
                    <Icon name="arrow-left" className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-lg font-bold text-center flex-1 -ml-10 pointer-events-none">パスワードの再設定</h1>
            </header>
            
            <main className="flex-1 flex flex-col justify-center p-8">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="user" className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm">
                        登録したメールアドレスを入力してください。<br/>
                        リセット用のリンクを送信します。
                    </p>
                </div>
                
                <form onSubmit={handleResetPassword} className="space-y-4">
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
                
                <div className="pt-4">
                    <button
                    type="submit"
                    className="w-full px-6 py-4 rounded-xl bg-neutral-800 dark:bg-neutral-700 text-white font-semibold shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                    disabled={!email || loading}
                    >
                    {loading ? '送信中...' : 'リセットメールを送信'}
                    </button>
                </div>
                </form>
            </main>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 animate-fade-in">
      <header className="sticky top-0 z-50 flex items-center p-2 bg-gradient-to-r from-[#FF5252] to-[#E63946] shadow-md text-white" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
        <button onClick={() => onNavigate({ view: 'welcome' })} className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/20 active:bg-white/30">
          <Icon name="arrow-left" className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-center flex-1 -ml-10 pointer-events-none">ログイン</h1>
      </header>
      
      <main className="flex-1 flex flex-col justify-center p-8">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400">メールアドレス</label>
            <TextInput
              type="email"
              value={email}
              onChange={(e) => {
                  setEmail(e.target.value);
                  setLoginError('');
              }}
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
              onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError('');
              }}
              placeholder="••••••••"
              required
              className="mt-2"
            />
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 flex items-center gap-2 animate-shake">
                <Icon name="x-mark" className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{loginError}</p>
            </div>
          )}
          
          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-br from-[#FF5252] to-[#E63946] text-white font-semibold shadow-lg shadow-[#FF5252]/30 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!email || !password || loading}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>

          <div className="text-center mt-4">
            <button type="button" onClick={() => setIsResetMode(true)} className="text-sm font-medium text-[#FF5252] hover:underline">
                パスワードを忘れた場合
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
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
