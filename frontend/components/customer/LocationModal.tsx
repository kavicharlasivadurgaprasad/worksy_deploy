'use client';

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Search,
  Check,
  Navigation
} from 'lucide-react';
import { popularLocations } from '@/lib/marketplace-data';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (loc: string) => void;
}

function LocationModalContent({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation
}: LocationModalProps) {
  // Never true at runtime: the exported wrapper only renders this when isOpen is set.
  // Kept so TypeScript narrows the prop; it stops hooks below from being skipped on close.
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  const filtered = popularLocations.filter((loc) =>
    loc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
        >
          <X size={16} />
        </button>

        <div>
          <h2 className="text-lg font-bold text-stone-900">Choose Service Location</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Prices and technician availability are tailored to your locality
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search locality (e.g. Indiranagar, Bandra)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-100 text-xs text-stone-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Popular Locations */}
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {filtered.map((loc) => {
            const isSelected = loc === currentLocation;
            return (
              <button
                key={loc}
                onClick={() => {
                  onSelectLocation(loc);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-semibold text-left transition-colors ${
                  isSelected
                    ? 'bg-black text-white'
                    : 'hover:bg-stone-50 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={14} className={isSelected ? 'text-amber-400' : 'text-stone-400'} />
                  <span>{loc}</span>
                </div>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper: returns early BEFORE any hook is called. Previously the early return sat above the
 * component's useState calls, so closing the modal changed the hook count and React threw
 * "Rendered fewer hooks than expected".
 */
export default function LocationModal(props: LocationModalProps) {
  if (!props.isOpen) return null;
  return <LocationModalContent {...props} />;
}
