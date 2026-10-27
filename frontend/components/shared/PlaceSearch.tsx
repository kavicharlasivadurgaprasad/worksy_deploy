'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MapPin, Search } from 'lucide-react';
import { api, ApiError, ApiGeocodeResult } from '@/lib/api';

/**
 * Type a city, town, locality, address or 6-digit PIN code -> pick the right place from the results.
 *
 * - Searches only when the user presses "Search" or Enter (never on every keystroke): the public
 *   OpenStreetMap geocoder forbids auto-complete-as-you-type, and the backend enforces 1 request/second.
 * - The backend (GET /geocode/search) does the geocoding. This component never invents coordinates:
 *   only a place the user explicitly picks from real results is passed to onSelect.
 * - Results of identical searches are remembered for this browser tab (memory only) to avoid repeat calls.
 * - Safe inside a <form>: it renders no nested form and its buttons are type="button".
 */
interface PlaceSearchProps {
  onSelect: (place: ApiGeocodeResult) => void;
  /** Highlights the place the parent currently holds as selected. */
  selectedId?: string | null;
  placeholder?: string;
  initialQuery?: string;
}

type Phase = 'idle' | 'loading' | 'results' | 'empty' | 'error';

const sessionCache = new Map<string, ApiGeocodeResult[]>();
const MIN_LENGTH = 3;

export default function PlaceSearch({
  onSelect,
  selectedId = null,
  placeholder = 'Type a city, area, address or PIN code',
  initialQuery = '',
}: PlaceSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<ApiGeocodeResult[]>([]);
  const [error, setError] = useState('');
  const [chosenId, setChosenId] = useState<string | null>(selectedId);
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => { setChosenId(selectedId); }, [selectedId]);

  const choose = (place: ApiGeocodeResult) => {
    setChosenId(place.id);
    onSelect(place);
  };

  const run = async () => {
    const q = query.trim().replace(/\s+/g, ' ');
    if (q.length < MIN_LENGTH) {
      setPhase('error');
      setError(`Enter at least ${MIN_LENGTH} characters of a place name or PIN code.`);
      setResults([]);
      return;
    }
    const key = q.toLowerCase();
    const id = ++requestId.current;
    setError('');

    const cached = sessionCache.get(key);
    if (cached) {
      showResults(cached);
      return;
    }

    setPhase('loading');
    try {
      const found = await api.geocodeSearch(q);
      if (!mounted.current || id !== requestId.current) return; // a newer search replaced this one
      sessionCache.set(key, found);
      showResults(found);
    } catch (e) {
      if (!mounted.current || id !== requestId.current) return;
      setResults([]);
      setPhase('error');
      setError(
        e instanceof ApiError || e instanceof Error
          ? e.message
          : 'Could not search for that location. Please try again.'
      );
    }
  };

  const showResults = (found: ApiGeocodeResult[]) => {
    setResults(found);
    if (found.length === 0) {
      setPhase('empty');
      return;
    }
    setPhase('results');
    // Exactly one match: nothing to disambiguate, so select it (the user can still search again).
    if (found.length === 1) choose(found[0]);
  };

  return (
    <div className="space-y-2.5 min-w-0">
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            maxLength={200}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void run();
              }
            }}
            placeholder={placeholder}
            aria-label="Search for a location"
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm font-semibold text-stone-800 placeholder:font-normal focus:outline-none focus:border-black"
          />
        </div>
        <button
          type="button"
          onClick={() => void run()}
          disabled={phase === 'loading'}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-stone-300 bg-white text-xs sm:text-sm font-bold text-stone-800 hover:bg-stone-50 disabled:opacity-60"
        >
          {phase === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Search
        </button>
      </div>

      {phase === 'loading' && (
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
          <Loader2 size={14} className="animate-spin" /> Looking up that location…
        </div>
      )}

      {phase === 'empty' && (
        <div className="flex items-start gap-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-3">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>
            We couldn&apos;t find that location. Check the spelling, or add the district or state (for example
            &ldquo;Madanapalle, Andhra Pradesh&rdquo;), or search by 6-digit PIN code.
          </span>
        </div>
      )}

      {phase === 'error' && (
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3">
          <AlertCircle size={14} className="shrink-0" />
          <span className="flex-1 min-w-0">{error}</span>
          {query.trim().length >= MIN_LENGTH && (
            <button
              type="button"
              onClick={() => void run()}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {phase === 'results' && results.length > 1 && (
        <p className="text-[11px] font-semibold text-stone-500">
          {results.length} places match. Choose the correct one:
        </p>
      )}

      {phase === 'results' && (
        <ul className="space-y-1.5 max-h-64 overflow-y-auto" role="listbox" aria-label="Matching places">
          {results.map((place) => {
            const selected = place.id === chosenId;
            return (
              <li key={place.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => choose(place)}
                  className={`w-full flex items-start gap-2.5 text-left p-3 rounded-xl border transition-colors ${
                    selected
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {selected ? (
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-amber-400" />
                  ) : (
                    <MapPin size={15} className="mt-0.5 shrink-0 text-stone-400" />
                  )}
                  <span className="min-w-0">
                    <span className="block text-xs sm:text-sm font-bold truncate">{place.label}</span>
                    <span className={`block text-[11px] ${selected ? 'text-stone-300' : 'text-stone-500'}`}>
                      {place.displayName}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
