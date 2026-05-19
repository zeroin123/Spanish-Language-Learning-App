'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';

/* ── Scroll-triggered fade-in ───────────────────────────────── */
function FadeIn({ children, delay = 0, className = '' }: {
  children: ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ opacity: 0, transform: 'translateY(28px)', transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ── Animated demo flash-card ───────────────────────────────── */
function DemoCard({ es, en, animStyle }: { es: string; en: string; animStyle: React.CSSProperties }) {
  return (
    <div className="card px-4 py-3.5 w-60 select-none pointer-events-none" style={{
      boxShadow: '0 8px 32px rgba(100,60,20,0.13)',
      ...animStyle,
    }}>
      <div className="text-[9px] font-semibold text-[#A8A29E] uppercase tracking-widest mb-1">Spanish</div>
      <div className="font-display text-[#1C1917] text-sm font-semibold leading-snug mb-2.5">{es}</div>
      <div style={{ height: 1, background: '#E7E0D5' }} className="mb-2.5" />
      <div className="text-[9px] font-semibold text-[#A8A29E] uppercase tracking-widest mb-1">English</div>
      <div className="text-xs text-[#78716C] leading-relaxed">{en}</div>
    </div>
  );
}

/* ── Step card ──────────────────────────────────────────────── */
function Step({ n, icon, title, body }: { n: number; icon: ReactNode; title: string; body: string }) {
  return (
    <div className="card p-6 flex gap-5 group hover:shadow-md transition-all duration-300">
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg,#C85A3A,#A84830)', boxShadow: '0 4px 12px rgba(200,90,58,0.30)' }}>
          {n}
        </div>
        <div className="flex-1 w-px" style={{ background: 'linear-gradient(to bottom, #E7E0D5, transparent)' }} />
      </div>
      <div className="pb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-display font-semibold text-[#1C1917] text-base">{title}</h3>
        </div>
        <p className="text-sm text-[#78716C] leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

/* ── Feature card ───────────────────────────────────────────── */
function Feature({ icon, label, body, color }: { icon: string; label: string; body: string; color: string }) {
  return (
    <div className="card p-5 group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl mb-4"
        style={{ background: `${color}18` }}>
        {icon}
      </div>
      <div className="font-semibold text-[#1C1917] text-sm mb-1.5">{label}</div>
      <p className="text-xs text-[#78716C] leading-relaxed">{body}</p>
    </div>
  );
}

/* ── Landing page ───────────────────────────────────────────── */
export default function LandingPage() {
  const ISLANDS = [
    { e: '👋', n: 'Meeting People' },    { e: '🌍', n: "Where You're From" },
    { e: '🚕', n: 'Taking a Cab' },      { e: '🗺️', n: 'Directions' },
    { e: '✈️', n: 'Travelling Around' }, { e: '🍽️', n: 'Eating Out' },
    { e: '🏥', n: 'At the Doctor' },     { e: '🏠', n: 'Flat-Hunting' },
    { e: '📞', n: 'On the Phone' },      { e: '💼', n: 'At the Office' },
    { e: '👨‍👩‍👧', n: 'Family Issues' },   { e: '✉️', n: 'Writing Home' },
    { e: '🚨', n: 'Emergencies' },       { e: '🌟', n: 'Hopes for the Future' },
    { e: '🥂', n: 'Invitations & Socializing' }, { e: '📝', n: 'Other' },
  ];

  return (
    <div style={{ background: '#FDFCF8', fontFamily: 'var(--font-sans)' }}>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(253,252,248,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E7E0D5' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">🌊</span>
          <span className="font-display font-semibold text-[#1C1917] text-lg tracking-tight">Polyglot Islands</span>
        </div>
        <Link href="/dashboard"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md hover:scale-[1.03] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg,#C85A3A,#A84830)', boxShadow: '0 2px 8px rgba(200,90,58,0.28)' }}>
          Open App
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24 md:pt-28 md:pb-32 max-w-6xl mx-auto">
        {/* Soft ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 55% at 65% 45%, rgba(200,90,58,0.07), transparent)',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 50% 40% at 20% 70%, rgba(217,119,6,0.05), transparent)',
        }} />

        <div className="relative grid md:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A',
                animation: 'fadeUp 0.6s ease both', animationDelay: '0ms' }}>
              🇪🇸 Learn Real Conversational Spanish
            </div>

            <h1 className="font-display font-bold text-[#1C1917] leading-[1.1] mb-5"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
                animation: 'fadeUp 0.7s ease both', animationDelay: '100ms' }}>
              Spanish that sticks,<br />
              <span style={{ color: '#C85A3A' }}>island by island.</span>
            </h1>

            <p className="text-[#78716C] leading-relaxed mb-8 max-w-md"
              style={{ fontSize: '1.05rem', animation: 'fadeUp 0.7s ease both', animationDelay: '200ms' }}>
              Drill real dialogue from 15 themed islands — greetings, restaurants, emergencies, and more.
              A smart spaced-repetition engine shows each card exactly when you're about to forget it.
            </p>

            <div className="flex flex-wrap gap-3"
              style={{ animation: 'fadeUp 0.7s ease both', animationDelay: '300ms' }}>
              <Link href="/dashboard"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#C85A3A,#A84830)', boxShadow: '0 4px 20px rgba(200,90,58,0.35)' }}>
                Open App
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="#how-it-works"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:shadow-md hover:border-[#D0C5B8]"
                style={{ border: '1.5px solid #E7E0D5', color: '#44403C', background: '#FFFFFF' }}>
                How it works
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right — floating demo cards */}
          <div className="relative hidden md:flex justify-center items-center"
            style={{ height: 380, animation: 'fadeIn 1s ease both', animationDelay: '400ms' }}>
            <DemoCard
              es="¿Cenamos esta noche fuera?"
              en="Shall we eat out tonight?"
              animStyle={{ position: 'absolute', top: 20, left: 10, zIndex: 10,
                animation: 'floatA 5s ease-in-out infinite', animationDelay: '0ms' }}
            />
            <DemoCard
              es="Necesito ver al médico cuanto antes."
              en="I need to see a doctor as soon as possible."
              animStyle={{ position: 'absolute', top: 110, left: 80, zIndex: 20,
                animation: 'floatB 4.5s ease-in-out infinite', animationDelay: '0.8s' }}
            />
            <DemoCard
              es="¿Me puede traer la cuenta, por favor?"
              en="Could you bring me the bill, please?"
              animStyle={{ position: 'absolute', top: 215, left: 30, zIndex: 15,
                animation: 'floatC 5.5s ease-in-out infinite', animationDelay: '0.4s' }}
            />
            {/* Subtle background blob */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
              background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(200,90,58,0.06), transparent)',
            }} />
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <FadeIn>
        <div className="border-y py-10" style={{ borderColor: '#E7E0D5', background: '#FFFFFF' }}>
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '319', label: 'Sentence pairs', color: '#C85A3A' },
              { value: '16',  label: 'Learning islands', color: '#D97706' },
              { value: '4 K+', label: 'Vocabulary entries', color: '#7C3AED' },
              { value: 'SM-2', label: 'Spaced repetition', color: '#0D9488' },
            ].map(({ value, label, color }, i) => (
              <div key={label} className="text-center" style={{ animation: `countUp 0.5s ease both ${i * 80}ms` }}>
                <div className="font-display font-bold text-3xl mb-1" style={{ color }}>{value}</div>
                <div className="text-xs text-[#78716C] font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-3xl mx-auto px-6 py-24">
        <FadeIn>
          <div className="text-center mb-14">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#C85A3A] mb-3">The method</div>
            <h2 className="font-display font-bold text-[#1C1917] text-3xl md:text-4xl mb-4">How it works</h2>
            <p className="text-[#78716C] text-base max-w-md mx-auto">Three steps. No grammar drills. No vocab lists. Just real sentences, reviewed at the right moment.</p>
          </div>
        </FadeIn>
        <div className="flex flex-col gap-4">
          <FadeIn delay={0}>
            <Step n={1} icon="📖"
              title="Explore an island"
              body="Each of the 16 islands maps to a real-life situation — restaurants, the doctor, the phone. Open an island and browse its sentence bank drawn from authentic Colloquial Spanish dialogue." />
          </FadeIn>
          <FadeIn delay={100}>
            <Step n={2} icon="✏️"
              title="Add your own sentences"
              body="Type anything in English — one sentence per line — and hit Translate. The AI renders natural, Iberian Spanish. Review the pairs, edit if needed, then save them to any island." />
          </FadeIn>
          <FadeIn delay={200}>
            <Step n={3} icon="🧠"
              title="Review with spaced repetition"
              body="The SM-2 algorithm schedules each card just before you're about to forget it. Grade yourself — Again, Hard, Good, or Easy — and the interval adjusts automatically. Sentences eventually graduate to Mastered." />
          </FadeIn>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E7E0D5', borderBottom: '1px solid #E7E0D5' }}
        className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-14">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#D97706] mb-3">Your toolkit</div>
              <h2 className="font-display font-bold text-[#1C1917] text-3xl md:text-4xl">Everything you need</h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '✏️', label: 'Add Sentences',    color: '#C85A3A',
                body: 'Type or speak in English. The AI translates to natural, Iberian Spanish instantly.' },
              { icon: '🔁', label: 'Spaced Review',    color: '#D97706',
                body: 'SM-2 algorithm surfaces cards exactly when you need them. Efficient and science-backed.' },
              { icon: '🎧', label: 'Listen & Shadow',  color: '#0D9488',
                body: 'Stream sentences aloud with native TTS. Filter by island and shadow the pronunciation.' },
              { icon: '🔍', label: 'Pre-Input Vocab',  color: '#7C3AED',
                body: 'Paste any Spanish text. AI extracts the 15 most important words before you read.' },
            ].map(({ icon, label, body, color }, i) => (
              <FadeIn key={label} delay={i * 80}>
                <Feature icon={icon} label={label} body={body} color={color} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Using the app — step by step ─────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <FadeIn>
          <div className="text-center mb-14">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#7C3AED] mb-3">Step-by-step</div>
            <h2 className="font-display font-bold text-[#1C1917] text-3xl md:text-4xl mb-4">Using the app</h2>
            <p className="text-[#78716C] text-base max-w-md mx-auto">Start reviewing in under a minute. Here's exactly what to do.</p>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { step: '01', icon: '🏠', title: 'Open the Dashboard',
              body: 'The dashboard shows how many sentences are due today, your mastery stats, and quick links to every feature.' },
            { step: '02', icon: '✏️', title: 'Add sentences',
              body: 'Hit "Add Sentences". Type English lines, one per line. Click Translate → review the Spanish → Save to an island.' },
            { step: '03', icon: '🔁', title: 'Start a review session',
              body: 'Hit "Review" from the dashboard. Flip each card, read the Spanish, then grade yourself — Again / Hard / Good / Easy.' },
            { step: '04', icon: '📊', title: 'Track your progress',
              body: 'Each island shows a mastery bar. When a sentence reaches "Easy" three times in a row it graduates to Mastered.' },
          ].map(({ step, icon, title, body }, i) => (
            <FadeIn key={step} delay={i * 90}>
              <div className="card p-6 group hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 font-display font-bold text-3xl leading-none"
                    style={{ color: '#E7E0D5' }}>{step}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{icon}</span>
                      <h3 className="font-semibold text-[#1C1917] text-sm">{title}</h3>
                    </div>
                    <p className="text-xs text-[#78716C] leading-relaxed">{body}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Islands preview ──────────────────────────────────────── */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E7E0D5', borderBottom: '1px solid #E7E0D5' }}
        className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#0D9488] mb-3">16 islands</div>
              <h2 className="font-display font-bold text-[#1C1917] text-3xl md:text-4xl">Every situation covered</h2>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {ISLANDS.map(({ e, n }, i) => (
                <div key={n}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-all hover:shadow-sm hover:-translate-y-0.5 cursor-default"
                  style={{
                    background: '#FDFCF8',
                    borderColor: '#E7E0D5',
                    color: '#44403C',
                    animation: `fadeUp 0.5s ease both ${i * 35}ms`,
                  }}>
                  <span>{e}</span>
                  <span>{n}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <section className="px-6 py-28 text-center">
        <FadeIn>
          <div className="max-w-xl mx-auto">
            <div className="text-5xl mb-6">🌊</div>
            <h2 className="font-display font-bold text-[#1C1917] text-3xl md:text-4xl mb-4">
              Ready to start speaking?
            </h2>
            <p className="text-[#78716C] text-base mb-10">
              319 sentence pairs. 16 islands. All you need to sound natural in Spanish.
            </p>
            <Link href="/dashboard"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:shadow-2xl hover:scale-[1.04] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#C85A3A,#A84830)', boxShadow: '0 6px 28px rgba(200,90,58,0.40)' }}>
              Open your dashboard
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t py-8 px-6" style={{ borderColor: '#E7E0D5' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-[#78716C]">
            <span>🌊</span>
            <span className="font-display font-semibold text-[#1C1917]">Polyglot Islands</span>
            <span>· Personal Spanish learning</span>
          </div>
          <Link href="/dashboard"
            className="text-sm font-semibold text-[#C85A3A] hover:text-[#A84830] transition-colors">
            Open App →
          </Link>
        </div>
      </footer>

    </div>
  );
}
