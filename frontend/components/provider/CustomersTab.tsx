'use client';

import React, { useState } from 'react';
import {
  Search,
  Users,
  Star,
  Calendar,
  DollarSign,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  FileText,
  ChevronRight
} from 'lucide-react';
import { ProviderCustomer, initialCustomers } from '@/lib/provider-data';

interface CustomersTabProps {
  onOpenCustomerChat?: (customerName: string) => void;
}

export default function CustomersTab({ onOpenCustomerChat }: CustomersTabProps) {
  const [customers, setCustomers] = useState<ProviderCustomer[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<ProviderCustomer | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.notes.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-24 w-full max-w-[1840px] 2xl:max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-500">
            Customer Relationship Management
          </p>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tightest text-stone-900 leading-tight">
            My <span className="italic font-normal">Customers</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-1 leading-relaxed">
            Directory of repeat clients, booking history, private technician notes, and lifetime spend.
          </p>
        </div>

        <span className="text-xs sm:text-sm font-semibold text-stone-600 bg-stone-100 px-4 py-2 rounded-full self-start sm:self-auto">
          {customers.length} verified clients
        </span>
      </div>

      {/* Search Input */}
      <div className="relative max-w-xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, phone, preferences..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black shadow-xs"
        />
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((cust) => (
          <div
            key={cust.id}
            className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/90 hover:shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Top Row: Avatar & Rating */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={cust.avatar}
                    alt={cust.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-stone-200 shrink-0"
                  />
                  <div>
                    <h3 className="font-display font-medium text-stone-900 text-xl tracking-tight">
                      {cust.name}
                    </h3>
                    <div className="text-xs text-stone-500 mt-0.5">{cust.phone}</div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 font-bold text-xs shrink-0">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span>{cust.rating}</span>
                </div>
              </div>

              {/* Stats Strip: Bookings & Lifetime Spend */}
              <div className="grid grid-cols-2 gap-3 mt-5 p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-stone-400">Total Bookings</div>
                  <div className="text-lg font-display font-semibold text-stone-900 mt-0.5">
                    {cust.totalBookings} services
                  </div>
                </div>
                <div className="border-l border-stone-200">
                  <div className="text-[10px] uppercase font-semibold text-stone-400">Lifetime Spend</div>
                  <div className="text-lg font-display font-semibold text-emerald-800 mt-0.5">
                    ₹{cust.totalSpent}
                  </div>
                </div>
              </div>

              {/* Information Rows */}
              <div className="mt-4 space-y-2 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-stone-400 shrink-0" />
                  <span>Last Service: <strong>{cust.lastServiceDate}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-stone-400 shrink-0" />
                  <span>Preferred Time: <strong>{cust.preferredSlot}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-rose-500 shrink-0" />
                  <span className="truncate">{cust.address}</span>
                </div>
              </div>

              {/* Private Notes Field */}
              <div className="mt-4 p-3 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs text-stone-700 leading-relaxed">
                <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider mb-0.5">
                  Technician Notes:
                </span>
                <span className="italic">&quot;{cust.notes}&quot;</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2.5">
              <a
                href={`tel:${cust.phone}`}
                className="flex-1 py-2.5 px-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone size={13} />
                <span>Call</span>
              </a>
              <button
                onClick={() => onOpenCustomerChat?.(cust.name)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-black text-white text-xs font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <MessageSquare size={13} />
                <span>Message</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
