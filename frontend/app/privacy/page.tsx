import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — Worksy',
  description: 'How Worksy collects, uses, and protects your information.',
};

const sections = [
  {
    title: '1. Information we collect',
    body: 'When you create an account, we collect basic profile information such as your name, email address, and phone number. Professionals also provide service categories, service areas, and verification documents. When you book or complete a job, we collect booking details, messages exchanged on the platform, and payment confirmations.',
  },
  {
    title: '2. How we use your information',
    body: 'We use your information to match customers with professionals, process bookings and payments, verify professional identities, provide customer support, and improve the reliability of the marketplace. We do not sell your personal information to third parties.',
  },
  {
    title: '3. Sharing with other users',
    body: 'To complete a booking, we share limited information between the customer and the professional involved — such as name, contact details for that job, and job location. Reviews you leave are visible publicly on the relevant profile.',
  },
  {
    title: '4. Payment information',
    body: 'Payments are processed through licensed payment providers. Worksy does not store full card numbers on its own servers. Funds for a booking are held until the job is marked complete and released to the professional shortly after.',
  },
  {
    title: '5. Data retention',
    body: 'We keep account and booking information for as long as your account is active, and for a limited period afterward where required for legal, tax, or dispute-resolution purposes.',
  },
  {
    title: '6. Your choices',
    body: 'You can review and update your profile information at any time from your account settings. You may request deletion of your account by contacting support, subject to any records we are required to retain by law.',
  },
  {
    title: '7. Changes to this policy',
    body: 'We may update this policy as the platform evolves. Material changes will be reflected here with an updated effective date.',
  },
];

export default function PrivacyPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="Effective date: this policy describes how Worksy handles information for customers and professionals using the platform."
    >
      <div className="space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-display text-xl tracking-tightest">{s.title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/70">{s.body}</p>
          </div>
        ))}
        <p className="text-[13px] leading-relaxed text-slate">
          Questions about this policy? Reach us any time at{' '}
          <a href="mailto:support@worksy.com" className="underline hover:text-ink">
            support@worksy.com
          </a>
          .
        </p>
      </div>
    </StaticPage>
  );
}
