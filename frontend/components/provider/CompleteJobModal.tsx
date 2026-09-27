'use client';

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  PenTool
} from 'lucide-react';
import { ProviderJob } from '@/lib/provider-data';

export interface AdditionalPart {
  id: string;
  name: string;
  cost: number;
}

interface CompleteJobModalProps {
  job: ProviderJob | null;
  onClose: () => void;
  onJobCompleted: (jobId: string, finalPrice: number, parts: AdditionalPart[], notes: string) => void | Promise<void>;
}

function CompleteJobModalContent({
  job,
  onClose,
  onJobCompleted
}: CompleteJobModalProps) {
  // Never true at runtime: the exported wrapper only renders this when job is set.
  // Kept so TypeScript narrows the prop; it stops hooks below from being skipped on close.
  if (!job) return null;

  const [parts, setParts] = useState<AdditionalPart[]>([
  ]);
  const [partNameInput, setPartNameInput] = useState('');
  const [partCostInput, setPartCostInput] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [signatureSigned, setSignatureSigned] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  const basePrice = job.estimatedEarnings;
  const partsTotal = parts.reduce((acc, p) => acc + p.cost, 0);
  const grandTotal = basePrice + partsTotal;
  const commission = Math.round(grandTotal * 0.1);
  const netEarnings = grandTotal - commission;

  const handleAddPart = () => {
    if (!partNameInput.trim() || !partCostInput) return;
    const cost = parseFloat(partCostInput);
    if (isNaN(cost) || cost <= 0) return;

    setParts(prev => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        name: partNameInput.trim(),
        cost
      }
    ]);
    setPartNameInput('');
    setPartCostInput('');
  };

  const handleRemovePart = (id: string) => {
    setParts(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await onJobCompleted(job.id, grandTotal, parts, technicianNotes);
      setCompletedSuccess(true);
      setTimeout(() => onClose(), 1800);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not complete the job.');
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Service Finalization &amp; Invoicing
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

        {/* Success Splash */}
        {completedSuccess ? (
          <div className="p-12 text-center space-y-4 my-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-display text-2xl font-bold text-stone-900">
              Job Successfully Completed!
            </h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              ₹{netEarnings.toLocaleString('en-IN')} has been credited to your Worksy Available Balance. The digital tax invoice was dispatched to {job.customerName}.
            </p>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Customer Summary Card */}
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4.5 flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-500 font-medium">Customer</p>
                <h4 className="font-display font-semibold text-stone-900 text-base">{job.customerName}</h4>
                <p className="text-xs text-stone-600 mt-0.5">{job.address}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-stone-500 font-medium">Booking ID</p>
                <p className="font-mono font-semibold text-stone-800 text-sm">{job.id}</p>
              </div>
            </div>

            {/* Additional Parts / Materials Section */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-semibold text-stone-900 text-sm">
                    Additional Spare Parts &amp; Materials
                  </h4>
                  <p className="text-xs text-stone-500">Bill any replacement hardware or consumables used</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg">
                  {parts.length} item{parts.length === 1 ? '' : 's'} added
                </span>
              </div>

              {/* List of parts */}
              {parts.length > 0 && (
                <div className="space-y-2">
                  {parts.map(p => (
                    <div 
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-sm"
                    >
                      <span className="font-medium text-stone-800">{p.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-stone-900">₹{p.cost}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePart(p.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add part inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2">
                <div className="sm:col-span-7">
                  <input
                    type="text"
                    placeholder="Part name (e.g. Copper coupling 1/2'')"
                    value={partNameInput}
                    onChange={(e) => setPartNameInput(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800 placeholder:text-stone-400"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="number"
                    placeholder="Cost (₹)"
                    value={partCostInput}
                    onChange={(e) => setPartCostInput(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800 placeholder:text-stone-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddPart}
                    className="w-full h-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Work & Diagnostic Report Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Work Performed &amp; Technician Notes
              </label>
              <textarea
                rows={3}
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                placeholder="Detail the root cause resolved and checks conducted..."
                required
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800 placeholder:text-stone-400 resize-none leading-relaxed"
              />
            </div>

            {/* Financial Recalculation Card */}
            <div className="bg-stone-900 text-white rounded-2xl p-5 space-y-3 shadow-md">
              <h4 className="font-display font-semibold text-white text-sm flex items-center justify-between border-b border-stone-800 pb-2">
                <span>Final Billing Summary</span>
                <span className="text-xs text-amber-400 font-normal">Customer approval verified</span>
              </h4>

              <div className="space-y-2 text-xs text-stone-300">
                <div className="flex items-center justify-between">
                  <span>Base Service Fee</span>
                  <span className="font-medium text-white">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                {partsTotal > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Parts &amp; Consumables ({parts.length})</span>
                    <span className="font-medium text-white">+₹{partsTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-stone-400 pt-1 border-t border-stone-800">
                  <span>Gross Invoice Value</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-rose-400">
                  <span>Worksy Platform Fee (10%)</span>
                  <span>-₹{commission.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800 flex items-center justify-between font-display text-base font-bold">
                <span className="text-stone-200">Your Net Earnings (Credit to Wallet)</span>
                <span className="text-amber-400 text-xl font-bold">
                  ₹{netEarnings.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Customer Sign-off Acknowledgement */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <PenTool className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-900">Customer Digital Sign-Off</p>
                  <p className="text-[11px] text-stone-500">
                    Customer {job.customerName} reviewed invoice &amp; accepted service completion.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSignatureSigned(!signatureSigned)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  signatureSigned 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {signatureSigned ? 'Signed ✓' : 'Awaiting Sign'}
              </button>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              {submitError && (
                <div className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 mb-2">
                  {submitError}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !signatureSigned}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-medium text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Generating Invoice &amp; Crediting Balance...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Finalize Job &amp; Collect ₹{netEarnings.toLocaleString('en-IN')}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export { CompleteJobModal };

/**
 * Wrapper: returns early BEFORE any hook is called. Previously the early return sat above the
 * component's useState calls, so closing the modal changed the hook count and React threw
 * "Rendered fewer hooks than expected".
 */
export default function CompleteJobModal(props: CompleteJobModalProps) {
  if (!props.job) return null;
  return <CompleteJobModalContent key={props.job.id} {...props} />;
}
