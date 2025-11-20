
import React, { useState, useEffect } from 'react';
import { Spot, Visit, SpotStatus, AppScreen, Photo } from '../types';
import { Icon } from '../constants';
import ActionSheet from '../components/ActionSheet';
import StatusToggle from '../components/StatusToggle';

interface SpotDetailModalProps {
  spot: Spot;
  onClose: () => void;
  onNavigate: (screen: AppScreen) => void;
  onUpdateSpot: (spot: Partial<Spot> & { id: string }) => void;
  onTogglePin: (spotId: string) => void;
  onDelete: (spotId: string) => void;
  onDeleteVisit: (spotId: string, visitId: string) => void;
}

const DetailRow: React.FC<{ icon: string; label: string; value?: string | string[] | number; children?: React.ReactNode }> = ({ icon, label, value, children }) => {
    if (!value && !children && !React.Children.count(children)) return null;
    return (
        <div className="flex items-start gap-4 py-3">
            <div className="w-10 h-10 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                <Icon name={icon} className="w-5 h-5 text-neutral-500" />
            </div>
            <div className="flex-1 pt-1">
                <p className="text-xs font-bold uppercase text-neutral-400 tracking-wider mb-1">{label}</p>
                {children ? (
                    <div>{children}</div>
                ) : (
                    <p className="text-base font-medium text-neutral-800 dark:text-neutral-100 whitespace-pre-wrap leading-relaxed">
                        {Array.isArray(value) ? value.join('\n') : value}
                    </p>
                )}
            </div>
        </div>
    );
};

