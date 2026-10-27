'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MapPin, Navigation, Search, X } from 'lucide-react';
import { api, ApiError, ApiGeocodeResult } from '@/lib/api';
import { mapProvider } from '@/lib/mappers';
import { Provider, ServiceCategory, ServiceItem } from '@/lib/marketplace-data';
import { SearchLocation, placeToSearchLocation, roundCoord, useGeolocation } from '@/lib/geolocation';
import PlaceSearch from '@/components/shared/PlaceSearch';

const RADIUS_OPTIONS = [5, 10, 20, 30];

interface NearbyProvidersPanelProps {
  categories: ServiceCategory[];
  services: ServiceItem[];
  /** Explore tab's category filter ('all' or a category id). A category is required for a nearby search. */
  selectedCategoryId: string;
  searchLocation: SearchLocation | null;
  onSearchLocationChange: (loc: SearchLocation) => void;
  /** null = nearby mode off (show the normal list); an array (possibly empty) = nearby results. */
  onResults: (providers: Provider[] | null) => void;
}

/**
 * "Find available providers near a location": the customer TYPES a location (city, locality, address or
 * PIN code), picks the correct match, chooses a radius and presses "Find Available Providers".
 *
 *   typed text -> backend geocoding (GET /geocode/search) -> verified lat/lng -> GET /providers/nearby
 *
 * GPS is optional ("Use my current location") and never required. The location chosen here is only the SEARCH
 * location; the service address is still chosen and confirmed by the customer in the booking flow.
 */
