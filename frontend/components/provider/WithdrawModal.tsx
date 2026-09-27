'use client';

import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  Building2, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export interface PayoutMethod {
  id: string;
  type: 'bank' | 'upi';
  holderName: string;
  bankName?: string;
  accountNumber?: string;
  upiId?: string;
  isPrimary: boolean;
}

// No payout-methods backend exists yet, so there is no real linked account to default to.
const defaultPayoutMethods: PayoutMethod[] = [];

interface WithdrawModalProps {
  isOpen?: boolean;
  availableBalance: number;
  payoutMethods?: PayoutMethod[];
  onClose: () => void;
  onWithdrawSuccess: (amount: number, methodId: string) => void;
}

export default function WithdrawModal({
  isOpen = true,
  availableBalance,
  payoutMethods = defaultPayoutMethods,
  onClose,
  onWithdrawSuccess
}: WithdrawModalProps) {
  const [selectedMethodId, setSelectedMethodId] = useState(payoutMethods[0]?.id || '');
  const [amountInput, setAmountInput] = useState('15000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const numAmount = parseFloat(amountInput) || 0;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount < 500) {
      setError('Minimum withdrawal amount is ₹500.');
      return;
    }
    if (numAmount > availableBalance) {
      setError(`Amount cannot exceed available balance of ₹${availableBalance.toLocaleString('en-IN')}`);
      return;
    }
    if (!selectedMethodId) {
      setError('Add a payout method before withdrawing.');
      return;
    }

    setError('');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onWithdrawSuccess(numAmount, selectedMethodId);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 relative overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 relative">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Wallet className="w-4 h-4" />
            Instant Balance Withdrawal
          </div>
          <h3 className="font-display text-2xl font-bold text-white">
            Available: ₹{availableBalance.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Zero deduction • Direct transfer to your bank or UPI
          </p>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-display text-xl font-bold text-stone-900">
              Transfer Initiated!
            </h4>
            <p className="text-xs text-stone-600">
              ₹{numAmount.toLocaleString('en-IN')} is being transferred via IMPS. Funds will reflect in your account within 15 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="p-6 space-y-5">
            {/* Amount input */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Withdrawal Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-stone-400">
                  ₹
                </span>
                <input
                  type="number"
                  min={500}
                  max={availableBalance}
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-8 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-lg font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800"
                  required
                />
              </div>

              {/* Preset quick buttons */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {[5000, 10000, 20000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmountInput(amt.toString())}
                    className="text-xs px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 font-medium transition-colors"
                  >
                    +₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmountInput(availableBalance.toString())}
                  className="text-xs px-2.5 py-1 bg-amber-100 hover:bg-amber-200 rounded-lg text-amber-900 font-medium transition-colors ml-auto"
                >
                  Withdraw All (₹{availableBalance.toLocaleString('en-IN')})
                </button>
              </div>

              {error && (
                <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
              )}
            </div>

            {/* Select Destination Account */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Deposit Destination
              </label>
              <div className="space-y-2">
                {payoutMethods.length === 0 && (
                  <div className="p-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 text-xs text-stone-500 text-center">
                    No payout method linked yet. Add a bank account or UPI ID to withdraw your earnings.
                  </div>
                )}
                {payoutMethods.map((method) => {
                  const isSelected = selectedMethodId === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethodId(method.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900' 
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                          {method.type === 'bank' ? (
                            <Building2 className="w-5 h-5" />
                          ) : (
                            <Smartphone className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-900">
                            {method.type === 'bank' ? `${method.bankName} (${method.accountNumber})` : `UPI ID (${method.upiId})`}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {method.holderName} {method.isPrimary && '• Primary Account'}
                          </p>
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-stone-900 bg-stone-900' : 'border-stone-300'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instant IMPS badge */}
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-emerald-800 text-xs border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct IMPS routing enabled. Instant transfer, 0% platform surcharge.</span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || numAmount <= 0 || payoutMethods.length === 0}
                className="flex-2 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium text-xs transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Connecting to Gateway...
                  </span>
                ) : (
                  <>
                    Confirm Withdrawal of ₹{numAmount.toLocaleString('en-IN')}
                    <ArrowRight className="w-4 h-4" />
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

export { WithdrawModal };
