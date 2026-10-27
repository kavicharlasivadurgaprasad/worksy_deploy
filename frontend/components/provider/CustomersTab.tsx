'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Users,
  Calendar,
  Phone,
  MessageSquare,
  MapPin,
  Briefcase,
  RefreshCw,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { mapProviderCustomer } from '@/lib/mappers';
import type { ProviderCustomer } from '@/lib/provider-data';
import UserAvatar from '@/components/shared/UserAvatar';

interface CustomersTabProps {
  /** Opens the chat with this customer (the parent switches to the Messages tab). */
  onOpenCustomerChat?: (customer: ProviderCustomer) => void;
}

/**
 * The provider's real customers: people who have a non-cancelled booking with THIS provider.
 * The list comes from GET /provider/customers, where the backend identifies the provider from the
 * JWT. There is no mock or fallback data: no customers means an empty state.
 */
export default function CustomersTab({ onOpenCustomerChat }: CustomersTabProps) {
  const [customers, setCustomers] = useState<ProviderCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadCustomers = useCallback(async (isCancelled: () => boolean = () => false) => {
    setIsLoading(true);
    setError('');
    try {
      const rows = await api.getMyCustomers();
      if (!isCancelled()) setCustomers(rows.map(mapProviderCustomer));
    } catch (e) {
      if (!isCancelled()) {
        setError(e instanceof ApiError || e instanceof Error ? e.message : 'Could not load your customers.');
      }
    } finally {
      if (!isCancelled()) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadCustomers(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [loadCustomers]);

  const q = search.trim().toLowerCase();
  const filtered = customers.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.lastServiceTitle.toLowerCase().includes(q) ||
      c.lastLocation.toLowerCase().includes(q)
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
            Customers who have booked you, with their booking history and what they have spent with you.
          </p>
        </div>

        {!isLoading && !error && (
          <span className="text-xs sm:text-sm font-semibold text-stone-600 bg-stone-100 px-4 py-2 rounded-full self-start sm:self-auto">
            {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div role="status" className="py-20 text-center text-sm text-stone-600">
          Loading your customers...
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white border border-rose-200 text-center space-y-4">
          <p role="alert" className="text-sm font-semibold text-rose-700">{error}</p>
          <button
            onClick={() => void loadCustomers()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-stone-800 transition-colors"
          >
            <RefreshCw size={13} />
            <span>Try again</span>
          </button>
        </div>
      )}

      {/* Empty: no real customers yet */}
      {!isLoading && !error && customers.length === 0 && (
        <div className="max-w-xl mx-auto p-10 rounded-3xl bg-white border border-stone-200/90 text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
            <Users size={24} />
          </div>
          <h3 className="font-display text-2xl font-medium text-stone-900">No customers yet</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            When customers book your services, they will appear here with their booking history.
          </p>
        </div>
      )}

      {!isLoading && !error && customers.length > 0 && (
        <>
          {/* Search Input */}
          <div className="relative max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, phone, service..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-black shadow-xs"
            />
          </div>

          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-stone-600">No customers match your search.</p>
          )}

          {/* Customer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((cust) => (
              <div
                key={cust.id}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/90 hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Avatar & Name */}
                  <div className="flex items-center gap-3.5">
                    <UserAvatar
                      src={cust.avatar}
                      name={cust.name}
                      className="w-14 h-14 rounded-2xl border border-stone-200"
                    />
                    <div className="min-w-0">
                      <h3 className="font-display font-medium text-stone-900 text-xl tracking-tight truncate">
                        {cust.name}
                      </h3>
                      {cust.phone && <div className="text-xs text-stone-500 mt-0.5">{cust.phone}</div>}
                    </div>
                  </div>

                  {/* Stats Strip: Bookings & Lifetime Spend */}
                  <div className="grid grid-cols-2 gap-3 mt-5 p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-center">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-stone-400">Total Bookings</div>
                      <div className="text-lg font-display font-semibold text-stone-900 mt-0.5">
                        {cust.totalBookings} {cust.totalBookings === 1 ? 'service' : 'services'}
                      </div>
                    </div>
                    <div className="border-l border-stone-200">
                      <div className="text-[10px] uppercase font-semibold text-stone-400">Completed Spend</div>
                      <div className="text-lg font-display font-semibold text-emerald-800 mt-0.5">
                        ₹{cust.totalSpent.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Information Rows */}
                  <div className="mt-4 space-y-2 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-stone-400 shrink-0" />
                      <span>Latest booking: <strong>{cust.lastBookingDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={13} className="text-stone-400 shrink-0" />
                      <span className="truncate">
                        <strong>{cust.lastServiceTitle}</strong> · {cust.lastStatus}
                      </span>
                    </div>
                    {cust.lastLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-rose-500 shrink-0" />
                        <span className="truncate">{cust.lastLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2.5">
                  {cust.phone && (
                    <a
                      href={`tel:${cust.phone}`}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Phone size={13} />
                      <span>Call</span>
                    </a>
                  )}
                  <button
                    onClick={() => onOpenCustomerChat?.(cust)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-black text-white text-xs font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare size={13} />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
