'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Heart,
  ChevronDown,
  X,
  Sparkles,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import {
  ServiceCategory,
  ServiceItem,
  Provider
} from '@/lib/marketplace-data';

interface ExploreTabProps {
  categories: ServiceCategory[];
  services: ServiceItem[];
  providers: Provider[];
  selectedLocation: string;
  favorites: string[];
  onToggleFavorite: (providerId: string) => void;
  onSelectService: (service: ServiceItem) => void;
  onSelectProvider: (provider: Provider) => void;
  onBookNow: (service?: ServiceItem, provider?: Provider) => void;
  initialCategory?: string;
  initialQuery?: string;
}

export default function ExploreTab({
  categories,
  services,
  providers,
  selectedLocation,
  favorites,
  onToggleFavorite,
  onSelectService,
  onSelectProvider,
  onBookNow,
  initialCategory = 'all',
  initialQuery = ''
}: ExploreTabProps) {
  const [activeView, setActiveView] = useState<'services' | 'providers'>('services');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<'recommended' | 'nearest' | 'highest_rated' | 'lowest_price' | 'available_now'>('recommended');

  // Filter states
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [availableTodayOnly, setAvailableTodayOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchesCategory =
        selectedCategory === 'all' || srv.categoryId === selectedCategory;
      const matchesSearch =
        srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = srv.price <= maxPrice;
      const matchesRating = srv.rating >= minRating;

      return matchesCategory && matchesSearch && matchesPrice && matchesRating;
    }).sort((a, b) => {
      if (sortBy === 'lowest_price') return a.price - b.price;
      if (sortBy === 'highest_rated') return b.rating - a.rating;
      return b.reviewsCount - a.reviewsCount; // recommended
    });
  }, [services, selectedCategory, searchQuery, maxPrice, minRating, sortBy]);

  // Filtered Providers
  const filteredProviders = useMemo(() => {
    return providers.filter((pro) => {
      const matchesCategory =
        selectedCategory === 'all' || pro.categoryId === selectedCategory;
      const matchesSearch =
        pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pro.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pro.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDistance = pro.distanceKm <= maxDistance;
      const matchesRating = pro.rating >= minRating;
      const matchesVerified = !verifiedOnly || pro.verified;
      const matchesPrice = pro.basePrice <= maxPrice;
      const matchesAvailable = !availableTodayOnly || pro.availability.toLowerCase().includes('today');

      return (
        matchesCategory &&
        matchesSearch &&
        matchesDistance &&
        matchesRating &&
        matchesVerified &&
        matchesPrice &&
        matchesAvailable
      );
    }).sort((a, b) => {
      if (sortBy === 'nearest') return a.distanceKm - b.distanceKm;
      if (sortBy === 'highest_rated') return b.rating - a.rating;
      if (sortBy === 'lowest_price') return a.basePrice - b.basePrice;
      return b.completedJobs - a.completedJobs; // recommended
    });
  }, [
    providers,
    selectedCategory,
    searchQuery,
    maxDistance,
    minRating,
    verifiedOnly,
    maxPrice,
    availableTodayOnly,
    sortBy
  ]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (availableTodayOnly ? 1 : 0) +
    (maxDistance < 10 ? 1 : 0) +
    (maxPrice < 3000 ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory('all');
    setMinRating(0);
    setVerifiedOnly(false);
    setAvailableTodayOnly(false);
    setMaxDistance(10);
    setMaxPrice(3000);
    setSortBy('recommended');
  };

  return (
    <div className="space-y-8 pb-24 lg:pb-16 w-full max-w-[1760px] 2xl:max-w-[1840px] mx-auto">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[12px] uppercase tracking-[0.2em] font-semibold text-stone-500">
            Verified Marketplace
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tightest text-stone-900">
            Explore Services <span className="italic font-normal">&amp;</span> Providers
          </h1>
          <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed">
            Search top-tier verified professionals in <strong>{selectedLocation}</strong>
          </p>
        </div>

        {/* View Mode Switcher: Services vs Providers */}
        <div className="inline-flex p-1.5 rounded-2xl bg-stone-100 border border-stone-200 self-start md:self-auto shadow-xs">
          <button
            onClick={() => setActiveView('services')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeView === 'services'
                ? 'bg-black text-white shadow-sm'
                : 'text-stone-600 hover:text-black'
            }`}
          >
            Services ({filteredServices.length})
          </button>
          <button
            onClick={() => setActiveView('providers')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeView === 'providers'
                ? 'bg-black text-white shadow-sm'
                : 'text-stone-600 hover:text-black'
            }`}
          >
            Providers ({filteredProviders.length})
          </button>
        </div>
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeView === 'services'
                ? 'Search services (e.g., AC deep clean, tap leak, fan repair)...'
                : 'Search providers (e.g., electrician, cleaning)...'
            }
            className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white border border-stone-200 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Toggle & Categories Selector (Categories placed at place of Sort) */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all ${
              activeFiltersCount > 0
                ? 'border-black bg-black text-white'
                : 'border-stone-200 bg-white text-stone-800 hover:bg-stone-50'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Categories selector placed at the place of sort */}
          <div className="flex-1 sm:flex-initial relative min-w-[190px] sm:min-w-[220px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none px-4 py-3.5 pr-9 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none focus:border-black cursor-pointer shadow-sm hover:border-stone-400 transition-colors"
            >
              <option value="all">📁 All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active filter badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-stone-500 font-medium">Active Filters:</span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-medium">
              Category: {categories.find((c) => c.id === selectedCategory)?.name}
              <X size={12} className="cursor-pointer" onClick={() => setSelectedCategory('all')} />
            </span>
          )}
          {minRating > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-medium">
              ⭐ {minRating}+ Stars
              <X size={12} className="cursor-pointer" onClick={() => setMinRating(0)} />
            </span>
          )}
          {verifiedOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-medium">
              Verified Only
              <X size={12} className="cursor-pointer" onClick={() => setVerifiedOnly(false)} />
            </span>
          )}
          {availableTodayOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-medium">
              Available Today
              <X size={12} className="cursor-pointer" onClick={() => setAvailableTodayOnly(false)} />
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-xs font-bold text-rose-600 hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* VIEW 1: SERVICES LIST */}
      {activeView === 'services' && (
        <div>
          {filteredServices.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-lg font-bold text-stone-900">No services match your search</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Try loosening your filters or searching for terms like AC, Cleaning, or Electrician.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
              {filteredServices.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-white border border-stone-200 rounded-3xl overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-stone-100">
                    <img
                      src={srv.image}
                      alt={srv.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {srv.badge && (
                      <span className="absolute top-3.5 left-3.5 bg-black/85 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        {srv.badge}
                      </span>
                    )}
                    <div className="absolute bottom-3.5 right-3.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold text-stone-900 shadow">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span>{srv.rating}</span>
                      <span className="text-[11px] text-stone-500 font-normal">({srv.reviewsCount})</span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                        {srv.category}
                      </div>
                      <h3 className="font-display font-medium text-stone-900 text-xl sm:text-2xl tracking-tight mt-1.5">
                        {srv.title}
                      </h3>
                      <p className="text-sm text-stone-600 mt-2.5 line-clamp-2 leading-relaxed">
                        {srv.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs sm:text-sm text-stone-600 mt-3.5">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock size={14} className="text-stone-400" />
                          {srv.duration}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">Onsite Service</span>
                      </div>

                      {/* Inclusions preview */}
                      <div className="mt-4 pt-3.5 border-t border-stone-100 space-y-1.5">
                        {srv.included.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 truncate">
                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Standard Price</div>
                        <div className="text-2xl font-display font-semibold text-stone-900 tracking-tight mt-0.5">₹{srv.price}</div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => onSelectService(srv)}
                          className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onBookNow(srv)}
                          className="px-5 py-2.5 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors shadow-sm"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PROVIDERS LIST */}
      {activeView === 'providers' && (
        <div>
          {filteredProviders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
              <div className="text-4xl mb-3">👨‍🔧</div>
              <h3 className="text-lg font-bold text-stone-900">No providers found in this radius</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Try expanding your distance slider or resetting your filters to discover experts.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-7">
              {filteredProviders.map((pro) => {
                const isFav = favorites.includes(pro.id);
                return (
                  <div
                    key={pro.id}
                    className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 hover:shadow-xl transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            <img
                              src={pro.avatar}
                              alt={pro.name}
                              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border border-stone-200"
                            />
                            {pro.verified && (
                              <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1" title="Worksy Verified Pro">
                                <ShieldCheck size={12} />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-display font-medium text-stone-900 text-xl tracking-tight truncate">{pro.name}</h3>
                              {pro.badge && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                                  {pro.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-stone-500 mt-1 font-medium line-clamp-1">
                              {pro.tagline}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-stone-600 mt-2.5">
                              <span className="flex items-center gap-1 font-bold text-stone-900">
                                <Star size={14} className="fill-amber-400 text-amber-400" />
                                {pro.rating}
                              </span>
                              <span>•</span>
                              <span className="text-stone-500 truncate">{pro.completedJobs}+ jobs</span>
                              <span>•</span>
                              <span className="text-stone-500 truncate">{pro.experienceYears} yrs exp</span>
                            </div>
                          </div>
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={() => onToggleFavorite(pro.id)}
                          className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
                            isFav
                              ? 'border-rose-200 bg-rose-50 text-rose-600'
                              : 'border-stone-200 hover:bg-stone-100 text-stone-400'
                          }`}
                        >
                          <Heart size={16} className={isFav ? 'fill-rose-600' : ''} />
                        </button>
                      </div>

                      {/* Badges strip: distance, response time, area */}
                      <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-stone-100 text-center">
                        <div className="p-2.5 rounded-xl bg-stone-50">
                          <div className="text-[11px] text-stone-400 uppercase font-semibold">Distance</div>
                          <div className="text-xs sm:text-sm font-bold text-stone-800 mt-0.5">{pro.distanceKm} km away</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-stone-50">
                          <div className="text-[11px] text-stone-400 uppercase font-semibold">Response</div>
                          <div className="text-xs sm:text-sm font-bold text-stone-800 mt-0.5">{pro.responseTime}</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-stone-50">
                          <div className="text-[11px] text-stone-400 uppercase font-semibold">Rate</div>
                          <div className="text-sm font-display font-semibold text-emerald-800 tracking-tight mt-0.5">₹{pro.basePrice} onwards</div>
                        </div>
                      </div>

                      {/* Services list snippet */}
                      <div className="mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
                        <span className="font-semibold text-stone-800">Services: </span>
                        {pro.servicesOffered.map((s) => s.title).join(', ')}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-3">
                      <button
                        onClick={() => onSelectProvider(pro)}
                        className="flex-1 py-3 px-4 rounded-xl border border-stone-300 text-stone-800 text-xs sm:text-sm font-bold hover:bg-stone-50 transition-colors text-center"
                      >
                        View Full Profile
                      </button>
                      <button
                        onClick={() => onBookNow(undefined, pro)}
                        className="flex-1 py-3 px-4 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors text-center shadow-sm"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FILTER MODAL / DRAWER */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} />
                <h3 className="text-base font-bold text-stone-900">Filter &amp; Sort Results</h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sort Options (Moved into Filter modal) */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-800 mb-2">
                <span>Sort Results By</span>
                <span className="text-stone-500 capitalize">{sortBy.replace('_', ' ')}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'recommended', label: 'Recommended' },
                  { id: 'nearest', label: 'Nearest First' },
                  { id: 'highest_rated', label: 'Highest Rated' },
                  { id: 'lowest_price', label: 'Lowest Price' },
                  { id: 'available_now', label: 'Available Today' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id as any)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      sortBy === opt.id
                        ? 'bg-black text-white border-black shadow-xs font-bold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Filter */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-800 mb-2">
                <span>Maximum Distance</span>
                <span className="text-amber-600">{maxDistance} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>1 km</span>
                <span>5 km</span>
                <span>15 km</span>
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <div className="text-xs font-bold text-stone-800 mb-2">Minimum Customer Rating</div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 4.0, 4.5, 4.8].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setMinRating(rate)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      minRating === rate
                        ? 'bg-black text-white border-black'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {rate === 0 ? 'All' : `⭐ ${rate}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-800 mb-2">
                <span>Price Ceiling</span>
                <span className="text-emerald-700">Under ₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="300"
                max="3000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {/* Checkboxes: Verified, Available Today */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-black accent-black"
                />
                <div>
                  <div className="text-xs font-bold text-stone-900">Verified Professionals Only</div>
                  <div className="text-[11px] text-stone-500">Only show pros with government ID & background checks</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableTodayOnly}
                  onChange={(e) => setAvailableTodayOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-black accent-black"
                />
                <div>
                  <div className="text-xs font-bold text-stone-900">Available Today Only</div>
                  <div className="text-[11px] text-stone-500">Guaranteed instant dispatch or slots today</div>
                </div>
              </label>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-stone-200">
              <button
                onClick={resetFilters}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-stone-800"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
