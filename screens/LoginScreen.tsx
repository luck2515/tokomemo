
import React, { useState } from 'react';
import { Icon } from '../constants';
import { AppScreen } from '../types';
import { supabase } from '../lib/supabase';

interface LoginScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
        {...props} 
        className={`w-full h-12 px-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all duration-300 ${props.className}`} 
    />
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

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
        setResetEmailSent(true);
    }
    setLoading(false);
  };

  if (resetEmailSent) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 animate-fade-in p-6 text-center">
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-[100px] animate-float" />

            <div className="relative z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full border border-white/50">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Icon name="paper-airplane" className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100 mb-4">送信完了</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8 font-medium">
                    <strong>{email}</strong> 宛にパスワードリセット用のメールを送信しました。<br/>
                    メール内のリンクから新しいパスワードを設定してください。
                </p>

                <button
                    onClick={() => { setResetEmailSent(false); setIsResetMode(false); }}
                    className="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-lg hover:scale-[1.02] transition-all active:scale-95"
                >
                    ログイン画面に戻る
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-neutral-50 dark:bg-neutral-900 p-6 animate-fade-in">
      
      {/* Mesh Gradient Background */}
      <div className="absolute top-[-10%] right-[-20%] w-[80%] h-[70%] bg-rose-200/30 dark:bg-rose-500/10 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[60%] bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-[80px] animate-float delay-1000" />

      <header className="absolute top-0 left-0 right-0 z-50 p-4" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
        <button onClick={() => onNavigate({ view: 'welcome' })} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/10">
          <Icon name="arrow-left" className="w-6 h-6 text-neutral-800 dark:text-neutral-100" />
        </button>
      </header>
      
      <main className="w-full max-w-md relative z-10">
        <div className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-neutral-200/50 dark:shadow-black/50 border border-white/50 dark:border-white/10 p-8">
            
            <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">
                    {isResetMode ? 'パスワード再設定' : 'おかえりなさい'}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                    {isResetMode ? '登録メールアドレスを入力してください' : 'とこメモアカウントにログイン'}
                </p>
            </div>

            {isResetMode ? (
                <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 ml-1">メールアドレス</label>
                        <TextInput
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-lg hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!email || loading}
                    >
                        {loading ? '送信中...' : 'リセットメールを送信'}
                    </button>
                    <button type="button" onClick={() => setIsResetMode(false)} className="w-full py-3 text-sm font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
                        ログインへ戻る
                    </button>
                </form>
            ) : (
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 ml-1">メールアドレス</label>
                        <TextInput
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setLoginError(''); }}
                            placeholder="email@example.com"
                            required
                        />
                    </div>
                    <div>
                         <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">パスワード</label>
                            <button type="button" onClick={() => setIsResetMode(true)} className="text-xs font-bold text-rose-500 hover:text-rose-600">
                                忘れた場合
                            </button>
                        </div>
                        <TextInput
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {loginError && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 flex items-center gap-2 animate-shake text-xs font-bold text-red-500">
                            <Icon name="x-mark" className="w-4 h-4 flex-shrink-0" />
                            {loginError}
                        </div>
                    )}
                    
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold shadow-lg shadow-rose-500/30 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!email || !password || loading}
                        >
                            {loading ? 'ログイン中...' : 'ログイン'}
                        </button>
                    </div>
                </form>
            )}
        </div>
        
        {!isResetMode && (
            <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mt-8 font-medium">
            アカウントをお持ちでないですか？{' '}
            <button onClick={() => onNavigate({ view: 'signup' })} className="font-bold text-rose-500 hover:underline">
                新規登録
            </button>
            </p>
        )}
      </main>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-float { animation: float 10s ease-in-out infinite; }
        @keyframes float {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(20px, -20px); }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
