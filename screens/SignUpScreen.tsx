
import React, { useState } from 'react';
import { Icon } from '../constants';
import { AppScreen } from '../types';
import { supabase } from '../lib/supabase';

interface SignUpScreenProps {
  onSignUp: () => void;
  onNavigate: (screen: AppScreen) => void;
}

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }> = ({ error, className, ...props }) => (
    <input 
        {...props} 
        className={`w-full h-12 px-4 rounded-xl border-2 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-neutral-200 dark:border-neutral-700 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/20'} bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 transition duration-200 ${className}`} 
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
        <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 animate-fade-in">
             <header className="sticky top-0 z-50 flex items-center p-2 bg-gradient-to-r from-[#FF5252] to-[#E63946] shadow-md text-white" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
                <button onClick={() => onNavigate({ view: 'welcome' })} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/20 active:bg-white/30">
                    <Icon name="x-mark" className="w-6 h-6 text-white" />
                </button>
                 <h1 className="text-lg font-bold text-center flex-1 -ml-10">確認メール送信完了</h1>
            </header>

            <main className="flex-1 flex flex-col justify-center p-8 text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon name="bell" className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">確認メールを送信しました</h2>
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8">
                    <strong>{email}</strong> 宛に確認メールを送信しました。<br/>
                    メール内のリンクをクリックして、登録を完了してください。
                </p>
                
                <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl text-sm text-left mb-8">
                    <p className="font-bold mb-2 text-neutral-700 dark:text-neutral-200">メールが届かない場合：</p>
                    <ul className="list-disc list-inside space-y-1 text-neutral-500 dark:text-neutral-400">
                        <li>迷惑メールフォルダをご確認ください</li>
                        <li>メールアドレスが正しいか確認してください</li>
                    </ul>
                </div>

                <button
                    onClick={() => onNavigate({ view: 'login' })}
                    className="w-full px-6 py-4 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-semibold transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-600 active:scale-95"
                >
                    ログイン画面へ戻る
                </button>
                
                 {cooldown > 0 && (
                    <p className="mt-4 text-xs text-neutral-400">
                        メールを再送信するには {cooldown} 秒お待ちください
                    </p>
                )}
            </main>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 animate-fade-in">
      <header className="sticky top-0 z-50 flex items-center p-2 bg-gradient-to-r from-[#FF5252] to-[#E63946] shadow-md text-white" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
        <button onClick={() => onNavigate({ view: 'welcome' })} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/20 active:bg-white/30">
          <Icon name="arrow-left" className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-bold text-center flex-1 -ml-10">新規登録</h1>
      </header>
      
      <main className="flex-1 flex flex-col justify-center p-8">
        <form onSubmit={handleSignUpSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400">メールアドレス</label>
            <TextInput
              type="email"
              value={email}
              onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
              }}
              placeholder="email@example.com"
              required
              className="mt-2"
              error={!!emailError}
            />
            {emailError && <p className="text-xs text-red-500 mt-1 font-semibold">{emailError}</p>}
          </div>
          <div>
            <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400">パスワード</label>
            <TextInput
              type="password"
              value={password}
              onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value.length >= 12) setPasswordError('');
              }}
              placeholder="12文字以上"
              required
              className="mt-2"
              error={!!passwordError}
            />
            {passwordError && <p className="text-xs text-red-500 mt-1 font-semibold">{passwordError}</p>}
            <p className="text-xs text-neutral-400 mt-1">セキュリティのため、12文字以上で設定してください</p>
          </div>
          
          <div className="pt-2">
            <Checkbox checked={agreedToTerms} onChange={setAgreedToTerms}>
                <span className="underline">利用規約</span>と<span className="underline">プライバシーポリシー</span>に同意します
            </Checkbox>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-br from-[#FF5252] to-[#E63946] text-white font-semibold shadow-lg shadow-[#FF5252]/30 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!email || !password || !agreedToTerms || loading || cooldown > 0}
            >
              {loading ? '登録処理中...' : 'アカウントを作成'}
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
