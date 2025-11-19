
import React, { useState } from 'react';
import { Icon, PLAN_LIMITS } from '../constants';
import { AppScreen } from '../types';
import StorageMeter from '../components/StorageMeter';

type Theme = 'system' | 'light' | 'dark';

interface SettingsScreenProps {
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
  userPlan: 'free' | 'supporter' | 'couple';
  onLogout: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onDeleteAccount: () => Promise<void>;
  usageStats: { photos: number, ai: number };
  onChangePlan: (plan: 'free' | 'supporter') => void;
}

const SettingRow: React.FC<{ icon: string, label: string, onClick?: () => void, children?: React.ReactNode }> = ({ icon, label, onClick, children }) => (
  <button onClick={onClick} className={`w-full flex items-center p-4 bg-white dark:bg-neutral-800 first:rounded-t-xl last:rounded-b-xl text-left ${onClick ? 'active:bg-neutral-100 dark:active:bg-neutral-700' : ''}`}>
    <Icon name="icon" className="w-6 h-6 text-neutral-500" />
    <Icon name={icon} className="w-6 h-6 text-neutral-500" />
    <span className="ml-4 flex-1 text-base font-medium text-neutral-800 dark:text-neutral-100">{label}</span>
    {children || (onClick && <Icon name="chevron-right" className="w-5 h-5 text-neutral-400" />)}
  </button>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onNavigate, userPlan, onLogout, theme, onThemeChange, onDeleteAccount, usageStats, onChangePlan }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const planDetails = {
    free: { name: 'フリープラン', color: 'text-neutral-500' },
    supporter: { name: 'サポーター', color: 'text-green-500' },
    couple: { name: 'カップルプラン', color: 'text-rose-500' },
  };

  const limits = PLAN_LIMITS[userPlan];

  const handleDeleteClick = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
        await onDeleteAccount();
    } catch (e) {
        // Error handling is done in App.tsx but we stop spinner here just in case
        setIsDeleting(false);
    }
  };

  const handleLogoutClick = () => {
      setShowLogoutModal(true);
  };

  const executeLogout = () => {
      setShowLogoutModal(false);
      onLogout();
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      <header className="sticky top-0 z-30 flex items-center p-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-700/80" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
        <button onClick={onBack} className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Icon name="arrow-left" className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-center flex-1 -ml-10 pointer-events-none text-neutral-900 dark:text-neutral-100">設定</h1>
      </header>
      
      <main className="p-4 space-y-6 pb-10">
        <section>
          <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-4 mb-2">アカウント</h2>
          <div className="rounded-xl shadow-sm overflow-hidden">
            <SettingRow icon="user" label="プラン" onClick={() => setShowPlanModal(true)}>
              <div className="flex items-center gap-2">
                  <span className={`font-semibold ${planDetails[userPlan].color}`}>{planDetails[userPlan].name}</span>
                  <Icon name="chevron-right" className="w-5 h-5 text-neutral-400" />
              </div>
            </SettingRow>
            <SettingRow icon="users" label="ペアリング" onClick={() => onNavigate({ view: 'pairing' })} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-4 mb-2">ストレージ</h2>
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-700/50">
            <StorageMeter title="写真の合計使用量" used={usageStats.photos} limit={limits.photos} unit="枚" />
          </div>
        </section>
        
        <section>
          <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-4 mb-2">AI利用状況</h2>
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-700/50">
            <StorageMeter title="今月のAI利用" used={usageStats.ai} limit={limits.ai_month} unit="回" />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-4 mb-2">表示設定</h2>
          <div className="rounded-xl shadow-sm overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-700/50">
            <div className="p-4 bg-white dark:bg-neutral-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon name="computer-desktop" className="w-6 h-6 text-neutral-500" />
                  <span className="ml-4 text-base font-medium text-neutral-800 dark:text-neutral-100">テーマ</span>
                </div>
                <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                  {(['system', 'light', 'dark'] as Theme[]).map(t => (
                    <button key={t} onClick={() => onThemeChange(t)} className={`p-1.5 rounded-md transition-colors capitalize ${theme === t ? 'bg-white dark:bg-neutral-600 text-[#FF5252] shadow-sm' : 'text-neutral-500'}`}>
                      {t === 'system' && <Icon name="computer-desktop" className="w-5 h-5" />}
                      {t === 'light' && <Icon name="sun" className="w-5 h-5" />}
                      {t === 'dark' && <Icon name="moon" className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="rounded-xl shadow-sm overflow-hidden mb-6">
            <button onClick={handleLogoutClick} className="w-full flex items-center p-4 bg-white dark:bg-neutral-800 active:bg-neutral-100 dark:active:bg-neutral-700">
              <Icon name="log-out" className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
              <span className="ml-4 flex-1 text-base font-medium text-neutral-500 dark:text-neutral-400">ログアウト</span>
            </button>
          </div>

          <div className="rounded-xl shadow-sm overflow-hidden">
             <button onClick={handleDeleteClick} disabled={isDeleting} className="w-full flex items-center p-4 bg-red-50 dark:bg-red-900/10 active:bg-red-100 dark:active:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl disabled:opacity-50">
              {isDeleting ? (
                   <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-4" />
              ) : (
                  <Icon name="user-minus" className="w-6 h-6 text-red-500" />
              )}
              <span className="ml-4 flex-1 text-base font-medium text-red-500">{isDeleting ? '処理中...' : 'アカウント削除（退会）'}</span>
            </button>
          </div>
        </section>
      </main>

      {/* Plan Change Modal */}
      {showPlanModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scale-up">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">プラン変更</h3>
                      <button onClick={() => setShowPlanModal(false)} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700">
                          <Icon name="x-mark" className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="space-y-3">
                      <button onClick={() => { onChangePlan('free'); setShowPlanModal(false); }} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${userPlan === 'free' ? 'border-[#FF5252] bg-[#FF5252]/5' : 'border-neutral-200 dark:border-neutral-700'}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">フリープラン</span>
                            {userPlan === 'free' && <Icon name="check-circle" className="w-6 h-6 text-[#FF5252]" />}
                          </div>
                          <p className="text-sm text-neutral-500 mt-1">基本機能、写真50枚まで</p>
                      </button>

                      <button onClick={() => { onChangePlan('supporter'); setShowPlanModal(false); }} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${userPlan === 'supporter' ? 'border-green-500 bg-green-500/5' : 'border-neutral-200 dark:border-neutral-700'}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">サポーター</span>
                            {userPlan === 'supporter' && <Icon name="check-circle" className="w-6 h-6 text-green-500" />}
                          </div>
                          <p className="text-sm text-neutral-500 mt-1">広告なし、写真500枚まで、AI 50回/月</p>
                      </button>

                      <div className={`w-full p-4 rounded-xl border-2 border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/10`}>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg text-rose-600 dark:text-rose-400">カップルプラン</span>
                            {userPlan === 'couple' && <Icon name="check-circle" className="w-6 h-6 text-rose-500" />}
                          </div>
                          <p className="text-sm text-rose-500/80 mt-1">パートナーとペアリングすると自動適用。写真無制限。</p>
                          {userPlan !== 'couple' && (
                              <button onClick={() => { setShowPlanModal(false); onNavigate({ view: 'pairing' }); }} className="mt-3 text-sm font-bold text-rose-500 underline">
                                  ペアリング設定へ
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-up">
                <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-2">ログアウト</h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                    本当にログアウトしますか？<br/>
                    次回利用時は再度ログインが必要です。
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowLogoutModal(false)} 
                        className="flex-1 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                    >
                        キャンセル
                    </button>
                    <button 
                        onClick={executeLogout} 
                        className="flex-1 py-3 rounded-xl bg-neutral-800 dark:bg-neutral-900 text-white font-semibold hover:bg-black transition-colors"
                    >
                        ログアウト
                    </button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        .animate-scale-up { animation: scaleUp 0.2s ease-out; }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default SettingsScreen;
