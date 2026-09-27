'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  CreditCard,
  Heart,
  CalendarCheck,
  Gift,
  Star,
  Bell,
  Globe,
  HelpCircle,
  MessageSquare,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Address } from '@/lib/marketplace-data';
import { CustomerTab } from './CustomerSidebar';

interface ProfileTabProps {
  addresses: Address[];
  walletBalance: number;
  onAddAddress: (newAddr: Omit<Address, 'id'>) => void;
  onDeleteAddress: (addrId: string) => void;
  onOpenWalletModal: () => void;
  setActiveTab: (tab: CustomerTab) => void;
}

export default function ProfileTab({
  addresses,
  walletBalance,
  onAddAddress,
  onDeleteAddress,
  onOpenWalletModal,
  setActiveTab
}: ProfileTabProps) {
  const router = useRouter();
  const { user, logout, switchRole } = useAuth();
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newLabel, setNewLabel] = useState<'Home' | 'Office' | 'Other'>('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newCity, setNewCity] = useState('Bangalore');
  const [newPincode, setNewPincode] = useState('');

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newArea) return;
    onAddAddress({
      label: newLabel,
      street: newStreet,
      area: newArea,
      city: newCity,
      pincode: newPincode || '560038',
      isDefault: false
    });
    setIsAddAddressOpen(false);
    setNewStreet('');
    setNewArea('');
    setNewPincode('');
  };

  return (
    <div className="space-y-10 pb-28 lg:pb-16 max-w-[1760px] 2xl:max-w-[1840px] mx-auto">
      {/* Profile Header */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <img
              src={user?.avatar || '/images/user-charan.jpg'}
              alt={user?.name || 'Profile'}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-stone-200 shadow-md"
            />
            <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Active">
              <Check size={14} />
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tightest text-stone-900 leading-tight">
                {user?.name}
              </h1>
              <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Gold Member
              </span>
            </div>
            <div className="text-sm sm:text-base text-stone-500 mt-1.5 font-medium">
              {user?.email}{user?.phone ? ` • ${user.phone}` : ''}
            </div>
            <div className="text-sm text-stone-600 mt-1.5 flex items-center gap-1.5 font-medium">
              <MapPin size={15} className="text-rose-500" />
              <span>Indiranagar, Bangalore, Karnataka</span>
            </div>
          </div>
        </div>

        {/* Worksy Wallet Quick Pill */}
        <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 text-left lg:text-right w-full lg:w-auto shrink-0 shadow-sm">
          <div className="text-xs uppercase font-bold tracking-wider text-stone-500">Worksy Wallet Balance</div>
          <div className="text-3xl font-extrabold text-emerald-800 mt-1">₹{walletBalance}</div>
          <button
            onClick={onOpenWalletModal}
            className="mt-2 text-xs sm:text-sm font-bold text-black hover:text-stone-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>+ Add Cash / Manage Wallet</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* 1. My Addresses Section */}
      <section className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📍</span>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
                Saved <span className="italic font-normal">Addresses</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5 leading-relaxed">
                Manage your home, office, and secondary service locations for one-tap checkout.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddAddressOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 transition-all self-start sm:self-auto shadow-sm"
          >
            <Plus size={16} />
            <span>Add New Address</span>
          </button>
        </div>

        {isAddAddressOpen && (
          <form onSubmit={handleSaveAddress} className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-4">
            <div className="font-bold text-sm text-stone-900">Add New Service Address</div>
            <div className="flex gap-2.5">
              {(['Home', 'Office', 'Other'] as const).map((label) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => setNewLabel(label)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    newLabel === label ? 'bg-black text-white border-black shadow-sm' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Flat / House No. / Building Name / Street"
              value={newStreet}
              onChange={(e) => setNewStreet(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-black shadow-sm"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Locality / Area (e.g. Koramangala)"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-black shadow-sm"
                required
              />
              <input
                type="text"
                placeholder="Pincode (e.g. 560034)"
                value={newPincode}
                onChange={(e) => setNewPincode(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-black shadow-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddAddressOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-600 hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 transition-colors shadow-sm"
              >
                Save Address
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-6 rounded-3xl bg-stone-50 border border-stone-200/90 flex items-start justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-stone-900">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-sm text-stone-600 mt-2 leading-relaxed">
                  {addr.street}, {addr.area}, {addr.city} — {addr.pincode}
                </div>
              </div>

              {addresses.length > 1 && (
                <button
                  onClick={() => onDeleteAddress(addr.id)}
                  className="text-stone-400 hover:text-rose-600 p-2 transition-colors rounded-lg"
                  title="Delete address"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 2. Quick Links Section */}
      <section className="bg-white border border-stone-200/90 rounded-3xl divide-y divide-stone-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setActiveTab('bookings')}
          className="w-full flex items-center justify-between p-6 sm:p-7 hover:bg-stone-50 transition-colors text-left group"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl group-hover:scale-110 transition-transform">📋</span>
            <div>
              <div className="text-base sm:text-lg font-bold text-stone-900">My Bookings</div>
              <div className="text-xs sm:text-sm text-stone-500 mt-0.5 leading-relaxed">View upcoming, ongoing &amp; completed service appointments</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className="w-full flex items-center justify-between p-6 sm:p-7 hover:bg-stone-50 transition-colors text-left group"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl group-hover:scale-110 transition-transform">❤️</span>
            <div>
              <div className="text-base sm:text-lg font-bold text-stone-900">Saved Favorites</div>
              <div className="text-xs sm:text-sm text-stone-500 mt-0.5 leading-relaxed">Shortlisted service specialists and top-rated technicians</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className="w-full flex items-center justify-between p-6 sm:p-7 hover:bg-stone-50 transition-colors text-left group"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl group-hover:scale-110 transition-transform">🎁</span>
            <div>
              <div className="text-base sm:text-lg font-bold text-stone-900">Offers &amp; Rewards</div>
              <div className="text-xs sm:text-sm text-stone-500 mt-0.5 leading-relaxed">Coupons, scratch cards, and referral bonus credits</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className="w-full flex items-center justify-between p-6 sm:p-7 hover:bg-stone-50 transition-colors text-left group"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl group-hover:scale-110 transition-transform">⚙️</span>
            <div>
              <div className="text-base sm:text-lg font-bold text-stone-900">Preferences &amp; Security</div>
              <div className="text-xs sm:text-sm text-stone-500 mt-0.5 leading-relaxed">Notifications, language, and two-factor authentication</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => setActiveTab('help')}
          className="w-full flex items-center justify-between p-6 sm:p-7 hover:bg-stone-50 transition-colors text-left group"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl group-hover:scale-110 transition-transform">❓</span>
            <div>
              <div className="text-base sm:text-lg font-bold text-stone-900">Help &amp; Support</div>
              <div className="text-xs sm:text-sm text-stone-500 mt-0.5 leading-relaxed">24/7 customer resolutions, warranty claims &amp; live chat</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </section>

      {/* 3. Role Switch & Logout */}
      <div className="space-y-4 pt-2">
        <button
          onClick={() => switchRole('provider')}
          className="w-full flex items-center justify-between p-5 sm:p-6 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <RefreshCw size={17} />
            <span>Switch to Worksy Provider Mode (Earn as a Pro Partner)</span>
          </div>
          <ChevronRight size={18} className="text-stone-500" />
        </button>

        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="w-full flex items-center justify-center gap-2.5 p-5 sm:p-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-sm"
        >
          <LogOut size={17} />
          <span>Log Out of Worksy</span>
        </button>
      </div>
    </div>
  );
}
