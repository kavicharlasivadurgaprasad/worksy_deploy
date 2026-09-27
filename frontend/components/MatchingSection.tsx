'use client';

import { motion } from 'framer-motion';
import { MessageSquare, UserCheck } from 'lucide-react';

export default function MatchingSection() {
  return (
    <section id="matching" className="bg-ink px-6 py-28 text-paper md:px-10 md:py-36">
      <div className="mx-auto max-w-content">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="text-[13px] text-paper/50">Matching</p>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tightest sm:text-5xl md:text-6xl">
            Finding the right person for the job shouldn&apos;t take all day.
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-paper/60">
            Our matching looks at trade, distance, current availability, and past
            job ratings, so the first three replies you get are ones worth
            reading.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl border border-paper/10 bg-ink-soft p-9"
          >
            <MessageSquare size={22} className="text-paper" />
            <h3 className="mt-8 font-display text-2xl italic">Tell us what you need</h3>
            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-paper/55">
              A short form — the job, your area, and roughly when. No account
              required to see who&apos;s available.
            </p>
            <div className="mt-9 rounded-xl border border-paper/10 bg-ink p-5">
              <p className="text-[12px] text-paper/40">Job description</p>
              <p className="mt-2 text-[14px] text-paper/80">
                &ldquo;Leaking pipe under the kitchen sink, need someone this week&rdquo;
              </p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-full bg-paper/10 px-3 py-1 text-[11px] text-paper/60">
                  Plumbing
                </span>
                <span className="rounded-full bg-paper/10 px-3 py-1 text-[11px] text-paper/60">
                  This week
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl border border-paper/10 bg-ink-soft p-9"
          >
            <UserCheck size={22} className="text-paper" />
            <h3 className="mt-8 font-display text-2xl italic">Get matched instantly</h3>
            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-paper/55">
              Ranked by fit, not by who pays for placement. Read reviews from
              your own neighbors before you message anyone.
            </p>
            <div className="mt-9 space-y-3">
              {[
                { name: 'Marisol T.', trade: 'Plumber · 0.8 mi away', rating: '4.9' },
                { name: 'Devon R.', trade: 'Plumber · 1.2 mi away', rating: '4.8' },
              ].map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-xl border border-paper/10 bg-ink px-4 py-3"
                >
                  <div>
                    <p className="text-[14px] text-paper/85">{p.name}</p>
                    <p className="text-[12px] text-paper/45">{p.trade}</p>
                  </div>
                  <span className="text-[13px] text-paper/90 font-medium">★ {p.rating}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
