'use client';

import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Building2,
  Shield,
  Smartphone,
  LogOut,
  ArrowUpRight,
  Check,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface SettingsTabProps {
  onSwitchToCustomer: () => void;
}

export default function SettingsTab({ onSwitchToCustomer }: SettingsTabProps) {
  const { logout } = useAuth();
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsLeads, setSmsLeads] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 pb-24 w-full max-w-[1840px] 2xl:max-w-[1920px] mx-auto">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-500">
          Preferences &amp; Security
        </p>
        <h2 className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tightest text-stone-900 leading-tight">
          Partner <span className="italic font-normal">Settings</span>
        </h2>
        <p className="text-sm sm:text-base text-stone-600 mt-1 leading-relaxed">
          Manage payout destinations, real-time alert channels, and access credentials.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in duration-150">
          <Check size={16} />
          <span>Partner preferences saved successfully!</span>
        </div>
      )}

      {/* Notifications Channels */}
      <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Bell size={18} className="text-stone-700" />
          <h3 className="font-display text-xl font-medium text-stone-900">Lead Alert Channels</h3>
        </div>

        <div className="divide-y divide-stone-100">
          <label className="flex items-center justify-between py-4 cursor-pointer">
            <div>
              <div className="text-sm font-bold text-stone-900">WhatsApp Instant Dispatch Alerts</div>
              <div className="text-xs text-stone-500 mt-0.5">Receive immediate WhatsApp sound alerts with customer map location</div>
            </div>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              className="w-5 h-5 accent-black rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between py-4 cursor-pointer">
            <div>
              <div className="text-sm font-bold text-stone-900">SMS Booking Confirmations &amp; OTPs</div>
              <div className="text-xs text-stone-500 mt-0.5">SMS text message for start OTPs and customer payments</div>
            </div>
            <input
              type="checkbox"
              checked={smsLeads}
              onChange={(e) => setSmsLeads(e.target.checked)}
              className="w-5 h-5 accent-black rounded cursor-pointer"
            />
          </label>
        </div>
      </section>

      {/* Payment & Payout Preferences */}
      <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <CreditCard size={18} className="text-stone-700" />
          <h3 className="font-display text-xl font-medium text-stone-900">Payout Credentials</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Primary UPI ID for Instant Settlements</label>
            <input
              type="text"
              defaultValue="ravi.sharma@okaxis"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-mono font-bold text-stone-800"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Bank Account (IFSC &amp; Number)</label>
            <input
              type="text"
              defaultValue="HDFC Bank — HDFC0001234 — ****4920"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-semibold text-stone-800"
            />
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Shield size={18} className="text-stone-700" />
          <h3 className="font-display text-xl font-medium text-stone-900">Account Protection</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div>
              <div className="text-xs font-bold text-stone-900">Two-Factor Authentication for Withdrawals</div>
              <div className="text-[11px] text-stone-500 mt-0.5">SMS OTP required before initiating balance withdrawals</div>
            </div>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={(e) => setTwoFactor(e.target.checked)}
              className="w-5 h-5 accent-black rounded"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </section>

      {/* Role Switching & Logout */}
      <div className="space-y-3 pt-2">
        <button
          onClick={onSwitchToCustomer}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          <span>Switch to Worksy Customer View (Book other home services)</span>
          <ArrowUpRight size={16} />
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span>Log Out of Worksy Partner</span>
        </button>
      </div>
    </div>
  );
}
