'use client';

import React, { useState } from 'react';
import {
  Search,
  HelpCircle,
  MessageSquare,
  Phone,
  ShieldCheck,
  ChevronDown,
  CalendarX,
  CreditCard,
  UserX,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CustomerTab } from './CustomerSidebar';

interface HelpSupportTabProps {
  onStartSupportChat: () => void;
  setActiveTab: (tab: CustomerTab) => void;
}

export default function HelpSupportTab({
  onStartSupportChat,
  setActiveTab
}: HelpSupportTabProps) {
  const [searchHelp, setSearchHelp] = useState('');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const commonIssues = [
    { label: 'Booking problem', icon: '📅', desc: 'Reschedule or edit appointment' },
    { label: 'Payment problem', icon: '💳', desc: 'UPI failure, double deduction or invoice' },
    { label: 'Cancel booking', icon: '❌', desc: 'Hassle-free cancellation & policies' },
    { label: 'Request refund', icon: '💰', desc: 'Check instant refund status' },
    { label: 'Provider issue', icon: '👨‍🔧', desc: 'Delay, feedback or behavior reporting' }
  ];

  const faqs = [
    {
      q: 'How do I track my service professional in real-time?',
      a: 'Go to "My Bookings" and click on the "Track Live Status" button on your upcoming appointment. You will see an interactive map with live ETA, the technician’s live milestone step (Confirmed -> Assigned -> On the way -> Service Started -> Completed), and direct Call/Message options.'
    },
    {
      q: 'What is the Worksy 30-Day Service Guarantee?',
      a: 'Every booking made through Worksy comes with a 30-day quality guarantee. If the fixed appliance develops the same issue, or if the deep cleaning was unsatisfactory, our certified provider will revisit and rectify it at zero additional cost.'
    },
    {
      q: 'How does the Start OTP work?',
      a: 'For your security, every booking generates a unique 4-digit OTP shown on your booking card and tracking screen. Only share this OTP with the technician after they arrive at your doorstep to start the job.'
    },
    {
      q: 'What payment modes are supported?',
      a: 'We prominently support UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, Net Banking, Worksy Wallet cash, and Pay Cash After Service.'
    },
    {
      q: 'How can I cancel or reschedule my service appointment?',
      a: 'You can reschedule or cancel for free up to 2 hours before the scheduled appointment directly from the My Bookings tab.'
    }
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchHelp.toLowerCase()) ||
      f.a.toLowerCase().includes(searchHelp.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-28 lg:pb-16 max-w-[1760px] 2xl:max-w-[1840px] mx-auto">
      {/* Hero Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10 backdrop-blur-sm">
            <HelpCircle size={15} />
            <span>24/7 Customer Help Center</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-tightest text-white leading-[1.06]">
            How can we <span className="italic font-normal">help you today?</span>
          </h1>
          <p className="text-stone-300 text-base sm:text-lg mt-3 max-w-2xl leading-relaxed">
            Search answers to common queries, resolve active booking issues, or start a live chat with our 24/7 dedicated support team.
          </p>

          <div className="mt-8 relative max-w-2xl">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchHelp}
              onChange={(e) => setSearchHelp(e.target.value)}
              placeholder="Search help (e.g. refund, OTP, cancellation, warranty)..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white text-stone-900 text-sm sm:text-base placeholder:text-stone-400 focus:outline-none shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Common Issues Quick Tiles */}
      <section>
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-500 mb-1">
          Assistance
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-stone-900 mb-6">
          Common Topics <span className="italic font-normal">&amp; Quick Help</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {commonIssues.map((issue, idx) => (
            <button
              key={idx}
              onClick={onStartSupportChat}
              className="p-6 rounded-3xl bg-white border border-stone-200/90 hover:border-black/30 hover:shadow-xl transition-all text-left flex flex-col justify-between group"
            >
              <div>
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{issue.icon}</div>
                <div className="text-base font-bold text-stone-900">{issue.label}</div>
                <div className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
                  {issue.desc}
                </div>
              </div>
              <div className="mt-5 text-xs font-bold text-black flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>Resolve</span>
                <ArrowRight size={13} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
            Frequently Asked <span className="italic font-normal">Questions</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-1 leading-relaxed">
            Quick solutions to our most common customer service questions and platform guidelines.
          </p>
        </div>

        <div className="divide-y divide-stone-100">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div key={idx} className="py-5">
                <button
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 text-left group"
                >
                  <span className="text-base sm:text-lg font-bold text-stone-800 group-hover:text-black transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-stone-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-black' : ''}`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed animate-in fade-in duration-150 pr-8">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Support Chat Banner */}
      <section className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-xl">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-3xl shrink-0 shadow-md">
            💬
          </div>
          <div>
            <h3 className="font-display text-2xl sm:text-3xl font-medium text-white">
              Still need help with an active job?
            </h3>
            <p className="text-sm sm:text-base text-emerald-100 mt-2 max-w-2xl leading-relaxed">
              Our 24/7 Customer Care team responds in under 2 minutes. We can assist with emergency re-assignments, warranty claims, or invoice disputes.
            </p>
          </div>
        </div>

        <button
          onClick={onStartSupportChat}
          className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white text-black text-xs sm:text-sm font-bold hover:bg-stone-100 transition-all shrink-0 shadow-lg cursor-pointer"
        >
          <MessageSquare size={16} />
          <span>Chat with Support</span>
        </button>
      </section>
    </div>
  );
}
