'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  Briefcase,
  Calendar,
  MessageSquare,
  Users,
  DollarSign,
  Star,
  BarChart3,
  Gift,
  Bell,
  Settings,
  HelpCircle,
  User,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { JobStatus } from '@/lib/provider-data';

export type ProviderMainTab =
  | 'dashboard'
  | 'jobs'
  | 'calendar'
  | 'messages'
  | 'customers'
  | 'earnings'
  | 'reviews'
  | 'analytics'
  | 'offers'
  | 'notifications'
  | 'settings'
  | 'help'
  | 'profile';

export type EarningsSubTab = 'overview' | 'transactions' | 'withdrawals';

interface ProviderSidebarProps {
  activeTab: ProviderMainTab;
  setActiveTab: (tab: ProviderMainTab) => void;
  activeJobSubTab: JobStatus;
  setActiveJobSubTab: (subTab: JobStatus) => void;
  activeEarningsSubTab: EarningsSubTab;
  setActiveEarningsSubTab: (subTab: EarningsSubTab) => void;
  newRequestsCount: number;
  ongoingCount: number;
  unreadMessagesCount: number;
  unreadNotifsCount: number;
  isOnline: boolean;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onSwitchToCustomer: () => void;
}

export default function ProviderSidebar({
  activeTab,
  setActiveTab,
  activeJobSubTab,
  setActiveJobSubTab,
  activeEarningsSubTab,
  setActiveEarningsSubTab,
  newRequestsCount,
  ongoingCount,
  unreadMessagesCount,
  unreadNotifsCount,
  isOnline,
  isMobileOpen,
  setIsMobileOpen,
  onSwitchToCustomer
}: ProviderSidebarProps) {
  const [jobsExpanded, setJobsExpanded] = React.useState(true);
  const [earningsExpanded, setEarningsExpanded] = React.useState(true);

  const jobSubTabs: { id: JobStatus; label: string; badge?: number }[] = [
    { id: 'New Requests', label: 'New Requests', badge: newRequestsCount },
    { id: 'Upcoming', label: 'Upcoming' },
    { id: 'Ongoing', label: 'Ongoing', badge: ongoingCount },
    { id: 'Completed', label: 'Completed' },
    { id: 'Cancelled', label: 'Cancelled' }
  ];

  const earningsSubTabs: { id: EarningsSubTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'withdrawals', label: 'Withdrawals' }
  ];

  const handleTabClick = (tab: ProviderMainTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const handleJobSubClick = (sub: JobStatus) => {
    setActiveTab('jobs');
    setActiveJobSubTab(sub);
    setIsMobileOpen(false);
  };

  const handleEarningsSubClick = (sub: EarningsSubTab) => {
    setActiveTab('earnings');
    setActiveEarningsSubTab(sub);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 lg:w-80 bg-[#F5F2EB] border-r border-[#E2DCCF] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Branding & Close on mobile */}
        <div>
          <div className="p-6 border-b border-[#E2DCCF]/80 flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="font-display text-2xl sm:text-3xl font-medium italic tracking-tightest text-stone-900 group-hover:text-black transition-colors">
                Worksy
              </span>
              <span className="px-2 py-0.5 rounded-full bg-black text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                Pro
              </span>
            </Link>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-xl hover:bg-stone-200/80 text-stone-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Online status indicator */}
          <div className="px-6 pt-4 pb-2">
            <div className="p-2.5 rounded-2xl bg-white/80 border border-[#E2DCCF] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  {isOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      isOnline ? 'bg-emerald-500' : 'bg-stone-400'
                    }`}
                  />
                </span>
                <span className="text-xs font-bold text-stone-800">
                  {isOnline ? 'Online • Receiving Leads' : 'Offline • Paused'}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-stone-400">Live</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)] no-scrollbar">
            {/* 1. Dashboard */}
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
            >
              <Home size={18} />
              <span>Dashboard</span>
            </button>

            {/* 2. Jobs (with expandable tree) */}
            <div>
              <button
                onClick={() => {
                  setActiveTab('jobs');
                  setJobsExpanded(!jobsExpanded);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'jobs'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase size={18} />
                  <span>Jobs</span>
                  {newRequestsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-extrabold">
                      {newRequestsCount}
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${
                    jobsExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Subtabs for Jobs */}
              {jobsExpanded && (
                <div className="ml-5 pl-3 border-l-2 border-[#E2DCCF] mt-1 space-y-1 py-1">
                  {jobSubTabs.map((sub) => {
                    const isSubActive = activeTab === 'jobs' && activeJobSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleJobSubClick(sub.id)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSubActive
                            ? 'bg-stone-800 text-white font-bold'
                            : 'text-stone-600 hover:text-black hover:bg-stone-200/50'
                        }`}
                      >
                        <span>{sub.label}</span>
                        {sub.badge !== undefined && sub.badge > 0 && (
                          <span
                            className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                              sub.id === 'Ongoing'
                                ? 'bg-emerald-500 text-white animate-pulse'
                                : 'bg-amber-300 text-black'
                            }`}
                          >
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Calendar */}
            <button
              onClick={() => handleTabClick('calendar')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
            >
              <Calendar size={18} />
              <span>Calendar</span>
            </button>

            {/* 4. Messages */}
            <button
              onClick={() => handleTabClick('messages')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'messages'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={18} />
                <span>Messages</span>
              </div>
              {unreadMessagesCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* 5. Customers */}
            <button
              onClick={() => handleTabClick('customers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'customers'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
            >
              <Users size={18} />
              <span>Customers</span>
            </button>

            {/* 6. Earnings (with expandable tree) */}
            <div>
              <button
                onClick={() => {
                  setActiveTab('earnings');
                  setEarningsExpanded(!earningsExpanded);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'earnings'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} />
                  <span>Earnings</span>
                </div>
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${
                    earningsExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Subtabs for Earnings */}
              {earningsExpanded && (
                <div className="ml-5 pl-3 border-l-2 border-[#E2DCCF] mt-1 space-y-1 py-1">
                  {earningsSubTabs.map((sub) => {
                    const isSubActive = activeTab === 'earnings' && activeEarningsSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleEarningsSubClick(sub.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSubActive
                            ? 'bg-stone-800 text-white font-bold'
                            : 'text-stone-600 hover:text-black hover:bg-stone-200/50'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 7. Reviews */}
            <button
              onClick={() => handleTabClick('reviews')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star size={18} />
                <span>Reviews</span>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                4.86 ★
              </span>
            </button>

            {/* 8. Analytics */}
            <button
              onClick={() => handleTabClick('analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
            >
              <BarChart3 size={18} />
              <span>Analytics</span>
            </button>

            {/* 9. Offers */}
            <button
              onClick={() => handleTabClick('offers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'offers'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
            >
              <Gift size={18} />
              <span>Offers</span>
            </button>

            {/* Divider */}
            <div className="pt-2 pb-1">
              <hr className="border-[#E2DCCF]" />
            </div>

            {/* 10. Notifications */}
            <button
              onClick={() => handleTabClick('notifications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'notifications'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell size={18} />
                <span>Notifications</span>
              </div>
              {unreadNotifsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* 11. Settings */}
            <button
              onClick={() => handleTabClick('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>

            {/* 12. Help & Support */}
            <button
              onClick={() => handleTabClick('help')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'help'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
            >
              <HelpCircle size={18} />
              <span>Help & Support</span>
            </button>

            {/* 13. My Profile */}
            <button
              onClick={() => handleTabClick('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
            >
              <User size={18} />
              <span>My Profile</span>
            </button>
          </nav>
        </div>

        {/* Bottom User Card & Switch to Customer */}
        <div className="p-4 border-t border-[#E2DCCF] bg-white/60 space-y-2.5">
          <div className="flex items-center gap-3 px-1">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
                alt="Ravi"
                className="w-10 h-10 rounded-xl object-cover border border-stone-200"
              />
              <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-2.5 h-2.5 rounded-full border-2 border-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-stone-900 truncate">Ravi Sharma</div>
              <div className="text-[11px] text-stone-500 truncate">Ravi Electricals & AC</div>
            </div>
          </div>

          <button
            onClick={onSwitchToCustomer}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-[11px] font-bold text-stone-800 transition-colors"
          >
            <span>Switch to Customer Mode</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </aside>
    </>
  );
}
