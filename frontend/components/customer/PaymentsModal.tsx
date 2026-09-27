'use client';

import React, { useState } from 'react';
import {
  X,
  Wallet,
  CreditCard,
  Plus,
  Check,
  Download,
  FileText,
  ShieldCheck,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Booking } from '@/lib/marketplace-data';

interface PaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onAddMoney: (amount: number) => void;
  bookings: Booking[];
  onViewInvoice: (booking: Booking) => void;
}

function PaymentsModalContent({
  isOpen,
  onClose,
  walletBalance,
  onAddMoney,
  bookings,
  onViewInvoice
}: PaymentsModalProps) {
  // Never true at runtime: the exported wrapper only renders this when isOpen is set.
  // Kept so TypeScript narrows the prop; it stops hooks below from being skipped on close.
  if (!isOpen) return null;

  const [addAmount, setAddAmount] = useState<number>(500);
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  const handleAddBalance = () => {
    onAddMoney(addAmount);
    setShowAddSuccess(true);
    setTimeout(() => setShowAddSuccess(false), 2000);
  };

  const savedUpiIds = ['charan@okhdfcbank', 'charan@oksbi'];
  const savedCards = [
    { brand: 'HDFC Bank Regalia', last4: '4821', exp: '08/28' },
    { brand: 'ICICI Sapphiro', last4: '9012', exp: '11/29' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Payments & Worksy Wallet</h2>
              <p className="text-[11px] text-stone-500">Saved UPI IDs, cards & recharge balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Wallet Balance Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-950 to-stone-800 text-white shadow-lg space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Available Balance</span>
                <div className="text-3xl font-extrabold text-white mt-0.5">₹{walletBalance}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                Active Wallet
              </span>
            </div>

            {/* Quick Recharge Controls */}
            <div className="pt-2 border-t border-white/10">
              <div className="text-xs font-semibold text-stone-300 mb-2">Recharge Wallet Instant Cash:</div>
              <div className="flex items-center gap-2">
                {[200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddAmount(amt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      addAmount === amt
                        ? 'bg-amber-400 text-black border-amber-400'
                        : 'bg-white/10 text-stone-200 border-white/10 hover:bg-white/20'
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleAddBalance}
                  className="ml-auto px-4 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-stone-100"
                >
                  Add Cash
                </button>
              </div>
              {showAddSuccess && (
                <div className="mt-2 text-xs text-emerald-400 font-semibold animate-in fade-in">
                  ✓ Successfully added ₹{addAmount} to your wallet!
                </div>
              )}
            </div>
          </div>

          {/* Saved UPI IDs */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase text-stone-400">Saved UPI Accounts</div>
            <div className="space-y-2">
              {savedUpiIds.map((upi, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between bg-stone-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚡</span>
                    <div>
                      <div className="text-xs font-bold text-stone-900">{upi}</div>
                      <div className="text-[10px] text-stone-500">Verified Auto-Pay Ready</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Primary
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Credit / Debit Cards */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase text-stone-400">Saved Cards (RBI Tokenized)</div>
            <div className="space-y-2">
              {savedCards.map((card, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between bg-stone-50"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} className="text-stone-700" />
                    <div>
                      <div className="text-xs font-bold text-stone-900">{card.brand} (•••• {card.last4})</div>
                      <div className="text-[10px] text-stone-500">Expires {card.exp}</div>
                    </div>
                  </div>
                  <ShieldCheck size={16} className="text-emerald-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Payment History & Invoices */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase text-stone-400">Recent Transactions & Invoices</div>
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
              {bookings.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-stone-900">{b.serviceTitle}</div>
                    <div className="text-[10px] text-stone-500">
                      {b.date} • {b.paymentMethod} • #{b.id}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-stone-900">₹{b.totalAmount}</span>
                    <button
                      onClick={() => onViewInvoice(b)}
                      className="p-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-white text-xs font-semibold inline-flex items-center gap-1"
                      title="View tax invoice"
                    >
                      <FileText size={12} />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper: returns early BEFORE any hook is called. Previously the early return sat above the
 * component's useState calls, so closing the modal changed the hook count and React threw
 * "Rendered fewer hooks than expected".
 */
export default function PaymentsModal(props: PaymentsModalProps) {
  if (!props.isOpen) return null;
  return <PaymentsModalContent {...props} />;
}
