'use client';

import React from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  Briefcase,
  CheckCircle2,
  Calendar,
  Heart,
  Share2
} from 'lucide-react';
import { Provider } from '@/lib/marketplace-data';

interface ProviderProfileModalProps {
  provider: Provider | null;
  onClose: () => void;
  onBookNow: (provider: Provider) => void;
  onMessage: (provider: Provider) => void;
  isFavorite: boolean;
  onToggleFavorite: (providerId: string) => void;
}

export default function ProviderProfileModal({
  provider,
  onClose,
  onBookNow,
  onMessage,
  isFavorite,
  onToggleFavorite
}: ProviderProfileModalProps) {
  if (!provider) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Banner Cover & Avatar */}
        <div className="relative h-44 sm:h-52 w-full bg-stone-100 shrink-0">
          <img
            src={provider.coverImage}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(provider.id)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isFavorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-black/60 text-white hover:bg-black'
              }`}
            >
              <Heart size={16} className={isFavorite ? 'fill-white' : ''} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Provider Avatar & Main Info */}
          <div className="absolute -bottom-8 left-6 flex items-end gap-4">
            <div className="relative">
              <img
                src={provider.avatar}
                alt={provider.name}
                className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-lg bg-white"
              />
              {provider.verified && (
                <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white" title="Verified Pro">
                  <ShieldCheck size={14} />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto pt-10 p-6 space-y-6">
          {/* Header text */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tightest text-stone-900">
                {provider.name}
              </h2>
              {provider.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {provider.badge}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {provider.tagline}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="flex items-center justify-center gap-1 text-sm sm:text-base font-display font-medium text-stone-900">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>{provider.rating}</span>
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5">{provider.reviewsCount} reviews</div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="text-sm sm:text-base font-display font-medium text-stone-900">{provider.completedJobs}+</div>
              <div className="text-[10px] text-stone-500 mt-0.5">Jobs Done</div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="text-sm sm:text-base font-display font-medium text-stone-900">{provider.experienceYears} Years</div>
              <div className="text-[10px] text-stone-500 mt-0.5">Experience</div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="text-sm sm:text-base font-display font-semibold text-emerald-800">₹{provider.basePrice}</div>
              <div className="text-[10px] text-stone-500 mt-0.5">Min Charge</div>
            </div>
          </div>

          {/* Service Area & Availability Strip */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs text-stone-700">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-rose-500 shrink-0" />
              <span><strong>Service Area:</strong> {provider.serviceArea} ({provider.distanceKm} km away)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-amber-600 shrink-0" />
              <span><strong>Response Time:</strong> {provider.responseTime} • {provider.availability}</span>
            </div>
          </div>

          {/* Services Offered */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-stone-900">Services Offered</h3>
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
              {provider.servicesOffered.map((srv, idx) => (
                <div
                  key={idx}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-800">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>{srv.title}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-stone-900">
                    ₹{srv.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Work Gallery */}
          {provider.portfolio.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900">Recent Job Photos & Portfolio</h3>
              <div className="grid grid-cols-3 gap-2.5">
                {provider.portfolio.map((img, idx) => (
                  <div key={idx} className="h-24 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                    <img
                      src={img}
                      alt="Work sample"
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">Verified Customer Reviews</h3>
              <span className="text-xs text-stone-500">⭐ {provider.rating} of 5</span>
            </div>

            <div className="space-y-3">
              {provider.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.avatar}
                        alt={rev.customerName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold text-stone-900">{rev.customerName}</div>
                        <div className="text-[10px] text-stone-400">{rev.date} • {rev.service}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Footer Buttons: [Book Now] [Message] */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onMessage(provider);
            }}
            className="flex-1 py-3 px-4 rounded-2xl border border-stone-300 text-stone-800 text-xs font-bold hover:bg-stone-50 flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare size={15} />
            <span>Message Pro</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onBookNow(provider);
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md active:scale-95 text-center"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
