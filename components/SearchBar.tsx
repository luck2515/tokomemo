
import React, { useState, useMemo } from 'react';
import { Icon } from '../constants';
import { FilterCriteria, SpotStatus, SortOption } from '../types';

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  filters: FilterCriteria;
  onFilterChange: (newFilters: FilterCriteria) => void;
  availableTags: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  onSearchQueryChange, 
  filters, 
  onFilterChange, 
  availableTags 
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
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg p-3 border-b border-neutral-200/80 dark:border-neutral-700/80">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon name="search" className="w-5 h-5 text-neutral-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="スポットを検索..."
              className="w-full h-11 pl-11 pr-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 transition"
            />
          </div>
          <button 
            onClick={toggleFilterPanel} 
            className={`relative w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-neutral-500 transition-all duration-200 border-2 ${isFilterOpen ? 'bg-[#FF5252]/10 border-[#FF5252]' : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'}`}
          >
            <Icon name="adjustments-horizontal" className={`w-6 h-6 ${isFilterOpen ? 'text-[#FF5252]' : 'dark:text-neutral-300'}`} />
            {activeFilterCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF5252] text-white text-xs font-bold flex items-center justify-center border-2 border-white dark:border-neutral-900">
                {activeFilterCount}
              </div>
            )}
          </button>
        </div>
      </div>
      
      {isFilterOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 shadow-lg animate-slide-down">
          
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-700/50">
              <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400">絞り込み条件</span>
              <button 
                onClick={handleReset}
                className="text-xs font-bold text-[#FF5252] hover:underline flex items-center gap-1"
              >
                  <Icon name="arrow-uturn-left" className="w-3 h-3" />
                  リセット
              </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase text-neutral-500 tracking-wider">ステータス</label>
              <div className="flex gap-2 mt-2">
                {(['want_to_go', 'visited', 'revisit'] as SpotStatus[]).map(status => (
                  <button key={status} onClick={() => handleStatusChange(status)} className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${filters.status === status ? 'bg-[#FF5252] text-white shadow-md shadow-[#FF5252]/20' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600'}`}>
                    {{'want_to_go': '行きたい', 'visited': '行った', 'revisit': '再訪したい'}[status]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase text-neutral-500 tracking-wider">タグ</label>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto">
                {availableTags.length > 0 ? availableTags.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors border ${filters.tags.includes(tag) ? 'bg-[#FF5252]/10 text-[#FF5252] border-[#FF5252]/50' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-200 border-transparent hover:bg-neutral-200 dark:hover:bg-neutral-600'}`}>
                    {tag}
                  </button>
                )) : (
                   <p className="text-sm text-neutral-400">登録されたタグはありません</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-neutral-500 tracking-wider">並び替え</label>
              <select onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as SortOption })} value={filters.sortBy} className="w-full mt-2 h-11 px-3 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[#FF6B6B] transition">
                <option value="created_desc">登録日が新しい順</option>
                <option value="name_asc">名前順 (A-Z)</option>
                <option value="rating_desc">評価が高い順</option>
                <option value="latest_visit">最近訪問した順</option>
              </select>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .animate-slide-down {
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
