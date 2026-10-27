'use client';

import React, { useEffect, useState } from 'react';
import { api, ApiCategory, ApiError, ApiGeocodeResult, ApiService } from '@/lib/api';
import { validatePriceInput } from '@/lib/price';
import { useAuth } from '@/lib/auth-context';
import { roundCoord, useGeolocation } from '@/lib/geolocation';
import PlaceSearch from '@/components/shared/PlaceSearch';

/**
 * A provider account has no provider_profiles row until this form is submitted
 * (POST /users/{id}/provider-profile). Bookings, jobs and reviews all hang off that row.
 */
export default function ProviderOnboarding() {
  const { user, refreshProviderProfile, logout } = useAuth();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('');
  const [experienceYears, setExperienceYears] = useState('0');
  const [serviceArea, setServiceArea] = useState('');
  // Services of the chosen category and the price the provider types for each (blank = not offered / not set).
  const [catalogue, setCatalogue] = useState<ApiService[]>([]);
  const [catalogueError, setCatalogueError] = useState('');
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [priceErrors, setPriceErrors] = useState<Record<number, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // Optional: capture the provider's own location now so they can appear in nearby searches later.
  const geo = useGeolocation();
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const captureLocation = async () => {
    const pos = await geo.request();
    if (pos) setCoords({ latitude: roundCoord(pos.latitude), longitude: roundCoord(pos.longitude) });
  };

  /** A place picked from the search: its verified coordinates are kept, and it fills the service-area text if empty. */
  const handlePlaceSelected = (place: ApiGeocodeResult) => {
    setCoords({ latitude: roundCoord(place.latitude), longitude: roundCoord(place.longitude) });
    setServiceArea((current) => (current.trim() ? current : place.label));
  };

  useEffect(() => {
    api.getCategories().then(setCategories).catch((e) => setError(e instanceof Error ? e.message : 'Could not load categories'));
  }, []);

  // Load the services of the selected category so a price can be entered for each one.
  useEffect(() => {
    setPrices({});
    setPriceErrors({});
    setCatalogue([]);
    setCatalogueError('');
    const selected = categories.find((c) => c.name === category);
    if (!selected) return;
    let cancelled = false;
    api.getServices(selected.id)
      .then((list) => { if (!cancelled) setCatalogue(list); })
      .catch((e) => { if (!cancelled) setCatalogueError(e instanceof Error ? e.message : 'Could not load services for this category.'); });
    return () => { cancelled = true; };
  }, [category, categories]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!businessName.trim() || !category) {
      setError('Business name and category are required.');
      return;
    }
    // Validate every price the provider typed. Blank = no price for that service (never a default).
    const errs: Record<number, string> = {};
    const servicePrices: { serviceId: number; price: number }[] = [];
    for (const svc of catalogue) {
      const raw = (prices[svc.id] ?? '').trim();
      if (!raw) continue;
      const problem = validatePriceInput(raw);
      if (problem) errs[svc.id] = problem;
      else servicePrices.push({ serviceId: svc.id, price: Number(raw) });
    }
    setPriceErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError('Please fix the highlighted prices.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.createProviderProfile(user.id, {
        businessName: businessName.trim(),
        tagline: tagline.trim() || undefined,
        category,
        experienceYears: Math.max(0, parseInt(experienceYears, 10) || 0),
        serviceArea: serviceArea.trim() || undefined,
        servicePrices: servicePrices.length > 0 ? servicePrices : undefined,
      });
      if (coords) {
        // Best effort: the profile already exists, so a failure here must not block onboarding.
        // Availability stays OFF until the provider opts in from Profile > Service location.
        try {
          await api.updateProviderLocation(user.id, coords);
        } catch { /* provider can set the location later from their profile */ }
      }
      await refreshProviderProfile();
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Could not create your profile.');
    } finally {
      setBusy(false);
    }
  };

  const input = 'w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-black';

  return (
    <div className="min-h-screen bg-[#EDEAE1] flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-xl p-8 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Set up your provider profile</h1>
          <p className="text-xs text-stone-500 mt-1">Customers will see this when they book you.</p>
        </div>
        <input className={input} placeholder="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        <input className={input} placeholder="Tagline (optional)" value={tagline} onChange={(e) => setTagline(e.target.value)} />
        <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select your service category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        {category && (
          <div className="space-y-2">
            <div>
              <p className="text-[11px] font-bold text-stone-700">Your prices (₹)</p>
              <p className="text-[11px] text-stone-500">
                Enter what you charge for each service you offer. Customers can only book services that have a price.
                You can change these any time from Edit Profile.
              </p>
            </div>
            {catalogueError && <div className="text-[11px] font-semibold text-rose-700">{catalogueError}</div>}
            {!catalogueError && catalogue.length === 0 && (
              <p className="text-[11px] text-stone-500">Loading services…</p>
            )}
            {catalogue.map((svc) => (
              <div key={svc.id} className="space-y-1">
                <div className="flex items-center gap-3">
                  <label htmlFor={`price-${svc.id}`} className="flex-1 min-w-0 text-xs font-semibold text-stone-800">
                    {svc.title}
                    <span className="block text-[10px] font-normal text-stone-400">{svc.duration}</span>
                  </label>
                  <div className="relative w-32 shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-500">₹</span>
                    <input
                      id={`price-${svc.id}`}
                      type="text"
                      inputMode="decimal"
                      placeholder="Price"
                      value={prices[svc.id] ?? ''}
                      onChange={(e) => {
                        setPrices((p) => ({ ...p, [svc.id]: e.target.value }));
                        setPriceErrors((p) => ({ ...p, [svc.id]: '' }));
                      }}
                      aria-invalid={priceErrors[svc.id] ? true : undefined}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
                {priceErrors[svc.id] && <p role="alert" className="text-[11px] font-semibold text-rose-700">{priceErrors[svc.id]}</p>}
              </div>
            ))}
          </div>
        )}
        <input className={input} type="number" min={0} placeholder="Years of experience" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
        <input className={input} placeholder="Service area (optional)" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} />
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-stone-700">Where do you work from? (optional)</p>
          <PlaceSearch onSelect={handlePlaceSelected} placeholder="Your city, area or PIN code" />
          {coords && <p className="text-[11px] font-semibold text-emerald-700">Service location chosen.</p>}
          <button
            type="button"
            onClick={captureLocation}
            disabled={geo.status === 'loading'}
            className="w-full py-3 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 hover:bg-stone-50 disabled:opacity-60"
          >
            {geo.status === 'loading' ? 'Getting your location…' : coords ? 'Location captured. Tap to update' : 'Use my current location (optional)'}
          </button>
          {geo.error && <div className="text-[11px] font-semibold text-rose-700">{geo.error.message}</div>}
          <p className="text-[11px] text-stone-500">Customers never see your exact location, only how far you are from them.</p>
        </div>
        {error && <div className="text-xs font-semibold text-rose-700">{error}</div>}
        <button disabled={busy} className="w-full py-3 rounded-xl bg-black text-white text-sm font-bold disabled:opacity-60">
          {busy ? 'Saving...' : 'Create profile'}
        </button>
        <button type="button" onClick={logout} className="w-full text-xs text-stone-500 underline">Sign out</button>
      </form>
    </div>
  );
}
