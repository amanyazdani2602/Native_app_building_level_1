import React, { useState, useRef, useEffect } from 'react';
import {
  Filter,
  RotateCcw,
  Check,
  ChevronDown,
  X,
  Search,
  Calendar,
  Layers,
  Store,
  MapPin,
  Building,
  Tag,
} from 'lucide-react';
import { FilterState, MergedRetailRecord } from '../types';
import { parseWeekToTimestamp } from '../utils/excelParser';

interface FilterBarProps {
  records: MergedRetailRecord[];
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  records,
  filters,
  onFilterChange,
  filteredCount,
  totalCount,
}) => {
  // Extract distinct values with chronological sorting for weeks
  const allWeeks = Array.from(new Set(records.map((r) => r.week_start_date))).sort((a, b) => {
    return parseWeekToTimestamp(a) - parseWeekToTimestamp(b);
  });
  const allRegions = Array.from(new Set(records.map((r) => r.region))).sort();
  const allStores = Array.from(new Set(records.map((r) => r.store_name))).sort();
  const allCities = Array.from(new Set(records.map((r) => r.city))).sort();
  const allFormats = Array.from(new Set(records.map((r) => r.store_format))).sort();
  const allCategories = Array.from(new Set(records.map((r) => r.product_category))).sort();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFilterItem = (key: keyof FilterState, item: string) => {
    const current = filters[key];
    const exists = current.includes(item);
    const updated = exists ? current.filter((x) => x !== item) : [...current, item];
    onFilterChange({ ...filters, [key]: updated });
  };

  const selectAll = (key: keyof FilterState, allItems: string[]) => {
    onFilterChange({ ...filters, [key]: allItems });
  };

  const clearKey = (key: keyof FilterState) => {
    onFilterChange({ ...filters, [key]: [] });
  };

  const resetAllFilters = () => {
    onFilterChange({
      weeks: [],
      regions: [],
      stores: [],
      cities: [],
      storeFormats: [],
      categories: [],
    });
  };

  const activeFilterCount =
    (filters.weeks.length > 0 ? 1 : 0) +
    (filters.regions.length > 0 ? 1 : 0) +
    (filters.stores.length > 0 ? 1 : 0) +
    (filters.cities.length > 0 ? 1 : 0) +
    (filters.storeFormats.length > 0 ? 1 : 0) +
    (filters.categories.length > 0 ? 1 : 0);

  // Quick preset for weeks (chooses chronologically latest valid weeks)
  const setLatestWeekOnly = () => {
    const validWeeks = allWeeks.filter((w) => w !== 'Unknown');
    if (validWeeks.length > 0) {
      onFilterChange({ ...filters, weeks: [validWeeks[validWeeks.length - 1]] });
    }
  };

  const setLast4Weeks = () => {
    const validWeeks = allWeeks.filter((w) => w !== 'Unknown');
    if (validWeeks.length > 0) {
      const last4 = validWeeks.slice(-4);
      onFilterChange({ ...filters, weeks: last4 });
    }
  };

  return (
    <div id="filter-bar" className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3" ref={dropdownRef}>
      {/* Top row: Headline + Counts + Clear all */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-800">Operational Filters</span>
            <span className="text-xs text-slate-500 ml-2">
              Viewing <strong className="text-slate-900">{filteredCount.toLocaleString()}</strong> of {totalCount.toLocaleString()} rows
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick presets for Weeks */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, weeks: [] })}
              className={`px-2.5 py-1 rounded transition-colors ${
                filters.weeks.length === 0 ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              All Weeks
            </button>
            <button
              type="button"
              onClick={setLatestWeekOnly}
              className={`px-2.5 py-1 rounded transition-colors ${
                filters.weeks.length === 1 && filters.weeks[0] === allWeeks[allWeeks.length - 1]
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Latest Week
            </button>
            <button
              type="button"
              onClick={setLast4Weeks}
              className="px-2.5 py-1 rounded hover:text-slate-900 transition-colors"
            >
              Last 4 Weeks
            </button>
          </div>

          {activeFilterCount > 0 && (
            <button
              id="reset-filters-btn"
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Dropdown Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* 1. Weeks Filter */}
        <FilterDropdown
          label="Week"
          icon={<Calendar className="w-3.5 h-3.5 text-blue-500" />}
          items={allWeeks}
          selected={filters.weeks}
          isOpen={openDropdown === 'weeks'}
          onToggleOpen={() => setOpenDropdown(openDropdown === 'weeks' ? null : 'weeks')}
          onItemToggle={(item) => toggleFilterItem('weeks', item)}
          onSelectAll={() => selectAll('weeks', allWeeks)}
          onClear={() => clearKey('weeks')}
        />

        {/* 2. Region Filter */}
        <FilterDropdown
          label="Region"
          icon={<MapPin className="w-3.5 h-3.5 text-emerald-500" />}
          items={allRegions}
          selected={filters.regions}
          isOpen={openDropdown === 'regions'}
          onToggleOpen={() => setOpenDropdown(openDropdown === 'regions' ? null : 'regions')}
          onItemToggle={(item) => toggleFilterItem('regions', item)}
          onSelectAll={() => selectAll('regions', allRegions)}
          onClear={() => clearKey('regions')}
        />

        {/* 3. Store Filter */}
        <FilterDropdown
          label="Store"
          icon={<Store className="w-3.5 h-3.5 text-indigo-500" />}
          items={allStores}
          selected={filters.stores}
          isOpen={openDropdown === 'stores'}
          onToggleOpen={() => setOpenDropdown(openDropdown === 'stores' ? null : 'stores')}
          onItemToggle={(item) => toggleFilterItem('stores', item)}
          onSelectAll={() => selectAll('stores', allStores)}
          onClear={() => clearKey('stores')}
          searchable
        />

        {/* 4. City Filter */}
        <FilterDropdown
          label="City"
          icon={<Building className="w-3.5 h-3.5 text-amber-500" />}
          items={allCities}
          selected={filters.cities}
          isOpen={openDropdown === 'cities'}
          onToggleOpen={() => setOpenDropdown(openDropdown === 'cities' ? null : 'cities')}
          onItemToggle={(item) => toggleFilterItem('cities', item)}
          onSelectAll={() => selectAll('cities', allCities)}
          onClear={() => clearKey('cities')}
          searchable
        />

        {/* 5. Store Format Filter */}
        <FilterDropdown
          label="Format"
          icon={<Layers className="w-3.5 h-3.5 text-purple-500" />}
          items={allFormats}
          selected={filters.storeFormats}
          isOpen={openDropdown === 'formats'}
          onToggleOpen={() => setOpenDropdown(openDropdown === 'formats' ? null : 'formats')}
          onItemToggle={(item) => toggleFilterItem('storeFormats', item)}
          onSelectAll={() => selectAll('storeFormats', allFormats)}
          onClear={() => clearKey('storeFormats')}
        />

        {/* 6. Product Category Filter */}
        <FilterDropdown
          label="Category"
          icon={<Tag className="w-3.5 h-3.5 text-rose-500" />}
          items={allCategories}
          selected={filters.categories}
          isOpen={openDropdown === 'categories'}
          onToggleOpen={() => setOpenDropdown(openDropdown === 'categories' ? null : 'categories')}
          onItemToggle={(item) => toggleFilterItem('categories', item)}
          onSelectAll={() => selectAll('categories', allCategories)}
          onClear={() => clearKey('categories')}
        />
      </div>

      {/* Active Filter Pills Bar */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1">Active:</span>

          {filters.weeks.map((w) => (
            <span
              key={`pill-week-${w}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium"
            >
              Week: {w}
              <button
                type="button"
                onClick={() => toggleFilterItem('weeks', w)}
                className="hover:text-blue-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.regions.map((r) => (
            <span
              key={`pill-region-${r}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-medium"
            >
              Region: {r}
              <button
                type="button"
                onClick={() => toggleFilterItem('regions', r)}
                className="hover:text-emerald-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.stores.map((s) => (
            <span
              key={`pill-store-${s}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-medium max-w-[180px] truncate"
            >
              {s}
              <button
                type="button"
                onClick={() => toggleFilterItem('stores', s)}
                className="hover:text-indigo-900 cursor-pointer shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.cities.map((c) => (
            <span
              key={`pill-city-${c}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-medium"
            >
              {c}
              <button
                type="button"
                onClick={() => toggleFilterItem('cities', c)}
                className="hover:text-amber-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.storeFormats.map((f) => (
            <span
              key={`pill-format-${f}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md font-medium"
            >
              {f}
              <button
                type="button"
                onClick={() => toggleFilterItem('storeFormats', f)}
                className="hover:text-purple-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filters.categories.map((cat) => (
            <span
              key={`pill-cat-${cat}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-medium"
            >
              {cat}
              <button
                type="button"
                onClick={() => toggleFilterItem('categories', cat)}
                className="hover:text-rose-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

interface FilterDropdownProps {
  label: string;
  icon: React.ReactNode;
  items: string[];
  selected: string[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onItemToggle: (item: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  searchable?: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  icon,
  items,
  selected,
  isOpen,
  onToggleOpen,
  onItemToggle,
  onSelectAll,
  onClear,
  searchable = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = searchable && searchTerm
    ? items.filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase()))
    : items;

  const count = selected.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggleOpen}
        className={`w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
          count > 0
            ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-semibold'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {icon}
          <span className="truncate">{label}</span>
          {count > 0 && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.2 bg-blue-600 text-white text-[10px] font-bold rounded-full">
              {count}
            </span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-30 left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 text-xs">
          {/* Header Actions */}
          <div className="px-3 pb-2 mb-1 border-b border-slate-100 flex items-center justify-between">
            <span className="font-semibold text-slate-800">{label} ({items.length})</span>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={onSelectAll}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={onClear}
                className="text-slate-500 hover:text-slate-800"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search box if searchable */}
          {searchable && (
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Item List */}
          <div className="max-h-56 overflow-y-auto px-1 space-y-0.5">
            {filteredItems.length === 0 ? (
              <div className="p-3 text-center text-slate-400 text-xs">No options found</div>
            ) : (
              filteredItems.map((item) => {
                const isChecked = selected.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onItemToggle(item)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-blue-50 font-medium text-blue-900'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="truncate pr-2">{item}</span>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