const VisitCard: React.FC<{ visit: Visit, onEdit: () => void, onDelete: () => void }> = ({ visit, onEdit, onDelete }) => {
    return (
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="font-bold text-neutral-800 dark:text-neutral-100">{new Date(visit.visitedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                            <Icon key={i} name="star" className={`w-4 h-4 ${i < visit.rating ? 'text-amber-400 fill-current' : 'text-neutral-200 dark:text-neutral-700'}`} />
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={onEdit} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                        <Icon name="pencil" className="w-4 h-4 text-neutral-400" />
                    </button>
                    <button onClick={onDelete} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Icon name="trash" className="w-4 h-4 text-red-400" />
                    </button>
                </div>
            </div>
            {visit.memo && <p className="text-sm text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed mb-3">{visit.memo}</p>}
            {visit.photos && visit.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-2">
                    {visit.photos.map(photo => (
                        <div key={photo.id} className="aspect-square rounded-xl overflow-hidden">
                            <img src={photo.url} alt="visit photo" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}
            {visit.bill && <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 text-right">¥{visit.bill.toLocaleString()}</p>}
        </div>
    );
}

const SpotDetailModal: React.FC<SpotDetailModalProps> = ({ spot, onClose, onNavigate, onUpdateSpot, onTogglePin, onDelete, onDeleteVisit }) => {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const photosToShow = spot.photos && spot.photos.length > 0 ? spot.photos : [{ id: 'cover', url: spot.coverPhotoUrl }];

  const goToPrevious = () => setCurrentPhotoIndex(prev => (prev === 0 ? photosToShow.length - 1 : prev - 1));
  const goToNext = () => setCurrentPhotoIndex(prev => (prev === photosToShow.length - 1 ? 0 : prev + 1));
  
  const handleStatusChange = (newStatus: SpotStatus) => {
    onUpdateSpot({ id: spot.id, status: newStatus });
  };
  
  const handleToggleShare = () => {
    const newScope: Spot['scope'] = (spot.scope === 'personal') ? 'both' : 'personal';
    onUpdateSpot({ id: spot.id, scope: newScope });
    setIsActionSheetOpen(false);
  };

  const menuItems = [
    { label: '編集', icon: 'pencil-square', onClick: () => { setIsActionSheetOpen(false); onNavigate({ view: 'spot-form', spotId: spot.id }) } },
    { label: (spot.scope === 'personal' || !spot.scope) ? '共有に追加' : '共有から外す', icon: 'share', onClick: handleToggleShare },
    { label: '削除', icon: 'trash', onClick: () => { setIsActionSheetOpen(false); if(window.confirm(`${spot.name}を削除しますか？`)) { onDelete(spot.id); } }, danger: true },
  ];
  
  const formattedPrice = () => {
    if (spot.priceMin && spot.priceMax) return `¥${spot.priceMin.toLocaleString()} - ¥${spot.priceMax.toLocaleString()}`;
    if (spot.priceMin) return `¥${spot.priceMin.toLocaleString()}から`;
    if (spot.priceMax) return `〜¥${spot.priceMax.toLocaleString()}`;
    return undefined;
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[96vh] bg-white dark:bg-neutral-900 rounded-t-[2.5rem] flex flex-col animate-slide-up-fast shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        
        {/* Header Action Buttons Overlay */}
        <header className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}>
            <button onClick={onClose} className="w-11 h-11 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/30 transition-all">
                <Icon name="x-mark" className="w-6 h-6 shadow-sm"/>
            </button>
            <div className="flex items-center gap-3">
              <button onClick={() => onTogglePin(spot.id)} className="w-11 h-11 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/30 transition-all active:scale-90">
                <Icon name="heart" className={`w-6 h-6 transition-all drop-shadow-sm ${spot.isPinned ? 'fill-rose-500 stroke-rose-500' : 'text-white'}`} />
              </button>
              <button onClick={() => setIsActionSheetOpen(true)} className="w-11 h-11 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/30 transition-all">
                  <Icon name="ellipsis-vertical" className="w-6 h-6 drop-shadow-sm"/>
              </button>
            </div>
        </header>
        
        <div className="flex-1 overflow-y-auto rounded-t-[2.5rem] no-scrollbar">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            {photosToShow.map((photo, index) => (
                <img 
                    key={photo.id} 
                    src={photo.url} 
                    alt={`${spot.name} ${index + 1}`} 
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${index === currentPhotoIndex ? 'opacity-100' : 'opacity-0'}`} 
                />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

            {photosToShow.length > 1 && (
                <>
                    <button onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
                        <Icon name="arrow-left" className="w-5 h-5" />
                    </button>
                    <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
                        <Icon name="chevron-right" className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {photosToShow.map((_, index) => (
                            <div key={index} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentPhotoIndex ? 'bg-white w-6' : 'bg-white/50'}`}></div>
                        ))}
                    </div>
                </>
            )}

             <div className="absolute bottom-0 left-0 right-0 p-6 pt-24 bg-gradient-to-t from-black/80 to-transparent">
                <h1 className="text-3xl font-extrabold text-white shadow-lg leading-tight">{spot.name}</h1>
                <div className="flex flex-wrap gap-2 mt-3">
                    {spot.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full text-xs font-bold">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
          </div>
          
          <div className="p-6 flex flex-col gap-6 -mt-4 relative z-10 bg-white dark:bg-neutral-900 rounded-t-[2rem]">
            
            <div className="w-12 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto -mt-2 mb-2 opacity-50" />

            <StatusToggle currentStatus={spot.status} onStatusChange={handleStatusChange} />

            <div className="space-y-2">
                <DetailRow icon="memo" label="Memo" value={spot.memo} />
                <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-2" />
                <DetailRow icon="link" label="URL">
                    {spot.url && <a href={spot.url} target="_blank" rel="noopener noreferrer" className="text-rose-500 font-bold hover:underline break-all">{spot.url}</a>}
                </DetailRow>
                <DetailRow icon="map-pin" label="Address">
                    {spot.address && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.address)}`} target="_blank" rel="noopener noreferrer" className="text-neutral-800 dark:text-neutral-200 underline decoration-neutral-300 underline-offset-2">{spot.address}</a>}
                </DetailRow>
                <DetailRow icon="phone" label="Phone" value={spot.phone} />
                <DetailRow icon="clock" label="Opening Hours" value={spot.openingHours} />
                <DetailRow icon="currency-yen" label="Price Range" value={formattedPrice()} />
                <DetailRow icon="credit-card" label="Payment Methods" value={spot.paymentMethods?.join(', ')} />
            </div>

             <div className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold uppercase text-neutral-400 tracking-wider">Visit History</h3>
                <button onClick={() => onNavigate({ view: 'visit-form', spotId: spot.id })} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors">
                    <Icon name="plus" className="w-4 h-4"/>
                    記録を追加
                </button>
              </div>
              {spot.visits && spot.visits.length > 0 ? (
                <div className="space-y-3">
                  {spot.visits.sort((a,b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime()).map(visit => (
                      <VisitCard 
                        key={visit.id} 
                        visit={visit} 
                        onEdit={() => onNavigate({ view: 'visit-form', spotId: spot.id, visitId: visit.id })}
                        onDelete={() => {if(window.confirm('この訪問記録を削除しますか？')) { onDeleteVisit(spot.id, visit.id) }}}
                       />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700">
                    <p className="text-neutral-400 text-sm font-medium">まだ訪問記録がありません</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
       <ActionSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        items={menuItems}
       />
       <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-slide-up-fast { animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default SpotDetailModal;
