import type { Metadata } from 'next';
import StaticPage from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Terms of Service — Worksy',
  description: 'The terms that govern use of the Worksy marketplace.',
};

const sections = [
  {
    title: '1. Using Worksy',
    body: 'Worksy is a marketplace connecting customers who need local services with independent professionals who provide them. By creating an account, you agree to provide accurate information and to use the platform only for lawful purposes.',
  },
  {
    title: '2. Accounts and roles',
    body: 'You may use Worksy as a customer, a professional, or both. Professionals are independent contractors, not employees or agents of Worksy, and are solely responsible for the quality and completion of the services they provide.',
  },
  {
    title: '3. Bookings and payments',
    body: 'When a quote is accepted, payment is processed through Worksy and held until the job is marked complete. Cancellation and rescheduling are free up to 2 hours before the scheduled slot; a visit fee may apply after that window.',
  },
  {
    title: '4. Verification',
    body: 'Professionals must pass identity and background verification, and license verification where required by their trade, before their profile is activated. Worksy may suspend or remove any account that fails to meet these standards or violates these terms.',
  },
  {
    title: '5. Payment protection',
    body: 'Jobs paid for through Worksy are eligible for payment protection up to the limit stated on the platform at the time of booking. Protection does not apply to work arranged or paid for outside of Worksy.',
  },
  {
    title: '6. Reviews and conduct',
    body: 'Reviews must reflect a genuine booking experience. Harassment, discrimination, or fraudulent activity by any user may result in account suspension and removal from the platform.',
  },
  {
    title: '7. Limitation of liability',
    body: 'Worksy facilitates connections between customers and professionals but is not a party to the service agreement between them. To the extent permitted by law, Worksy\u2019s liability is limited to the amount paid for the relevant booking.',
  },
  {
    title: '8. Changes to these terms',
    body: 'We may update these terms from time to time. Continued use of Worksy after an update constitutes acceptance of the revised terms.',
  },
];

export default function TermsPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Terms of Service"
      intro="These terms govern your use of Worksy as a customer or a professional. Please read them carefully."
    >
      <div className="space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-display text-xl tracking-tightest">{s.title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/70">{s.body}</p>
          </div>
        ))}
        <p className="text-[13px] leading-relaxed text-slate">
          Questions about these terms? Reach us any time at{' '}
          <a href="mailto:support@worksy.com" className="underline hover:text-ink">
            support@worksy.com
          </a>
          .
        </p>
      </div>
    </StaticPage>
  );
}
