
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Spot, AppScreen, FilterCriteria } from '../types';
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

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterCriteria>({
    status: null,
    tags: [],
    sortBy: 'created_desc',
  });

  // Compute available tags dynamically from spots
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    initialSpots.forEach(spot => spot.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [initialSpots]);

  // Filtering Logic
  const filteredSpots = useMemo(() => {
    return initialSpots.filter(spot => {
      // 1. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = spot.name.toLowerCase().includes(query);
        const matchMemo = spot.memo?.toLowerCase().includes(query);
        const matchAddress = spot.address?.toLowerCase().includes(query);
        if (!matchName && !matchMemo && !matchAddress) return false;
      }

      // 2. Status Filter
      if (filters.status && spot.status !== filters.status) return false;

      // 3. Tag Filter (OR Logic by default)
      if (filters.tags.length > 0) {
         const hasAnyTag = filters.tags.some(tag => spot.tags.includes(tag));
         if (!hasAnyTag) return false;
      }

      return true;
    }).sort((a, b) => {
      // 4. Sort
      switch (filters.sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'rating_desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'latest_visit':
          const dateA = a.lastVisitDate ? new Date(a.lastVisitDate).getTime() : 0;
          const dateB = b.lastVisitDate ? new Date(b.lastVisitDate).getTime() : 0;
          return dateB - dateA;
        case 'created_desc':
        default:
          const createdA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const createdB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return createdB - createdA;
      }
    });
  }, [initialSpots, searchQuery, filters]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setDisplayedSpots(filteredSpots.slice(0, ITEMS_PER_PAGE));
  }, [filteredSpots]);

  // Initial Load Simulation
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
        setLoading(false);
        setDisplayedSpots(filteredSpots.slice(0, ITEMS_PER_PAGE));
    }, 500);
    return () => clearTimeout(timer);
  }, [initialSpots, view]);

  // Infinite Scroll Logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && displayedSpots.length < filteredSpots.length) {
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
  }, [loading, displayedSpots, filteredSpots]);

  const loadMore = () => {
      const nextPage = page + 1;
      const nextSpots = filteredSpots.slice(0, nextPage * ITEMS_PER_PAGE);
      setDisplayedSpots(nextSpots);
      setPage(nextPage);
  };

  const renderEmptyState = () => {
    if (searchQuery || filters.status || filters.tags.length > 0) {
         return <EmptyState
          iconName="search"
          title="見つかりませんでした"
          message="検索条件を変更して、もう一度お試しください"
          action={{ label: '条件をクリア', onClick: () => { setSearchQuery(''); setFilters({ status: null, tags: [], sortBy: 'created_desc' }); } }}
        />;
    }

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
    spotsWithAd.splice(2, 0, { id: 'ad-1' } as any);
  }

  return (
    <div className="pb-20">
      <SearchBar 
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        filters={filters}
        onFilterChange={setFilters}
        availableTags={availableTags}
      />
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
             {displayedSpots.length < filteredSpots.length && (
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
