'use client';

import React, { useState } from 'react';
import {
  Tag,
  Copy,
  Check,
  Gift,
  Sparkles,
  Share2,
  Percent,
  ArrowRight
} from 'lucide-react';
import { Coupon } from '@/lib/marketplace-data';

interface OffersTabProps {
  offers: Coupon[];
  onApplyCouponToBooking?: (couponCode: string) => void;
  onAddWalletCredit?: (amount: number) => void;
}

export default function OffersTab({
  offers,
  onApplyCouponToBooking,
  onAddWalletCredit
}: OffersTabProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [scratchRevealed, setScratchRevealed] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleScratch = () => {
    if (!scratchRevealed) {
      setScratchRevealed(true);
      if (onAddWalletCredit) {
        onAddWalletCredit(50);
      }
    }
  };

  return (
    <div className="space-y-10 pb-28 lg:pb-16 max-w-[1760px] 2xl:max-w-[1840px] mx-auto">
      {/* Title */}
      <div>
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-500">
          Exclusive Perks
        </p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tightest text-stone-900 leading-[1.08]">
          Offers <span className="italic font-normal">&amp;</span> Rewards
        </h1>
        <p className="text-base sm:text-lg text-stone-600 mt-2 max-w-2xl leading-relaxed">
          Apply discount codes at checkout or redeem exclusive Worksy member perks for your home services.
        </p>
      </div>

      {/* Interactive Scratch Card */}
      <section className="bg-gradient-to-br from-amber-500 via-amber-600 to-stone-900 rounded-3xl p-8 sm:p-12 lg:p-14 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
            <Sparkles size={15} className="text-amber-200" />
            <span>Mystery Scratch Card</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
            Daily <span className="italic font-normal">Rewards</span>
          </h2>
          <p className="text-sm sm:text-base text-amber-100 mt-2.5 max-w-xl leading-relaxed">
            Tap below to scratch and reveal free instant cash credited directly to your Worksy Wallet balance.
          </p>

          <div className="mt-8">
            {!scratchRevealed ? (
              <button
                onClick={handleScratch}
                className="group relative px-10 py-6 rounded-2xl bg-stone-900 border-2 border-amber-300 text-center hover:scale-[1.03] transition-all shadow-2xl cursor-pointer"
              >
                <div className="text-4xl mb-2">🎁</div>
                <div className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-widest">
                  Tap to Scratch & Reveal
                </div>
                <div className="text-xs text-stone-400 mt-1">Win up to ₹100 Wallet Cash instantly</div>
              </button>
            ) : (
              <div className="p-7 rounded-2xl bg-white text-stone-900 max-w-md shadow-2xl border-2 border-amber-400 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl font-bold shrink-0">
                    🎉
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Congratulations!
                    </div>
                    <div className="text-2xl font-extrabold text-stone-900 mt-0.5">
                      ₹50 Wallet Cash Credited!
                    </div>
                    <div className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                      Automatically applied to your Worksy Wallet balance for any service booking.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Available Coupon Codes */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
              Available Coupons <span className="italic font-normal">&amp; Vouchers</span>
            </h3>
            <p className="text-sm text-stone-600 mt-1 leading-relaxed">
              Copy any coupon code below to unlock savings at the checkout screen.
            </p>
          </div>
          <span className="text-sm font-semibold text-stone-500 bg-stone-100 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
            {offers.length} active coupons
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {offers.map((offer) => {
            const isCopied = copiedCode === offer.code;
            return (
              <div
                key={offer.code}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/90 hover:border-black/30 hover:shadow-xl transition-all flex flex-col justify-between gap-5 group"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-105 transition-transform">
                      %
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-extrabold tracking-wider bg-stone-100 text-stone-900 px-3 py-1 rounded-xl border border-stone-300">
                          {offer.code}
                        </span>
                        {offer.discountType === 'percentage' ? (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {offer.discountValue}% OFF
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            ₹{offer.discountValue} OFF
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-700 font-medium leading-relaxed">
                        {offer.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs sm:text-sm text-stone-500">
                  <span className="font-medium">Min order ₹{offer.minBooking} • {offer.expiry}</span>

                  <button
                    onClick={() => handleCopy(offer.code)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-black text-white hover:bg-stone-800'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check size={14} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Refer & Earn Banner */}
      <section className="bg-stone-100/90 border border-stone-200 rounded-3xl p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-black flex items-center justify-center text-3xl font-bold shrink-0 shadow-sm">
            🤝
          </div>
          <div>
            <h3 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
              Refer Neighbors <span className="italic font-normal">&amp; Friends</span>
            </h3>
            <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-2xl leading-relaxed">
              Share your referral code <strong className="font-mono text-black font-extrabold px-1.5 py-0.5 bg-white rounded border border-stone-300">CHARAN200</strong>. When they complete their first home service, both of you will receive ₹200 wallet credits!
            </p>
          </div>
        </div>

        <button
          onClick={() => handleCopy('CHARAN200')}
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-stone-800 transition-colors shrink-0 shadow-sm"
        >
          <Share2 size={16} />
          <span>Copy Referral Code</span>
        </button>
      </section>
    </div>
  );
}
