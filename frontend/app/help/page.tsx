import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarX, CreditCard, ShieldCheck, UserX, ArrowUpRight } from 'lucide-react';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Help center — Worksy',
  description: 'Answers on bookings, payments, cancellations, and account issues, plus how to reach support.',
};

const topics = [
  {
    icon: CalendarX,
    title: 'Bookings & rescheduling',
    desc: 'Free cancellation up to 2 hours before your scheduled slot. Reschedule anytime from My Bookings.',
  },
  {
    icon: CreditCard,
    title: 'Payments & invoices',
    desc: 'You\u2019re only charged once a quote is accepted, and funds release to the pro after the job is complete.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust & verification',
    desc: 'Every professional passes an identity and background check, plus license checks for regulated trades.',
  },
  {
    icon: UserX,
    title: 'Account & disputes',
    desc: 'Message the professional first for most issues. If it doesn\u2019t resolve, our team can step in directly.',
  },
];

export default function HelpCenterPage() {
  return (
    <StaticPage
      eyebrow="Help center"
      title="How can we help?"
      intro="Signed-in customers get a full searchable help desk from their dashboard. Here are answers to the most common questions, wherever you're starting from."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {topics.map((t) => (
          <div key={t.title} className="rounded-2xl border border-ink/10 p-6">
            <t.icon size={20} className="text-ink/70" />
            <p className="mt-4 text-[15px] font-medium text-ink">{t.title}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/65">{t.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4 rounded-2xl bg-ink px-8 py-8 text-paper">
        <div className="flex-1 min-w-[220px]">
          <p className="font-display text-xl italic tracking-tightest">Still stuck?</p>
          <p className="mt-2 text-[14px] text-paper/70">
            Check the FAQ for quick answers, or reach our support team directly.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/#faq"
            className="inline-flex items-center gap-1.5 rounded-full border border-paper/30 px-5 py-2.5 text-[13px] font-medium text-paper transition-colors duration-300 hover:bg-paper/10"
          >
            Browse FAQs
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-paper px-5 py-2.5 text-[13px] font-medium text-ink transition-colors duration-300 hover:bg-white"
          >
            Contact support
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </StaticPage>
  );
}
