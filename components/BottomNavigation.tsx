import React from 'react';
import { Icon } from '../constants';
import { AppScreen } from '../types';

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  isFloating?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick, isFloating }) => {
  if (isFloating) {
    return (
      <button onClick={onClick} className="relative flex flex-col items-center justify-center text-neutral-500 -translate-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF5252]">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF5252] to-[#E63946] text-white flex items-center justify-center shadow-lg shadow-[#FF5252]/40 transform transition-transform duration-200 active:scale-90">
          <Icon name="plus-circle" className="w-8 h-8" />
        </div>
      </button>
    );
  }
  
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 p-2 transition-colors duration-200 min-w-[44px] min-h-[44px] rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5252] ${active ? 'text-[#FF5252]' : 'text-neutral-500 dark:text-neutral-400 hover:text-[#FF5252] dark:hover:text-pink-400'}`}>
      <Icon name={icon} className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-t border-neutral-200/80 dark:bg-neutral-900/80 dark:border-neutral-700/80" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto max-w-md h-16 grid grid-cols-5 items-center">
        <NavItem icon="home" label="ホーム" active={activeTab === 'home'} onClick={() => onNavigate({ view: 'home' })} />
        <NavItem icon="heart" label="お気に入り" active={activeTab === 'favorites'} onClick={() => onNavigate({ view: 'favorites' })} />
        <NavItem icon="plus-circle" label="追加" active={false} onClick={onAdd} isFloating />
        <NavItem icon="share" label="共有" active={activeTab === 'shared'} onClick={() => onNavigate({ view: 'shared' })} />
        <NavItem icon="user" label="設定" active={activeTab === 'settings'} onClick={() => onNavigate({ view: 'settings' })} />
      </div>
    </div>
  );
};

export default BottomNavigation;