import React, { useState, useEffect, useRef } from 'react';
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
  const [displayedSpots, setDisplayedSpots] = useState<Spot[]>([]);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset when view or initial data changes
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
        setLoading(false);
        setDisplayedSpots(initialSpots.slice(0, ITEMS_PER_PAGE));
        setPage(1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [initialSpots, view]);

  // Infinite Scroll Logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && displayedSpots.length < initialSpots.length) {
            loadMore();
        }
    }, {
        root: null,
        rootMargin: '20px',
        threshold: 1.0
    });

    if (loaderRef.current) {
        observer.observe(loaderRef.current);
    }

    return () => {
        if (loaderRef.current) {
            observer.unobserve(loaderRef.current);
        }
    };
  }, [loading, displayedSpots, initialSpots]);

  const loadMore = () => {
      const nextPage = page + 1;
      const nextSpots = initialSpots.slice(0, nextPage * ITEMS_PER_PAGE);
      setDisplayedSpots(nextSpots);
      setPage(nextPage);
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

  const spotsWithAd = [...displayedSpots];
  if (userPlan === 'free' && spotsWithAd.length > 2) {
    // Insert an ad after the 2nd spot
    spotsWithAd.splice(2, 0, { id: 'ad-1' } as any);
  }

  return (
    <div className="pb-20">
      <SearchBar />
      {loading && displayedSpots.length === 0 ? (
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, index) => <SpotCardSkeleton key={index} />)}
        </div>
      ) : displayedSpots.length > 0 ? (
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
          {/* Infinite Scroll Trigger / Loader */}
          <div ref={loaderRef} className="h-20 flex items-center justify-center w-full">
             {displayedSpots.length < initialSpots.length && (
                 <div className="w-6 h-6 border-2 border-neutral-200 border-t-[#FF5252] rounded-full animate-spin"></div>
             )}
          </div>
        </>
      ) : (
        renderEmptyState()
      )}
    </div>
  );
};

export default HomeScreen;