'use client';

import { motion } from 'framer-motion';
import { Search, Sparkles, CalendarCheck, ShieldCheck, ArrowUpRight } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Describe the job',
    text: 'Tell us what needs doing, when, and your budget. Takes under a minute.',
  },
  {
    icon: Sparkles,
    title: 'Get matched',
    text: 'We surface professionals nearby with the right skills and open availability.',
  },
  {
    icon: CalendarCheck,
    title: 'Book on your time',
    text: 'Compare quotes, message directly, and lock in a slot that works for you.',
  },
  {
    icon: ShieldCheck,
    title: 'Pay with confidence',
    text: 'Funds are held until the work is done. Every job is insured up to $2,500.',
  },
];

export default function FeatureCards() {
  return (
    <section className="bg-paper px-6 pb-28 md:px-10 md:pb-36">
      <div className="mx-auto max-w-content">
        <div className="max-w-xl">
          <p className="text-[13px] text-slate">The process</p>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tightest sm:text-5xl">
            From posted job to finished work, in four steps.
          </h2>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-2xl bg-ink p-8 text-paper"
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-sm italic text-paper/40">0{i + 1}</span>
                <f.icon size={20} className="text-paper/80" />
              </div>
              <h3 className="mt-10 font-display text-2xl">{f.title}</h3>
              <p className="mt-3 max-w-[26ch] text-[14px] leading-relaxed text-paper/60">
                {f.text}
              </p>
              <div className="mt-8 flex items-center gap-1.5 text-[13px] text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100 font-medium">
                Learn more <ArrowUpRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
