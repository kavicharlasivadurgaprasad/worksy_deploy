'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const avatars = [
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
];

const testimonials = [
  {
    quote:
      'I posted the job on a Tuesday night and had someone fixing the fence by Thursday morning. Didn\u2019t expect it to be that fast.',
    name: 'Priya N.',
    detail: 'Fence repair · Oak Park',
    rating: 5,
  },
  {
    quote:
      'The quotes came in within the hour and I could actually see reviews from people a few streets over. Booked the second one I read.',
    name: 'Marcus D.',
    detail: 'Electrical work · Riverside',
    rating: 5,
  },
  {
    quote:
      'As someone who\u2019s been burned by no-shows before, having the job amount held until it\u2019s done made this an easy yes.',
    name: 'Elena V.',
    detail: 'Deep cleaning · Northgate',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="reviews" className="bg-ink px-6 py-28 text-paper md:px-10 md:py-32">
      <div className="mx-auto max-w-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[13px] text-paper/50">Word of mouth</p>
          <h2 className="mt-4 max-w-lg font-display text-4xl leading-[1.05] tracking-tightest sm:text-5xl">
            Trusted by people on your block, and the next one over.
          </h2>

          <div className="mt-9 flex -space-x-3">
            {avatars.map((a, i) => (
              <img
                key={i}
                src={a}
                alt=""
                className="h-11 w-11 rounded-full border-2 border-ink object-cover"
              />
            ))}
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-paper/10 text-[11px] text-paper/70">
              9K+
            </div>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col rounded-2xl border border-paper/10 bg-ink-soft p-7"
            >
              <div className="flex gap-0.5 text-paper">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-5 flex-1 text-[15px] leading-relaxed text-paper/85">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 border-t border-paper/10 pt-4">
                <p className="text-[13px] text-paper/85">{t.name}</p>
                <p className="text-[12px] text-paper/45">{t.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
