'use client';

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageSquare, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { ProviderJob } from '@/lib/provider-data';

interface OngoingJobModalProps {
  job: ProviderJob | null;
  onClose: () => void;
  /** Calls the backend (PATCH /bookings/{id}/start). Rejects with an Error(message) when the OTP is wrong or the job cannot start. */
  onVerifyOtp: (jobId: string, otp: string) => Promise<void>;
  onProceedToComplete: (job: ProviderJob) => void;
  onOpenChat?: (job: ProviderJob) => void;
}

function OngoingJobModalContent({
  job,
  onClose,
  onVerifyOtp,
  onProceedToComplete,
  onOpenChat
}: OngoingJobModalProps) {
  // Never true at runtime: the exported wrapper only renders this when job is set.
  // Kept so TypeScript narrows the prop; it stops hooks below from being skipped on close.
  if (!job) return null;

  const [otpValue, setOtpValue] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(job.status === 'Ongoing');
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Isolate main electrical breaker before opening unit', done: false },
    { id: 2, label: 'Inspect internal wiring & run diagnostic check', done: false },
    { id: 3, label: 'Perform repair / service according to checklist', done: false },
    { id: 4, label: 'Test live load and verify cooling / power stability', done: false },
  ]);

  const verifyOtp = async (code: string) => {
    setIsVerifying(true);
    try {
      await onVerifyOtp(job.id, code); // the server checks the code; it is never sent to the provider
      setIsOtpVerified(true);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Could not verify the OTP. Please try again.');
      setOtpValue(['', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (isVerifying) return;
    val = val.replace(/\D/g, '');
    if (val.length > 1) val = val.slice(-1);
    const newOtp = [...otpValue];
    newOtp[index] = val;
    setOtpValue(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto verify once all 4 digits are entered
    const fullCode = newOtp.join('');
    if (fullCode.length === 4) {
      void verifyOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValue[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const toggleChecklistItem = (id: number) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                {isOtpVerified ? 'Active Job in Progress' : 'On Route / Arrival Verification'}
              </span>
              <h3 className="font-display text-lg font-semibold text-stone-900">
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

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Customer & Location banner */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-display font-semibold text-stone-900 text-base">{job.customerName}</h4>
              <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                {job.address}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a 
                href={`tel:${job.customerPhone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-stone-200 hover:border-stone-300 rounded-xl text-xs font-medium text-stone-700 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 text-stone-600" />
                Call
              </a>
              <button 
                onClick={() => {
                  onClose();
                  onOpenChat?.(job);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </button>
            </div>
          </div>

          {/* Step 1: Arrival & OTP Verification */}
          {!isOtpVerified ? (
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-amber-950 text-base">
                      Customer Start OTP Verification
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Ask the customer for the 4-digit code shown on their Worksy app to commence work.
                    </p>
                  </div>
                </div>

              </div>

              {/* 4 Digit Inputs */}
              <div>
                <div className="flex justify-center gap-3 my-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      disabled={isVerifying}
                      value={otpValue[idx]}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-14 h-16 text-center font-mono text-2xl font-bold rounded-2xl bg-white border-2 border-amber-300 text-stone-900 focus:border-stone-900 focus:outline-none shadow-sm transition-all"
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-xs text-rose-600 text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {otpError}
                  </p>
                )}

              </div>
            </div>
          ) : (
            /* Verified State */
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-emerald-950 text-sm">
                    Start Code Verified &amp; Insurance Active
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Visit officially logged at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Worksy ₹50K guarantee active.
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-200/70 text-emerald-800">
                Verified
              </span>
            </div>
          )}

          {/* Quality & Safety Standard Checklist */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-semibold text-stone-900 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                Service Execution Checklist
              </h4>
              <span className="text-xs text-stone-500 font-medium">
                {checklist.filter(c => c.done).length} of {checklist.length} completed
              </span>
            </div>

            <div className="space-y-2">
              {checklist.map((item) => (
                <label 
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    item.done 
                      ? 'bg-stone-50 border-stone-200 text-stone-400 line-through' 
                      : 'bg-white border-stone-200/80 text-stone-800 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => {}}
                    className="w-4 h-4 text-stone-900 rounded border-stone-300 focus:ring-stone-800"
                  />
                  <span className="text-xs font-medium select-none">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Customer Problem Note Reminder */}
          {job.customerNotes && (
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 text-xs text-stone-600">
              <span className="font-semibold text-stone-900 block mb-1">Customer reported issue:</span>
              &ldquo;{job.customerNotes}&rdquo;
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-stone-100 px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-xs font-medium text-stone-700 transition-colors"
          >
            Minimize Sheet
          </button>

          <button
            disabled={!isOtpVerified}
            onClick={() => {
              onClose();
              onProceedToComplete(job);
            }}
            className={`px-6 py-2.5 rounded-xl text-xs font-medium shadow-sm transition-all inline-flex items-center gap-2 ${
              isOtpVerified
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <span>Proceed to Invoice &amp; Complete</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export { OngoingJobModal };

/**
 * Wrapper: returns early BEFORE any hook is called. Previously the early return sat above the
 * component's useState calls, so closing the modal changed the hook count and React threw
 * "Rendered fewer hooks than expected".
 */
export default function OngoingJobModal(props: OngoingJobModalProps) {
  if (!props.job) return null;
  return <OngoingJobModalContent key={props.job.id} {...props} />;
}
