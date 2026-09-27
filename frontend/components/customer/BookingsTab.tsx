'use client';

import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  ChevronRight,
  Sparkles,
  Phone,
  MessageSquare,
  FileText,
  RotateCcw,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Booking } from '@/lib/marketplace-data';

interface BookingsTabProps {
  bookings: Booking[];
  onTrackBooking: (booking: Booking) => void;
  onViewBookingDetails: (booking: Booking) => void;
  onMessageProvider: (booking: Booking) => void;
  onRateService: (booking: Booking) => void;
  onBookAgain: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  onViewInvoice: (booking: Booking) => void;
}

export default function BookingsTab({
  bookings,
  onTrackBooking,
  onViewBookingDetails,
  onMessageProvider,
  onRateService,
  onBookAgain,
  onCancelBooking,
  onViewInvoice
}: BookingsTabProps) {
  const [activeStatusTab, setActiveStatusTab] = useState<'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled'>('Upcoming');

  const filteredBookings = bookings.filter((b) => {
    if (activeStatusTab === 'Upcoming') {
      return b.status === 'Upcoming' || (b.status as any) === 'In Progress';
    }
    return b.status === activeStatusTab;
  });

  const getStatusBadge = (booking: Booking) => {
    if (booking.status === 'Upcoming') {
      if (booking.trackingStep === 3) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>On the Way (ETA {booking.etaMinutes}m)</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 text-[11px] font-bold border border-sky-200">
          <Clock size={12} />
          <span>Confirmed for {booking.date.split(',')[0]}</span>
        </span>
      );
    }
    if (booking.status === 'Completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-200">
          <CheckCircle2 size={12} />
          <span>Completed</span>
        </span>
      );
    }
    if (booking.status === 'Cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 text-[11px] font-bold border border-rose-200">
          <XCircle size={12} />
          <span>Cancelled & Refunded</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-24 lg:pb-16 w-full max-w-[1760px] 2xl:max-w-[1840px] mx-auto">
      {/* Title */}
      <div>
        <p className="text-[12px] uppercase tracking-[0.2em] font-semibold text-stone-500">
          Appointments &amp; History
        </p>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tightest text-stone-900">
          My <span className="italic font-normal">Bookings</span>
        </h1>
        <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed">
          Track active technicians, view booking summaries, rebook, or download tax invoices
        </p>
      </div>

      {/* Status Tabs: Upcoming | Ongoing | Completed | Cancelled */}
      <div className="flex items-center gap-3 border-b border-stone-200 overflow-x-auto no-scrollbar">
        {(['Upcoming', 'Completed', 'Cancelled'] as const).map((tab) => {
          const count = bookings.filter((b) => b.status === tab).length;
          const isActive = activeStatusTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveStatusTab(tab)}
              className={`flex items-center gap-2 pb-3.5 px-4 text-sm sm:text-base font-bold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-black text-black'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-black text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-display text-xl sm:text-2xl font-medium text-stone-900 tracking-tight">No {activeStatusTab.toLowerCase()} bookings</h3>
          <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto leading-relaxed">
            {activeStatusTab === 'Upcoming'
              ? 'You have no pending appointments. Discover top-rated local professionals in the Explore tab!'
              : `You do not have any ${activeStatusTab.toLowerCase()} orders.`}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 hover:shadow-lg transition-all space-y-5"
            >
              {/* Header: ID, Date, Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs sm:text-sm font-bold text-stone-800 bg-stone-100 px-3 py-1 rounded-lg">
                    #{booking.id}
                  </span>
                  <span className="text-xs text-stone-400">•</span>
                  <span className="text-xs sm:text-sm text-stone-500">Booked {booking.createdAt}</span>
                </div>
                <div>{getStatusBadge(booking)}</div>
              </div>

              {/* Main Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-start gap-4 sm:gap-5">
                  <img
                    src={booking.providerAvatar}
                    alt={booking.providerName}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border border-stone-200 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      {booking.category}
                    </div>
                    <h3 className="font-display font-medium text-stone-900 text-xl sm:text-2xl tracking-tight mt-1">
                      {booking.serviceTitle}
                    </h3>
                    <div className="text-sm text-stone-600 mt-1 font-medium">
                      Assigned Pro: <span className="font-semibold text-stone-900">{booking.providerName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-stone-500 mt-2.5">
                      <span className="flex items-center gap-1.5 font-semibold text-amber-950">
                        <Calendar size={14} />
                        {booking.date} • {booking.timeSlot}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-stone-400" />
                        {booking.address.area}, {booking.address.city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount & Payment Status */}
                <div className="sm:text-right shrink-0">
                  <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">Total Paid</div>
                  <div className="text-2xl font-display font-semibold text-stone-900 tracking-tight mt-0.5">₹{booking.totalAmount}</div>
                  <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                    {booking.paymentMethod} • {booking.paymentStatus}
                  </div>
                  {booking.otp && booking.status === 'Upcoming' && (
                    <div className="mt-1.5 text-xs font-mono bg-stone-100 text-stone-800 px-2.5 py-1 rounded border border-stone-200">
                      Start OTP: <strong>{booking.otp}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => onViewBookingDetails(booking)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onViewInvoice(booking)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors inline-flex items-center gap-1.5"
                  >
                    <FileText size={14} />
                    <span>Invoice</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {booking.status === 'Upcoming' && (
                    <>
                      <button
                        onClick={() => onMessageProvider(booking)}
                        className="p-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50"
                        title="Chat with provider"
                      >
                        <MessageSquare size={17} />
                      </button>
                      <button
                        onClick={() => onTrackBooking(booking)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white text-xs sm:text-sm font-bold hover:bg-stone-800 transition-all shadow-sm"
                      >
                        <Sparkles size={14} className="text-amber-400" />
                        <span>Track Live Status</span>
                      </button>
                    </>
                  )}

                  {booking.status === 'Completed' && (
                    <>
                      {!booking.reviewed ? (
                        <button
                          onClick={() => onRateService(booking)}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
                        >
                          <Star size={13} className="fill-amber-500 text-amber-500" />
                          <span>Rate Service</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold px-3 py-1.5 bg-emerald-50 rounded-xl">
                          ⭐ Rated {booking.ratingGiven}/5
                        </span>
                      )}
                      <button
                        onClick={() => onBookAgain(booking)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-stone-800 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <RotateCcw size={13} />
                        <span>Book Again</span>
                      </button>
                    </>
                  )}

                  {booking.status === 'Cancelled' && (
                    <button
                      onClick={() => onBookAgain(booking)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-stone-800"
                    >
                      Book Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
