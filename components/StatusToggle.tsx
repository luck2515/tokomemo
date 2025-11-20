
import React from 'react';
import { SpotStatus } from '../types';
import { Icon } from '../constants';

interface StatusToggleProps {
  currentStatus: SpotStatus;
  onStatusChange: (newStatus: SpotStatus) => void;
}

const statusOptions: { key: SpotStatus, label: string, icon: string, color: string }[] = [
    { key: 'want_to_go', label: '行きたい', icon: 'bookmark', color: 'text-rose-500' },
    { key: 'visited', label: '行った', icon: 'check-circle', color: 'text-[#10B981]' },
    { key: 'revisit', label: '再訪', icon: 'sparkles', color: 'text-[#F59E0B]' }
];

const StatusToggle: React.FC<StatusToggleProps> = ({ currentStatus, onStatusChange }) => {
  return (
    <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl grid grid-cols-3 gap-1.5 relative">
      {statusOptions.map(opt => (
        <button 
          key={opt.key}
          onClick={() => onStatusChange(opt.key)}
          className={`relative z-10 py-3 px-2 rounded-xl flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-colors duration-300 ${currentStatus === opt.key ? `text-white` : 'text-neutral-500 hover:bg-white/50 dark:hover:bg-neutral-700/50'}`}
        >
          <Icon name={opt.icon} className="w-5 h-5" />
          <span className="text-xs md:text-sm font-bold">{opt.label}</span>
        </button>
      ))}
       <div 
        className={`absolute top-1.5 bottom-1.5 w-[calc((100%-0.75rem)/3)] rounded-xl shadow-lg transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
          ${currentStatus === 'want_to_go' ? 'bg-rose-500 translate-x-0 shadow-rose-500/30' : ''}
          ${currentStatus === 'visited' ? 'bg-emerald-500 translate-x-[calc(100%+0.375rem)] shadow-emerald-500/30' : ''}
          ${currentStatus === 'revisit' ? 'bg-amber-500 translate-x-[calc(200%+0.75rem)] shadow-amber-500/30' : ''}
        `}
        style={{ left: '0.375rem'}}
      />
    </div>
  );
};

export default StatusToggle;
