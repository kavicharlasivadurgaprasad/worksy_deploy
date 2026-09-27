'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  DollarSign,
  Calendar,
  Users,
  Star,
  BarChart3,
  Gift,
  Bell,
  Settings,
  HelpCircle,
  User,
  LogOut,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  MapPin,
  Sparkles
} from 'lucide-react';
import { ProviderMainTab } from './ProviderSidebar';
import { useAuth } from '@/lib/auth-context';

interface ProviderHeaderProps {
  activeTab: ProviderMainTab;
  onSelectTab: (tab: ProviderMainTab) => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  newRequestsCount: number;
  unreadMessagesCount?: number;
  onSwitchToCustomer: () => void;
  onLogout?: () => void;
}

export default function ProviderHeader({
  activeTab,
  onSelectTab,
  isOnline,
  onToggleOnline,
  unreadNotifsCount,
  onOpenNotifications,
  newRequestsCount,
  unreadMessagesCount = 2,
  onSwitchToCustomer,
  onLogout
}: ProviderHeaderProps) {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Primary 4 Tabs in Navbar
  const primaryTabs: { id: ProviderMainTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, badge: newRequestsCount },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'earnings', label: 'Earnings', icon: DollarSign }
  ];

  // Secondary Options in Profile Dropdown
  const profileDropdownSections: { id: ProviderMainTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'calendar', label: 'Calendar & Schedule', icon: Calendar },
    { id: 'customers', label: 'Customers (CRM)', icon: Users },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star, badge: '4.86 ⭐' },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
    { id: 'offers', label: 'Special Offers', icon: Gift }
  ];

  const handleDropdownSelect = (tab: ProviderMainTab) => {
    onSelectTab(tab);
    setDropdownOpen(false);
  };

  const handleMobileSelect = (tab: ProviderMainTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#EDEAE1]/95 backdrop-blur-xl border-b border-[#D8D2C4] px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-[1840px] 2xl:max-w-[1920px] mx-auto">
        {/* Left: Brand & Online Toggle */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl bg-white/80 border border-[#D8D2C4] text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <Link href="/provider" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-sm tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
              W
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-stone-900 leading-none">
                  WORKSY
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider border border-amber-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[10px] tracking-wide text-stone-500 font-medium hidden sm:block">
                Operations Center
              </span>
            </div>
          </Link>

          {/* Quick Online Status Badge */}
          <button
            onClick={onToggleOnline}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300'
            }`}
            title={isOnline ? 'Click to switch offline' : 'Click to switch online'}
          >
            <span className="relative flex h-2 w-2">
              {isOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOnline ? 'bg-emerald-500' : 'bg-stone-500'
                }`}
              />
            </span>
            <span className="text-[11px] font-bold">
              {isOnline ? 'Accepting Jobs' : 'Offline'}
            </span>
          </button>
        </div>

        {/* Center: Primary 4 Tabs in Navbar (Dashboard, Jobs, Messages, Earnings) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-white/70 p-1.5 rounded-2xl border border-[#D8D2C4] shadow-xs">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-amber-400' : 'text-stone-500'} />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-amber-400 text-stone-950'
                        : 'bg-amber-500/20 text-amber-900'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Notifications & Profile Picture Dropdown (Replacing Customer View) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-2xl bg-white/80 hover:bg-white border border-[#D8D2C4] text-stone-700 hover:text-stone-900 transition-colors shadow-xs cursor-pointer"
            title="Notifications"
            aria-label="Open notifications"
          >
            <Bell size={18} />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Profile Picture Trigger & Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2.5 p-1 sm:pr-3 rounded-2xl border transition-all cursor-pointer ${
                dropdownOpen
                  ? 'bg-white border-stone-800 ring-2 ring-stone-900/10 shadow-md'
                  : 'bg-white/80 hover:bg-white border-[#D8D2C4] shadow-xs'
              }`}
              aria-label="Provider account menu"
            >
              <div className="relative">
                <img
                  src={user?.avatar || "/images/provider-ac.jpg"}
                  alt={user?.name || "Profile"}
                  className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-xl object-cover border border-stone-200"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="hidden sm:block text-left min-w-0 max-w-[120px]">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-stone-900 truncate block">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                </div>
                <span className="text-[10px] text-stone-500 truncate block leading-tight">
                  {user?.businessName}
                </span>
              </div>

              <ChevronDown
                size={15}
                className={`text-stone-500 transition-transform hidden sm:block ${
                  dropdownOpen ? 'rotate-180 text-stone-900' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Container */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-76 sm:w-80 bg-white rounded-3xl shadow-2xl border border-stone-200/90 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header Card inside Dropdown */}
                <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3">
                  <img
                    src={user?.avatar || "/images/provider-ac.jpg"}
                    alt={user?.name || "Profile"}
                    className="w-11 h-11 rounded-2xl object-cover border border-stone-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-display font-semibold text-stone-900 text-sm truncate">
                        {user?.name}
                      </h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        PRO
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 truncate">{user?.businessName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-md">
                        <Star size={10} className="fill-amber-500 text-amber-500" />
                        4.86
                      </span>
                      <span className="text-[11px] text-stone-400 truncate">
                        Indiranagar, Bengaluru
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operations & Management Sections (Moved from left sidebar) */}
                <div className="px-2 py-2 space-y-0.5">
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wider font-semibold text-stone-400">
                    Business Management
                  </p>

                  {profileDropdownSections.map((item) => {
                    const Icon = item.icon;
                    const isCurrent = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleDropdownSelect(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-stone-900 text-white font-semibold'
                            : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            size={16}
                            className={isCurrent ? 'text-amber-400' : 'text-stone-500'}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                              isCurrent ? 'bg-stone-800 text-stone-200' : 'text-stone-500'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Settings & Support Divider */}
                <div className="border-t border-stone-100 px-2 py-2 space-y-0.5">
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wider font-semibold text-stone-400">
                    Preferences &amp; Support
                  </p>

                  <button
                    onClick={() => handleDropdownSelect('settings')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <Settings size={16} className={activeTab === 'settings' ? 'text-amber-400' : 'text-stone-500'} />
                    <span>Partner Settings</span>
                  </button>

                  <button
                    onClick={() => handleDropdownSelect('help')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'help'
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <HelpCircle size={16} className={activeTab === 'help' ? 'text-amber-400' : 'text-stone-500'} />
                    <span>Help &amp; Partner Desk</span>
                  </button>
                </div>

                {/* Account Actions: Switch to Customer & Logout */}
                <div className="border-t border-stone-100 px-2 pt-2 pb-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onSwitchToCustomer();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-amber-50 hover:text-amber-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ArrowUpRight size={16} className="text-amber-700" />
                      <span>Switch to Customer View</span>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-medium">
                      Customer
                    </span>
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-250">
            {/* Mobile Header */}
            <div className="flex items-center justify-between pb-5 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                  W
                </div>
                <div>
                  <span className="font-display font-bold text-base text-stone-900">
                    WORKSY PRO
                  </span>
                  <span className="text-[10px] text-stone-500 block">Navigation</span>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-2">
                  Primary Operations
                </p>
                <div className="space-y-1">
                  {primaryTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleMobileSelect(tab.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? 'bg-stone-900 text-white'
                            : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} className={isActive ? 'text-amber-400' : 'text-stone-500'} />
                          <span>{tab.label}</span>
                        </div>
                        {typeof tab.badge === 'number' && tab.badge > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-stone-950 font-bold">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-2">
                  More Management
                </p>
                <div className="space-y-1">
                  {profileDropdownSections.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMobileSelect(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? 'bg-stone-900 text-white'
                            : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} className={isActive ? 'text-amber-400' : 'text-stone-500'} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] text-stone-500">{item.badge}</span>
                        )}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handleMobileSelect('settings')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      activeTab === 'settings' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Settings size={16} className="text-stone-500" />
                    <span>Partner Settings</span>
                  </button>

                  <button
                    onClick={() => handleMobileSelect('help')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      activeTab === 'help' ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <HelpCircle size={16} className="text-stone-500" />
                    <span>Help &amp; Support</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="pt-4 border-t border-stone-100 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSwitchToCustomer();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold"
              >
                <ArrowUpRight size={14} />
                <span>Switch to Customer View</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export { ProviderHeader };
