
import React, { useState } from 'react';
import { Icon } from '../constants';
import { AppScreen } from '../types';
import { supabase } from '../lib/supabase';

interface SignUpScreenProps {
  onSignUp: () => void;
  onNavigate: (screen: AppScreen) => void;
}

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
        {...props} 
        className={`w-full h-12 px-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition duration-200 ${props.className}`} 
    />
);

const Checkbox: React.FC<{ checked: boolean, onChange: (checked: boolean) => void, children: React.ReactNode }> = ({ checked, onChange, children }) => (
    <label className="flex items-center space-x-3 cursor-pointer">
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 ${checked ? 'bg-[#FF5252] border-[#FF5252]' : 'border-neutral-300 dark:border-neutral-600'}`}>
                {checked && <Icon name="check" className="w-4 h-4 text-white" />}
            </div>
        </div>
        <span className="text-sm text-neutral-600 dark:text-neutral-300">{children}</span>
    </label>
);

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
        alert('利用規約とプライバシーポリシーに同意してください。');
        return;
    }
    setLoading(true);

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        alert('登録エラー: ' + authError.message);
        setLoading(false);
        return;
    }

    // 2. Check if email confirmation is required (no session immediately available)
    if (authData.user && !authData.session) {
        setEmailSent(true);
        setLoading(false);
        return;
    }

    // If session exists (email auto-confirmed or not required), App.tsx auth listener handles navigation
    setLoading(false);
  };

  const isFormValid = email && password && agreedToTerms;

  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 animate-fade-in">
         <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce-small">
                <Icon name="check-circle" className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">確認メールを送信しました</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{email}</span> 宛に<br/>
                確認メールを送信しました。<br/><br/>
                メール内のリンクをクリックして、<br/>
                登録を完了してください。
            </p>
            <button
                onClick={() => onNavigate({ view: 'login' })}
                className="w-full max-w-sm px-6 py-4 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 font-semibold transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700 active:scale-95"
            >
                ログイン画面へ戻る
            </button>
         </main>
          <style>{`
            .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-bounce-small { animation: bounceSmall 2s infinite; }
            @keyframes bounceSmall { 
                0%, 100% { transform: translateY(0); } 
                50% { transform: translateY(-5px); } 
            }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 animate-fade-in">
      <header className="flex-shrink-0 flex items-center p-2" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
        <button onClick={() => onNavigate({ view: 'welcome' })} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Icon name="arrow-left" className="w-6 h-6" />
        </button>
      </header>
      
      <main className="flex-1 flex flex-col justify-center p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">新規登録</h1>
        </div>
        
        <form onSubmit={handleSignUpSubmit} className="space-y-4">
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
                <Checkbox checked={agreedToTerms} onChange={setAgreedToTerms}>
                    <a href="#" className="underline">利用規約</a>と<a href="#" className="underline">プライバシーポリシー</a>に同意します。
                </Checkbox>
            </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-br from-[#FF5252] to-[#E63946] text-white font-semibold shadow-lg shadow-[#FF5252]/30 transition-transform active:scale-95 disabled:opacity-50"
              disabled={!isFormValid || loading}
            >
              {loading ? '登録中...' : 'アカウントを作成'}
            </button>
          </div>
        </form>
        
        <p className="text-sm text-center text-neutral-500 mt-8">
          すでにアカウントをお持ちですか？{' '}
          <button onClick={() => onNavigate({ view: 'login' })} className="font-semibold text-[#FF5252] hover:underline">
            ログイン
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

export default SignUpScreen;
