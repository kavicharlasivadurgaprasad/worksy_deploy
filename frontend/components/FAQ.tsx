'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const faqs = [
  {
    q: 'How does Worksy work?',
    a: 'Post what you need done along with your neighborhood and rough timing. Nearby professionals send quotes, you compare and message them directly, then book whoever fits.',
  },
  {
    q: 'How are professionals verified?',
    a: 'Every professional passes an identity check and background screening before their profile goes live, and license verification for trades that require one.',
  },
  {
    q: 'How does payment work?',
    a: 'You pay through Worksy once a quote is accepted. Funds are held and released to the professional after the job is marked complete by you.',
  },
  {
    q: 'What if I\u2019m not happy with the work?',
    a: 'Message the professional first — most issues are resolved directly. If not, our support team can step in, and jobs paid through Worksy are covered up to $2,500.',
  },
  {
    q: 'Can I become a professional on the platform?',
    a: 'Yes. Apply with your trade and service area, complete the verification step, and you can start receiving job requests once approved.',
  },
  {
    q: 'Is there a fee to join?',
    a: 'Posting a job and browsing professionals is free. Professionals pay a small percentage only on jobs they complete through the platform.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-ink px-6 py-28 text-paper md:px-10 md:py-32">
      <div className="mx-auto max-w-content">
        <div className="grid gap-10 md:grid-cols-[280px_1fr] md:gap-16">
          <div>
            <p className="text-[13px] text-paper/50">FAQ</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tightest sm:text-5xl">
              Questions, answered.
            </h2>
          </div>

          <div>
            {faqs.map((f, i) => {
              const open = openIndex === i;
              return (
                <div key={f.q} className="border-b border-paper/10">
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-center justify-between py-6 text-left"
                    aria-expanded={open}
                  >
                    <span className="pr-6 text-[16px] text-paper/90 md:text-[18px]">{f.q}</span>
                    <motion.span
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="shrink-0 text-paper/60"
                    >
                      <Plus size={18} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-lg pb-6 text-[14px] leading-relaxed text-paper/55">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
