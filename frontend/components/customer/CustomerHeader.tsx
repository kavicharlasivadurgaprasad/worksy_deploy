'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Search,
  Bell,
  Wallet,
  User,
  ChevronDown,
  Sparkles,
  LogOut,
  RefreshCw,
  HelpCircle,
  Settings,
  Heart,
  CalendarCheck,
  CheckCircle2,
  Home,
  MessageSquare,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { CustomerTab } from './CustomerSidebar';

interface CustomerHeaderProps {
  selectedLocation: string;
  onOpenLocationModal: () => void;
  onOpenWalletModal: () => void;
  onOpenNotifications: () => void;
  unreadNotifsCount?: number;
  walletBalance?: number;
  activeTab: CustomerTab;
  setActiveTab: (tab: CustomerTab) => void;
  onSearchSubmit?: (query: string) => void;
  activeBookingsCount?: number;
  unreadMessagesCount?: number;
  favoritesCount?: number;
  onLogout?: () => void;
}

export default function CustomerHeader({
  selectedLocation,
  onOpenLocationModal,
  onOpenWalletModal,
  onOpenNotifications,
  unreadNotifsCount = 2,
  walletBalance = 850,
  activeTab,
  setActiveTab,
  onSearchSubmit,
  activeBookingsCount = 0,
  unreadMessagesCount = 0,
  favoritesCount = 0,
  onLogout,
}: CustomerHeaderProps) {
  const router = useRouter();
  const { user, logout, switchRole } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      router.push('/login');
    }
  };

  const navTabs = [
    { id: 'home' as CustomerTab, label: 'Home', icon: Home },
    { id: 'explore' as CustomerTab, label: 'Explore Services', icon: Search },
    {
      id: 'bookings' as CustomerTab,
      label: 'My Bookings',
      icon: CalendarCheck,
      badge: activeBookingsCount > 0 ? activeBookingsCount : undefined
    },
    {
      id: 'messages' as CustomerTab,
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined
    },
    {
      id: 'favorites' as CustomerTab,
      label: 'Favourites',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : undefined
    },
  ];

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      if (onSearchSubmit) {
        onSearchSubmit(searchInput.trim());
      }
      setActiveTab('explore');
    }
  };

  const handleSearchSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      if (onSearchSubmit) {
        onSearchSubmit(searchInput.trim());
      }
      setActiveTab('explore');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#EDEAE1]/95 backdrop-blur-xl border-b border-[#D8D2C4] transition-all text-stone-900 shadow-sm">
      {/* Top Row: Brand Logo, Nav Links, and Profile */}
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 max-w-[1840px] 2xl:max-w-[1920px] mx-auto">
        {/* Left: Brand Logo & Location */}
        <div className="flex items-center gap-5 min-w-0 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            {/* Orbital stylized WORKSY logo glyph */}
            <div className="w-7 h-7 rounded-full border border-stone-800/40 flex items-center justify-center relative transition-transform group-hover:scale-105">
              <div className="w-3.5 h-3.5 rounded-full border border-stone-800/70 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-stone-900" />
              </div>
              <div className="absolute inset-0 rounded-full border-t border-stone-900 rotate-45" />
            </div>
            <span className="font-display text-2xl italic tracking-tightest text-stone-900 group-hover:text-black transition-colors">
              Worksy
            </span>
          </Link>

          {/* Location Selector Button */}
          <button
            onClick={onOpenLocationModal}
            className="hidden sm:flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-950 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-black/5"
            title="Change service location"
          >
            <MapPin size={13} className="text-stone-500 shrink-0" />
            <span className="font-medium max-w-[130px] lg:max-w-[180px] truncate">{selectedLocation || 'Bengaluru, Karnataka'}</span>
            <ChevronDown size={12} className="text-stone-500 shrink-0" />
          </button>
        </div>

        {/* Center: Nav Items (Home, Explore Services, My Bookings, Messages, Favourites) */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
          {navTabs.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3 lg:px-3.5 py-1.5 sm:py-2 rounded-xl text-[13px] tracking-tight transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-stone-900 text-white font-semibold shadow-sm border border-stone-800'
                    : 'text-stone-700 font-medium hover:text-stone-950 hover:bg-black/5'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-white' : 'text-stone-500'} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notifications Bell with Dot */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full hover:bg-black/5 text-stone-700 hover:text-stone-950 transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-black/5 transition-colors"
            >
              <img
                src="/images/user-charan.jpg"
                alt={user?.name || "Profile"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';
                }}
                className="w-7 h-7 rounded-full object-cover border border-stone-300"
              />
              <span className="text-xs font-medium text-stone-800">
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown size={12} className="text-stone-500" />
            </button>

            {/* Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/98 border border-stone-200 backdrop-blur-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-stone-900">
                <div className="px-4 py-2.5 border-b border-stone-100">
                  <div className="text-xs font-bold text-stone-900">{user?.name}</div>
                  <div className="text-[11px] text-stone-500 truncate">{user?.email}</div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                    <CheckCircle2 size={12} />
                    <span>Verified Customer</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-100 transition-colors text-left"
                  >
                    <User size={14} className="text-stone-500" />
                    <span>My Profile & Addresses</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('bookings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-100 transition-colors text-left"
                  >
                    <CalendarCheck size={14} className="text-stone-500" />
                    <span>My Bookings</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('favorites');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-100 transition-colors text-left"
                  >
                    <Heart size={14} className="text-stone-500" />
                    <span>Saved Providers</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-100 transition-colors text-left"
                  >
                    <Settings size={14} className="text-stone-500" />
                    <span>Preferences & Security</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('help');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-100 transition-colors text-left"
                  >
                    <HelpCircle size={14} className="text-stone-500" />
                    <span>Help & Support Center</span>
                  </button>
                </div>

                <div className="border-t border-stone-100 my-1" />

                {/* Switch to Provider Portal */}
                <div className="px-2 py-1">
                  <button
                    onClick={() => {
                      switchRole('provider');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <RefreshCw size={13} className="text-stone-600" />
                      <span>Switch to Provider Mode</span>
                    </div>
                    <span className="text-[10px] font-mono bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">Pro</span>
                  </button>
                </div>

                <div className="border-t border-stone-100 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Header: Search Bar Below Navbar */}
      <div className="w-full border-t border-[#D8D2C4] bg-[#E3DDD0]/90 py-2.5 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSearchSubmitForm}
            className="relative w-full flex items-center"
          >
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Search for a service, professional or category..."
              className="w-full pl-11 pr-24 py-2 rounded-full bg-white border border-[#D5CFC2] hover:border-stone-400 focus:border-stone-900 focus:bg-white text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none transition-all shadow-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 transition-colors"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
