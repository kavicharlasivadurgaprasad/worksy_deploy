import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type StaticPageProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
};

export default function StaticPage({ eyebrow, title, intro, children }: StaticPageProps) {
  return (
    <main className="relative min-h-screen bg-paper text-ink">
      <Navbar />

      <section className="bg-paper px-6 pb-16 pt-40 md:px-10 md:pt-48">
        <div className="mx-auto max-w-content">
          <p className="text-[13px] uppercase tracking-widest text-slate">{eyebrow}</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] tracking-tightest sm:text-5xl">
            {title}
          </h1>
          {intro && (
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate">{intro}</p>
          )}
        </div>
      </section>

      <section className="bg-paper px-6 pb-28 md:px-10">
        <div className="mx-auto max-w-content">
          <div className="max-w-3xl">{children}</div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
