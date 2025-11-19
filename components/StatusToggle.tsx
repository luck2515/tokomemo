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
    { key: 'revisit', label: '再訪したい', icon: 'sparkles', color: 'text-[#F59E0B]' }
];

const StatusToggle: React.FC<StatusToggleProps> = ({ currentStatus, onStatusChange }) => {
  return (
    <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl grid grid-cols-3 gap-1.5 relative">
      {statusOptions.map(opt => (
        <button 
          key={opt.key}
          onClick={() => onStatusChange(opt.key)}
          className={`relative z-10 py-3 px-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300 ${currentStatus === opt.key ? `text-white` : 'text-neutral-500 hover:bg-white/50 dark:hover:bg-neutral-700/50'}`}
        >
          <Icon name={opt.icon} className="w-5 h-5" />
          <span className="text-sm font-semibold">{opt.label}</span>
        </button>
      ))}
       <div 
        className={`absolute top-1.5 h-[calc(100%-0.75rem)] w-[calc((100%-0.75rem)/3)] rounded-lg bg-gradient-to-br shadow-lg transition-all duration-300 ease-in-out
          ${currentStatus === 'want_to_go' ? 'from-rose-500 to-red-500 translate-x-0 shadow-rose-500/30' : ''}
          ${currentStatus === 'visited' ? 'from-green-500 to-emerald-500 translate-x-[calc(100%+0.375rem)] shadow-green-500/30' : ''}
          ${currentStatus === 'revisit' ? 'from-amber-500 to-orange-500 translate-x-[calc(200%+0.75rem)] shadow-amber-500/30' : ''}
        `}
        style={{ left: '0.375rem'}}
      />
    </div>
  );
};

export default StatusToggle;