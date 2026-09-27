'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const reel1 = [
  { url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop', title: 'Electrical' },
  { url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop', title: 'Engineering' },
  { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop', title: 'Barbering' },
  { url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop', title: 'Cleaning' },
];

const reel2 = [
  { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop', title: 'Architecture' },
  { url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop', title: 'Painting' },
  { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop', title: 'Catering' },
  { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop', title: 'Interior Design' },
];

const reel3 = [
  { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop', title: 'Construction' },
  { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop', title: 'Personal Training' },
  { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop', title: 'Wellness' },
  { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop', title: 'Fitness' },
];

const reel4 = [
  { url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?q=80&w=600&auto=format&fit=crop', title: 'Carpentry' },
  { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop', title: 'Styling' },
  { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop', title: 'Home Repair' },
  { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop', title: 'Aesthetics' },
];

export default function BusinessShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const yReel1 = useTransform(scrollYProgress, [0, 1], [-120, 120]);
  const yReel2 = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const yReel3 = useTransform(scrollYProgress, [0, 1], [-140, 140]);
  const yReel4 = useTransform(scrollYProgress, [0, 1], [140, -140]);

  return (
    <section
      ref={containerRef}
      id="professionals"
      className="relative flex min-h-[650px] md:min-h-[720px] w-full items-center justify-center overflow-hidden bg-black px-6 py-28 md:py-36"
    >
      {/* Tilted Reel Gallery Background - High Visibility */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-80 md:opacity-85">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-[140%] md:w-[130%] max-w-none -rotate-6 md:-rotate-8 scale-110 translate-y-4">
          {/* Column 1 */}
          <motion.div style={{ y: yReel1 }} className="flex flex-col gap-4 md:gap-6">
            {reel1.concat(reel1).map((item, idx) => (
              <div key={idx} className="group relative h-48 md:h-64 w-full overflow-hidden rounded-2xl border border-paper/20 bg-paper/10 shadow-2xl">
                <img src={item.url} alt={item.title} className="h-full w-full object-cover opacity-95 transition-all duration-700 group-hover:scale-105" />
              </div>
            ))}
          </motion.div>

          {/* Column 2 */}
          <motion.div style={{ y: yReel2 }} className="flex flex-col gap-4 md:gap-6">
            {reel2.concat(reel2).map((item, idx) => (
              <div key={idx} className="group relative h-48 md:h-64 w-full overflow-hidden rounded-2xl border border-paper/20 bg-paper/10 shadow-2xl">
                <img src={item.url} alt={item.title} className="h-full w-full object-cover opacity-95 transition-all duration-700 group-hover:scale-105" />
              </div>
            ))}
          </motion.div>

          {/* Column 3 */}
          <motion.div style={{ y: yReel3 }} className="hidden md:flex flex-col gap-4 md:gap-6">
            {reel3.concat(reel3).map((item, idx) => (
              <div key={idx} className="group relative h-48 md:h-64 w-full overflow-hidden rounded-2xl border border-paper/20 bg-paper/10 shadow-2xl">
                <img src={item.url} alt={item.title} className="h-full w-full object-cover opacity-95 transition-all duration-700 group-hover:scale-105" />
              </div>
            ))}
          </motion.div>

          {/* Column 4 */}
          <motion.div style={{ y: yReel4 }} className="hidden md:flex flex-col gap-4 md:gap-6">
            {reel4.concat(reel4).map((item, idx) => (
              <div key={idx} className="group relative h-48 md:h-64 w-full overflow-hidden rounded-2xl border border-paper/20 bg-paper/10 shadow-2xl">
                <img src={item.url} alt={item.title} className="h-full w-full object-cover opacity-95 transition-all duration-700 group-hover:scale-105" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Vignette & Gradient Overlays - Lightened for maximum background visibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/40 blur-[90px]" />

      {/* Foreground Content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto flex max-w-xl flex-col items-center justify-center px-4 text-center"
      >
        <span className="rounded-full border border-paper/25 bg-black/60 px-4.5 py-1.5 text-[12px] font-semibold tracking-wider text-paper uppercase backdrop-blur-md shadow-sm">
          For Local Businesses
        </span>
        <h2 className="mt-6 font-display text-4xl leading-[1.08] tracking-tightest text-paper sm:text-5xl md:text-6xl">
          Built for the business, not just the booking.
        </h2>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-paper/85 sm:text-base">
          Showcase your expertise, manage appointments effortlessly, and grow your local client base with zero hidden fees.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#get-started"
            className="rounded-full bg-paper px-8 py-3.5 text-sm font-medium text-ink transition-all duration-300 hover:bg-white hover:shadow-lg"
          >
            List your business
          </a>
        </div>
      </motion.div>
    </section>
  );
}
