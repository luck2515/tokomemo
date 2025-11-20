
import React from 'react';
import { Spot, SpotStatus } from '../types';
import { Icon } from '../constants';

interface SpotCardProps {
  spot: Spot;
  onClick: () => void;
}

const statusStyles: { [key in SpotStatus]: { badge: string; text: string; label: string; icon: string } } = {
  want_to_go: { badge: 'bg-rose-500/90', text: 'text-white', label: '行きたい', icon: 'bookmark' },
  visited: { badge: 'bg-emerald-500/90', text: 'text-white', label: '行った', icon: 'check' },
  revisit: { badge: 'bg-amber-500/90', text: 'text-white', label: '再訪', icon: 'sparkles' },
};

const SpotCard: React.FC<SpotCardProps> = ({ spot, onClick }) => {
  const { badge, text, label, icon } = statusStyles[spot.status];

  return (
    <div
      className="group relative bg-white dark:bg-neutral-800 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1 border border-neutral-100 dark:border-neutral-700/50"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
            src={spot.coverPhotoUrl} 
            alt={spot.name} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
            loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-70 transition-opacity"></div>
        
        {/* Floating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 z-10">
           <div className={`pl-2 pr-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md flex items-center gap-1 ${badge} ${text}`}>
                <Icon name={icon} className="w-3 h-3" />
                {label}
            </div>
            {spot.isOpenNow && (
                <div className="px-2 py-1 rounded-full text-[10px] font-bold shadow-sm bg-white/90 text-green-600 backdrop-blur-md">
                    Open
                </div>
            )}
        </div>

        {/* Pin Button */}
        {spot.isPinned && (
             <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-sm z-10">
                <Icon name="heart" className="w-4 h-4 text-white fill-white" />
            </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-bold text-[15px] text-neutral-800 dark:text-neutral-100 leading-tight line-clamp-2 group-hover:text-rose-500 transition-colors">
            {spot.name}
        </h3>
        
        <div className="flex items-center justify-between mt-1">
             <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg border border-amber-100 dark:border-amber-800/30">
                <Icon name="star" className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
                    {spot.rating ? spot.rating.toFixed(1) : '-.-'}
                </span>
            </div>
            
            <div className="text-[11px] text-neutral-400 font-medium">
                {spot.visitCount > 0 ? `${spot.visitCount}回訪問` : '未訪問'}
            </div>
        </div>

        {spot.tags.length > 0 && (
             <div className="flex flex-wrap gap-1.5 mt-2 overflow-hidden h-6">
                {spot.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                    #{tag}
                </span>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default SpotCard;
