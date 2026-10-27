'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, MapPin, Navigation } from 'lucide-react';
import { api, ApiError, ApiGeocodeResult, ApiProvider } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { roundCoord, useGeolocation } from '@/lib/geolocation';
import PlaceSearch from '@/components/shared/PlaceSearch';

/**
 * Lets a provider set their own service location (typed and picked from a search, or from the browser) and opt in to nearby bookings.
 * Only the owner can do this (PUT /users/{id}/provider-profile/location). Customers never see the
 * coordinates, only their distance from the provider.
 */
export default function ProviderLocationCard() {
  const { user } = useAuth();
  const geo = useGeolocation();
  const [profile, setProfile] = useState<ApiProvider | null>(null);
  const [pending, setPending] = useState<{ latitude: number; longitude: number; label?: string } | null>(null);
  const [radius, setRadius] = useState('15');
  const [accepting, setAccepting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api
      .getMyProviderProfile(user.id)
      .then((p) => {
        if (cancelled) return;
        setProfile(p);
        setAccepting(!!p.acceptingBookings);
        if (p.serviceRadiusKm) setRadius(String(p.serviceRadiusKm));
      })
      .catch(() => { /* the rest of the profile page already reports load problems */ });
    return () => { cancelled = true; };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasLocation = !!profile?.locationSet || !!pending;

  const captureLocation = async () => {
    setMsg(null);
    const pos = await geo.request();
    if (!pos) return;
    setPending({ latitude: roundCoord(pos.latitude), longitude: roundCoord(pos.longitude) });
  };

  /** A place the provider typed and picked: its verified coordinates and name become their service location. */
  const handlePlaceSelected = (place: ApiGeocodeResult) => {
    setMsg(null);
    setPending({ latitude: roundCoord(place.latitude), longitude: roundCoord(place.longitude), label: place.label });
  };

  const save = async () => {
    if (!user) return;
    const radiusNum = parseFloat(radius);
    if (!Number.isFinite(radiusNum) || radiusNum < 0.5 || radiusNum > 200) {
      setMsg({ ok: false, text: 'Service radius must be between 0.5 and 200 km.' });
      return;
    }
    if (accepting && !hasLocation) {
      setMsg({ ok: false, text: 'Set your service location before accepting bookings.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const updated = await api.updateProviderLocation(user.id, {
        ...(pending ? { latitude: pending.latitude, longitude: pending.longitude } : {}),
        // Keep the readable service area in step with a location picked from the search.
        ...(pending?.label ? { serviceArea: pending.label } : {}),
        serviceRadiusKm: radiusNum,
        acceptingBookings: accepting,
      });
      setProfile(updated);
      setPending(null);
      setMsg({ ok: true, text: 'Saved.' });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof ApiError || e instanceof Error ? e.message : 'Could not save.' });
    } finally {
      setBusy(false);
    }
  };

  if (!user || user.role !== 'provider' || !user.providerId) return null;

  return (
    <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
      <div>
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <MapPin size={18} className="text-amber-500" /> Service location &amp; availability
        </h2>
        <p className="text-xs text-stone-500 mt-1 max-w-2xl">
          Customers searching for nearby providers will only see you when you have set a location and turned on
          &ldquo;Accepting bookings&rdquo;. Your exact coordinates are never shown to customers, only your distance
          from them.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={captureLocation}
          disabled={geo.status === 'loading'}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 disabled:opacity-60"
        >
          {geo.status === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <Navigation size={15} />}
          {profile?.locationSet || pending ? 'Update from my current location' : 'Use my current location'}
        </button>
        <span className="text-xs font-semibold text-stone-600">
          {pending
            ? `New location${pending.label ? `: ${pending.label}` : ''}. Press Save to apply it.`
            : profile?.locationSet
              ? 'Location is set.'
              : 'No location set yet.'}
        </span>
      </div>
      {geo.error && <div className="text-xs font-semibold text-rose-700">{geo.error.message}</div>}

      <div className="space-y-2">
        <p className="text-xs font-bold text-stone-800">…or search for your service location</p>
        <PlaceSearch onSelect={handlePlaceSelected} placeholder="Your city, area or PIN code, e.g. Madanapalle" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs font-bold text-stone-800">How far will you travel? (km)</span>
          <input
            type="number"
            min={0.5}
            max={200}
            step={0.5}
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-black"
          />
        </label>
        <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer self-end">
          <input
            type="checkbox"
            checked={accepting}
            onChange={(e) => setAccepting(e.target.checked)}
            className="w-4 h-4 accent-black"
          />
          <div>
            <div className="text-xs font-bold text-stone-900">Accepting bookings</div>
            <div className="text-[11px] text-stone-500">Show me in nearby searches</div>
          </div>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className="px-6 py-2.5 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
        {msg && (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${msg.ok ? 'text-emerald-700' : 'text-rose-700'}`}>
            {msg.ok && <CheckCircle2 size={14} />}
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
