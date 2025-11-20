
import React, { useState } from 'react';
import { Icon } from '../constants';
import { AppScreen } from '../types';
import { supabase } from '../lib/supabase';

interface SignUpScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }> = ({ error, className, ...props }) => (
    <input 
        {...props} 
        className={`w-full h-12 px-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all duration-300 ${error ? 'border-red-500 bg-red-50/50' : ''} ${className}`} 
    />
);

const Checkbox: React.FC<{ checked: boolean, onChange: (checked: boolean) => void, children: React.ReactNode }> = ({ checked, onChange, children }) => (
    <label className="flex items-center space-x-3 cursor-pointer group">
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${checked ? 'bg-rose-500 border-rose-500 shadow-md shadow-rose-500/30' : 'border-neutral-300 dark:border-neutral-600 bg-white/50 group-hover:border-rose-300'}`}>
                {checked && <Icon name="check" className="w-4 h-4 text-white" />}
            </div>
        </div>
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{children}</span>
    </label>
);

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
        alert('利用規約とプライバシーポリシーに同意してください。');
        return;
    }
    if (password.length < 12) {
        setPasswordError('パスワードは12文字以上である必要があります。');
        return;
    }
    if (cooldown > 0) return;

    setPasswordError('');
    setEmailError('');
    setLoading(true);

    try {
        const normalizedEmail = email.trim();
        
        // RPC call to check email existence
        const { data: exists, error: rpcError } = await supabase.rpc('check_email_exists', {
            email_input: normalizedEmail,
        });

        if (rpcError) {
            console.error("RPC Error:", rpcError);
            alert(`システム設定エラー: 重複チェック機能が見つかりません。\n\nSupabaseのSQL Editorで以下の関数を作成してください:\ncheck_email_exists`);
            setLoading(false);
            return;
        }

        if (exists) {
            setEmailError('このメールアドレスは既に登録されています。ログインしてください。');
            setLoading(false);
            return;
        }

        // 1. Sign Up
        const { error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password: password,
        });

        if (error) {
            if (error.message.includes('already registered')) {
                 setEmailError('このメールアドレスは既に登録されています。');
            } else {
                 alert('登録に失敗しました: ' + error.message);
            }
        } else {
            setEmailSent(true);
            setCooldown(60);
            const timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    } catch (err) {
        console.error(err);
        alert('予期せぬエラーが発生しました。');
    } finally {
        setLoading(false);
    }
  };

  if (emailSent) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 animate-fade-in p-6 text-center">
             <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-green-200/30 dark:bg-green-500/10 rounded-full blur-[100px] animate-float" />

            <div className="relative z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full border border-white/50">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Icon name="bell" className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100 mb-4">メールを送信しました</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8 font-medium">
                    <strong>{email}</strong> 宛に確認メールを送信しました。<br/>
                    リンクをクリックして登録を完了してください。
                </p>

                <button
                    onClick={() => onNavigate({ view: 'login' })}
                    className="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-lg hover:scale-[1.02] transition-all active:scale-95"
                >
                    ログイン画面へ
                </button>
                
                 {cooldown > 0 && (
                    <p className="mt-4 text-xs text-neutral-400 font-bold">
                        再送信まで {cooldown} 秒
                    </p>
                )}
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-neutral-50 dark:bg-neutral-900 p-6 animate-fade-in">
      
       {/* Mesh Gradient Background */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[70%] bg-rose-200/30 dark:bg-rose-500/10 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[60%] bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-[80px] animate-float delay-1000" />

      <header className="absolute top-0 left-0 right-0 z-50 p-4" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
        <button onClick={() => onNavigate({ view: 'welcome' })} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/10">
          <Icon name="arrow-left" className="w-6 h-6 text-neutral-800 dark:text-neutral-100" />
        </button>
      </header>
      
      <main className="w-full max-w-md relative z-10">
         <div className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-neutral-200/50 dark:shadow-black/50 border border-white/50 dark:border-white/10 p-8">
            
            <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">
                    アカウント作成
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                    とこメモで二人の思い出を残しましょう
                </p>
            </div>

            <form onSubmit={handleSignUpSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 ml-1">メールアドレス</label>
                    <TextInput
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                    }}
                    placeholder="email@example.com"
                    required
                    error={!!emailError}
                    />
                    {emailError && <p className="text-xs text-red-500 mt-1.5 font-bold ml-1">{emailError}</p>}
                </div>
                <div>
                    <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 ml-1">パスワード</label>
                    <TextInput
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (e.target.value.length >= 12) setPasswordError('');
                    }}
                    placeholder="12文字以上"
                    required
                    error={!!passwordError}
                    />
                    {passwordError && <p className="text-xs text-red-500 mt-1.5 font-bold ml-1">{passwordError}</p>}
                    {!passwordError && <p className="text-[10px] text-neutral-400 mt-1.5 ml-1 font-medium">セキュリティのため、12文字以上で設定してください</p>}
                </div>
                
                <div className="pt-2 pl-1">
                    <Checkbox checked={agreedToTerms} onChange={setAgreedToTerms}>
                        <span className="underline hover:text-rose-500 transition-colors">利用規約</span>と<span className="underline hover:text-rose-500 transition-colors">プライバシーポリシー</span>に同意します
                    </Checkbox>
                </div>

                <div className="pt-2">
                    <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold shadow-lg shadow-rose-500/30 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!email || !password || !agreedToTerms || loading || cooldown > 0}
                    >
                    {loading ? '登録処理中...' : 'はじめる'}
                    </button>
                </div>
            </form>
         </div>
        
        <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mt-8 font-medium">
          すでにアカウントをお持ちですか？{' '}
          <button onClick={() => onNavigate({ view: 'login' })} className="font-bold text-rose-500 hover:underline">
            ログイン
          </button>
        </p>
      </main>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-float { animation: float 10s ease-in-out infinite; }
        @keyframes float {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(20px, -20px); }
        }
      `}</style>
    </div>
  );
};

export default SignUpScreen;
