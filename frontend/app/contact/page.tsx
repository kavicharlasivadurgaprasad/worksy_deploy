import type { Metadata } from 'next';
import { Mail, MessageCircle, HelpCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Contact — Worksy',
  description: 'Get in touch with the Worksy team.',
};

export default function ContactPage() {
  return (
    <StaticPage
      eyebrow="Contact"
      title="Talk to a real person."
      intro="Whether you\u2019re a customer, a professional, or just curious about Worksy, here\u2019s the fastest way to reach us."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <a
          href="mailto:support@worksy.com"
          className="group flex flex-col rounded-2xl border border-ink/10 p-6 transition-colors duration-300 hover:border-ink/30"
        >
          <Mail size={20} className="text-ink/70" />
          <p className="mt-4 text-[15px] font-medium text-ink">Email support</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink/65">
            support@worksy.com — for booking issues, payments, or account help.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-ink/80 group-hover:text-ink">
            Send an email
            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </a>

        <a
          href="mailto:partners@worksy.com"
          className="group flex flex-col rounded-2xl border border-ink/10 p-6 transition-colors duration-300 hover:border-ink/30"
        >
          <MessageCircle size={20} className="text-ink/70" />
          <p className="mt-4 text-[15px] font-medium text-ink">Professional partnerships</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink/65">
            partners@worksy.com — for professionals and teams joining the platform.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-ink/80 group-hover:text-ink">
            Send an email
            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </a>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4 rounded-2xl bg-ink px-8 py-8 text-paper">
        <HelpCircle size={22} className="text-paper/70 shrink-0" />
        <div className="flex-1 min-w-[220px]">
          <p className="font-display text-xl italic tracking-tightest">Have a quick question?</p>
          <p className="mt-2 text-[14px] text-paper/70">
            Most common questions are already answered in our help center.
          </p>
        </div>
        <Link
          href="/help"
          className="inline-flex items-center gap-1.5 rounded-full bg-paper px-5 py-2.5 text-[13px] font-medium text-ink transition-colors duration-300 hover:bg-white"
        >
          Visit help center
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </StaticPage>
  );
}
