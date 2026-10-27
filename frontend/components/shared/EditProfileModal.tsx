'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Camera, Loader2, Trash2, X } from 'lucide-react';
import { api, ApiCategory, ApiError, ApiProfile, ApiProviderServicePrice, resolveAvatarUrl, UpdateProfilePayload } from '@/lib/api';
import { formatRupees, validatePriceInput } from '@/lib/price';
import { useAuth } from '@/lib/auth-context';
import { ACCEPT_ATTR, ACCEPTED_IMAGE_TYPES, formatFileSize } from '@/lib/image-upload';

/**
 * Edit Profile for the signed-in user, for both roles.
 *
 * - Loads the real profile from GET /profile/me (nothing is hard-coded) and pre-fills the form.
 * - Customers edit: name, phone, profile picture and their default address.
 * - Providers edit: name, phone, profile picture and business details (name, tagline, about,
 *   category, experience, response time, service area).
 * - Providers also see one price field per service in their category, pre-filled with the saved prices
 *   (GET /users/{id}/provider-profile/services). Only prices that were actually changed are sent.
 * - Email is read-only (it is the login identifier). Passwords are not handled here.
 * - Cancel / Escape / the X simply unmount the form, so unsaved changes are discarded.
 * - A failed save keeps everything the user typed; only a confirmed 2xx closes the form.
 */

const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // the backend enforces the same 2 MB limit
const PHONE_RE = /^\+[1-9]\d{7,14}$/;
const PIN_RE = /^[1-9]\d{5}$/;

/** "98765 43210" / "9876543210" / "919876543210" -> "+919876543210". Anything else is only stripped of spaces. */
function normalizePhone(raw: string): string {
  const t = raw.replace(/[\s\-()]/g, '');
  if (/^\d{10}$/.test(t)) return `+91${t}`;
  if (/^91\d{10}$/.test(t)) return `+${t}`;
  return t;
}

interface FormState {
  name: string;
  phone: string;
  phoneOtp: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  businessName: string;
  tagline: string;
  description: string;
  category: string;
  experienceYears: string;
  responseTime: string;
  serviceArea: string;
}

function toForm(p: ApiProfile): FormState {
  return {
    name: p.name ?? '',
    phone: p.phone ?? '',
    phoneOtp: '',
    street: p.address?.street ?? '',
    area: p.address?.area ?? '',
    city: p.address?.city ?? '',
    state: p.address?.state ?? '',
    pincode: p.address?.pincode ?? '',
    businessName: p.provider?.businessName ?? '',
    tagline: p.provider?.tagline ?? '',
    description: p.provider?.description ?? '',
    category: p.provider?.category ?? '',
    experienceYears: String(p.provider?.experienceYears ?? 0),
    responseTime: p.provider?.responseTime ?? '',
    serviceArea: p.provider?.serviceArea ?? '',
  };
}

type Errors = Record<string, string>;

const inputCls =
  'w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-sm text-stone-900 focus:outline-none focus:border-black disabled:bg-stone-100 disabled:text-stone-500';

interface EditProfileModalProps {
  onClose: () => void;
  /** Called with the saved profile after a confirmed successful update. */
  onSaved: (profile: ApiProfile) => void;
}

