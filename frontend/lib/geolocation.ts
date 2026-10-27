'use client';

/**
 * Browser location helpers for the nearby-providers feature.
 *
 * Privacy: coordinates live only in React state for the current session. They are never written to
 * localStorage and are sent to the backend only as query parameters of a nearby search. They are
 * rounded to 4 decimals (~11 m) before use, which is plenty for a "providers near me" search.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/** Where the customer is searching from. NOT the service address - that is confirmed in the booking flow. */
export interface SearchLocation {
  latitude: number;
  longitude: number;
  label: string;
  /** gps = browser location, search = place picked from the location search (verified), locality = built-in approximate list. */
  source: 'gps' | 'search' | 'locality';
}

export type GeoErrorKind = 'unsupported' | 'insecure' | 'denied' | 'unavailable' | 'timeout';
export interface GeoError { kind: GeoErrorKind; message: string }
export interface GeoPosition { latitude: number; longitude: number; accuracyM: number }
export type GeoStatus = 'idle' | 'loading' | 'success' | 'error';

const ERROR_MESSAGES: Record<GeoErrorKind, string> = {
  unsupported: 'Your browser does not support location access. Please type a location to search instead.',
  insecure: 'Location access needs a secure (HTTPS) connection. Please type a location to search instead.',
  denied: 'Location permission was denied. Allow it in your browser settings, or type a location to search instead.',
  unavailable: 'We could not determine your location. Please try again or type a location to search instead.',
  timeout: 'Getting your location took too long. Please try again or type a location to search instead.',
};

export const roundCoord = (n: number) => Math.round(n * 10000) / 10000;

export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [error, setError] = useState<GeoError | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  /** Asks the browser for the current position (this is what triggers the permission prompt). Resolves null on failure. */
  const request = useCallback(
    () =>
      new Promise<GeoPosition | null>((resolve) => {
        const fail = (kind: GeoErrorKind) => {
          if (mounted.current) {
            setStatus('error');
            setError({ kind, message: ERROR_MESSAGES[kind] });
          }
          resolve(null);
        };

        if (typeof window === 'undefined' || !('geolocation' in navigator)) return fail('unsupported');
        if (!window.isSecureContext) return fail('insecure');

        setStatus('loading');
        setError(null);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (mounted.current) setStatus('success');
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracyM: pos.coords.accuracy,
            });
          },
          (err) =>
            fail(err.code === err.PERMISSION_DENIED ? 'denied' : err.code === err.TIMEOUT ? 'timeout' : 'unavailable'),
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      }),
    []
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, request, reset };
}

/**
 * APPROXIMATE centre points of the localities offered in the location picker (popularLocations),
 * used only as the manual fallback when GPS is unavailable. Keys must match popularLocations exactly.
 * Accuracy is roughly neighbourhood level, so distances from these points are indicative only.
 */
export const LOCALITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  'Indiranagar, Bangalore': { latitude: 12.9784, longitude: 77.6408 },
  'Koramangala, Bangalore': { latitude: 12.9352, longitude: 77.6245 },
  'HSR Layout, Bangalore': { latitude: 12.9116, longitude: 77.6389 },
  'Whitefield, Bangalore': { latitude: 12.9698, longitude: 77.75 },
  'Jayanagar, Bangalore': { latitude: 12.925, longitude: 77.5938 },
  'Bandra West, Mumbai': { latitude: 19.0596, longitude: 72.8295 },
  'Andheri West, Mumbai': { latitude: 19.1364, longitude: 72.8296 },
  'Powai, Mumbai': { latitude: 19.1176, longitude: 72.906 },
};

/** Converts a place picked from the location search into the SearchLocation the nearby search uses. */
export function placeToSearchLocation(place: { latitude: number; longitude: number; label: string }): SearchLocation {
  return {
    latitude: roundCoord(place.latitude),
    longitude: roundCoord(place.longitude),
    label: place.label,
    source: 'search',
  };
}

export function localityToSearchLocation(name: string): SearchLocation | null {
  const c = LOCALITY_COORDINATES[name];
  return c ? { latitude: c.latitude, longitude: c.longitude, label: name, source: 'locality' } : null;
}
