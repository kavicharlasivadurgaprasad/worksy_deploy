'use client';

import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Tag,
  Clock,
  CreditCard,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { NotificationItem } from '@/lib/marketplace-data';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onNotificationClick: (notif: NotificationItem) => void;
}

export default function NotificationsDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onNotificationClick
}: NotificationsDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-stone-700" />
              <h2 className="text-base font-bold text-stone-900">Notifications</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                {notifications.filter((n) => !n.read).length} new
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-stone-100 text-stone-500"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-[11px] font-semibold text-stone-600">
            <button
              onClick={onMarkAllRead}
              className="hover:text-black transition-colors"
            >
              Mark all as read
            </button>
            <button
              onClick={onClearAll}
              className="text-rose-600 hover:text-rose-800 transition-colors"
            >
              Clear all
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => onNotificationClick(notif)}
                  className={`p-4 cursor-pointer transition-colors ${
                    notif.read ? 'bg-white hover:bg-stone-50' : 'bg-amber-50/40 hover:bg-amber-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-bold text-stone-900">{notif.title}</div>
                    <span className="text-[10px] text-stone-400 shrink-0">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
