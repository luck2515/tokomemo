import React, { useState } from 'react';
import { Icon } from '../constants';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface PairingScreenProps {
  onBack: () => void;
  onPair: (code: string) => void;
  currentUser: UserProfile | null;
}

const PairingScreen: React.FC<PairingScreenProps> = ({ onBack, onPair, currentUser }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePair = async () => {
    if (!code.trim()) {
      alert('ペアリングコードを入力してください。');
      return;
    }
    if (!currentUser) return;

    setLoading(true);

    try {
        // 1. Find partner by code
        const { data: partner, error: searchError } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('pairing_code', code.trim().toUpperCase())
            .single();

        if (searchError || !partner) {
            alert('ユーザーが見つかりませんでした。コードを確認してください。');
            setLoading(false);
            return;
        }

        if (partner.id === currentUser.id) {
             alert('自分のコードは入力できません。');
             setLoading(false);
             return;
        }

        // 2. Update current user
        const { error: updateMeError } = await supabase
            .from('profiles')
            .update({ partner_id: partner.id })
            .eq('id', currentUser.id);

        if (updateMeError) throw updateMeError;

        // 3. Update partner (two-way binding)
        // Ideally this would be done via a database function to ensure consistency and security,
        // but implementing on client for this spec.
        const { error: updatePartnerError } = await supabase
             .from('profiles')
             .update({ partner_id: currentUser.id })
             .eq('id', partner.id);

        if (updatePartnerError) throw updatePartnerError;

        alert(`${partner.email} とペアリングしました！`);
        onPair(code); // Trigger refresh

    } catch (error) {
        console.error("Pairing error:", error);
        alert('ペアリングに失敗しました。');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-50 dark:bg-neutral-900 animate-slide-up-fast flex flex-col">
      <header className="flex-shrink-0 flex items-center p-2 border-b border-neutral-200 dark:border-neutral-700/80" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
        <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Icon name="arrow-left" className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-center flex-1 -ml-10">ペアリング</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-6 flex flex-col">
        <div className="text-center">
            <Icon name="users" className="w-16 h-16 text-neutral-400 dark:text-neutral-500 mx-auto" />
            <h2 className="text-xl font-bold mt-4">パートナーとリストを共有</h2>
            <p className="text-neutral-500 mt-2">お互いのコードを入力してペアリングすると、共有リストが使えるようになります。</p>
        </div>

        <div className="mt-8">
            <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">あなたのコード</label>
            <div className="mt-2 flex items-center gap-3 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                <p className="text-2xl font-mono font-bold flex-1 tracking-widest">{currentUser?.pairing_code || 'Loading...'}</p>
                <button 
                    onClick={() => navigator.clipboard.writeText(currentUser?.pairing_code || '')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-sm font-semibold text-neutral-800 dark:text-neutral-100 active:scale-95 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                    <Icon name="document-duplicate" className="w-4 h-4" />
                    コピー
                </button>
            </div>
        </div>

        <div className="mt-8">
             <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">パートナーのコード</label>
            <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXX-YYYY"
                className="mt-2 w-full h-14 text-center text-2xl font-mono tracking-widest rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition"
            />
        </div>

        <div className="mt-auto pt-8">
            <button onClick={handlePair} disabled={loading} className="w-full px-5 py-4 rounded-xl bg-gradient-to-br from-[#FF5252] to-[#E63946] text-white font-semibold shadow-md shadow-[#FF5252]/30 transition-transform active:scale-95 disabled:opacity-50">
                {loading ? '処理中...' : 'ペアリングする'}
            </button>
        </div>
      </main>
      <style>{`
        .animate-slide-up-fast { animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default PairingScreen;