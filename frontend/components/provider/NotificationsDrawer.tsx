'use client';

import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CreditCard, 
  Calendar, 
  MessageSquare, 
  Star, 
  Info,
  Clock
} from 'lucide-react';
import { ProviderNotification } from '@/lib/provider-data';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ProviderNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (item: ProviderNotification) => void;
}

function NotificationsDrawerContent({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification
}: NotificationsDrawerProps) {
  // Never true at runtime: the exported wrapper only renders this when isOpen is set.
  // Kept so TypeScript narrows the prop; it stops hooks below from being skipped on close.
  if (!isOpen) return null;

  const [filter, setFilter] = useState<'all' | 'lead' | 'booking' | 'payment' | 'review' | 'reminder'>('all');

  const filtered = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const getIcon = (type: ProviderNotification['type']) => {
    switch (type) {
      case 'lead':
      case 'booking':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'review':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 border-l border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-stone-900 text-base">
                Notifications
              </h3>
              <p className="text-xs text-stone-500">
                {notifications.filter(n => !n.read).length} unread updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onMarkAllAsRead}
              title="Mark all as read"
              className="text-xs font-medium text-stone-600 hover:text-stone-900 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-3 border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'lead', 'payment', 'review'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
                filter === cat
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-sm">
              No notifications in this category.
            </div>
          ) : (
            filtered.map((notif) => {
              const text = notif.message || (notif as any).description;
              const time = notif.timestamp || (notif as any).time;
              return (
                <div
                  key={notif.id}
                  onClick={() => onSelectNotification(notif)}
                  className={`p-4 transition-colors cursor-pointer hover:bg-stone-50/80 flex items-start gap-3.5 ${
                    !notif.read ? 'bg-amber-50/40' : 'bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold truncate ${
                        !notif.read ? 'text-stone-900' : 'text-stone-700'
                      }`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-stone-400 shrink-0">
                        {time}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {text}
                    </p>
                  </div>

                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 text-center">
          <p className="text-[11px] text-stone-500">
            Push alerts &amp; WhatsApp dispatch enabled for high priority bookings.
          </p>
        </div>
      </div>
    </div>
  );
}

export { NotificationsDrawer };

/** Wrapper: returns early BEFORE any hook runs (closing the modal used to change the hook count and crash React). */
export default function NotificationsDrawer(props: NotificationsDrawerProps) {
  if (!props.isOpen) return null;
  return <NotificationsDrawerContent {...props} />;
}
