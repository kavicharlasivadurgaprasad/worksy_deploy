'use client';

import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight } from 'lucide-react';

const popular = [
  'Plumber',
  'Electrician',
  'House cleaner',
  'Tutor',
  'Photographer',
  'AC repair',
  'Hair stylist',
  'Auto detailer',
];

export default function SearchSection() {
  return (
    <section id="search" className="bg-ink px-6 py-28 text-paper md:px-10 md:py-32">
      <div className="mx-auto max-w-content">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl font-display text-4xl leading-[1.05] tracking-tightest sm:text-5xl"
        >
          What needs doing this week?
        </motion.h2>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={(e) => e.preventDefault()}
          className="mt-10 flex flex-col gap-3 rounded-2xl border border-paper/15 bg-ink-soft p-2.5 sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 items-center gap-3 px-4 py-3">
            <Search size={18} className="shrink-0 text-paper/40" />
            <input
              type="text"
              placeholder="A service, trade, or job description"
              className="w-full bg-transparent text-[15px] text-paper placeholder:text-paper/40 focus:outline-none"
            />
          </div>
          <div className="hidden h-9 w-px bg-paper/15 sm:block" />
          <div className="flex items-center gap-3 border-t border-paper/10 px-4 py-3 sm:border-none">
            <MapPin size={18} className="shrink-0 text-paper/40" />
            <input
              type="text"
              placeholder="Your neighborhood"
              className="w-full bg-transparent text-[15px] text-paper placeholder:text-paper/40 focus:outline-none sm:w-40"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-paper px-6 py-3.5 text-[14px] font-medium text-ink transition-colors duration-300 hover:bg-white"
          >
            Search
            <ArrowRight size={15} />
          </button>
        </motion.form>

        <div className="mt-8">
          <p className="text-[12px] text-paper/40">Popular this week</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {popular.map((p) => (
              <button
                key={p}
                className="rounded-full border border-paper/15 px-4 py-2 text-[13px] text-paper/70 transition-colors duration-300 hover:border-paper/40 hover:text-paper"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
