'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { api, ApiError, ApiProviderServicePrice } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

/** Mirrors the backend rule (the backend re-validates everything; this only gives instant feedback). */
function validate(raw: string): string | null {
  const t = raw.trim();
  if (!t) return 'Enter a price.';
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return 'Use a positive amount with at most 2 decimals (e.g. 499 or 499.50).';
  if (Number(t) <= 0) return 'Price must be greater than 0.';
  return null;
}

/** "Manage Services and Prices": the signed-in provider sets / updates their own price per service. */
export default function ServicesPricesTab() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ApiProviderServicePrice[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setLoadError('');
    try {
      const list = await api.getMyServicePrices(user.id);
      setRows(list);
      setDrafts(Object.fromEntries(list.map((r) => [r.serviceId, r.price != null ? String(r.price) : ''])));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not load your services.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const applyRow = (updated: ApiProviderServicePrice) => {
    setRows((prev) => prev.map((r) => (r.serviceId === updated.serviceId ? updated : r)));
    setDrafts((prev) => ({ ...prev, [updated.serviceId]: updated.price != null ? String(updated.price) : '' }));
  };

  const save = async (row: ApiProviderServicePrice) => {
    if (!user) return;
    const draft = drafts[row.serviceId] ?? '';
    const problem = validate(draft);
    setSuccess('');
    if (problem) { setErrors((p) => ({ ...p, [row.serviceId]: problem })); return; }
    setErrors((p) => ({ ...p, [row.serviceId]: '' }));
    setSaving(row.serviceId);
    try {
      applyRow(await api.setMyServicePrice(user.id, row.serviceId, Number(draft)));
      setSuccess(`Price for "${row.title}" saved. Customers will now see it. Existing bookings keep their original price.`);
    } catch (e) {
      setErrors((p) => ({ ...p, [row.serviceId]: e instanceof ApiError || e instanceof Error ? e.message : 'Could not save the price.' }));
    } finally {
      setSaving(null);
    }
  };

  const clear = async (row: ApiProviderServicePrice) => {
    if (!user) return;
    setSuccess('');
    setSaving(row.serviceId);
    try {
      applyRow(await api.clearMyServicePrice(user.id, row.serviceId));
      setSuccess(`Price for "${row.title}" removed. Customers can no longer book you for it until you set a new price.`);
    } catch (e) {
      setErrors((p) => ({ ...p, [row.serviceId]: e instanceof Error ? e.message : 'Could not remove the price.' }));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6 pb-24 w-full max-w-[1100px] mx-auto">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-500">Pricing</p>
        <h2 className="mt-1 font-display text-3xl sm:text-4xl font-medium tracking-tightest text-stone-900">
          Manage <span className="italic font-normal">Services &amp; Prices</span>
        </h2>
        <p className="text-sm text-stone-600 mt-1 leading-relaxed">
          Set what you charge (in ₹) for each service in your category. Customers can only book services you have priced,
          and they pay exactly this amount. Changing a price never changes bookings that already exist.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-start gap-2">
          <Check size={16} className="shrink-0 mt-0.5" /><span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm text-stone-500 bg-white rounded-3xl border border-stone-200">Loading your services...</div>
      ) : loadError ? (
        <div className="p-6 rounded-3xl bg-white border border-rose-200 text-center space-y-3">
          <p className="text-sm font-semibold text-rose-700">{loadError}</p>
          <button onClick={() => void load()} className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold">Try again</button>
        </div>
      ) : rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-stone-500 bg-white rounded-3xl border border-stone-200">
          There are no catalogue services in your category yet.
        </div>
      ) : (
        <div className="bg-white border border-stone-200/90 rounded-3xl divide-y divide-stone-100 overflow-hidden">
          {rows.map((row) => (
            <div key={row.serviceId} className="p-5 sm:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-stone-900">{row.title}</div>
                <div className="text-xs text-stone-500 mt-0.5">{row.duration}{row.description ? ` • ${row.description}` : ''}</div>
                <div className={`mt-2 inline-block text-[11px] font-bold px-2 py-0.5 rounded-md ${row.priceSet ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                  {row.priceSet ? `Current price: ₹${Number(row.price).toLocaleString('en-IN')}` : 'Price not set (customers cannot book this yet)'}
                </div>
              </div>

              <div className="md:w-72 shrink-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-500">₹</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={drafts[row.serviceId] ?? ''}
                      onChange={(e) => { setDrafts((p) => ({ ...p, [row.serviceId]: e.target.value })); setErrors((p) => ({ ...p, [row.serviceId]: '' })); setSuccess(''); }}
                      placeholder="Enter price"
                      aria-label={`Price for ${row.title}`}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>
                  <button
                    onClick={() => void save(row)}
                    disabled={saving === row.serviceId}
                    className="px-4 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-stone-800 disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {saving === row.serviceId && <Loader2 size={13} className="animate-spin" />}
                    {row.priceSet ? 'Update' : 'Save'}
                  </button>
                  {row.priceSet && (
                    <button
                      onClick={() => void clear(row)}
                      disabled={saving === row.serviceId}
                      title="Remove price"
                      aria-label={`Remove price for ${row.title}`}
                      className="p-2.5 rounded-xl border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                {errors[row.serviceId] && (
                  <p className="text-xs font-semibold text-rose-700 flex items-start gap-1"><AlertCircle size={13} className="shrink-0 mt-0.5" />{errors[row.serviceId]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
