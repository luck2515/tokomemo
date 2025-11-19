import React from 'react';
import { Icon } from '../constants';
import { AppScreen } from '../types';
import StorageMeter from '../components/StorageMeter';

type Theme = 'system' | 'light' | 'dark';
type TagSearchMode = 'or' | 'and';

interface SettingsScreenProps {
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
  userPlan: 'free' | 'supporter' | 'couple';
  onLogout: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  tagSearchMode: TagSearchMode;
  onTagSearchModeChange: (mode: TagSearchMode) => void;
}

const SettingRow: React.FC<{ icon: string, label: string, onClick?: () => void, children?: React.ReactNode }> = ({ icon, label, onClick, children }) => (
  <button onClick={onClick} className={`w-full flex items-center p-4 bg-white dark:bg-neutral-800 first:rounded-t-xl last:rounded-b-xl text-left ${onClick ? 'active:bg-neutral-100 dark:active:bg-neutral-700' : ''}`}>
    <Icon name={icon} className="w-6 h-6 text-neutral-500" />
    <span className="ml-4 flex-1 text-base font-medium text-neutral-800 dark:text-neutral-100">{label}</span>
    {children || (onClick && <Icon name="chevron-right" className="w-5 h-5 text-neutral-400" />)}
  </button>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onNavigate, userPlan, onLogout, theme, onThemeChange, tagSearchMode, onTagSearchModeChange }) => {
  const planDetails = {
    free: { name: 'フリープラン', color: 'text-neutral-500' },
    supporter: { name: 'サポーター', color: 'text-green-500' },
    couple: { name: 'カップルプラン', color: 'text-rose-500' },
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      <header className="sticky top-0 z-10 flex items-center p-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-700/80" style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}>
        <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Icon name="arrow-left" className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-center flex-1 -ml-10">設定</h1>
      </header>
      
      <main className="p-4 space-y-6 pb-10">
        <section>
          <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-4 mb-2">アカウント</h2>
          <div className="rounded-xl shadow-sm overflow-hidden">
            <SettingRow icon="user" label="プラン">
              <span className={`font-semibold ${planDetails[userPlan].color}`}>{planDetails[userPlan].name}</span>
            </SettingRow>
            <SettingRow icon="users" label="ペアリング" onClick={() => onNavigate({ view: 'pairing' })} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-4 mb-2">ストレージ</h2>
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-700/50">
            <StorageMeter title="写真の合計使用量" used={34} limit={100} />
            <StorageMeter title="今月の写真" used={12} limit={50} />
            <StorageMeter title="今日の写真" used={3} limit={10} />
          </div>
        </section>
        
        <section>
          <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-4 mb-2">AI利用状況</h2>
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-700/50">
            <StorageMeter title="今月のAI利用" used={25} limit={100} />
            <StorageMeter title="今日のAI利用" used={4} limit={10} />
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
          <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-4 mb-2">検索設定</h2>
          <div className="rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-white dark:bg-neutral-800">
              <div className="flex items-center justify-between">
                 <div className="flex items-center">
                  <Icon name="tag" className="w-6 h-6 text-neutral-500" />
                  <span className="ml-4 text-base font-medium text-neutral-800 dark:text-neutral-100">タグ検索モード</span>
                </div>
                <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                  {(['or', 'and'] as TagSearchMode[]).map(mode => (
                    <button key={mode} onClick={() => onTagSearchModeChange(mode)} className={`px-3 py-1 text-sm font-bold rounded-md transition-colors uppercase ${tagSearchMode === mode ? 'bg-white dark:bg-neutral-600 text-[#FF5252] shadow-sm' : 'text-neutral-500'}`}>
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        <section>
          <div className="rounded-xl shadow-sm overflow-hidden">
            <button onClick={onLogout} className="w-full flex items-center p-4 bg-white dark:bg-neutral-800 active:bg-neutral-100 dark:active:bg-neutral-700">
              <Icon name="log-out" className="w-6 h-6 text-red-500" />
              <span className="ml-4 flex-1 text-base font-medium text-red-500">ログアウト</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SettingsScreen;