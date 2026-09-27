'use client';

import React from 'react';
import {
  X,
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  Download
} from 'lucide-react';
import { Booking } from '@/lib/marketplace-data';

interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
  onTrack?: (booking: Booking) => void;
}

export default function BookingDetailModal({
  booking,
  onClose,
  onTrack
}: BookingDetailModalProps) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <FileText size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Tax Invoice & Booking Summary</h2>
              <p className="text-[11px] text-stone-500">Worksy Technologies India Pvt Ltd</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top Meta Strip */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap justify-between gap-3 text-xs">
            <div>
              <div className="text-stone-400 font-semibold uppercase text-[10px]">Booking Reference</div>
              <div className="font-mono font-bold text-stone-900 text-sm">#{booking.id}</div>
            </div>
            <div>
              <div className="text-stone-400 font-semibold uppercase text-[10px]">Invoice Date</div>
              <div className="font-bold text-stone-900">{booking.date}</div>
            </div>
            <div>
              <div className="text-stone-400 font-semibold uppercase text-[10px]">Status</div>
              <div className="font-bold text-emerald-700">{booking.status} • {booking.paymentStatus}</div>
            </div>
          </div>

          {/* Service & Provider Details */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-stone-900 uppercase text-[11px] tracking-wider text-stone-400">
              Service Details
            </h3>
            <div className="p-4 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex justify-between font-bold text-stone-900 text-sm">
                <span>{booking.serviceTitle}</span>
                <span>₹{booking.basePrice}</span>
              </div>
              <div className="text-stone-500">{booking.problemDescription}</div>

              {booking.addons.length > 0 && (
                <div className="pt-2 border-t border-stone-100 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Add-on Services:</div>
                  {booking.addons.map((a) => (
                    <div key={a.id} className="flex justify-between text-stone-700">
                      <span>• {a.name}</span>
                      <span>₹{a.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Service Address & Specialist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl border border-stone-200">
              <div className="text-[10px] uppercase font-bold text-stone-400 mb-1">Service Location</div>
              <div className="font-bold text-stone-900">{booking.address.label}</div>
              <div className="text-stone-600 mt-0.5 leading-relaxed">
                {booking.address.street}, {booking.address.area}, {booking.address.city} — {booking.address.pincode}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-stone-200">
              <div className="text-[10px] uppercase font-bold text-stone-400 mb-1">Assigned Specialist</div>
              <div className="font-bold text-stone-900">{booking.providerName}</div>
              <div className="text-stone-600 mt-0.5">Phone: {booking.providerPhone}</div>
              <div className="text-emerald-700 font-semibold mt-1">Verified Worksy Technician</div>
            </div>
          </div>

          {/* Itemized Financial Breakdown */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Item Subtotal:</span>
              <span>₹{booking.basePrice + booking.addonsTotal}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>GST & Safe Visit Fee (10%):</span>
              <span>₹{booking.tax}</span>
            </div>
            {booking.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount / Voucher Applied:</span>
                <span>-₹{booking.discount}</span>
              </div>
            )}
            <div className="pt-2 border-t border-stone-200 flex justify-between font-extrabold text-stone-900 text-sm">
              <span>Total Paid via {booking.paymentMethod}:</span>
              <span>₹{booking.totalAmount}</span>
            </div>
          </div>

          <div className="text-[10px] text-stone-400 text-center">
            This is a computer generated invoice and carries the official Worksy 30-Day Service Guarantee.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 inline-flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>Print Invoice</span>
          </button>

          {booking.status === 'Upcoming' && onTrack && (
            <button
              onClick={() => {
                onClose();
                onTrack(booking);
              }}
              className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-stone-800"
            >
              Track Provider
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
