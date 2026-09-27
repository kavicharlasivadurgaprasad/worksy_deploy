'use client';

import React, { useState } from 'react';
import { X, Tag, Sparkles, CheckCircle2, Calendar, Percent } from 'lucide-react';
import { ProviderOffer } from '@/lib/provider-data';

interface CreateOfferModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onOfferCreated: (offer: ProviderOffer) => void;
}

export default function CreateOfferModal({
  isOpen = true,
  onClose,
  onOfferCreated
}: CreateOfferModalProps) {
  const [title, setTitle] = useState('');
  const [discountValue, setDiscountValue] = useState('20');
  const [category, setCategory] = useState('AC Care');
  const [validUntil, setValidUntil] = useState('30 Sep 2026');
  const [maxBookings, setMaxBookings] = useState('50');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newOffer: ProviderOffer = {
      id: `off-${Date.now()}`,
      title: title.trim(),
      discountPercentage: parseInt(discountValue, 10) || 20,
      validUntil: validUntil || '30 Sep 2026',
      maxBookings: parseInt(maxBookings, 10) || 50,
      usedBookings: 0,
      applicableCategory: category,
      status: 'Active'
    };

    onOfferCreated(newOffer);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-stone-900">
                Create New Promotion
              </h3>
              <p className="text-xs text-stone-500">Boost your booking volume with targeted offers</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Promotion Title
            </label>
            <input
              type="text"
              placeholder="e.g. Weekend Monsoon AC Tune-up"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Discount Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="20"
                  min="5"
                  max="50"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-800"
              >
                <option value="AC Care">AC Care</option>
                <option value="Electrical">Electrical</option>
                <option value="All Services">All Services</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="30 Sep 2026"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Max Redemptions
              </label>
              <input
                type="number"
                placeholder="50"
                value={maxBookings}
                onChange={(e) => setMaxBookings(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium text-xs shadow-md active:scale-[0.99] transition-all cursor-pointer"
            >
              Launch Promotion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { CreateOfferModal };
