
import React, { useState } from 'react';
import { Icon } from '../constants';
import { AppScreen } from '../types';
import { supabase } from '../lib/supabase';

interface UpdatePasswordScreenProps {
  onNavigate: (screen: AppScreen) => void;
}

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
        {...props} 
        className={`w-full h-12 px-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition duration-200 ${props.className}`} 
    />
);

const UpdatePasswordScreen: React.FC<UpdatePasswordScreenProps> = ({ onNavigate }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 12) {
        setPasswordError('パスワードは12文字以上である必要があります。');
        return;
    }
    setLoading(true);
    
    const { error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        alert('パスワードの更新に失敗しました: ' + error.message);
    } else {
        alert('パスワードを更新しました。');
        onNavigate({ view: 'home' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 animate-fade-in">
       <header className="sticky top-0 z-50 flex items-center p-2 bg-gradient-to-r from-[#FF5252] to-[#E63946] shadow-md text-white" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
          <button onClick={() => onNavigate({ view: 'home' })} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/20 active:bg-white/30">
             <Icon name="x-mark" className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-bold text-center flex-1 -ml-10">新しいパスワード</h1>
       </header>

       <main className="flex-1 flex flex-col justify-center p-8">
        <div className="text-center mb-10">
             <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="user" className="w-8 h-8 text-blue-500" />
            </div>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">新しいパスワードの設定</h1>
           <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm">
                新しいパスワードを入力してください。
            </p>
        </div>
        
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400">新しいパスワード</label>
            <TextInput
              type="password"
              value={password}
              onChange={(e) => {
                  setPassword(e.target.value);
                  if(e.target.value.length >= 12) setPasswordError('');
              }}
              placeholder="••••••••••••"
              required
              className="mt-2"
            />
             {passwordError && <p className="text-xs text-red-500 mt-1 font-semibold">{passwordError}</p>}
             <p className="text-xs text-neutral-400 mt-1">12文字以上で入力してください</p>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-br from-[#FF5252] to-[#E63946] text-white font-semibold shadow-lg shadow-[#FF5252]/30 transition-transform active:scale-95 disabled:opacity-50"
              disabled={!password || loading}
            >
              {loading ? '更新中...' : 'パスワードを変更'}
            </button>
          </div>
        </form>
      </main>
       <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default UpdatePasswordScreen;
