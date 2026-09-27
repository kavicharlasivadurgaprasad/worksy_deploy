'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const categories = [
  {
    name: 'Home repairs',
    blurb: 'Carpenters, handymen, and fix-it specialists',
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop',
  },
  {
    name: 'Cleaning',
    blurb: 'Standing appointments and one-time deep cleans',
    img: 'https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?q=80&w=1200&auto=format&fit=crop',
  },
  {
    name: 'Beauty & wellness',
    blurb: 'Hair, skin, and mobile spa professionals',
    img: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=1200&auto=format&fit=crop',
  },
  {
    name: 'Tutoring',
    blurb: 'Subject specialists for every grade level',
    img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
  },
  {
    name: 'Moving',
    blurb: 'Local crews for apartments, homes, and offices',
    img: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    name: 'Automotive',
    blurb: 'Mobile mechanics and detailing at your curb',
    img: 'https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1200&auto=format&fit=crop',
  },
  {
    name: 'Photography',
    blurb: 'Portraits, events, and small business shoots',
    img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1200&auto=format&fit=crop',
  },
  {
    name: 'Pet care',
    blurb: 'Walking, sitting, and grooming nearby',
    img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop',
  },
];

export default function ServiceCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scales, setScales] = useState<number[]>(categories.map(() => 0.86));

  const updateScales = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    const next = cardRefs.current.map((el) => {
      if (!el) return 0.86;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(trackCenter - cardCenter);
      const norm = Math.min(dist / (track.clientWidth / 1.6), 1);
      return 1 - norm * 0.16;
    });
    setScales(next);
  }, []);

  useEffect(() => {
    updateScales();
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', updateScales, { passive: true });
    window.addEventListener('resize', updateScales);
    return () => {
      track.removeEventListener('scroll', updateScales);
      window.removeEventListener('resize', updateScales);
    };
  }, [updateScales]);

  return (
    <section id="services" className="bg-paper px-6 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-content">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[13px] text-slate">Categories</p>
            <h2 className="mt-4 max-w-lg font-display text-4xl leading-[1.05] tracking-tightest sm:text-5xl">
              Whatever the job, someone nearby does it well.
            </h2>
          </div>
          <p className="max-w-xs text-[15px] leading-relaxed text-slate">
            Browse by category or search directly — every professional is
            background-checked before their first job.
          </p>
        </div>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 md:gap-7 md:px-[calc((100vw-1440px)/2+2.5rem)]"
        style={{ scrollPaddingLeft: '2.5rem' }}
      >
        {categories.map((c, i) => (
          <div
            key={c.name}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            style={{ scale: scales[i] }}
            className="group relative w-[78vw] shrink-0 snap-center overflow-hidden rounded-2xl transition-[scale] duration-150 ease-out sm:w-[46vw] md:w-[380px]"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink-soft">
              <img
                src={c.img}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl italic text-paper">{c.name}</h3>
                  <p className="mt-1.5 text-[13px] text-paper/70">{c.blurb}</p>
                </div>
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper/15 backdrop-blur-sm transition-colors duration-300 group-hover:bg-paper">
                  <ArrowUpRight
                    size={16}
                    className="text-paper transition-colors duration-300 group-hover:text-ink"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
