
import React, { useState, useMemo } from 'react';
import { Icon } from '../constants';
import { FilterCriteria, SpotStatus, SortOption } from '../types';

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  filters: FilterCriteria;
  onFilterChange: (newFilters: FilterCriteria) => void;
  availableTags: string[];
  viewMode: 'grid' | 'list';
  onToggleViewMode: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  onSearchQueryChange, 
  filters, 
  onFilterChange, 
  availableTags,
  viewMode,
  onToggleViewMode
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleFilterPanel = () => setIsFilterOpen(!isFilterOpen);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.tags.length > 0) count++;
    if (filters.sortBy !== 'created_desc') count++;
    return count;
  }, [filters]);

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag) 
      ? filters.tags.filter(t => t !== tag) 
      : [...filters.tags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const handleStatusChange = (status: SpotStatus) => {
    onFilterChange({ ...filters, status: filters.status === status ? null : status });
  }

  const handleReset = () => {
    onSearchQueryChange('');
    onFilterChange({
        status: null,
        tags: [],
        sortBy: 'created_desc'
    });
  };

  return (
    <div className="sticky top-0 z-30" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="px-4 pb-3 pt-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon name="search" className="w-5 h-5 text-neutral-400 group-focus-within:text-[#FF5252] transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="スポットを検索..."
              className="w-full h-12 pl-11 pr-4 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[#FF5252] focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all font-medium placeholder-neutral-400"
            />
          </div>
          
           <button 
            onClick={onToggleViewMode} 
            className="relative w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200 border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
          >
            <Icon name={viewMode === 'grid' ? 'list-bullet' : 'squares-2x2'} className="w-6 h-6" />
          </button>

          <button 
            onClick={toggleFilterPanel} 
            className={`relative w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200 border ${isFilterOpen ? 'bg-rose-50 border-rose-200 text-[#FF5252]' : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}
          >
            <Icon name="adjustments-horizontal" className="w-6 h-6" />
            {activeFilterCount > 0 && (
              <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#FF5252] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-neutral-900 transform translate-x-1 -translate-y-1">
                {activeFilterCount}
              </div>
            )}
          </button>
        </div>
      </div>
      
      {isFilterOpen && (
        <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-700 p-5 shadow-xl animate-slide-down rounded-b-3xl mx-2">
          
          <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400">絞り込み条件</span>
              <button 
                onClick={handleReset}
                className="text-xs font-bold text-[#FF5252] hover:underline flex items-center gap-1 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-lg"
              >
                  <Icon name="arrow-uturn-left" className="w-3 h-3" />
                  リセット
              </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase text-neutral-400 tracking-wider mb-3 block">ステータス</label>
              <div className="flex gap-2">
                {(['want_to_go', 'visited', 'revisit'] as SpotStatus[]).map(status => (
                  <button key={status} onClick={() => handleStatusChange(status)} className={`px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 border ${filters.status === status ? 'bg-[#FF5252] border-[#FF5252] text-white shadow-lg shadow-rose-500/30' : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50'}`}>
                    {{'want_to_go': '行きたい', 'visited': '行った', 'revisit': '再訪'}[status]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-neutral-400 tracking-wider mb-3 block">タグ</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                {availableTags.length > 0 ? availableTags.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 text-sm font-semibold rounded-xl transition-colors border ${filters.tags.includes(tag) ? 'bg-rose-50 dark:bg-rose-900/20 text-[#FF5252] border-rose-200 dark:border-rose-800' : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-transparent hover:bg-neutral-100'}`}>
                    #{tag}
                  </button>
                )) : (
                   <p className="text-sm text-neutral-400">登録されたタグはありません</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-neutral-400 tracking-wider mb-3 block">並び替え</label>
              <div className="relative">
                <select onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as SortOption })} value={filters.sortBy} className="w-full h-12 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[#FF5252] transition appearance-none font-medium">
                    <option value="created_desc">登録日が新しい順</option>
                    <option value="name_asc">名前順 (A-Z)</option>
                    <option value="rating_desc">評価が高い順</option>
                    <option value="latest_visit">最近訪問した順</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                    <Icon name="chevron-right" className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .animate-slide-down {
          animation: slideDown 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
