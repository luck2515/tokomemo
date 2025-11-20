
import React from 'react';
import { Icon } from '../constants';
import { AppScreen } from '../types';

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  isMain?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick, isMain }) => {
  if (isMain) {
    return (
      <button 
        onClick={onClick} 
        className="group focus:outline-none relative"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF5252] to-[#ff8a80] text-white flex items-center justify-center shadow-xl shadow-rose-500/40 transform transition-all duration-300 group-active:scale-95 group-hover:shadow-rose-500/60 ring-4 ring-neutral-50 dark:ring-neutral-900 border border-white/10">
          <Icon name="plus" className="w-8 h-8 stroke-[2.5]" />
        </div>
      </button>
    );
  }
  
  return (
    <button 
        onClick={onClick} 
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 active:scale-90 focus:outline-none group ${active ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'}`}
    >
      <Icon name={icon} className={`w-6 h-6 transition-transform duration-300 ${active ? 'scale-110 fill-current' : ''}`} />
    </button>
  );
};

interface BottomNavigationProps {
  activeTab: 'home' | 'favorites' | 'shared' | 'settings';
  onNavigate: (screen: AppScreen) => void;
  onAdd: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onNavigate, onAdd }) => {
  return (
    <div className="fixed bottom-6 left-4 right-4 z-40 flex justify-center pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="pointer-events-auto w-full max-w-md bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-neutral-200/50 dark:shadow-black/50 border border-white/40 dark:border-neutral-700 px-6 py-2 flex justify-between items-center relative h-20">
        <NavItem icon="home" label="ホーム" active={activeTab === 'home'} onClick={() => onNavigate({ view: 'home' })} />
        <NavItem icon="heart" label="お気に入り" active={activeTab === 'favorites'} onClick={() => onNavigate({ view: 'favorites' })} />
        
        <div className="w-16"></div> {/* Spacer */}
        
        {/* Floating Button Container - Centered vertically on the top edge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
             <NavItem icon="plus" label="追加" active={false} onClick={onAdd} isMain />
        </div>

        <NavItem icon="users" label="共有" active={activeTab === 'shared'} onClick={() => onNavigate({ view: 'shared' })} />
        <NavItem icon="cog" label="設定" active={activeTab === 'settings'} onClick={() => onNavigate({ view: 'settings' })} />
      </div>
    </div>
  );
};

export default BottomNavigation;
