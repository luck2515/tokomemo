
import React, { useState } from 'react';
import { Icon } from '../constants';
import { supabase } from '../lib/supabase';

const VerifyEmailScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const checkVerification = async () => {
    setLoading(true);
    // Refresh session to get latest email_confirmed_at
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (session?.user.email_confirmed_at) {
        // Session update will trigger onAuthStateChange in App.tsx
        window.location.reload(); 
    } else {
        alert('まだ認証が完了していません。メールのリンクをクリックしてください。');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      // Will trigger App.tsx state change to welcome/login
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 animate-fade-in p-6 text-center relative overflow-hidden">
       {/* Mesh Gradient Background */}
       <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-amber-200/30 dark:bg-amber-500/10 rounded-full blur-[100px] animate-float" />

        <div className="relative z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full border border-white/50">
            <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                <Icon name="lock-closed" className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100 mb-4">メール認証が必要です</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8 font-medium">
                登録されたメールアドレス宛に確認メールを送信しました。<br/>
                メール内のリンクをクリックしてアカウントを有効化してください。
            </p>

            <div className="space-y-3">
                <button
                    onClick={checkVerification}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-lg hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? '確認中...' : '認証完了を確認する'}
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full py-3 text-sm font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                    ログアウト / 別のアカウント
                </button>
            </div>
        </div>
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

export default VerifyEmailScreen;
