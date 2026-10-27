'use client';

import UserAvatar from '@/components/shared/UserAvatar';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Search,
  Bell,
  User,
  ChevronDown,
  ChevronRight,
  LogOut,
  HelpCircle,
  Settings,
  Heart,
  CalendarCheck,
  CheckCircle2,
  Home,
  MessageSquare,
  Gift,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { CustomerTab } from './CustomerSidebar';

interface CustomerHeaderProps {
  selectedLocation: string;
  onOpenLocationModal: () => void;
  onOpenWalletModal?: () => void;
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
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
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

  const profileMenuItems = [
    {
      id: 'profile' as CustomerTab,
      label: 'My Profile & Addresses',
      description: 'Personal details & saved addresses',
      icon: User,
      tileBg: 'bg-stone-100 text-stone-900 group-hover:bg-stone-900 group-hover:text-white',
    },
    {
      id: 'bookings' as CustomerTab,
      label: 'My Bookings',
      description: 'Active services & booking history',
      icon: CalendarCheck,
      tileBg: 'bg-amber-100 text-amber-900 group-hover:bg-amber-600 group-hover:text-white',
      badge: activeBookingsCount > 0 ? `${activeBookingsCount} active` : undefined,
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300',
    },
    {
      id: 'favorites' as CustomerTab,
      label: 'Saved Providers',
      description: 'Your shortlisted professionals',
      icon: Heart,
      tileBg: 'bg-rose-100 text-rose-800 group-hover:bg-rose-600 group-hover:text-white',
      badge: favoritesCount > 0 ? `${favoritesCount}` : undefined,
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-200',
    },
    {
      id: 'offers' as CustomerTab,
      label: 'Offers & Coupons',
      description: 'Exclusive discounts & vouchers',
      icon: Gift,
      tileBg: 'bg-emerald-100 text-emerald-900 group-hover:bg-emerald-600 group-hover:text-white',
    },
    {
      id: 'settings' as CustomerTab,
      label: 'Preferences & Security',
      description: 'Account settings, notifications & privacy',
      icon: Settings,
      tileBg: 'bg-stone-100 text-stone-900 group-hover:bg-stone-900 group-hover:text-white',
    },
    {
      id: 'help' as CustomerTab,
      label: 'Help & Support',
      description: 'FAQs, ticket status & customer care',
      icon: HelpCircle,
      tileBg: 'bg-blue-100 text-blue-900 group-hover:bg-blue-600 group-hover:text-white',
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
            className="hidden sm:flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-950 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-black/5 cursor-pointer"
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
                className={`relative flex items-center gap-2 px-3 lg:px-3.5 py-1.5 sm:py-2 rounded-xl text-[13px] tracking-tight transition-all whitespace-nowrap cursor-pointer ${
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
            className="relative p-2 rounded-full hover:bg-black/5 text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
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
              className={`flex items-center gap-2.5 py-1 pl-1 pr-3 rounded-full border transition-all duration-200 cursor-pointer ${
                profileDropdownOpen
                  ? 'bg-white border-stone-400 shadow-sm ring-2 ring-stone-900/10'
                  : 'bg-white/80 hover:bg-white border-[#D5CFC2] hover:border-stone-400 shadow-2xs hover:shadow-sm'
              }`}
              title="Account Menu"
            >
              <UserAvatar src={user?.avatar} name={user?.name || "Profile"} className="w-7 h-7 rounded-full border border-stone-300" />
              <span className="text-xs font-bold text-stone-900">
                {user?.name?.split(' ')[0] || 'Account'}
              </span>
              <ChevronDown
                size={13}
                className={`text-stone-600 transition-transform duration-200 ${
                  profileDropdownOpen ? 'rotate-180 text-stone-950' : ''
                }`}
              />
            </button>

            {/* Menu Dropdown Card */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-76 sm:w-80 rounded-2xl bg-white border border-stone-200/90 shadow-2xl shadow-stone-900/15 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-stone-900">
                {/* User Info Header Card */}
                <div className="px-4 py-3 border-b border-stone-100 flex items-start gap-3">
                  <UserAvatar src={user?.avatar} name={user?.name || "Profile"} className="w-10 h-10 rounded-full border border-stone-200 shadow-2xs mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-stone-950 truncate leading-snug">
                      {user?.name || 'Customer Account'}
                    </div>
                    <div className="text-xs font-medium text-stone-500 truncate leading-tight">
                      {user?.email || 'customer@worksy.in'}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                        <span>Verified Customer</span>
                      </span>
                    </div>
                  </div>
                </div>



                {/* Options List */}
                <div className="px-2 py-1 space-y-0.5">
                  <p className="px-3 pt-1.5 pb-1 text-[10px] uppercase tracking-wider font-bold text-stone-400">
                    Account & Navigation
                  </p>

                  {profileMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isCurrent = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer group ${
                          isCurrent
                            ? 'bg-stone-100 text-stone-950 font-semibold ring-1 ring-stone-200'
                            : 'text-stone-800 hover:bg-stone-50 hover:text-stone-950'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${item.tileBg}`}
                        >
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[13px] font-bold text-stone-900 group-hover:text-black leading-tight">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${item.badgeClass}`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-stone-500 group-hover:text-stone-700 truncate leading-tight mt-0.5">
                            {item.description}
                          </p>
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-stone-300 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
                        />
                      </button>
                    );
                  })}
                </div>



                {/* Log Out */}
                <div className="px-2 pt-1 pb-0.5 border-t border-stone-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-50 group-hover:bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 transition-colors">
                      <LogOut size={14} />
                    </div>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
