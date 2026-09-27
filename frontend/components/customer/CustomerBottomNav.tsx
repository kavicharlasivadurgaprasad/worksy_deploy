'use client';

import React from 'react';
import { CustomerTab } from './CustomerSidebar';
import { Home, Search, CalendarCheck, MessageSquare, User } from 'lucide-react';

interface CustomerBottomNavProps {
  activeTab: CustomerTab;
  setActiveTab: (tab: CustomerTab) => void;
  activeBookingsCount?: number;
  unreadMessagesCount?: number;
}

export default function CustomerBottomNav({
  activeTab,
  setActiveTab,
  activeBookingsCount = 2,
  unreadMessagesCount = 1
}: CustomerBottomNavProps) {
  const tabs = [
    { id: 'home' as CustomerTab, label: 'Home', icon: Home, emoji: '🏠' },
    { id: 'explore' as CustomerTab, label: 'Explore', icon: Search, emoji: '🔍' },
    {
      id: 'bookings' as CustomerTab,
      label: 'Bookings',
      icon: CalendarCheck,
      emoji: '📋',
      badge: activeBookingsCount > 0 ? activeBookingsCount : undefined
    },
    {
      id: 'messages' as CustomerTab,
      label: 'Messages',
      icon: MessageSquare,
      emoji: '💬',
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined
    },
    { id: 'profile' as CustomerTab, label: 'Profile', icon: User, emoji: '👤' }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/90 backdrop-blur-xl border-t border-white/10 safe-area-inset-bottom shadow-2xl">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive =
            activeTab === tab.id ||
            (tab.id === 'profile' && ['settings', 'help', 'offers', 'favorites'].includes(activeTab));
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-colors ${
                isActive ? 'text-cyan-400' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-black">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
