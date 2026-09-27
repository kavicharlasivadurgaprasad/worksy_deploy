'use client';

import { categoryImage } from '@/lib/mappers';
import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Heart,
  Calendar,
  ChevronDown,
  MessageCircle,
  Award,
  Clock
} from 'lucide-react';
import {
  ServiceCategory,
  ServiceItem,
  Provider,
  Booking,
  Coupon
} from '@/lib/marketplace-data';
import { CustomerTab } from './CustomerSidebar';

interface HomeTabProps {
  userName?: string;
  selectedLocation: string;
  onOpenLocationModal: () => void;
  categories: ServiceCategory[];
  services: ServiceItem[];
  providers: Provider[];
  upcomingBooking?: Booking;
  recentBooking?: Booking;
  offers: Coupon[];
  favorites: string[];
  onToggleFavorite: (providerId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectService: (service: ServiceItem) => void;
  onSelectProvider: (provider: Provider) => void;
  onTrackBooking: (booking: Booking) => void;
  onViewBookingDetails: (booking: Booking) => void;
  onBookNow: (service?: ServiceItem, provider?: Provider) => void;
  onRateService: (booking: Booking) => void;
  onOpenOffers: () => void;
  setActiveTab: (tab: CustomerTab) => void;
}

export default function HomeTab({
  selectedLocation,
  onOpenLocationModal,
  categories,
  services,
  providers,
  upcomingBooking,
  favorites,
  onToggleFavorite,
  onSelectCategory,
  onSelectProvider,
  onViewBookingDetails,
  onOpenOffers,
  setActiveTab
}: HomeTabProps) {
  const [heroSearch, setHeroSearch] = useState('');

  // Everything below is derived from backend data (categories, providers, services)
  const popularCategoriesList = categories.slice(0, 6).map((c) => ({ id: c.id, name: c.name, image: categoryImage(c.name) }));

  const recommendedPros = [...providers]
    .sort((x, y) => y.rating - x.rating || y.completedJobs - x.completedJobs)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      name: p.name,
      rating: p.rating.toFixed(1),
      reviews: `${p.completedJobs} jobs`,
      distance: p.serviceArea || 'Service area not set',
      category: p.category,
      price: p.basePrice > 0 ? `₹${p.basePrice}` : 'On request',
      image: p.avatar,
      verified: p.verified,
      provider: p
    }));

  const recentlyViewedItems = services.slice(0, 4).map((sv) => ({
    id: sv.id,
    title: sv.title,
    price: `₹${sv.price.toLocaleString('en-IN')} onwards`,
    image: sv.image,
    categoryId: sv.categoryId
  }));

  const handleSearchHero = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('explore');
  };

  return (
    <div className="w-full pb-16">
      {/* Full-Width Main Content Layout */}
      <div className="w-full space-y-10 min-w-0">

        {/* 1. HERO BANNER - ENLARGED & EXPANSIVE */}
        <section className="relative rounded-3xl overflow-hidden min-h-[500px] sm:min-h-[540px] lg:min-h-[580px] border border-[#1F1F24] flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-black shadow-2xl">
          {/* Background Image with dramatic silhouette */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url('/images/hero-bg.jpg')`,
            }}
          />

          {/* Dark gradient overlay for extreme readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30 pointer-events-none" />

          {/* Top Row inside Hero: Kicker & Location Selector */}
          <div className="relative z-10 flex items-start justify-between gap-4">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-zinc-300">
              LOCAL SERVICES. REAL PEOPLE.
            </span>

            {/* Location Selector chip on top-right of hero banner */}
            <button
              onClick={onOpenLocationModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-xs sm:text-sm text-zinc-100 transition-all font-medium shadow-sm"
            >
              <MapPin size={14} className="text-zinc-300 shrink-0" />
              <span>{selectedLocation || 'Bengaluru, Karnataka'}</span>
              <ChevronDown size={13} className="text-zinc-400 shrink-0" />
            </button>
          </div>

          {/* Middle Row inside Hero: Serif Headline */}
          <div className="relative z-10 flex flex-col justify-between my-auto py-4">
            <div className="max-w-3xl">
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tightest text-white leading-[1.02]">
                Your home,<br /><span className="italic font-normal">our priority.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-zinc-200 font-normal leading-relaxed max-w-2xl">
                Find trusted professionals for all your local service needs — quickly, easily, and reliably.
              </p>
            </div>
          </div>

          {/* Bottom Row inside Hero: Floating Search Bar Pill */}
          <div className="relative z-10 mt-6 max-w-xl">
            <form
              onSubmit={handleSearchHero}
              className="flex items-center justify-between p-2 pl-6 rounded-full bg-[#EDE8DF] hover:bg-white text-zinc-900 shadow-2xl transition-all border border-white/25"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-3">
                <Search size={20} className="text-zinc-700 shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="What service do you need today?"
                  className="w-full bg-transparent text-sm sm:text-base text-zinc-900 placeholder:text-zinc-600 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-black hover:bg-zinc-800 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md"
                title="Search Services"
              >
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </section>

        {/* 2. POPULAR CATEGORIES - ENLARGED CARDS */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[12px] uppercase tracking-[0.2em] font-semibold text-stone-500">
                Curated Trades
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl font-medium text-stone-900 tracking-tightest">
                Popular <span className="italic font-normal">Categories</span>
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('explore')}
              className="text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1.5 transition-colors group"
            >
              <span>View All</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* 7 Category Cards in a spacious responsive row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 sm:gap-5">
            {popularCategoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="flex flex-col items-center group text-center"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-white border border-[#DCD6C9] group-hover:border-stone-400 group-hover:scale-[1.04] transition-all p-1.5 shadow-xs">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <span className="font-display text-sm sm:text-base font-medium text-stone-800 group-hover:text-black mt-3 tracking-tight truncate w-full">
                  {cat.name}
                </span>
              </button>
            ))}

            {/* 7th Card: "More" with circular right arrow */}
            <button
              onClick={() => setActiveTab('explore')}
              className="flex flex-col items-center group text-center"
            >
              <div className="w-full aspect-square rounded-2xl bg-white border border-[#DCD6C9] group-hover:border-stone-400 group-hover:scale-[1.04] transition-all flex items-center justify-center p-2 shadow-xs">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-stone-100 group-hover:bg-stone-200 text-stone-700 group-hover:text-stone-900 flex items-center justify-center transition-colors">
                  <ArrowRight size={17} />
                </div>
              </div>
              <span className="font-display text-sm sm:text-base font-medium text-stone-800 group-hover:text-black mt-3 tracking-tight">
                More
              </span>
            </button>
          </div>
        </section>

        {/* 3. RECOMMENDED NEAR YOU - ENLARGED PROVIDER CARDS & IMAGES */}
        <section>
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-[12px] uppercase tracking-[0.2em] font-semibold text-stone-500">
                Verified Local Pros
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl font-medium text-stone-900 tracking-tightest">
                Recommended <span className="italic font-normal">Near You</span>
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('explore')}
              className="text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1.5 transition-colors group"
            >
              <span>View All</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* 4 Provider Cards in a 4-column grid with bigger images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {recommendedPros.map((pro) => {
              const isFav = favorites.includes(pro.id);
              const matchedPro = pro.provider;

              return (
                <div
                  key={pro.id}
                  className="flex flex-col bg-white border border-[#DCD6C9] rounded-3xl overflow-hidden hover:border-stone-400 transition-all group shadow-sm hover:shadow-xl"
                >
                  {/* Top Image with Verified Badge and Favorite Heart - ENLARGED */}
                  <div className="relative aspect-[16/11] sm:h-60 lg:h-64 w-full overflow-hidden bg-stone-100">
                    <img
                      src={pro.image}
                      alt={pro.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Favorite Heart Button top right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(pro.id);
                      }}
                      className={`absolute top-3.5 right-3.5 p-2 rounded-full bg-black/50 backdrop-blur-md transition-all ${
                        isFav ? 'text-rose-500' : 'text-stone-200 hover:text-white'
                      }`}
                      title="Favorite"
                    >
                      <Heart size={15} className={isFav ? 'fill-rose-500' : ''} />
                    </button>

                    {/* Verified Badge bottom left */}
                    {pro.verified && (
                      <div className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-xs font-medium text-zinc-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
                    <div>
                      <h3 className="font-display font-medium text-stone-950 text-lg sm:text-xl tracking-tight truncate">
                        {pro.name}
                      </h3>

                      {/* Rating & Distance */}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mt-2">
                        <span className="flex items-center gap-1 font-semibold text-stone-800">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          {pro.rating}
                        </span>
                        <span className="text-stone-400">({pro.reviews})</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-stone-500">
                          <MapPin size={12} />
                          {pro.distance}
                        </span>
                      </div>

                      {/* Category */}
                      <div className="text-xs sm:text-sm text-stone-500 mt-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                        <span>{pro.category}</span>
                      </div>

                      {/* Price */}
                      <div className="mt-3 font-display text-lg sm:text-xl font-semibold text-stone-900 tracking-tight">
                        {pro.price} <span className="font-body text-xs sm:text-sm font-normal text-stone-500">onwards</span>
                      </div>
                    </div>

                    {/* View Profile Button */}
                    <button
                      onClick={() => onSelectProvider(matchedPro)}
                      className="w-full py-3 rounded-full bg-stone-100 hover:bg-stone-900 text-stone-800 hover:text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all border border-stone-200 hover:border-stone-900 shadow-xs"
                    >
                      <span>View Profile</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. EXCLUSIVE PROMOTIONAL OFFER BANNER - ENLARGED */}
        <section className="relative rounded-3xl overflow-hidden min-h-[280px] sm:min-h-[320px] border border-[#1F1F24] p-8 sm:p-12 lg:p-14 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          {/* Warm Living Room Couch Background */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url('/images/promo-living-room.jpg')` }}
          />

          {/* Left dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/30 pointer-events-none" />

          {/* Offer Text */}
          <div className="relative z-10 max-w-xl">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-300">
              EXCLUSIVE OFFERS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-white mt-3 leading-[1.08] tracking-tightest">
              Get 20% OFF<br /><span className="italic font-normal">on your first service</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-200 mt-3 leading-relaxed max-w-lg">
              Book any top-rated professional and receive instant savings at checkout.
            </p>

            <button
              onClick={onOpenOffers}
              className="mt-6 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#EDE8DF] hover:bg-white text-zinc-900 text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95"
            >
              <span>Explore Offers</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Right Promo Code Badge */}
          <div className="relative z-10 shrink-0">
            <div className="px-6 py-4 rounded-2xl bg-black/65 backdrop-blur-md border border-white/20 text-center shadow-lg">
              <div className="text-xs text-zinc-300 uppercase tracking-wider font-medium">
                Use code
              </div>
              <div className="text-base sm:text-lg font-mono font-bold text-white tracking-widest mt-1">
                WELCOME20
              </div>
            </div>
          </div>
        </section>

        {/* 5. WHY CHOOSE WORKSY? */}
        <section>
          <p className="text-[12px] uppercase tracking-[0.2em] font-semibold text-stone-500">
            Worksy Standard
          </p>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl font-medium text-stone-900 tracking-tightest mb-6">
            Why Choose <span className="italic font-normal">Worksy?</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            {/* Feature 1 */}
            <div className="relative flex flex-col items-start gap-4 p-6 sm:p-7 rounded-3xl bg-white border border-[#DCD6C9] shadow-xs group hover:border-stone-400 transition-colors">
              <span className="absolute top-5 right-5 font-display text-sm italic text-stone-400">01</span>
              <div className="w-12 h-12 rounded-2xl border border-stone-200 bg-stone-100 flex items-center justify-center text-stone-800">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="font-display text-lg font-medium text-stone-900 tracking-tight">Trusted Professionals</h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">Verified &amp; background checked</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative flex flex-col items-start gap-4 p-6 sm:p-7 rounded-3xl bg-white border border-[#DCD6C9] shadow-xs group hover:border-stone-400 transition-colors">
              <span className="absolute top-5 right-5 font-display text-sm italic text-stone-400">02</span>
              <div className="w-12 h-12 rounded-2xl border border-stone-200 bg-stone-100 flex items-center justify-center text-stone-800">
                <CreditCard size={22} />
              </div>
              <div>
                <h3 className="font-display text-lg font-medium text-stone-900 tracking-tight">Transparent Pricing</h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">No hidden charges</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative flex flex-col items-start gap-4 p-6 sm:p-7 rounded-3xl bg-white border border-[#DCD6C9] shadow-xs group hover:border-stone-400 transition-colors">
              <span className="absolute top-5 right-5 font-display text-sm italic text-stone-400">03</span>
              <div className="w-12 h-12 rounded-2xl border border-stone-200 bg-stone-100 flex items-center justify-center text-stone-800">
                <Calendar size={22} />
              </div>
              <div>
                <h3 className="font-display text-lg font-medium text-stone-900 tracking-tight">Easy Booking</h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">In just a few clicks</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="relative flex flex-col items-start gap-4 p-6 sm:p-7 rounded-3xl bg-white border border-[#DCD6C9] shadow-xs group hover:border-stone-400 transition-colors">
              <span className="absolute top-5 right-5 font-display text-sm italic text-stone-400">04</span>
              <div className="w-12 h-12 rounded-2xl border border-stone-200 bg-stone-100 flex items-center justify-center text-stone-800">
                <MessageCircle size={22} />
              </div>
              <div>
                <h3 className="font-display text-lg font-medium text-stone-900 tracking-tight">Customer Support</h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">Always here to help</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. RECENTLY VIEWED - ENLARGED IMAGE CARDS */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 lg:p-12 border border-[#DCD6C9] shadow-sm text-stone-900">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-[12px] uppercase tracking-[0.2em] font-semibold text-stone-500">
                Recent Activity
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl md:text-4xl font-medium text-stone-900 tracking-tightest">
                Popular <span className="italic font-normal">Services</span>
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('explore')}
              className="text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1.5 transition-colors group"
            >
              <span>View All</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            {recentlyViewedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectCategory(item.categoryId)}
                className="cursor-pointer group flex flex-col"
              >
                <div className="relative aspect-[16/11] sm:h-56 w-full rounded-2xl overflow-hidden bg-stone-100 border border-[#DCD6C9] shadow-xs">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/45 backdrop-blur-md text-white hover:text-rose-400 transition-colors"
                  >
                    <Heart size={15} />
                  </button>
                </div>
                <h3 className="font-display font-medium text-stone-900 text-lg tracking-tight mt-3 truncate group-hover:text-black">
                  {item.title}
                </h3>
                <div className="font-display text-base font-semibold text-stone-900 mt-1">
                  {item.price}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
