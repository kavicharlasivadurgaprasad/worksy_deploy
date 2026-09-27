'use client';

import React, { useState } from 'react';
import {
  X,
  Star,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Check,
  ChevronDown,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { ServiceItem, ServiceAddon, Provider } from '@/lib/marketplace-data';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onBookNow: (service: ServiceItem, selectedAddons: ServiceAddon[]) => void;
  providers: Provider[];
  onSelectProvider: (provider: Provider) => void;
}

function ServiceDetailModalContent({
  service,
  onClose,
  onBookNow,
  providers,
  onSelectProvider
}: ServiceDetailModalProps) {
  // Never true at runtime: the exported wrapper only renders this when service is set.
  // Kept so TypeScript narrows the prop; it stops hooks below from being skipped on close.
  if (!service) return null;

  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedAddons = service.addons.filter((a) =>
    selectedAddonIds.includes(a.id)
  );

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = service.price + addonsTotal;

  // Matching providers for this service category
  const matchingPros = providers.filter(
    (p) => p.categoryId === service.categoryId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header with image */}
        <div className="relative h-48 sm:h-56 w-full bg-stone-100 shrink-0">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
          >
            <X size={18} />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
              {service.category}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-medium leading-tight tracking-tightest">
              {service.title}
            </h2>
            <div className="flex items-center gap-3 text-xs mt-1">
              <span className="flex items-center gap-1 font-bold text-amber-300">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                {service.rating} ({service.reviewsCount} reviews)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {service.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-1">Service Description</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* What's Included */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-stone-500">
              What&apos;s Included in Standard Service
            </h3>
            <div className="space-y-2">
              {service.included.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {service.excluded && service.excluded.length > 0 && (
              <div className="pt-2 border-t border-stone-200/80 space-y-1">
                <div className="text-[11px] font-bold text-stone-400 uppercase">Not Included</div>
                {service.excluded.map((item, idx) => (
                  <div key={idx} className="text-xs text-stone-500">
                    • {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add-ons Selector */}
          {service.addons.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900">Recommended Add-ons</h3>
                <span className="text-[11px] text-stone-500">Optional add-ons for full protection</span>
              </div>

              <div className="space-y-2.5">
                {service.addons.map((addon) => {
                  const isSelected = selectedAddonIds.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-black bg-stone-50 shadow-sm'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-stone-900">
                          {addon.name}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {addon.description}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-xs sm:text-sm font-bold text-stone-900">
                          +₹{addon.price}
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                            isSelected ? 'bg-black text-white' : 'border border-stone-300 text-stone-400'
                          }`}
                        >
                          {isSelected ? <Check size={14} /> : <Plus size={14} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Providers Offering this */}
          {matchingPros.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900">Top Rated Providers for this Service</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchingPros.slice(0, 2).map((pro) => (
                  <div
                    key={pro.id}
                    onClick={() => {
                      onClose();
                      onSelectProvider(pro);
                    }}
                    className="p-3 rounded-xl border border-stone-200 hover:border-black cursor-pointer transition-all flex items-center gap-3 bg-stone-50/50"
                  >
                    <img
                      src={pro.avatar}
                      alt={pro.name}
                      className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-stone-900 truncate">{pro.name}</div>
                      <div className="text-[10px] text-stone-500">
                        ⭐ {pro.rating} • {pro.distanceKm} km away
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs Accordion */}
          {service.faqs.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-stone-900">Frequently Asked Questions</h3>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl p-3">
                {service.faqs.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={idx} className="py-2.5 first:pt-0 last:pb-0">
                      <button
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left text-xs font-semibold text-stone-800"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown size={14} className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <p className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancellation Policy */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <Info size={15} className="shrink-0 mt-0.5 text-amber-700" />
            <div>
              <span className="font-bold">Cancellation Policy: </span>
              {service.cancellationPolicy}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Booking Bar */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400">Total Payable</div>
            <div className="text-2xl font-display font-semibold text-stone-900 tracking-tight">
              ₹{totalPrice}
              {addonsTotal > 0 && (
                <span className="text-xs font-normal text-stone-500 ml-1.5 font-body">
                  (incl. ₹{addonsTotal} add-ons)
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onBookNow(service, selectedAddons)}
            className="px-6 py-3 rounded-2xl bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md active:scale-95"
          >
            Proceed to Book
          </button>
        </div>
      </div>
    </div>
  );
}

/** Wrapper: returns early BEFORE any hook runs (closing the modal used to change the hook count and crash React). */
export default function ServiceDetailModal(props: ServiceDetailModalProps) {
  if (!props.service) return null;
  return <ServiceDetailModalContent key={props.service.id} {...props} />;
}
