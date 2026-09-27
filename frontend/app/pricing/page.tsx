import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, ArrowUpRight } from 'lucide-react';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Pricing — Worksy',
  description: 'Free for customers. A simple, pay-as-you-earn fee for professionals — no monthly subscriptions.',
};

const customerIncludes = [
  'Post a job and browse professionals, free',
  'Compare quotes and message pros directly',
  'Payment protection on every booking',
  'Coverage up to $2,500 on jobs paid through Worksy',
];

const proIncludes = [
  'Create a profile and receive job leads, free',
  'No monthly subscription or listing fee',
  'Small percentage fee only on completed jobs',
  'Get paid out once the customer marks the job done',
];

export default function PricingPage() {
  return (
    <StaticPage
      eyebrow="Pricing"
      title="Simple on both sides."
      intro="Worksy makes money only when a job actually gets done — never before."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 p-8">
          <p className="text-[13px] uppercase tracking-widest text-slate">For customers</p>
          <p className="mt-3 font-display text-3xl tracking-tightest">Free</p>
          <ul className="mt-6 space-y-3">
            {customerIncludes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] text-ink/75">
                <Check size={16} className="mt-0.5 shrink-0 text-moss" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/login?mode=signup&role=customer"
            className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-paper transition-colors duration-300 hover:bg-ink/90"
          >
            Get started
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-ink p-8 text-paper">
          <p className="text-[13px] uppercase tracking-widest text-paper/50">For professionals</p>
          <p className="mt-3 font-display text-3xl tracking-tightest">Pay only when you earn</p>
          <ul className="mt-6 space-y-3">
            {proIncludes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] text-paper/80">
                <Check size={16} className="mt-0.5 shrink-0 text-paper" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/login?mode=signup&role=provider"
            className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-paper px-5 py-2.5 text-[13px] font-medium text-ink transition-colors duration-300 hover:bg-white"
          >
            Join as a professional
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      <p className="mt-8 max-w-xl text-[13px] leading-relaxed text-slate">
        The exact service fee percentage depends on your trade and category and is
        shown before you accept any job — there are never hidden charges.
      </p>
    </StaticPage>
  );
}
