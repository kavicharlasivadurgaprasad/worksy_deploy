'use client';

import React, { useEffect, useState } from 'react';
import { api, ApiCategory, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

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
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch((e) => setError(e instanceof Error ? e.message : 'Could not load categories'));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!businessName.trim() || !category) {
      setError('Business name and category are required.');
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
      });
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
        <input className={input} type="number" min={0} placeholder="Years of experience" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
        <input className={input} placeholder="Service area (optional)" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} />
        {error && <div className="text-xs font-semibold text-rose-700">{error}</div>}
        <button disabled={busy} className="w-full py-3 rounded-xl bg-black text-white text-sm font-bold disabled:opacity-60">
          {busy ? 'Saving...' : 'Create profile'}
        </button>
        <button type="button" onClick={logout} className="w-full text-xs text-stone-500 underline">Sign out</button>
      </form>
    </div>
  );
}
