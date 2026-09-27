'use client';

import React, { useState } from 'react';
import {
  Gift,
  Plus,
  Percent,
  Calendar,
  Sparkles,
  Users,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { ProviderOffer, initialOffers } from '@/lib/provider-data';

interface OffersTabProps {
  onOpenCreateOfferModal: () => void;
  offers: ProviderOffer[];
}

export default function OffersTab({ onOpenCreateOfferModal, offers }: OffersTabProps) {
  return (
    <div className="space-y-8 pb-24 w-full max-w-[1840px] 2xl:max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-500">
            Promotions &amp; Growth
          </p>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tightest text-stone-900 leading-tight">
            Special <span className="italic font-normal">Offers</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-1 leading-relaxed">
            Create custom seasonal discounts to attract new neighborhood clients and fill quiet weekday slots.
          </p>
        </div>

        <button
          onClick={onOpenCreateOfferModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* Offers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {offers.map((off) => (
          <div
            key={off.id}
            className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/90 hover:shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center justify-center font-bold text-lg shrink-0">
                  <Percent size={20} />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {off.status}
                </span>
              </div>

              <div className="mt-4">
                <span className="text-xs font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                  {off.discountPercentage}% OFF
                </span>
                <h3 className="font-display font-medium text-stone-900 text-xl tracking-tight mt-2">
                  {off.title}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Applicable for: <strong>{off.applicableCategory}</strong>
                </p>
              </div>

              {/* Progress & Utilization */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Redemptions</span>
                  <span className="font-bold text-stone-900">
                    {off.usedBookings} of {off.maxBookings} bookings
                  </span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    style={{ width: `${(off.usedBookings / off.maxBookings) * 100}%` }}
                    className="h-full bg-amber-400 rounded-full"
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
                <Calendar size={13} className="text-stone-400" />
                <span>Valid until <strong>{off.validUntil}</strong></span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">Auto-applies at customer checkout</span>
              <button
                onClick={() => alert(`Offer "${off.title}" shared link copied to clipboard!`)}
                className="font-bold text-black hover:underline"
              >
                Share Link →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
