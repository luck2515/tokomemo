
import React, { useState, useEffect } from 'react';
import { Icon } from '../constants';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface PairingScreenProps {
  onBack: () => void;
  onPair: (code: string) => void;
  currentUser: UserProfile | null;
}

type PairingStatus = 'idle' | 'waiting' | 'connected';

const PairingScreen: React.FC<PairingScreenProps> = ({ onBack, onPair, currentUser }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<PairingStatus>('idle');
  const [partnerEmail, setPartnerEmail] = useState<string | null>(null);

  useEffect(() => {
      checkStatus();
  }, [currentUser]);

  const checkStatus = async () => {
      if (!currentUser || !currentUser.partner_id) {
          setStatus('idle');
          return;
      }

      try {
          // Fetch the partner I am pointing to
          const { data: partner, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.partner_id)
            .single();

          if (error || !partner) {
              // Partner deleted?
              setStatus('idle');
              return;
          }

          setPartnerEmail(partner.email);

          // Check if partner points back to me
          if (partner.partner_id === currentUser.id) {
              setStatus('connected');
          } else {
              setStatus('waiting');
          }
      } catch (e) {
          console.error("Status check failed", e);
      }
  };

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

        // 2. Update ONLY current user's partner_id
        // We do NOT update the partner's profile, as RLS likely prevents it.
        const { error: updateMeError } = await supabase
            .from('profiles')
            .update({ partner_id: partner.id })
            .eq('id', currentUser.id);

        if (updateMeError) throw updateMeError;

        // 3. Refresh status
        alert('コードを登録しました！');
        onPair(code); // Trigger App refresh
        
        // Force check status immediately
        setPartnerEmail(partner.email);
        
        // Check if they already added me
        const { data: partnerProfile } = await supabase.from('profiles').select('partner_id').eq('id', partner.id).single();
        if (partnerProfile?.partner_id === currentUser.id) {
            setStatus('connected');
            alert(`おめでとうございます！ ${partner.email} とペアリングが完了しました。`);
        } else {
            setStatus('waiting');
        }

    } catch (error) {
        console.error("Pairing error:", error);
        alert('ペアリング処理に失敗しました。');
    } finally {
        setLoading(false);
    }
  };

  const renderContent = () => {
      if (status === 'connected') {
          return (
              <div className="text-center animate-fade-in">
                  <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon name="heart" className="w-12 h-12 text-rose-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-rose-500">ペアリング中</h2>
                  <p className="text-neutral-600 dark:text-neutral-300 mt-4">
                      パートナー：<span className="font-bold">{partnerEmail}</span>
                  </p>
                  <p className="text-sm text-neutral-500 mt-2">
                      お互いの共有リストが見られる状態です。
                  </p>
                  <button 
                    onClick={() => {
                        // In a real app, add unpair logic
                        alert('ペアリング解除機能は実装中です。');
                    }}
                    className="mt-8 text-sm text-neutral-400 underline"
                  >
                      ペアリングを解除する
                  </button>
              </div>
          );
      }

      if (status === 'waiting') {
          return (
              <div className="text-center animate-fade-in">
                   <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon name="clock" className="w-12 h-12 text-amber-500" />
                  </div>
                  <h2 className="text-xl font-bold text-amber-500">パートナーの承認待ち</h2>
                  <p className="text-neutral-600 dark:text-neutral-300 mt-4">
                      あなたは <strong>{partnerEmail}</strong> をパートナーに指定しました。<br/>
                      相手があなたのコードを入力するとペアリングが完了します。
                  </p>
                  
                  <div className="mt-8 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                      <p className="text-xs font-bold text-neutral-500 mb-2">あなたのコードを相手に伝えてください</p>
                      <p className="text-2xl font-mono font-bold tracking-widest">{currentUser?.pairing_code}</p>
                  </div>

                   <button 
                    onClick={() => setStatus('idle')} 
                    className="mt-6 text-sm text-neutral-400 underline"
                   >
                       コード入力画面に戻る（修正する）
                   </button>
              </div>
          );
      }

      return (
        <>
            <div className="text-center">
                <Icon name="users" className="w-16 h-16 text-neutral-400 dark:text-neutral-500 mx-auto" />
                <h2 className="text-xl font-bold mt-4 text-neutral-900 dark:text-neutral-100">パートナーとリストを共有</h2>
                <p className="text-neutral-500 mt-2">お互いのコードを入力してペアリングすると、共有リストが使えるようになります。</p>
            </div>

            <div className="mt-8">
                <label className="text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">あなたのコード</label>
                <div className="mt-2 flex items-center gap-3 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                    <p className="text-2xl font-mono font-bold flex-1 tracking-widest text-neutral-900 dark:text-neutral-100">{currentUser?.pairing_code || 'Loading...'}</p>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(currentUser?.pairing_code || '');
                            alert('コードをコピーしました');
                        }}
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
                    className="mt-2 w-full h-14 text-center text-2xl font-mono tracking-widest rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition"
                />
            </div>

            <div className="mt-auto pt-8">
                <button onClick={handlePair} disabled={loading} className="w-full px-5 py-4 rounded-xl bg-gradient-to-br from-[#FF5252] to-[#E63946] text-white font-semibold shadow-md shadow-[#FF5252]/30 transition-transform active:scale-95 disabled:opacity-50">
                    {loading ? '処理中...' : 'ペアリングする'}
                </button>
            </div>
        </>
      );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-neutral-50 dark:bg-neutral-900 animate-slide-up-fast flex flex-col">
      <header className="flex-shrink-0 flex items-center p-2 border-b border-neutral-200 dark:border-neutral-700/80 relative z-10" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
        <button onClick={onBack} className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
          <Icon name="arrow-left" className="w-6 h-6 text-neutral-900 dark:text-neutral-100" />
        </button>
        <h1 className="text-lg font-bold text-center flex-1 -ml-10 pointer-events-none text-neutral-900 dark:text-neutral-100">ペアリング</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-6 flex flex-col">
        {renderContent()}
      </main>
      <style>{`
        .animate-slide-up-fast { animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default PairingScreen;
