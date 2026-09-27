'use client';

import React from 'react';
import { Heart, Star, ShieldCheck, Clock, Trash2, ArrowRight } from 'lucide-react';
import { Provider, ServiceItem } from '@/lib/marketplace-data';

interface FavoritesTabProps {
  favoriteProviderIds: string[];
  providers: Provider[];
  services: ServiceItem[];
  onToggleFavorite: (providerId: string) => void;
  onSelectProvider: (provider: Provider) => void;
  onBookNow: (service?: ServiceItem, provider?: Provider) => void;
}

export default function FavoritesTab({
  favoriteProviderIds,
  providers,
  services,
  onToggleFavorite,
  onSelectProvider,
  onBookNow
}: FavoritesTabProps) {
  const savedProviders = providers.filter((p) =>
    favoriteProviderIds.includes(p.id)
  );

  return (
    <div className="space-y-10 pb-28 lg:pb-16 w-full max-w-[1760px] 2xl:max-w-[1840px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-500">
            Saved Directory
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tightest text-stone-900 leading-[1.08]">
            Saved <span className="italic font-normal">Favorites</span>
          </h1>
          <p className="text-base sm:text-lg text-stone-600 mt-2 max-w-2xl leading-relaxed">
            Your shortlisted certified specialists and preferred neighborhood technicians for instant booking.
          </p>
        </div>

        {savedProviders.length > 0 && (
          <span className="text-sm font-semibold text-stone-600 bg-stone-100/90 border border-stone-200/80 px-4 py-2 rounded-full self-start sm:self-auto">
            {savedProviders.length} saved {savedProviders.length === 1 ? 'professional' : 'professionals'}
          </span>
        )}
      </div>

      {savedProviders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 shadow-sm max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center text-4xl mx-auto mb-4 shadow-xs">
            ❤️
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-medium text-stone-900 tracking-tight">
            No favorite providers yet
          </h3>
          <p className="text-sm sm:text-base text-stone-600 mt-2.5 max-w-md mx-auto leading-relaxed">
            Tap the heart icon on any service specialist profile while exploring to quickly access them here for repeat bookings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
          {savedProviders.map((pro) => (
            <div
              key={pro.id}
              className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden hover:shadow-xl hover:border-black/20 transition-all flex flex-col justify-between group relative"
            >
              {/* Card Header with Cover Image & Floating Badges */}
              <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-stone-100">
                <img
                  src={pro.coverImage}
                  alt={pro.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Badge top-left */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                  <span className="bg-black/80 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/10 shadow-sm">
                    {pro.badge || pro.category}
                  </span>
                </div>

                {/* Remove from favorites button top-right */}
                <button
                  onClick={() => onToggleFavorite(pro.id)}
                  className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-rose-600 flex items-center justify-center shadow-md hover:scale-110 transition-all cursor-pointer"
                  title="Remove from favorites"
                >
                  <Heart size={17} className="fill-rose-600" />
                </button>
              </div>

              {/* Main Content Area */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between -mt-10 relative z-10">
                <div>
                  {/* Avatar & Rating row */}
                  <div className="flex items-end justify-between gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={pro.avatar}
                        alt={pro.name}
                        className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-stone-100"
                      />
                      {pro.verified && (
                        <span
                          className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 border-2 border-white shadow-sm"
                          title="Worksy Verified Professional"
                        >
                          <ShieldCheck size={13} />
                        </span>
                      )}
                    </div>

                    <div className="mb-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-900 text-xs sm:text-sm font-bold shadow-xs shrink-0">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span>{pro.rating}</span>
                      <span className="text-stone-400 font-normal text-xs">({pro.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div className="mt-3.5 min-w-0">
                    <h3 className="font-display font-medium text-stone-900 text-xl sm:text-2xl tracking-tight truncate">
                      {pro.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 mt-1 line-clamp-1 font-medium leading-relaxed">
                      {pro.tagline || pro.category}
                    </p>
                  </div>

                  {/* 3-Column Highlights Strip */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 my-4 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-[11px] text-stone-400 font-semibold uppercase tracking-wider">Distance</div>
                      <div className="text-xs sm:text-sm font-bold text-stone-800 mt-0.5 truncate">{pro.distanceKm} km</div>
                    </div>
                    <div className="border-x border-stone-200/70 min-w-0 px-1">
                      <div className="text-[10px] sm:text-[11px] text-stone-400 font-semibold uppercase tracking-wider">Jobs</div>
                      <div className="text-xs sm:text-sm font-bold text-stone-800 mt-0.5 truncate">{pro.completedJobs}+</div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-[11px] text-stone-400 font-semibold uppercase tracking-wider">Experience</div>
                      <div className="text-xs sm:text-sm font-bold text-stone-800 mt-0.5 truncate">{pro.experienceYears} yrs</div>
                    </div>
                  </div>

                  {/* Pricing & Availability */}
                  <div className="flex items-center justify-between text-xs sm:text-sm pt-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-stone-600 truncate mr-2 min-w-0">
                      <Clock size={14} className="text-stone-400 shrink-0" />
                      <span className="truncate">{pro.availability}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Starts at</span>
                      <span className="text-base sm:text-lg font-display font-semibold text-emerald-800">₹{pro.basePrice}</span>
                    </div>
                  </div>

                  {/* Top Services Offered */}
                  {pro.servicesOffered && pro.servicesOffered.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-stone-100">
                      {pro.servicesOffered.slice(0, 2).map((srv, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg truncate max-w-full"
                        >
                          {srv.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-6 pt-4 border-t border-stone-100 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onSelectProvider(pro)}
                    className="w-full py-3 px-3 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors text-center truncate cursor-pointer"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onBookNow(undefined, pro)}
                    className="w-full py-3 px-3 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors text-center shadow-sm truncate cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
