'use client';

import React, { useState } from 'react';
import {
  Bell,
  Globe,
  DollarSign,
  Shield,
  Smartphone,
  Check,
  Lock,
  Eye,
  Sliders
} from 'lucide-react';

export default function SettingsTab() {
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsReceipts, setSmsReceipts] = useState(true);
  const [promoNotifications, setPromoNotifications] = useState(false);
  const [language, setLanguage] = useState('English');
  const [twoFactor, setTwoFactor] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-10 pb-28 lg:pb-16 max-w-[1760px] 2xl:max-w-[1840px] mx-auto">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-500">
          Preferences
        </p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tightest text-stone-900 leading-[1.08]">
          Settings <span className="italic font-normal">&amp;</span> Preferences
        </h1>
        <p className="text-base sm:text-lg text-stone-600 mt-2 max-w-2xl leading-relaxed">
          Customize your real-time notification alerts, regional localization, and account privacy credentials.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-3 animate-in fade-in duration-150 shadow-sm">
          <Check size={18} />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {/* Notifications Section */}
      <section className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Bell size={22} className="text-stone-700" />
          <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
            Notification Channels
          </h2>
        </div>

        <div className="divide-y divide-stone-100">
          <label className="flex items-center justify-between py-5 cursor-pointer group">
            <div className="pr-4">
              <div className="text-base sm:text-lg font-bold text-stone-800 group-hover:text-black transition-colors">
                WhatsApp Live Updates
              </div>
              <div className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
                Receive live technician ETA, tracking map links, and job completion reports directly on WhatsApp
              </div>
            </div>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              className="w-6 h-6 accent-black rounded cursor-pointer shrink-0"
            />
          </label>

          <label className="flex items-center justify-between py-5 cursor-pointer group">
            <div className="pr-4">
              <div className="text-base sm:text-lg font-bold text-stone-800 group-hover:text-black transition-colors">
                SMS Booking Confirmations &amp; Invoices
              </div>
              <div className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
                Receive critical appointment reminders, security start OTPs, and paid invoice summaries via SMS
              </div>
            </div>
            <input
              type="checkbox"
              checked={smsReceipts}
              onChange={(e) => setSmsReceipts(e.target.checked)}
              className="w-6 h-6 accent-black rounded cursor-pointer shrink-0"
            />
          </label>

          <label className="flex items-center justify-between py-5 cursor-pointer group">
            <div className="pr-4">
              <div className="text-base sm:text-lg font-bold text-stone-800 group-hover:text-black transition-colors">
                Promotions &amp; Seasonal Offers
              </div>
              <div className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
                Exclusive member coupons, festival deep cleaning discounts, and weekend appliance maintenance deals
              </div>
            </div>
            <input
              type="checkbox"
              checked={promoNotifications}
              onChange={(e) => setPromoNotifications(e.target.checked)}
              className="w-6 h-6 accent-black rounded cursor-pointer shrink-0"
            />
          </label>
        </div>
      </section>

      {/* Language & Currency */}
      <section className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Globe size={22} className="text-stone-700" />
          <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
            Language <span className="italic font-normal">&amp; Localization</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-bold text-stone-700 block mb-2">Platform Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm sm:text-base font-semibold focus:outline-none focus:border-black shadow-sm cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-stone-700 block mb-2">Display Currency</label>
            <div className="px-4 py-3 rounded-2xl bg-stone-100 border border-stone-200 text-sm sm:text-base font-semibold text-stone-800 shadow-sm">
              ₹ INR (Indian Rupee) — Standard
            </div>
          </div>
        </div>
      </section>

      {/* Security & Account Protection */}
      <section className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Shield size={22} className="text-stone-700" />
          <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
            Security <span className="italic font-normal">&amp; Privacy</span>
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="pr-4">
              <div className="text-base font-bold text-stone-800">Two-Factor Authentication (2FA)</div>
              <div className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
                Additional SMS or WhatsApp OTP confirmation for high-value wallet debits and sign-ins
              </div>
            </div>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={(e) => setTwoFactor(e.target.checked)}
              className="w-6 h-6 accent-black rounded cursor-pointer shrink-0"
            />
          </div>

          <div className="flex items-center justify-between p-5 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="pr-4">
              <div className="text-base font-bold text-stone-800">Active Devices &amp; Sessions</div>
              <div className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
                Currently signed in on Android App &amp; Chrome Web Browser (Bangalore, India)
              </div>
            </div>
            <button
              onClick={() => alert('All other sessions revoked successfully.')}
              className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-800 transition-colors shrink-0 cursor-pointer"
            >
              Revoke Others
            </button>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3.5 rounded-2xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 transition-all shadow-md cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </section>
    </div>
  );
}
