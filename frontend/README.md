# Worksy — local service marketplace landing page

A premium, editorial-style landing page for a local service marketplace, built with Next.js 14 (App Router), Tailwind CSS, and Framer Motion.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

To build for production:

```bash
npm run build
npm run start
```

## Structure

- `app/` — App Router entry (`layout.tsx`, `page.tsx`, `globals.css`)
- `components/` — one component per section (Navbar, Hero, Stats, ServiceCarousel, FeatureCards, MatchingSection, SearchSection, Testimonials, BusinessShowcase, FAQ, FinalCTA, Footer)
- `lib/utils.ts` — small `cn()` classname helper
- `tailwind.config.ts` — design tokens (colors, fonts, spacing)

## Design system

- **Colors**: `ink` (#15140F, near-black), `paper` (#EDEAE1, warm ivory), `brass` (#A87C4F, accent), `moss` (#47543D, verification/trust), `slate` (muted text)
- **Type**: `Fraunces` for display/headline text, `Inter` for body and UI — loaded via `next/font/google` in `app/layout.tsx`
- **Motion**: Framer Motion throughout; the hero has the one orchestrated load sequence, everything else uses functional scroll-reveal and hover states. `prefers-reduced-motion` is respected globally in `globals.css`.

## Images

All photography currently points to Unsplash placeholder URLs (`images.unsplash.com`) so the layout renders correctly out of the box. Swap the `src` values in `components/ServiceCarousel.tsx`, `components/Hero.tsx`, `components/BusinessShowcase.tsx`, and `components/Testimonials.tsx` for your own licensed photography before shipping. `next.config.js` is already configured to allow the Unsplash domain — add any new image host there too.

## Notes

- This project was written by hand to match a specific design brief; dependencies were **not** installed or build-verified in the environment that generated it (no network access), so run `npm install && npm run build` locally as a first check before deploying.
- Tailwind's JIT will only pick up classes it can see as static strings — if you add new dynamic class names, make sure they appear in full somewhere in the codebase.
