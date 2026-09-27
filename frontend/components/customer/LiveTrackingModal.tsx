'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Clock,
  Phone,
  MessageSquare,
  MapPin,
  ShieldCheck,
  Navigation,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { Booking } from '@/lib/marketplace-data';

interface LiveTrackingModalProps {
  booking: Booking | null;
  onClose: () => void;
  onMessageProvider: (booking: Booking) => void;
  onCallProvider: (phone: string, name: string) => void;
  onUpdateBookingStatus?: (bookingId: string, newStep: 1 | 2 | 3 | 4 | 5) => void;
}

function LiveTrackingModalContent({
  booking,
  onClose,
  onMessageProvider,
  onCallProvider,
  onUpdateBookingStatus
}: LiveTrackingModalProps) {
  // Never true at runtime: the exported wrapper only renders this when booking is set.
  // Kept so TypeScript narrows the prop; it stops hooks below from being skipped on close.
  if (!booking) return null;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(booking.trackingStep || 3);
  const [eta, setEta] = useState<number>(booking.etaMinutes || 15);

  const steps = [
    { num: 1, label: 'Booking Confirmed', desc: 'Order received & scheduled' },
    { num: 2, label: 'Professional Assigned', desc: `${booking.providerName} assigned` },
    { num: 3, label: 'On the Way', desc: 'Technician dispatched via two-wheeler' },
    { num: 4, label: 'Service Started', desc: 'OTP verified & inspection in progress' },
    { num: 5, label: 'Service Completed', desc: 'Quality checked & invoice generated' }
  ];

  const handleSimulateNext = () => {
    const next = Math.min(currentStep + 1, 5) as 1 | 2 | 3 | 4 | 5;
    setCurrentStep(next);
    if (next === 4) setEta(0);
    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(booking.id, next);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Navigation size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">
                  Live Service Tracking
                </h2>
                <span className="text-[10px] font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                  #{booking.id}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {booking.serviceTitle} • {booking.date}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Real-time Status Card with ETA */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-400/30">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>
                    {currentStep === 3
                      ? 'Technician on the way'
                      : currentStep === 4
                      ? 'Service in progress'
                      : currentStep === 5
                      ? 'Service completed'
                      : 'Assigned & preparing'}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold">
                  {currentStep === 3 && `${booking.providerName.split(' ')[0]} is on the way`}
                  {currentStep === 4 && `${booking.providerName.split(' ')[0]} has started service`}
                  {currentStep === 5 && `Service Completed Successfully`}
                  {currentStep < 3 && `Technician Assigned`}
                </h3>

                <p className="text-xs text-stone-300 mt-1">
                  Destination: {booking.address.street}, {booking.address.area}
                </p>
              </div>

              {currentStep === 3 && (
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-center sm:text-right shrink-0">
                  <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Estimated Arrival</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                    {eta} Mins
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium">Distance: 1.8 km away</div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive SVG Route Map */}
          <div className="rounded-3xl border border-stone-200 overflow-hidden bg-stone-100 relative h-60 shadow-inner">
            <svg
              className="w-full h-full"
              viewBox="0 0 600 240"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Map Base Grid & Roads */}
              <rect width="600" height="240" fill="#f4f3ef" />

              {/* Minor grid streets */}
              <line x1="50" y1="0" x2="50" y2="240" stroke="#e6e4dc" strokeWidth="10" />
              <line x1="200" y1="0" x2="200" y2="240" stroke="#e6e4dc" strokeWidth="12" />
              <line x1="380" y1="0" x2="380" y2="240" stroke="#e6e4dc" strokeWidth="14" />
              <line x1="520" y1="0" x2="520" y2="240" stroke="#e6e4dc" strokeWidth="10" />

              <line x1="0" y1="50" x2="600" y2="50" stroke="#e6e4dc" strokeWidth="10" />
              <line x1="0" y1="130" x2="600" y2="130" stroke="#e6e4dc" strokeWidth="18" />
              <line x1="0" y1="190" x2="600" y2="190" stroke="#e6e4dc" strokeWidth="12" />

              {/* Major arterial road labels */}
              <text x="30" y="125" fill="#a8a29e" fontSize="10" fontWeight="bold">100ft Road Indiranagar</text>
              <text x="210" y="45" fill="#a8a29e" fontSize="10" fontWeight="bold">CMH Road</text>
              <text x="390" y="185" fill="#a8a29e" fontSize="10" fontWeight="bold">12th Main Road</text>

              {/* Green Park Area */}
              <rect x="70" y="65" width="115" height="55" rx="10" fill="#dcfce7" />
              <text x="85" y="98" fill="#15803d" fontSize="10" fontWeight="bold">Defense Colony Park</text>

              {/* Navigation Route Line */}
              <path
                d="M 120 130 L 200 130 L 200 190 L 380 190 L 380 90 L 480 90"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 120 130 L 200 130 L 200 190 L 380 190 L 380 90 L 480 90"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="6,6"
                strokeLinecap="round"
                className="animate-pulse"
              />

              {/* Destination Pin (Customer Home) */}
              <g transform="translate(480, 90)">
                <circle r="18" fill="#10b981" opacity="0.2" className="animate-ping" />
                <circle r="12" fill="#10b981" />
                <text x="0" y="4" fill="#ffffff" fontSize="11" textAnchor="middle" fontWeight="bold">🏠</text>
                <rect x="-45" y="-35" width="90" height="20" rx="6" fill="#111827" />
                <text x="0" y="-22" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">Your Address</text>
              </g>

              {/* Moving Technician Icon (Position changes by step) */}
              <g
                transform={
                  currentStep >= 4
                    ? 'translate(470, 90)'
                    : currentStep === 3
                    ? 'translate(290, 190)'
                    : 'translate(120, 130)'
                }
                className="transition-transform duration-1000 ease-in-out"
              >
                <circle r="18" fill="#f59e0b" opacity="0.25" className="animate-ping" />
                <circle r="13" fill="#000000" stroke="#f59e0b" strokeWidth="2.5" />
                <text x="0" y="4" fill="#ffffff" fontSize="11" textAnchor="middle" fontWeight="bold">🛵</text>
                <rect x="-35" y="-32" width="70" height="18" rx="6" fill="#000000" />
                <text x="0" y="-20" fill="#f59e0b" fontSize="8.5" textAnchor="middle" fontWeight="bold">
                  {booking.providerName.split(' ')[0]} (Live)
                </text>
              </g>
            </svg>

            {/* Live indicator overlay */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-stone-900 border border-stone-200 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live GPS Broadcast</span>
            </div>
          </div>

          {/* Milestone Stepper */}
          <div className="p-5 rounded-3xl bg-stone-50 border border-stone-200 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-stone-400">
              Booking Progress Milestones
            </h3>

            <div className="space-y-4">
              {steps.map((s) => {
                const isPassed = currentStep > s.num;
                const isCurrent = currentStep === s.num;

                return (
                  <div key={s.num} className="flex items-start gap-3.5 relative">
                    {/* Circle Indicator */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-black text-white ring-4 ring-amber-400/40 animate-pulse'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {isPassed ? <Check size={14} /> : s.num}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm ${
                            isCurrent
                              ? 'font-extrabold text-stone-900'
                              : isPassed
                              ? 'font-bold text-stone-700'
                              : 'text-stone-400'
                          }`}
                        >
                          {s.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Provider Contact & Security OTP */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={booking.providerAvatar}
                alt={booking.providerName}
                className="w-12 h-12 rounded-2xl object-cover border border-stone-200"
              />
              <div>
                <h4 className="text-sm font-bold text-stone-900">{booking.providerName}</h4>
                <div className="text-xs text-stone-500">Certified Professional • ⭐ 4.86</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  Verified Two-Wheeler & Tool Kit
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onCallProvider(booking.providerPhone, booking.providerName)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Phone size={13} />
                <span>Call provider</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onMessageProvider(booking);
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold transition-colors"
              >
                <MessageSquare size={13} />
                <span>Message</span>
              </button>
            </div>
          </div>

          {/* Security OTP Card */}
          {booking.otp && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-amber-700 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-950">Start Job Security PIN</div>
                  <div className="text-[11px] text-amber-800">Share with technician upon arrival to begin work</div>
                </div>
              </div>
              <div className="font-mono text-lg font-extrabold tracking-widest text-amber-950 bg-white px-3 py-1 rounded-xl border border-amber-300">
                {booking.otp}
              </div>
            </div>
          )}

          {/* Demo stepper: only rendered when a simulator callback is supplied. Real bookings advance via provider actions on the server. */}
          {onUpdateBookingStatus && (
          <>
          <div className="p-3 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">Interactive Demo Stepper:</span>
            <button
              onClick={handleSimulateNext}
              className="px-3 py-1.5 rounded-xl bg-black text-white text-[11px] font-bold hover:bg-stone-800"
            >
              {currentStep === 3
                ? 'Simulate: Arrived & Started →'
                : currentStep === 4
                ? 'Simulate: Service Done ✓'
                : 'Reset to Step 1 ↺'}
            </button>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Wrapper: returns early BEFORE any hook runs (closing the modal used to change the hook count and crash React). */
export default function LiveTrackingModal(props: LiveTrackingModalProps) {
  if (!props.booking) return null;
  return <LiveTrackingModalContent key={props.booking.id} {...props} />;
}
