'use client';

import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Navigation, 
  CheckCircle2, 
  User, 
  AlertCircle
} from 'lucide-react';
import { ProviderJob } from '@/lib/provider-data';

interface JobDetailsModalProps {
  job: ProviderJob | null;
  onClose: () => void;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onStartJob?: (job: ProviderJob) => void;
  onCompleteJob?: (job: ProviderJob) => void;
  onOpenChat?: (job: ProviderJob) => void;
}

export default function JobDetailsModal({
  job,
  onClose,
  onAccept,
  onDecline,
  onStartJob,
  onCompleteJob,
  onOpenChat
}: JobDetailsModalProps) {
  if (!job) return null;

  const price = job.estimatedEarnings || 499;
  const isNew = job.status === 'New Requests';
  const isUpcoming = job.status === 'Upcoming';
  const isOngoing = job.status === 'Ongoing';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-stone-100 px-6 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-700 font-bold text-xs">
              {job.id}
            </div>
            <div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                isOngoing ? 'bg-amber-100 text-amber-800' :
                isUpcoming ? 'bg-blue-100 text-blue-800' :
                job.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                job.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {job.status}
              </span>
              <h3 className="font-display text-lg font-semibold text-stone-900 mt-0.5">
                {job.serviceTitle}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Customer Card */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-stone-200/80 flex items-center justify-center text-stone-700 font-display font-semibold text-base">
                {job.customerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-semibold text-stone-900">{job.customerName}</h4>
                  <span className="text-xs bg-stone-200/60 text-stone-700 px-2 py-0.5 rounded-md font-medium">Verified Customer</span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{job.customerPhone}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a 
                href={`tel:${job.customerPhone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-stone-200 hover:border-stone-300 rounded-xl text-xs font-medium text-stone-700 shadow-sm hover:bg-stone-50 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-stone-600" />
                Call
              </a>
              <button 
                onClick={() => {
                  onClose();
                  onOpenChat?.(job);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium shadow-sm transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message
              </button>
            </div>
          </div>

          {/* Schedule & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center gap-2 text-stone-500 text-xs font-medium uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-amber-600" />
                Scheduled Date & Time
              </div>
              <p className="font-display font-semibold text-stone-900 text-base">{job.date}</p>
              <div className="inline-flex items-center gap-1 text-xs text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                {job.timeSlot}
              </div>
            </div>

            <div className="bg-white border border-stone-200/80 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-500 text-xs font-medium uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  Service Location
                </div>
                {job.distanceKm && (
                  <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                    {job.distanceKm} km away
                  </span>
                )}
              </div>
              <p className="font-display font-medium text-stone-900 text-sm">{job.address}</p>
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline pt-0.5"
              >
                <Navigation className="w-3 h-3" />
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* Customer Problem Notes */}
          {job.customerNotes && (
            <div className="bg-amber-50/50 border border-amber-200/70 rounded-2xl p-4.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Customer Problem Notes
              </div>
              <p className="text-sm text-amber-950/80 leading-relaxed font-body">
                &ldquo;{job.customerNotes}&rdquo;
              </p>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-3">
            <h4 className="font-display font-semibold text-stone-900 text-sm flex items-center justify-between">
              <span>Financial Summary</span>
              <span className="text-xs font-normal text-stone-500">Includes 10% platform fee</span>
            </h4>

            <div className="space-y-2 text-sm text-stone-600 divide-y divide-stone-100">
              <div className="flex items-center justify-between pt-1">
                <span>Base Inspection / Service Charge</span>
                <span className="font-medium text-stone-900">₹{price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>Platform Commission (10%)</span>
                <span className="text-rose-600 font-medium">-₹{(price * 0.1).toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 font-display text-base font-semibold text-stone-900">
                <span>Net Payout to You</span>
                <span className="text-emerald-700 font-bold">₹{(price * 0.9).toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Safety & Guarantee Badge */}
          <div className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Worksy Guarantee: All jobs started with OTP verification are insured up to ₹50,000 against accidental damage.
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-stone-100 px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-xs font-medium text-stone-700 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {isNew && (
              <>
                <button
                  onClick={() => {
                    onDecline?.(job.id);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium transition-colors"
                >
                  Decline Lead
                </button>
                <button
                  onClick={() => {
                    onAccept?.(job.id);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-sm transition-all"
                >
                  Accept Booking (₹{price})
                </button>
              </>
            )}

            {isUpcoming && (
              <button
                onClick={() => {
                  onStartJob?.(job);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-sm transition-all inline-flex items-center gap-2"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                Start Visit & Verify OTP
              </button>
            )}

            {isOngoing && (
              <button
                onClick={() => {
                  onCompleteJob?.(job);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium shadow-sm transition-all inline-flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Finalize & Complete Job
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { JobDetailsModal };
