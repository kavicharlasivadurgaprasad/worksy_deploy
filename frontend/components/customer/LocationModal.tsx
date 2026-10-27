'use client';

import React, { useState } from 'react';
import {
  X,
  MapPin,
  Search,
  Check,
  Navigation,
  Loader2
} from 'lucide-react';
import { popularLocations } from '@/lib/marketplace-data';
import { SearchLocation, localityToSearchLocation, placeToSearchLocation, roundCoord, useGeolocation } from '@/lib/geolocation';
import PlaceSearch from '@/components/shared/PlaceSearch';
import type { ApiGeocodeResult } from '@/lib/api';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (loc: string) => void;
  /** Called with coordinates (GPS, or a known locality's approximate centre) so nearby search can use them. */
  onSelectSearchLocation?: (loc: SearchLocation) => void;
}

function LocationModalContent({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  onSelectSearchLocation
}: LocationModalProps) {
  // Never true at runtime: the exported wrapper only renders this when isOpen is set.
  // Kept so TypeScript narrows the prop; it stops hooks below from being skipped on close.
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const geo = useGeolocation();

  const handleUseCurrentLocation = async () => {
    const pos = await geo.request();
    if (!pos) return;
    onSelectSearchLocation?.({
      latitude: roundCoord(pos.latitude),
      longitude: roundCoord(pos.longitude),
      label: 'Current location',
      source: 'gps'
    });
    onClose();
  };

  /** A place the customer typed and picked: its verified coordinates become the nearby-search location. */
  const handlePlaceSelected = (place: ApiGeocodeResult) => {
    onSelectLocation(place.label);
    onSelectSearchLocation?.(placeToSearchLocation(place));
    onClose();
  };

  const filtered = popularLocations.filter((loc) =>
    loc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
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

        {/* Any city, area, address or PIN code (verified through the backend geocoder) */}
        {onSelectSearchLocation && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-stone-700">Search any city, area, address or PIN code</p>
            <PlaceSearch onSelect={handlePlaceSelected} placeholder="e.g. Madanapalle, Andhra Pradesh or 517325" />
          </div>
        )}

        {/* Filter the popular localities below */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter popular localities (e.g. Indiranagar, Bandra)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-100 text-xs text-stone-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Current location (permission-based; used only to find nearby providers) */}
        {onSelectSearchLocation && (
          <div className="space-y-1.5">
            <button
              onClick={handleUseCurrentLocation}
              disabled={geo.status === 'loading'}
              className="w-full p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-left bg-stone-100 hover:bg-stone-200 text-stone-900 disabled:opacity-60 transition-colors"
            >
              {geo.status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
              {geo.status === 'loading' ? 'Getting your location…' : 'Use my current location'}
            </button>
            {geo.error ? (
              <p className="text-[11px] font-semibold text-rose-700">{geo.error.message}</p>
            ) : (
              <p className="text-[11px] text-stone-500">
                Used only to find providers near you. You will confirm your service address when you book.
              </p>
            )}
          </div>
        )}

        {/* Popular Locations (approximate centres, used only when picked from this list) */}
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {filtered.map((loc) => {
            const isSelected = loc === currentLocation;
            return (
              <button
                key={loc}
                onClick={() => {
                  onSelectLocation(loc);
                  const coords = localityToSearchLocation(loc);
                  if (coords) onSelectSearchLocation?.(coords);
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
