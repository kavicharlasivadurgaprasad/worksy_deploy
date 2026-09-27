'use client';

import { motion } from 'framer-motion';
import Globe from './Globe';

export default function FinalCTA() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[580px] md:min-h-[720px] overflow-hidden bg-black px-6 py-28 text-center md:py-36">
      {/* Interactive 3D Globe Background - High Visibility */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-100">
        <div className="h-[580px] w-[580px] sm:h-[680px] sm:w-[680px] md:h-[820px] md:w-[820px]">
          <Globe />
        </div>
      </div>

      {/* Radial vignette mask for ambient text clarity */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-black via-black/20 to-black" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-xl pointer-events-auto"
      >
        <h2 className="font-display text-4xl leading-[1.05] tracking-tightest text-paper sm:text-5xl md:text-6xl">
          The next job on your list is one post away.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-paper/85 md:text-base">
          Free to post, no obligation to book, and someone nearby is probably
          already available this week.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#search"
            className="rounded-full bg-paper px-7 py-3.5 text-sm font-medium text-ink transition-all duration-300 hover:bg-white hover:shadow-lg"
          >
            Post a job
          </a>
          <a
            href="#professionals"
            className="text-sm text-paper underline decoration-paper/40 underline-offset-4 transition-colors duration-300 hover:decoration-paper"
          >
            Join as a professional
          </a>
        </div>
      </motion.div>
    </section>
  );
}
