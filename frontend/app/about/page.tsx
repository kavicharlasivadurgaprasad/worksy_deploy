import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'About — Worksy',
  description: 'Why Worksy exists and what we\u2019re building for local service professionals and the neighbors who hire them.',
};

export default function AboutPage() {
  return (
    <StaticPage
      eyebrow="About"
      title="Built for the neighborhood, not the algorithm."
      intro="Worksy started with a simple frustration: finding a good, available local professional shouldn\u2019t take a dozen phone calls."
    >
      <div className="space-y-8 text-[15px] leading-relaxed text-ink/80">
        <p>
          Every day, people need something fixed, cleaned, taught, styled, or built —
          and every day, skilled professionals nearby have the time and the skill to
          do it. Worksy exists to close that gap quickly, transparently, and without
          the guesswork.
        </p>
        <p>
          We built a marketplace where customers can describe a job once and get
          matched with vetted local pros in minutes, and where professionals can grow
          a real business without paying for leads that go nowhere. No subscriptions
          to browse, no bidding wars for exposure — just a fair match based on skill,
          location, and availability.
        </p>
        <p>
          Every professional on Worksy passes an identity check and background
          screening before their profile goes live, and license verification for
          trades that require one. Every job booked through Worksy is covered by our
          payment protection, so both sides can focus on the work instead of the
          paperwork.
        </p>
        <p>
          We&apos;re a small team that cares a lot about the details — from how quickly
          a quote arrives to how a completed job actually looks. If you want to know
          more about what we&apos;re building, or you&apos;d like to work with us, we&apos;d
          love to hear from you.
        </p>
      </div>
    </StaticPage>
  );
}
