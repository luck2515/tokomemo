import React from 'react';
import { Spot, SpotStatus } from '../types';
import { Icon } from '../constants';

interface SpotCardProps {
  spot: Spot;
  onClick: () => void;
}

const statusStyles: { [key in SpotStatus]: { badge: string; text: string; label: string } } = {
  want_to_go: { badge: 'bg-[#FF5252]/90', text: 'text-white', label: '行きたい' },
  visited: { badge: 'bg-[#10B981]/90', text: 'text-white', label: '行った' },
  revisit: { badge: 'bg-[#F59E0B]/90', text: 'text-white', label: '再訪したい' },
};

const SpotCard: React.FC<SpotCardProps> = ({ spot, onClick }) => {
  const { badge, text, label } = statusStyles[spot.status];

  return (
    <div
      className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg dark:shadow-black/20 active:scale-[0.98] transition-all duration-200 relative group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={spot.coverPhotoUrl} alt={spot.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy"/>
      </div>
      
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
        <div className={`px-2 py-1 rounded-md text-[11px] font-bold backdrop-blur-sm shadow-md ${badge} ${text}`}>
            {label}
        </div>
        {spot.isOpenNow && (
            <div className="px-2 py-1 rounded-md text-[11px] font-bold backdrop-blur-sm shadow-md bg-green-500 text-white">
                営業中
            </div>
        )}
      </div>


      {spot.isPinned && (
        <div className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/80 dark:bg-neutral-900/50 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
            <Icon name="heart" className="w-4 h-4 text-[#FF5252] fill-current" />
        </div>
      )}

      <div className="p-3 flex flex-col gap-2">
        <h3 className="font-semibold text-sm text-neutral-900 dark:text-white leading-snug-looser webkit-box-2-lines">{spot.name}</h3>
        
        <div className="flex flex-col gap-2 flex-grow">
            {spot.rating && (
                <div className="flex items-center gap-1">
                    <Icon name="star" className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{spot.rating.toFixed(1)}</span>
                    <span className="text-xs text-neutral-500">({spot.visitCount})</span>
                </div>
            )}
            
            <div className="flex flex-wrap gap-1.5">
                {spot.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full text-[10px] font-medium">
                    {tag}
                </span>
                ))}
            </div>
        </div>
        
        {spot.lastVisitDate && (
            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 pt-1 mt-auto border-t border-neutral-100 dark:border-neutral-700/50">
                <Icon name="calendar" className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">
                    最終訪問: {new Date(spot.lastVisitDate).toLocaleString('ja-JP')}
                </span>
            </div>
        )}
      </div>
      <style>{`
        .webkit-box-2-lines {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 2.75rem; /* line-height * 2 */
        }
        .leading-snug-looser {
            line-height: 1.375;
        }
      `}</style>
    </div>
  );
};

export default SpotCard;