'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

const stats = [
  { value: 12000, suffix: '+', label: 'Vetted professionals', decimals: 0 },
  { value: 61000, suffix: '+', label: 'Jobs completed', decimals: 0 },
  { value: 4.9, suffix: '/5', label: 'Average job rating', decimals: 1 },
  { value: 140, suffix: '+', label: 'Towns and cities', decimals: 0 },
];

function Counter({ value, suffix, decimals }: { value: number; suffix: string; decimals: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, value, decimals]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="bg-ink px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-content grid-cols-2 gap-y-14 md:grid-cols-4 md:gap-y-0">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="border-l border-paper/15 pl-5 md:pl-8"
          >
            <div className="font-display text-4xl tracking-tightest text-paper sm:text-5xl md:text-6xl">
              <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} />
            </div>
            <p className="mt-3 text-[13px] text-paper/55">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