export default function NearbyProvidersPanel({
  categories,
  services,
  selectedCategoryId,
  searchLocation,
  onSearchLocationChange,
  onResults,
}: NearbyProvidersPanelProps) {
  const geo = useGeolocation();
  const [radius, setRadius] = useState(10);
  // The place the customer has picked but not searched with yet. Only "Find Available Providers" applies it.
  const [draft, setDraft] = useState<SearchLocation | null>(searchLocation);
  const [draftPlaceId, setDraftPlaceId] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'searching' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);
  const [attempt, setAttempt] = useState(0);

  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;

  const category = categories.find((c) => c.id === selectedCategoryId);

  // A location chosen elsewhere (header location picker) becomes the draft here too.
  useEffect(() => {
    if (searchLocation) {
      setDraft(searchLocation);
      setDraftPlaceId(null);
    }
  }, [searchLocation]);

  useEffect(() => {
    if (!active || !searchLocation) return;
    if (!category) {
      setPhase('idle');
      onResultsRef.current(null);
      return;
    }
    let cancelled = false;
    setPhase('searching');
    setError('');
    onResultsRef.current([]);
    api
      .getNearbyProviders({
        latitude: roundCoord(searchLocation.latitude),
        longitude: roundCoord(searchLocation.longitude),
        radiusKm: radius,
        category: category.name,
      })
      .then((rows) => {
        if (cancelled) return;
        const mapped = rows.map((r) => mapProvider(r, categories, services));
        setCount(mapped.length);
        setPhase('done');
        onResultsRef.current(mapped);
      })
      .catch((e) => {
        if (cancelled) return;
        setPhase('error');
        setError(e instanceof ApiError || e instanceof Error ? e.message : 'Could not load nearby providers.');
        onResultsRef.current([]);
      });
    return () => {
      cancelled = true;
    };
    // `category` is derived from categories + selectedCategoryId, so those are the real dependencies.
  }, [active, searchLocation, selectedCategoryId, radius, attempt, categories, services]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlaceSelected = (place: ApiGeocodeResult) => {
    geo.reset();
    setDraft(placeToSearchLocation(place));
    setDraftPlaceId(place.id);
  };

  const handleUseMyLocation = async () => {
    const pos = await geo.request();
    if (!pos) return;
    setDraft({
      latitude: roundCoord(pos.latitude),
      longitude: roundCoord(pos.longitude),
      label: 'Current location',
      source: 'gps',
    });
    setDraftPlaceId(null);
  };

  /** "Find Available Providers": applies the picked location and runs the search (re-runs it if nothing changed). */
  const handleFind = () => {
    if (!draft || !category) return;
    if (draft !== searchLocation) onSearchLocationChange(draft);
    else setAttempt((a) => a + 1);
    setActive(true);
  };

  const clear = () => {
    setActive(false);
    setPhase('idle');
    setError('');
    onResultsRef.current(null);
  };

  const nextRadius = RADIUS_OPTIONS.find((r) => r > radius);
  const needsCategory = !category;
  const canFind = !!draft && !needsCategory && phase !== 'searching';

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
            <MapPin size={18} className="text-amber-500" /> Find available providers near a location
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Enter any city, area, address or PIN code, pick the correct match, then search. Location access on your
            device is not needed. Distances are measured from the place you pick; you will confirm your service
            address when you book.
          </p>
        </div>
        {active && (
          <button
            onClick={clear}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
          >
            <X size={12} /> Show all providers
          </button>
        )}
      </div>

      <PlaceSearch onSelect={handlePlaceSelected} selectedId={draftPlaceId} />

      {draft && (
        <div className="flex items-start gap-2 text-xs sm:text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl p-3">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>
            Searching from <strong>{draft.label}</strong>
            {draft.source === 'gps' && ' (your device location)'}
            {draft.source === 'locality' && ' (approximate centre of the locality)'}
            {draft.source === 'search' && ' (location found from your search)'}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="px-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none focus:border-black"
          aria-label="Search radius"
        >
          {RADIUS_OPTIONS.map((r) => (
            <option key={r} value={r}>
              Within {r} km
            </option>
          ))}
        </select>

        <button
          onClick={handleFind}
          disabled={!canFind}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {phase === 'searching' ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Find Available Providers
        </button>

        <button
          onClick={handleUseMyLocation}
          disabled={geo.status === 'loading'}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-60 sm:ml-auto"
        >
          {geo.status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
          {geo.status === 'loading' ? 'Getting your location…' : 'Use my current location instead (optional)'}
        </button>
      </div>

      {/* Status area */}
      {geo.error && (
        <div className="flex items-start gap-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{geo.error.message}</span>
        </div>
      )}

      {needsCategory && (
        <div className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-3">
          Choose a service category (for example Plumbing) in the category filter above to search nearby.
        </div>
      )}

      {!needsCategory && !draft && !active && (
        <div className="text-xs text-stone-500">
          Search for a location above to find {category?.name} providers near it.
        </div>
      )}

      {active && searchLocation && !needsCategory && phase === 'searching' && (
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600">
          <Loader2 size={15} className="animate-spin" /> Searching for {category?.name} providers within {radius} km of{' '}
          {searchLocation.label}…
        </div>
      )}

      {active && phase === 'done' && !needsCategory && searchLocation && (
        <div className="text-xs sm:text-sm text-stone-700">
          {count > 0 ? (
            <>
              <strong>{count}</strong> available {category?.name} provider{count === 1 ? '' : 's'} within {radius} km of{' '}
              <strong>{searchLocation.label}</strong>
              {searchLocation.source === 'locality' ? ' (approximate centre of the locality)' : ''}, nearest first.
            </>
          ) : (
            <div className="rounded-xl bg-stone-50 border border-stone-200 p-4 space-y-3">
              <div className="font-bold text-stone-900">
                No available {category?.name} providers within {radius} km of {searchLocation.label}.
              </div>
              <p className="text-xs text-stone-500">
                Only providers who are currently accepting bookings and have set their service location are shown.
              </p>
              <div className="flex flex-wrap gap-2">
                {nextRadius ? (
                  <button
                    onClick={() => setRadius(nextRadius)}
                    className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-stone-800"
                  >
                    Expand search to {nextRadius} km
                  </button>
                ) : (
                  <span className="text-xs text-stone-500">
                    This is the widest search. Try another category or location.
                  </span>
                )}
                <button
                  onClick={clear}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-white"
                >
                  Browse all providers
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {active && phase === 'error' && (
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3">
          <AlertCircle size={14} className="shrink-0" />
          <span className="flex-1 min-w-0">{error}</span>
          <button
            onClick={() => setAttempt((a) => a + 1)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
