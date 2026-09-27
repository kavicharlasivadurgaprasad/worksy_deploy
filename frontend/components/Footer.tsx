import Link from 'next/link';
import { Instagram, Twitter, Facebook } from 'lucide-react';

type FooterLink = {
  label: string;
  href: string;
};

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Find a service', href: '/#search' },
      { label: 'Browse categories', href: '/#services' },
      { label: 'How it works', href: '/#matching' },
      { label: 'Reviews', href: '/#reviews' },
    ],
  },
  {
    title: 'For professionals',
    links: [
      { label: 'Join as a professional', href: '/login?mode=signup&role=provider' },
      { label: 'Business dashboard', href: '/provider' },
      { label: 'Grow your business', href: '/#professionals' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help center', href: '/help' },
      { label: 'Blog', href: '/blog' },
      { label: 'FAQs', href: '/#faq' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com', Icon: Instagram },
  { label: 'Twitter', href: 'https://twitter.com', Icon: Twitter },
  { label: 'Facebook', href: 'https://facebook.com', Icon: Facebook },
];

export default function Footer() {
  return (
    <footer className="bg-ink px-6 pt-20 text-paper md:px-10">
      <div className="mx-auto max-w-content">
        <div className="grid gap-14 border-b border-paper/10 pb-16 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Link href="/" className="font-display text-2xl italic tracking-tightest">
              Worksy
            </Link>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-paper/50">
              The neighborhood marketplace for people who do the work, and the
              people who need it done.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[13px] text-paper/40">{col.title}</p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-[14px] text-paper/70 transition-colors duration-300 hover:text-paper"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 py-8 text-[12px] text-paper/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Worksy. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button type="button" className="hover:text-paper/70">
              English (US)
            </button>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-paper/70 transition-colors duration-300 hover:text-paper"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
