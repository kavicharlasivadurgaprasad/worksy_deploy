import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Blog — Worksy',
  description: 'Stories, guides, and updates from Worksy — coming soon.',
};

const upcomingTopics = [
  'How we screen and verify local professionals',
  'A guide to getting accurate quotes for home repairs',
  'Behind the scenes of Worksy\u2019s matching system',
];

export default function BlogPage() {
  return (
    <StaticPage
      eyebrow="Blog"
      title="We're just getting started."
      intro="The Worksy blog is coming soon, with guides for hiring well and stories from professionals on the platform."
    >
      <div className="rounded-2xl border border-ink/10 p-8">
        <p className="text-[13px] uppercase tracking-widest text-slate">What&apos;s next</p>
        <ul className="mt-4 space-y-3">
          {upcomingTopics.map((t) => (
            <li key={t} className="text-[15px] text-ink/75">
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[14px] leading-relaxed text-ink/60">
          Want to know when we publish? Reach out and we&apos;ll let you know as soon
          as the first posts are live.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-paper transition-colors duration-300 hover:bg-ink/90"
        >
          Get in touch
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </StaticPage>
  );
}