export default function EditProfileModal({ onClose, onSaved }: EditProfileModalProps) {
  const { applyProfile } = useAuth();

  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState<FormState | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Provider service prices: the saved rows and what the provider has typed (service id -> text).
  const [priceRows, setPriceRows] = useState<ApiProviderServicePrice[]>([]);
  const [priceDrafts, setPriceDrafts] = useState<Record<number, string>>({});
  const [priceErrors, setPriceErrors] = useState<Record<number, string>>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [pricesLoadError, setPricesLoadError] = useState('');

  // Profile picture: chosen here, uploaded when the user presses Save (so Cancel really discards it).
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedPreview, setStagedPreview] = useState<string | null>(null);
  const [removePicture, setRemovePicture] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phone change needs an OTP sent to the new number.
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInfo, setOtpInfo] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<Element | null>(null);

  const isProvider = profile?.role === 'PROVIDER';
  const isCustomer = profile?.role === 'CUSTOMER';

  /* ----------------------------- load ----------------------------- */

  const loadPrices = useCallback(async (userId: number) => {
    setPricesLoading(true);
    setPricesLoadError('');
    try {
      const rows = await api.getMyServicePrices(userId);
      setPriceRows(rows);
      setPriceDrafts(Object.fromEntries(rows.map((r) => [r.serviceId, r.price != null ? String(r.price) : ''])));
      setPriceErrors({});
    } catch (e) {
      setPricesLoadError(e instanceof Error ? e.message : 'Could not load your service prices.');
    } finally {
      setPricesLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoadError('');
    setProfile(null);
    setForm(null);
    try {
      const p = await api.getMyProfile();
      setProfile(p);
      setForm(toForm(p));
      if (p.role === 'PROVIDER') {
        // Needed for the category drop-down; the form still works if this fails.
        api.getCategories().then(setCategories).catch(() => setCategories([]));
        if (p.provider) void loadPrices(p.id);
      }
    } catch (e) {
      setLoadError(e instanceof ApiError || e instanceof Error ? e.message : 'Could not load your profile.');
    }
  }, [loadPrices]);

  useEffect(() => {
    openerRef.current = document.activeElement;
    void load();
    return () => {
      // Give focus back to the button that opened the form.
      if (openerRef.current instanceof HTMLElement) openerRef.current.focus();
    };
  }, [load]);

  useEffect(() => {
    if (form) firstFieldRef.current?.focus();
  }, [form === null]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock page scroll behind the dialog.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  // Preview URL for a newly chosen picture (released when replaced / closed).
  useEffect(() => {
    if (!stagedFile) { setStagedPreview(null); return; }
    const url = URL.createObjectURL(stagedFile);
    setStagedPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [stagedFile]);

  // OTP resend countdown.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  /* ----------------------------- derived ----------------------------- */

  const normalizedPhone = useMemo(() => (form ? normalizePhone(form.phone) : ''), [form]);
  const savedPhone = profile?.phone ?? '';
  const phoneChanged = normalizedPhone !== '' && normalizedPhone !== savedPhone;
  const phoneCleared = normalizedPhone === '' && savedPhone !== '';
  const serviceAreaLocked = !!profile?.provider?.locationSet;
  // Prices belong to the services of the SAVED category, so they are edited only while it is unchanged.
  const categoryChanged =
    !!form && !!profile?.provider && form.category.trim().toLowerCase() !== (profile.provider.category ?? '').toLowerCase();

  /* ----------------------------- handlers ----------------------------- */

  const set = (key: keyof FormState, value: string) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setErrors((prev) => {
      const k = fieldKey(key);
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
    setFormError('');
    if (key === 'phone') {
      setOtpSent(false);
      setOtpInfo('');
    }
  };

  const requestClose = () => {
    if (!saving) onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      requestClose();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    // Keep keyboard focus inside the dialog.
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const typeOk = ACCEPTED_IMAGE_TYPES.includes(file.type) || (!file.type && ['jpg', 'jpeg', 'png', 'webp'].includes(ext));
    if (!typeOk) {
      setAvatarError('Please choose a JPG, PNG or WEBP image.');
      return;
    }
    if (file.size === 0) {
      setAvatarError('That file is empty.');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError(`That image is ${formatFileSize(file.size)}. The limit is 2 MB.`);
      return;
    }
    setAvatarError('');
    setRemovePicture(false);
    setStagedFile(file);
  };

  const sendOtp = async () => {
    if (!form) return;
    if (!PHONE_RE.test(normalizedPhone)) {
      setErrors((p) => ({ ...p, phone: 'Enter a valid phone number, e.g. +919876543210.' }));
      return;
    }
    setOtpSending(true);
    setOtpInfo('');
    setFormError('');
    try {
      const res = await api.sendPhoneOtp(normalizedPhone);
      setOtpSent(true);
      setCooldown(res.resendCooldownSeconds || 30);
      setOtpInfo(`We sent a 6-digit code to ${normalizedPhone}.`);
    } catch (e) {
      setOtpInfo('');
      setErrors((p) => ({ ...p, phone: e instanceof Error ? e.message : 'Could not send the OTP.' }));
    } finally {
      setOtpSending(false);
    }
  };

  const validate = (f: FormState): Errors => {
    const e: Errors = {};
    const name = f.name.trim();
    if (!name) e['name'] = 'Name is required.';
    else if (name.length < 2 || name.length > 100) e['name'] = 'Name must be 2 to 100 characters.';

    if (normalizedPhone && !PHONE_RE.test(normalizedPhone)) {
      e['phone'] = 'Enter a valid phone number, e.g. +919876543210.';
    } else if (phoneChanged && !/^\d{6}$/.test(f.phoneOtp.trim())) {
      e['phoneOtp'] = 'Enter the 6-digit code sent to your new number.';
    }

    if (isCustomer) {
      const any = [f.street, f.area, f.city, f.state, f.pincode].some((v) => v.trim());
      if (any || profile?.address) {
        if (!f.street.trim()) e['address.street'] = 'Address is required.';
        if (!f.area.trim()) e['address.area'] = 'Locality is required.';
        if (!f.city.trim()) e['address.city'] = 'City is required.';
        if (!f.pincode.trim()) e['address.pincode'] = 'PIN code is required.';
        else if (!PIN_RE.test(f.pincode.trim())) e['address.pincode'] = 'PIN code must be 6 digits.';
        if (f.state.trim().length > 100) e['address.state'] = 'State is too long.';
      }
    }

    if (isProvider && profile?.provider) {
      if (!f.businessName.trim()) e['provider.businessName'] = 'Business name is required.';
      else if (f.businessName.trim().length > 255) e['provider.businessName'] = 'Business name is too long.';
      if (f.tagline.trim().length > 255) e['provider.tagline'] = 'Tagline cannot exceed 255 characters.';
      if (f.description.trim().length > 1000) e['provider.description'] = 'Description cannot exceed 1000 characters.';
      const years = Number(f.experienceYears);
      if (f.experienceYears.trim() === '' || !Number.isInteger(years) || years < 0 || years > 60) {
        e['provider.experienceYears'] = 'Enter whole years between 0 and 60.';
      }
      if (f.responseTime.trim().length > 255) e['provider.responseTime'] = 'Response time is too long.';
      if (f.serviceArea.trim().length > 255) e['provider.serviceArea'] = 'Service area is too long.';
    }
    return e;
  };

  const buildPayload = (f: FormState): UpdateProfilePayload => {
    const payload: UpdateProfilePayload = { name: f.name.trim() };
    if (phoneChanged) {
      payload.phone = normalizedPhone;
      payload.phoneOtp = f.phoneOtp.trim();
    } else if (phoneCleared) {
      payload.phone = '';
    }
    if (isCustomer && ([f.street, f.area, f.city, f.state, f.pincode].some((v) => v.trim()) || profile?.address)) {
      payload.address = {
        street: f.street.trim(),
        area: f.area.trim(),
        city: f.city.trim(),
        state: f.state.trim(),
        pincode: f.pincode.trim(),
      };
    }
    if (isProvider && profile?.provider) {
      payload.provider = {
        businessName: f.businessName.trim(),
        tagline: f.tagline.trim(),
        description: f.description.trim(),
        category: f.category || undefined,
        experienceYears: Number(f.experienceYears),
        responseTime: f.responseTime.trim(),
        // Once a map location is saved the backend keeps the service area in step with it.
        ...(serviceAreaLocked ? {} : { serviceArea: f.serviceArea.trim() }),
      };
    }
    return payload;
  };

  const focusFirstError = (errs: Errors) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    const el = panelRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
    el?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !form || !profile) return; // blocks double submits
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError('Please fix the highlighted fields.');
      focusFirstError(found);
      return;
    }

    // Prices: only rows the provider actually changed are validated and sent.
    const priceEdits: { serviceId: number; price: number }[] = [];
    if (isProvider && profile.provider && !categoryChanged) {
      const perr: Record<number, string> = {};
      for (const row of priceRows) {
        const draft = (priceDrafts[row.serviceId] ?? '').trim();
        const original = row.price != null ? String(row.price) : '';
        if (draft === original || (draft !== '' && original !== '' && Number(draft) === Number(original))) continue;
        if (draft === '') {
          perr[row.serviceId] = 'Enter a price. To remove one, use Services & Prices.';
          continue;
        }
        const problem = validatePriceInput(draft);
        if (problem) perr[row.serviceId] = problem;
        else priceEdits.push({ serviceId: row.serviceId, price: Number(draft) });
      }
      setPriceErrors(perr);
      if (Object.keys(perr).length > 0) {
        setFormError('Please fix the highlighted prices.');
        const firstId = Object.keys(perr)[0];
        panelRef.current?.querySelector<HTMLElement>(`[data-field="price.${firstId}"]`)?.focus();
        return;
      }
    }

    setSaving(true);
    setFormError('');

    // Prices go first and are saved all-or-nothing by the backend: if they fail, nothing else was changed.
    if (priceEdits.length > 0) {
      try {
        const updated = await api.setMyServicePrices(profile.id, priceEdits);
        const byId = new Map(updated.map((u) => [u.serviceId, u]));
        setPriceRows((rows) => rows.map((r) => byId.get(r.serviceId) ?? r));
        setPriceDrafts((d) => ({ ...d, ...Object.fromEntries(updated.map((u) => [u.serviceId, u.price != null ? String(u.price) : ''])) }));
      } catch (err) {
        setFormError(`Your prices could not be saved, so no changes were made: ${err instanceof Error ? err.message : 'please try again.'}`);
        setSaving(false);
        return;
      }
    }

    let saved: ApiProfile;
    try {
      saved = await api.updateMyProfile(buildPayload(form));
    } catch (err) {
      // Keep everything the user typed; just show what went wrong.
      if (err instanceof ApiError && err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors);
        setFormError('Please fix the highlighted fields.');
        focusFirstError(err.fieldErrors);
      } else {
        setFormError(err instanceof Error ? err.message : 'Could not save your profile. Please try again.');
      }
      if (priceEdits.length > 0) {
        setFormError((m) => `${m} Your new prices were already saved.`);
      }
      setSaving(false);
      return;
    }

    // Details are saved. The picture (if changed) is a separate request.
    if (stagedFile || removePicture) {
      try {
        saved = stagedFile ? await api.uploadAvatar(stagedFile) : await api.removeAvatar();
      } catch (err) {
        applyProfile(saved);
        setProfile(saved);
        setForm({ ...toForm(saved) });
        setOtpSent(false);
        setOtpInfo('');
        setFormError(
          `Your details were saved, but the picture could not be updated: ${
            err instanceof Error ? err.message : 'please try again.'
          }`
        );
        setSaving(false);
        return;
      }
    }

    applyProfile(saved); // headers, sidebars and chat pick up the new name / picture immediately
    setSaving(false);
    onSaved(saved);
  };

  /* ----------------------------- render ----------------------------- */

  const currentAvatar = removePicture ? undefined : stagedPreview || resolveAvatarUrl(profile?.avatarUrl);
  const initials = (form?.name || profile?.name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const field = (key: string) => ({
    'data-field': key,
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `err-${key}` : undefined,
  });

  const fieldError = (key: string) =>
    errors[key] ? (
      <p id={`err-${key}`} role="alert" className="mt-1 text-xs font-semibold text-rose-700">
        {errors[key]}
      </p>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) requestClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        onKeyDown={onKeyDown}
        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[94vh] flex flex-col"
      >
        <div className="flex items-start justify-between gap-4 px-6 sm:px-8 pt-6 pb-4 border-b border-stone-100">
          <div>
            <h2 id="edit-profile-title" className="font-display text-2xl font-medium text-stone-900">
              Edit <span className="italic font-normal">Profile</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {isProvider ? 'Update how customers see you and your business.' : 'Update your personal details and default address.'}
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            aria-label="Close edit profile"
            className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading / load error */}
        {!form && !loadError && (
          <div className="px-8 py-16 flex flex-col items-center gap-3 text-sm text-stone-600" role="status">
            <Loader2 className="animate-spin" size={22} />
            <span>Loading your profile…</span>
          </div>
        )}
        {loadError && (
          <div className="px-8 py-12 text-center space-y-4">
            <p role="alert" className="text-sm font-semibold text-rose-700">{loadError}</p>
            <div className="flex justify-center gap-3">
              <button type="button" onClick={() => void load()} className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-stone-800">
                Try again
              </button>
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50">
                Close
              </button>
            </div>
          </div>
        )}

        {form && profile && (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col min-h-0">
            <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-8">
              {formError && (
                <div role="alert" className="flex items-start gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Profile picture */}
              <section aria-labelledby="ep-photo" className="flex flex-col sm:flex-row sm:items-center gap-5">
                {currentAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentAvatar} alt="Your profile picture" className="w-24 h-24 rounded-3xl object-cover border-2 border-stone-200 shadow-sm" />
                ) : (
                  <div aria-hidden className="w-24 h-24 rounded-3xl bg-stone-900 text-white flex items-center justify-center text-2xl font-semibold shrink-0">
                    {initials}
                  </div>
                )}
                <div className="space-y-2">
                  <h3 id="ep-photo" className="text-sm font-bold text-stone-900">Profile picture</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 hover:bg-stone-50"
                    >
                      <Camera size={14} /> {currentAvatar ? 'Change photo' : 'Add photo'}
                    </button>
                    {(profile.avatarUrl || stagedFile) && !removePicture && (
                      <button
                        type="button"
                        onClick={() => {
                          setStagedFile(null);
                          setAvatarError('');
                          if (profile.avatarUrl) setRemovePicture(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept={ACCEPT_ATTR} onChange={pickFile} className="sr-only" tabIndex={-1} aria-label="Choose a profile picture" />
                  <p className="text-[11px] text-stone-500">JPG, PNG or WEBP, up to 2 MB. Applied when you press Save.</p>
                  {avatarError && <p role="alert" className="text-xs font-semibold text-rose-700">{avatarError}</p>}
                </div>
              </section>

              {/* Personal details */}
              <section aria-labelledby="ep-personal" className="space-y-4">
                <h3 id="ep-personal" className="text-sm font-bold text-stone-900">Personal details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="ep-name" className="text-xs font-bold text-stone-800">Full name</label>
                    <input id="ep-name" ref={firstFieldRef} className={`${inputCls} mt-1.5`} value={form.name} maxLength={100} autoComplete="name"
                      onChange={(e) => set('name', e.target.value)} {...field('name')} />
                    {fieldError('name')}
                  </div>

                  <div>
                    <label htmlFor="ep-email" className="text-xs font-bold text-stone-800">Email</label>
                    <input id="ep-email" className={`${inputCls} mt-1.5`} value={profile.email ?? ''} disabled readOnly aria-describedby="ep-email-note" />
                    <p id="ep-email-note" className="mt-1 text-[11px] text-stone-500">Your email is your sign-in ID, so it cannot be changed here.</p>
                  </div>

                  <div>
                    <label htmlFor="ep-phone" className="text-xs font-bold text-stone-800">Phone number</label>
                    <input id="ep-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+919876543210" className={`${inputCls} mt-1.5`}
                      value={form.phone} onChange={(e) => set('phone', e.target.value)} {...field('phone')} />
                    {fieldError('phone')}
                  </div>

                  {phoneChanged && (
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-3">
                      <p className="text-xs text-amber-900 font-medium">
                        Your phone number can be used to sign in, so we need to confirm the new number ({normalizedPhone}) with a one-time code.
                      </p>
                      <div className="flex flex-wrap items-end gap-3">
                        <button
                          type="button"
                          onClick={() => void sendOtp()}
                          disabled={otpSending || cooldown > 0}
                          className="px-4 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-stone-800 disabled:opacity-60"
                        >
                          {otpSending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : otpSent ? 'Resend code' : 'Send code'}
                        </button>
                        <div className="flex-1 min-w-[140px]">
                          <label htmlFor="ep-otp" className="text-xs font-bold text-stone-800">6-digit code</label>
                          <input id="ep-otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" className={`${inputCls} mt-1.5`}
                            value={form.phoneOtp} onChange={(e) => set('phoneOtp', e.target.value.replace(/\D/g, ''))} {...field('phoneOtp')} />
                          {fieldError('phoneOtp')}
                        </div>
                      </div>
                      {otpInfo && <p role="status" className="text-xs font-semibold text-emerald-800">{otpInfo}</p>}
                    </div>
                  )}
                </div>
              </section>

              {/* Customer address */}
              {isCustomer && (
                <section aria-labelledby="ep-address" className="space-y-4">
                  <div>
                    <h3 id="ep-address" className="text-sm font-bold text-stone-900">Default address</h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">Other saved addresses are managed under Saved Addresses.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="ep-street" className="text-xs font-bold text-stone-800">Flat / house no. / building / street</label>
                      <input id="ep-street" className={`${inputCls} mt-1.5`} value={form.street} maxLength={255} autoComplete="address-line1"
                        onChange={(e) => set('street', e.target.value)} {...field('address.street')} />
                      {fieldError('address.street')}
                    </div>
                    <div>
                      <label htmlFor="ep-area" className="text-xs font-bold text-stone-800">Locality / area</label>
                      <input id="ep-area" className={`${inputCls} mt-1.5`} value={form.area} maxLength={255} autoComplete="address-line2"
                        onChange={(e) => set('area', e.target.value)} {...field('address.area')} />
                      {fieldError('address.area')}
                    </div>
                    <div>
                      <label htmlFor="ep-city" className="text-xs font-bold text-stone-800">City</label>
                      <input id="ep-city" className={`${inputCls} mt-1.5`} value={form.city} maxLength={255} autoComplete="address-level2"
                        onChange={(e) => set('city', e.target.value)} {...field('address.city')} />
                      {fieldError('address.city')}
                    </div>
                    <div>
                      <label htmlFor="ep-state" className="text-xs font-bold text-stone-800">State</label>
                      <input id="ep-state" className={`${inputCls} mt-1.5`} value={form.state} maxLength={100} autoComplete="address-level1"
                        onChange={(e) => set('state', e.target.value)} {...field('address.state')} />
                      {fieldError('address.state')}
                    </div>
                    <div>
                      <label htmlFor="ep-pin" className="text-xs font-bold text-stone-800">PIN code</label>
                      <input id="ep-pin" inputMode="numeric" maxLength={6} autoComplete="postal-code" className={`${inputCls} mt-1.5`} value={form.pincode}
                        onChange={(e) => set('pincode', e.target.value.replace(/\D/g, ''))} {...field('address.pincode')} />
                      {fieldError('address.pincode')}
                    </div>
                  </div>
                </section>
              )}

              {/* Provider business details */}
              {isProvider && !profile.provider && (
                <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                  Finish setting up your provider profile first; then you can edit your business details here.
                </p>
              )}
              {isProvider && profile.provider && (
                <section aria-labelledby="ep-business" className="space-y-4">
                  <h3 id="ep-business" className="text-sm font-bold text-stone-900">Business details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="ep-biz" className="text-xs font-bold text-stone-800">Business / display name</label>
                      <input id="ep-biz" className={`${inputCls} mt-1.5`} value={form.businessName} maxLength={255}
                        onChange={(e) => set('businessName', e.target.value)} {...field('provider.businessName')} />
                      {fieldError('provider.businessName')}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="ep-tagline" className="text-xs font-bold text-stone-800">Tagline</label>
                      <input id="ep-tagline" className={`${inputCls} mt-1.5`} value={form.tagline} maxLength={255} placeholder="e.g. Licensed electrician, same-day service"
                        onChange={(e) => set('tagline', e.target.value)} {...field('provider.tagline')} />
                      {fieldError('provider.tagline')}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="ep-desc" className="text-xs font-bold text-stone-800">About your services</label>
                      <textarea id="ep-desc" rows={4} maxLength={1000} className={`${inputCls} mt-1.5 resize-y`} value={form.description}
                        onChange={(e) => set('description', e.target.value)} {...field('provider.description')} />
                      <div className="flex justify-between">
                        {fieldError('provider.description') ?? <span />}
                        <span className="mt-1 text-[11px] text-stone-400">{form.description.length}/1000</span>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="ep-cat" className="text-xs font-bold text-stone-800">Service category</label>
                      <select id="ep-cat" className={`${inputCls} mt-1.5`} value={form.category}
                        onChange={(e) => set('category', e.target.value)} {...field('provider.category')}
                        aria-describedby={`${errors['provider.category'] ? 'err-provider.category ' : ''}ep-cat-note`}>
                        {!categories.some((c) => c.name === form.category) && form.category && <option value={form.category}>{form.category}</option>}
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                      <p id="ep-cat-note" className="mt-1 text-[11px] text-stone-500">Can&apos;t be changed while you have pending or upcoming jobs.</p>
                      {fieldError('provider.category')}
                    </div>
                    <div>
                      <label htmlFor="ep-exp" className="text-xs font-bold text-stone-800">Years of experience</label>
                      <input id="ep-exp" type="number" min={0} max={60} step={1} inputMode="numeric" className={`${inputCls} mt-1.5`} value={form.experienceYears}
                        onChange={(e) => set('experienceYears', e.target.value)} {...field('provider.experienceYears')} />
                      {fieldError('provider.experienceYears')}
                    </div>
                    <div>
                      <label htmlFor="ep-resp" className="text-xs font-bold text-stone-800">Typical response time</label>
                      <input id="ep-resp" className={`${inputCls} mt-1.5`} value={form.responseTime} maxLength={255} placeholder="e.g. Within 30 mins"
                        onChange={(e) => set('responseTime', e.target.value)} {...field('provider.responseTime')} />
                      {fieldError('provider.responseTime')}
                    </div>
                    <div>
                      <label htmlFor="ep-area-text" className="text-xs font-bold text-stone-800">Service area</label>
                      <input id="ep-area-text" className={`${inputCls} mt-1.5`} value={form.serviceArea} maxLength={255} disabled={serviceAreaLocked}
                        onChange={(e) => set('serviceArea', e.target.value)} {...field('provider.serviceArea')}
                        aria-describedby={`${errors['provider.serviceArea'] ? 'err-provider.serviceArea ' : ''}ep-area-note`} />
                      <p id="ep-area-note" className="mt-1 text-[11px] text-stone-500">
                        {serviceAreaLocked
                          ? 'Linked to your saved map location. Change it from “Service location & availability” so both stay in sync.'
                          : 'Set your map location in “Service location & availability” to appear in nearby searches.'}
                      </p>
                      {fieldError('provider.serviceArea')}
                    </div>
                  </div>
                </section>
              )}

              {/* Service prices */}
              {isProvider && profile.provider && (
                <section aria-labelledby="ep-prices" className="space-y-4">
                  <div>
                    <h3 id="ep-prices" className="text-sm font-bold text-stone-900">Service prices (₹)</h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      What you charge for each service. Customers see these on your profile and can only book services that have a price.
                      Existing bookings keep the price they were booked at.
                    </p>
                  </div>
                  {categoryChanged && (
                    <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                      Save your new category first, then edit the prices for its services.
                    </p>
                  )}
                  {pricesLoading && (
                    <p role="status" className="text-xs text-stone-500 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading your prices…</p>
                  )}
                  {pricesLoadError && (
                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                      <p role="alert" className="text-xs font-semibold text-rose-800">{pricesLoadError}</p>
                      <button type="button" onClick={() => void loadPrices(profile.id)} className="px-3 py-1.5 rounded-lg bg-black text-white text-[11px] font-bold shrink-0">Retry</button>
                    </div>
                  )}
                  {!pricesLoading && !pricesLoadError && priceRows.length === 0 && (
                    <p className="text-xs text-stone-500">There are no catalogue services in your category yet.</p>
                  )}
                  {!categoryChanged && priceRows.length > 0 && (
                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                      {priceRows.map((row) => (
                        <div key={row.serviceId} className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <label htmlFor={`ep-price-${row.serviceId}`} className="text-xs sm:text-sm font-bold text-stone-900">{row.title}</label>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              {row.duration} •{' '}
                              <span className={row.priceSet ? 'text-emerald-800 font-semibold' : 'text-amber-800 font-semibold'}>
                                {row.priceSet ? `Saved: ${formatRupees(row.price as number)}` : 'Price not set'}
                              </span>
                            </div>
                          </div>
                          <div className="sm:w-40 shrink-0">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-500">₹</span>
                              <input
                                id={`ep-price-${row.serviceId}`}
                                type="text"
                                inputMode="decimal"
                                placeholder="Enter price"
                                className={`${inputCls} pl-7 py-2.5`}
                                value={priceDrafts[row.serviceId] ?? ''}
                                onChange={(e) => {
                                  setPriceDrafts((d) => ({ ...d, [row.serviceId]: e.target.value }));
                                  setPriceErrors((p) => ({ ...p, [row.serviceId]: '' }));
                                  setFormError('');
                                }}
                                data-field={`price.${row.serviceId}`}
                                aria-invalid={priceErrors[row.serviceId] ? true : undefined}
                                aria-describedby={priceErrors[row.serviceId] ? `err-price-${row.serviceId}` : undefined}
                              />
                            </div>
                            {priceErrors[row.serviceId] && (
                              <p id={`err-price-${row.serviceId}`} role="alert" className="mt-1 text-xs font-semibold text-rose-700">{priceErrors[row.serviceId]}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 sm:px-8 py-4 border-t border-stone-100 bg-white rounded-b-3xl">
              <button
                type="button"
                onClick={requestClose}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 disabled:opacity-60"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/** Maps a form-state key to the key used by validation / server field errors. */
function fieldKey(key: keyof FormState): string {
  switch (key) {
    case 'street': case 'area': case 'city': case 'state': case 'pincode':
      return `address.${key}`;
    case 'businessName': case 'tagline': case 'description': case 'category':
    case 'experienceYears': case 'responseTime': case 'serviceArea':
      return `provider.${key}`;
    default:
      return key;
  }
}
