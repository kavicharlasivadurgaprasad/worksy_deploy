'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  Search,
  CalendarCheck,
  MessageSquare,
  Heart,
  Gift,
  Bell,
  User,
  Settings,
  HelpCircle,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export type CustomerTab =
  | 'home'
  | 'explore'
  | 'bookings'
  | 'messages'
  | 'favorites'
  | 'offers'
  | 'profile'
  | 'settings'
  | 'help';

interface CustomerSidebarProps {
  activeTab: CustomerTab;
  setActiveTab: (tab: CustomerTab) => void;
  activeBookingsCount?: number;
  unreadMessagesCount?: number;
  favoritesCount?: number;
  selectedLocation: string;
  onOpenLocationModal?: () => void;
  onQuickBook?: () => void;
}

export default function CustomerSidebar({
  activeTab,
  setActiveTab,
}: CustomerSidebarProps) {
  const navItems = [
    { id: 'home' as CustomerTab, label: 'Home', icon: Home },
    { id: 'explore' as CustomerTab, label: 'Explore Services', icon: Search },
    { id: 'bookings' as CustomerTab, label: 'My Bookings', icon: CalendarCheck },
    { id: 'messages' as CustomerTab, label: 'Messages', icon: MessageSquare },
    { id: 'favorites' as CustomerTab, label: 'Favorites', icon: Heart },
    { id: 'offers' as CustomerTab, label: 'Offers & Rewards', icon: Gift },
    { id: 'notifications' as CustomerTab, label: 'Notifications', icon: Bell },
    { id: 'profile' as CustomerTab, label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col bg-[#08080A] border-r border-[#1F1F24] min-h-[calc(100vh-4rem)] px-3.5 py-6 sticky top-16 select-none z-20 text-zinc-300">
      <nav className="space-y-1 w-full">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#222226] text-white font-semibold shadow-inner'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#151518]'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-zinc-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

