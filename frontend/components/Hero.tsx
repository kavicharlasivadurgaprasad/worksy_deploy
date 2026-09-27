'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';

const SERVICES = [
  {
    id: 'repairs',
    title: 'Home repairs',
    blurb: 'Carpenters, handymen, and fix-it specialists',
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
    flareColor: 'rgba(255, 255, 255, 0.15)',
  },
  {
    id: 'cleaning',
    title: 'Cleaning',
    blurb: 'Standing appointments and one-time deep cleans',
    img: 'https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?q=80&w=1200&auto=format&fit=crop',
    flareColor: 'rgba(6, 182, 212, 0.22)',
  },
  {
    id: 'wellness',
    title: 'Beauty & wellness',
    blurb: 'Hair, skin, and mobile spa professionals',
    img: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=1200&auto=format&fit=crop',
    flareColor: 'rgba(236, 72, 153, 0.22)',
  },
  {
    id: 'tutoring',
    title: 'Tutoring',
    blurb: 'Subject specialists for every grade level',
    img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
    flareColor: 'rgba(139, 92, 246, 0.22)',
  },
  {
    id: 'moving',
    title: 'Moving',
    blurb: 'Local crews for apartments, homes, and offices',
    img: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?q=80&w=1200&auto=format&fit=crop',
    flareColor: 'rgba(203, 213, 225, 0.18)',
  },
  {
    id: 'automotive',
    title: 'Automotive',
    blurb: 'Mobile mechanics and detailing at your curb',
    img: 'https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1200&auto=format&fit=crop',
    flareColor: 'rgba(59, 130, 246, 0.22)',
  },
];

export default function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeService = SERVICES[activeIdx];

  const ref = useRef<HTMLDivElement>(null);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  // Center active card smoothly in the middle of the carousel container
  const centerCard = useCallback((idx: number) => {
    const track = carouselTrackRef.current;
    const card = cardRefs.current[idx];
    if (track && card) {
      const trackRect = track.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const targetScrollLeft =
        track.scrollLeft +
        (cardRect.left - trackRect.left) -
        trackRect.width / 2 +
        cardRect.width / 2;

      track.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth',
      });
    }
  }, []);

  // Center card whenever activeIdx changes
  useEffect(() => {
    centerCard(activeIdx);
  }, [activeIdx, centerCard]);

  // Re-center on window resize
  useEffect(() => {
    const handleResize = () => centerCard(activeIdx);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIdx, centerCard]);

  // Auto-change card and background every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SERVICES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="relative min-h-[110vh] w-full overflow-hidden bg-ink py-10 md:py-16">
      {/* Dynamic Motion Background Image Layer */}
      <AnimatePresence>
        <motion.div
          key={activeService.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* Continuous Motion Pan/Zoom Effect */}
          <motion.img
            src={activeService.img}
            alt={activeService.title}
            animate={{
              scale: [1, 1.08, 1],
              x: [0, -10, 10, 0],
              y: [0, -6, 6, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dynamic Color Motion Flare Overlay */}
      <AnimatePresence>
        <motion.div
          key={`flare-${activeService.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="pointer-events-none absolute inset-0"
        >
          <motion.div
            animate={{
              x: [-60, 60, -30, 0],
              y: [-40, 40, -20, 0],
              scale: [1, 1.25, 0.95, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="absolute left-1/3 top-1/4 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
            style={{ backgroundColor: activeService.flareColor }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Vignette & Gradient Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/30" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-ink/40" />

      {/* Main Foreground Content */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 flex min-h-full max-w-content flex-col justify-start px-6 pt-24 pb-14 md:mx-auto md:px-10 md:pt-32 md:pb-20"
      >
        {/* Main Section Headline */}
        <motion.h1
          initial={{ opacity: 0.8, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl font-display text-[10.5vw] leading-[0.96] tracking-tightest text-paper sm:text-5xl md:text-6xl lg:text-[4.75rem]"
        >
          The person for
          <br />
          <span className="italic">the job</span> is near you.
        </motion.h1>

        {/* Dynamic Description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`blurb-${activeService.id}`}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.4, y: -4 }}
            transition={{ duration: 0.3 }}
            className="mt-4 max-w-md text-[14px] leading-relaxed text-paper/80 sm:text-[15px]"
          >
            {activeService.blurb}
          </motion.p>
        </AnimatePresence>

        {/* Action CTAs (ABOVE CARDS) */}
        <motion.div
          initial={{ opacity: 0.95, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 flex flex-wrap items-center gap-4"
        >
          <a
            href="#search"
            className="group flex items-center gap-2 rounded-full bg-paper px-7 py-3 text-sm font-medium text-ink transition-all duration-300 hover:bg-white hover:shadow-lg"
          >
            Post a {activeService.title.toLowerCase()} job
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <a
            href="#professionals"
            className="text-sm text-paper underline decoration-paper/40 underline-offset-4 transition-colors duration-300 hover:decoration-paper"
          >
            Become a professional
          </a>
        </motion.div>

        {/* Straight Carousel Marquee with Centered Active Card */}
        <div className="mt-10 overflow-hidden pt-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[12px] font-semibold tracking-wider text-paper/70 uppercase">
              Select a service to preview near you:
            </p>
            {/* 2s Live Auto-change Indicator */}
            <div className="flex items-center gap-2 text-[11px] text-paper/60">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Auto-previewing (every 2s)</span>
            </div>
          </div>
          
          <div
            ref={carouselTrackRef}
            className="no-scrollbar flex items-center gap-6 sm:gap-8 md:gap-10 overflow-x-auto py-8 scroll-smooth px-[calc(50%-140px)] sm:px-[calc(50%-170px)] md:px-[calc(50%-190px)]"
          >
            {SERVICES.map((service, idx) => {
              const isActive = activeIdx === idx;

              return (
                <button
                  key={service.id}
                  ref={(el) => { cardRefs.current[idx] = el; }}
                  onClick={() => setActiveIdx(idx)}
                  className={`group relative shrink-0 overflow-hidden rounded-2xl text-left transition-all duration-700 ease-out w-[280px] sm:w-[340px] md:w-[380px] cursor-pointer ${
                    isActive
                      ? 'scale-[1.08] sm:scale-[1.12] ring-2 ring-white/90 shadow-2xl shadow-black/90 z-20 opacity-100 brightness-105'
                      : 'scale-[0.88] sm:scale-[0.92] opacity-35 hover:opacity-65 brightness-75 grayscale-[25%] z-10'
                  }`}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-soft rounded-2xl">
                    <img
                      src={service.img}
                      alt={service.title}
                      className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
                        isActive ? 'scale-105' : 'group-hover:scale-105'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-xl sm:text-2xl italic text-paper leading-tight">
                              {service.title}
                            </h3>
                            {isActive && (
                              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="mt-1 max-w-[250px] text-[12px] sm:text-[13px] leading-snug text-paper/80">
                            {service.blurb}
                          </p>
                        </div>
                        <div
                          className={`mt-1 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full backdrop-blur-sm transition-colors duration-300 ${
                            isActive
                              ? 'bg-paper text-ink shadow-md'
                              : 'bg-paper/15 text-paper group-hover:bg-paper group-hover:text-ink'
                          }`}
                        >
                          <ArrowUpRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dot navigation indicators */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {SERVICES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveIdx(idx)}
                aria-label={`Preview ${s.title}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  activeIdx === idx
                    ? 'w-7 bg-white shadow-sm'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-paper/60"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}

