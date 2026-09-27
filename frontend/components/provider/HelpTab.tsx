'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  PhoneCall, 
  MessageSquare, 
  FileText, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
  category: 'payouts' | 'jobs' | 'ratings' | 'safety';
}

const FAQS: FAQItem[] = [
  {
    category: 'payouts',
    q: 'When do earnings from completed jobs get credited to my balance?',
    a: 'Earnings are instantly credited to your "Available Balance" the moment the customer confirms completion or the 4-digit completion code is verified. You can withdraw instantly via UPI or IMPS within 15 minutes.'
  },
  {
    category: 'payouts',
    q: 'What are the platform commission fees on Worksy?',
    a: 'Worksy charges a transparent 10% platform fee on completed jobs. This covers payment gateway fees, lead dispatch, ₹50,000 technician damage insurance, and dedicated partner support.'
  },
  {
    category: 'jobs',
    q: 'How does the customer start OTP work?',
    a: 'When you arrive at the customer’s premises, tap "Arrived" and ask the customer for their 4-digit start OTP. Entering this code unlocks the job sheet and confirms your official start time for insurance coverage.'
  },
  {
    category: 'jobs',
    q: 'What if a customer requests extra spare parts or additional work?',
    a: 'You can add extra line items and parts during job completion in the app. The customer will review the revised total on their phone and approve before the final invoice is charged.'
  },
  {
    category: 'ratings',
    q: 'How do customer ratings impact my lead frequency?',
    a: 'Providers with a rating of 4.8+ and an acceptance rate above 85% earn "Top Rated Pro" status and receive priority lead dispatch with up to 2x more incoming bookings.'
  },
  {
    category: 'safety',
    q: 'What insurance is provided during on-site visits?',
    a: 'Every active job started with an OTP is covered under the Worksy Partner Protection policy: up to ₹50,000 for accidental property damage and ₹2,00,000 personal accidental cover for registered technicians.'
  }
];

export function HelpTab({
  onOpenLiveChat
}: {
  onOpenLiveChat: () => void;
}) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'payouts' | 'jobs' | 'ratings' | 'safety'>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const filteredFaqs = activeFilter === 'all' 
    ? FAQS 
    : FAQS.filter(f => f.category === activeFilter);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubject('');
      setTicketMessage('');
      setTicketSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-xl border border-stone-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_70%_50%,rgba(217,119,6,0.18),transparent_70%)] pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-4 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            24/7 Priority Partner Desk
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3">
            How can we support your business today?
          </h1>
          <p className="text-stone-300 text-sm md:text-base leading-relaxed">
            Need urgent help on an active job, billing clarification, or dispute assistance? Our dedicated technician support team is available 24/7.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-stone-800/80">
          <div className="bg-stone-800/60 backdrop-blur-sm p-4 rounded-2xl border border-stone-700/60 flex items-center gap-4 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Emergency Hotline</p>
              <p className="text-base font-semibold text-white">1800-419-WORK</p>
              <span className="text-[11px] text-emerald-400">Available 24/7 • Toll Free</span>
            </div>
          </div>

          <button 
            onClick={onOpenLiveChat}
            className="bg-stone-800/60 backdrop-blur-sm p-4 rounded-2xl border border-stone-700/60 flex items-center gap-4 hover:border-amber-500/40 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Support Chat</p>
              <p className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors">Start Live Chat</p>
              <span className="text-[11px] text-stone-400">Avg reply &lt; 2 minutes</span>
            </div>
          </button>

          <div className="bg-stone-800/60 backdrop-blur-sm p-4 rounded-2xl border border-stone-700/60 flex items-center gap-4 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Protection Policy</p>
              <p className="text-base font-semibold text-white">₹50K Coverage</p>
              <span className="text-[11px] text-stone-400">Active job damage protection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: FAQs + Ticket Submission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: FAQs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-900">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs text-stone-500 mt-1">Quick answers regarding payouts, bookings, and policies</p>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['all', 'payouts', 'jobs', 'ratings', 'safety'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                      activeFilter === cat
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion list */}
            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div 
                    key={idx}
                    className="border border-stone-200/70 rounded-2xl overflow-hidden transition-all duration-200 hover:border-stone-300"
                  >
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-medium text-stone-900 text-sm hover:bg-stone-50/50"
                    >
                      <span className="font-display font-medium text-stone-900">{faq.q}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-stone-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 text-sm text-stone-600 leading-relaxed bg-stone-50/40 border-t border-stone-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Submit Support Ticket */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-stone-900">
                  Open a Partner Ticket
                </h3>
                <p className="text-xs text-stone-500">Expect official response within 2 hours</p>
              </div>
            </div>

            {ticketSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-display font-semibold text-emerald-900">Ticket #TK-9842 Submitted</h4>
                <p className="text-xs text-emerald-700">
                  Our Partner Desk team has received your inquiry. You will receive an SMS and in-app message once an agent updates your ticket.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800">
                    <option>Payment & Withdrawal Inquiry</option>
                    <option>Active Booking Issue / Customer Cancellation</option>
                    <option>Rating Dispute / Customer Feedback</option>
                    <option>Insurance & Damage Claim</option>
                    <option>Account Verification & GST Details</option>
                    <option>Other Operational Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g., Booking #JOB-8821 payment discrepancy"
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe what happened, including booking ID, customer name, or details..."
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-800 placeholder:text-stone-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow active:scale-[0.99]"
                >
                  Submit Support Ticket
                </button>
              </form>
            )}
          </div>

          {/* Emergency Dispatch Card */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display font-semibold text-amber-950 text-sm">Emergency Dispatch</h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Encountering an unsafe work environment or severe electrical hazard at a site? Disconnect power immediately and dial <span className="font-semibold underline">1800-419-WORK (Option 1)</span> for urgent safety intervention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpTab;
