import React, { useState } from 'react';
import { Spot, AppScreen } from '../types';
import SpotCard from '../components/SpotCard';
import SearchBar from '../components/SearchBar';
import SpotCardSkeleton from '../components/skeletons/SpotCardSkeleton';
import { EmptyState } from '../components/EmptyState';
import AdBanner from '../components/AdBanner';

interface HomeScreenProps {
  spots: Spot[];
  onNavigate: (screen: AppScreen) => void;
  view: 'home' | 'shared' | 'favorites';
  userPlan: 'free' | 'supporter' | 'couple';
}

const HomeScreen: React.FC<HomeScreenProps> = ({ spots: initialSpots, onNavigate, view, userPlan }) => {
  const [loading, setLoading] = useState(true);
  const [spots, setSpots] = useState(initialSpots.slice(0, 4)); // Show limited spots initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasMore = spots.length < initialSpots.length;

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setSpots(initialSpots);
      setIsLoadingMore(false);
    }, 1000);
  };

  const renderEmptyState = () => {
    switch (view) {
      case 'shared':
        return <EmptyState
          iconName="users"
          title="共有スポットがありません"
          message={<>ペアを組んでスポットを共有し、<br/>一緒の思い出を作りましょう</>}
          action={{ label: 'ペアリング設定へ', onClick: () => onNavigate({ view: 'settings' }) }}
        />;
      case 'favorites':
        return <EmptyState
          iconName="heart"
          title="お気に入りはまだありません"
          message={<>気になるスポットのハートマークを押して、<br/>自分だけのお気に入りリストを作りましょう</>}
        />;
      case 'home':
      default:
         return <EmptyState
          iconName="file-plus"
          title="まだスポットがありません"
          message={<>最初のスポットを登録して、<br/>Tokomemoを始めましょう！</>}
          action={{ label: '最初のスポットを追加', onClick: () => onNavigate({ view: 'spot-form' }) }}
        />;
    }
  };

  const spotsWithAd = [...spots];
  if (userPlan === 'free' && spots.length > 2) {
    // Insert an ad after the 2nd spot
    spotsWithAd.splice(2, 0, { id: 'ad-1' } as any);
  }

  return (
    <div className="pb-20">
      <SearchBar />
      {loading ? (
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, index) => <SpotCardSkeleton key={index} />)}
        </div>
      ) : spots.length > 0 ? (
        <>
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {spotsWithAd.map(item => {
              if (item.id === 'ad-1') {
                return <AdBanner key="ad-1" />;
              }
              return (
                <SpotCard key={item.id} spot={item} onClick={() => onNavigate({ view: 'spot-detail', spotId: item.id })} />
              );
            })}
          </div>
          {hasMore && (
            <div className="px-4 mt-4 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-3 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-semibold transition-colors active:scale-95 hover:bg-neutral-300 dark:hover:bg-neutral-600 disabled:opacity-50"
              >
                {isLoadingMore ? '読み込み中...' : 'さらに読み込む'}
              </button>
            </div>
          )}
        </>
      ) : (
        renderEmptyState()
      )}
    </div>
  );
};

export default HomeScreen;