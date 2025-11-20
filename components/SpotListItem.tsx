
import React from 'react';
import { Spot, SpotStatus } from '../types';
import { Icon } from '../constants';

interface SpotListItemProps {
  spot: Spot;
  onClick: () => void;
  onTogglePin?: () => void;
}

const statusStyles: { [key in SpotStatus]: { badge: string; text: string; label: string; icon: string } } = {
  want_to_go: { badge: 'bg-rose-500/90', text: 'text-white', label: '行きたい', icon: 'bookmark' },
  visited: { badge: 'bg-emerald-500/90', text: 'text-white', label: '行った', icon: 'check' },
  revisit: { badge: 'bg-amber-500/90', text: 'text-white', label: '再訪', icon: 'sparkles' },
};

const SpotListItem: React.FC<SpotListItemProps> = ({ spot, onClick, onTogglePin }) => {
  const { badge, text, label, icon } = statusStyles[spot.status];

  return (
    <div
      className="group relative bg-white dark:bg-neutral-800 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-lg border border-neutral-100 dark:border-neutral-700/50 flex h-32"
      onClick={onClick}
    >
      {/* Image Section - Full Height, Fixed Width */}
      <div className="relative w-36 h-full flex-shrink-0">
        <img 
            src={spot.coverPhotoUrl} 
            alt={spot.name} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
            loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-50"></div>
        
         {/* Pin Button - Interactive */}
         <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onTogglePin) onTogglePin();
          }}
          className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center border shadow-sm z-10 transition-all duration-200 hover:scale-110 active:scale-90 ${spot.isPinned ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white/30 backdrop-blur-md border-white/20 text-white hover:bg-white/40'}`}
        >
             <Icon name="heart" className={`w-3.5 h-3.5 ${spot.isPinned ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-between p-3.5 min-w-0">
        <div>
            <div className="flex justify-between items-start gap-2 mb-1">
                 <div className={`inline-flex items-center gap-1 pl-2 pr-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge} ${text} flex-shrink-0 shadow-sm`}>
                    <Icon name={icon} className="w-2.5 h-2.5" />
                    {label}
                </div>
                 {spot.rating && (
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md">
                        <Icon name="star" className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
                            {spot.rating.toFixed(1)}
                        </span>
                    </div>
                 )}
            </div>

            <h3 className="font-bold text-[15px] text-neutral-800 dark:text-neutral-100 leading-snug line-clamp-2 group-hover:text-rose-500 transition-colors">
                {spot.name}
            </h3>
        </div>

        <div className="flex flex-col gap-1.5">
            {spot.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 overflow-hidden h-5 mask-image-fade-right">
                    {spot.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-md whitespace-nowrap">
                        #{tag}
                    </span>
                    ))}
                </div>
            )}
            
            <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-medium border-t border-neutral-100 dark:border-neutral-700/50 pt-1.5 mt-0.5">
                 <span>{(spot.visitCount || 0) > 0 ? `${spot.visitCount}回訪問` : '未訪問'}</span>
                 {spot.lastVisitDate && (
                     <span>最終: {new Date(spot.lastVisitDate).toLocaleDateString()}</span>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SpotListItem;
