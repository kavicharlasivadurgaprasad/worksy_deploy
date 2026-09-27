import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Careers — Worksy',
  description: 'Open roles at Worksy and what it\u2019s like to work here.',
};

const departments = [
  {
    name: 'Engineering',
    blurb: 'Marketplace, matching, and payments infrastructure for both sides of the platform.',
  },
  {
    name: 'Trust & Safety',
    blurb: 'Verification, background screening, and dispute resolution for every job booked.',
  },
  {
    name: 'Operations',
    blurb: 'Onboarding professionals and keeping local service quality high, city by city.',
  },
  {
    name: 'Support',
    blurb: 'First line of help for customers and professionals, every day of the week.',
  },
];

export default function CareersPage() {
  return (
    <StaticPage
      eyebrow="Careers"
      title="Help neighbors and professionals find each other."
      intro="We\u2019re a small, deliberate team building the trust layer for local services. Here\u2019s where we\u2019re currently looking to grow."
    >
      <div className="space-y-10">
        <div className="grid gap-6 sm:grid-cols-2">
          {departments.map((d) => (
            <div key={d.name} className="rounded-2xl border border-ink/10 p-6">
              <p className="font-display text-xl italic tracking-tightest">{d.name}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-ink/70">{d.blurb}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-ink px-8 py-10 text-paper">
          <p className="font-display text-2xl italic tracking-tightest">
            Don&apos;t see the right role listed?
          </p>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-paper/70">
            We&apos;re always glad to hear from people who care about local service
            work. Tell us what you&apos;re good at and where you&apos;d want to help.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-paper px-5 py-2.5 text-[13px] font-medium text-ink transition-colors duration-300 hover:bg-white"
          >
            Get in touch
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </StaticPage>
  );
}
