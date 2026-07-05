import { useLayoutEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import styles from './Chapter1Initialize.module.css';

/* ============================================================
   TYPES
   ============================================================ */

interface StarDef {
  id: number;
  top: string;
  left: string;
  size: number;
  opacity: number;
}

interface FragmentDef {
  id: number;
  label: string;
  left: string;
  bottom: string;
  dur: string;
  delay: string;
  drift: string;
}

/* ============================================================
   STATIC DATA — generated once at module level so the
   component re-renders don't reshuffle positions
   ============================================================ */

/** Seeded pseudo-random: keeps positions stable across HMR. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = seeded(0x4f2a91);

const STARS: StarDef[] = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  top: `${(rng() * 90).toFixed(2)}%`,
  left: `${(rng() * 100).toFixed(2)}%`,
  size: parseFloat((0.8 + rng() * 1.8).toFixed(2)),
  opacity: parseFloat((0.25 + rng() * 0.55).toFixed(2)),
}));

const FRAGMENTS: FragmentDef[] = [
  { id: 0, label: '0x4F2A',   left: '22%',  bottom: '52%', dur: '7s',  delay: '0s',    drift: '10px'  },
  { id: 1, label: 'SYN_ACK',  left: '68%',  bottom: '48%', dur: '8.5s',delay: '1.3s',  drift: '-12px' },
  { id: 2, label: 'PKT::FF01',left: '38%',  bottom: '60%', dur: '6.5s',delay: '2.8s',  drift: '6px'   },
];

/* ============================================================
   TERMINAL TEXT — types out line by line
   ============================================================ */

const TERMINAL_LINES = [
  'SYSTEM STATUS',
  'ONLINE',
  'INITIALIZING COSMOS...',
];

/* ============================================================
   COMPONENT
   ============================================================ */

export default function Chapter1Initialize() {
  /* ---- Refs ---- */
  const sectionRef    = useRef<HTMLElement>(null);
  const terminalRef   = useRef<HTMLDivElement>(null);
  const terminalLines = useRef<(HTMLSpanElement | null)[]>([]);
  const cursorRef     = useRef<HTMLSpanElement>(null);
  const heroRef       = useRef<HTMLDivElement>(null);
  const missionRef    = useRef<HTMLDivElement>(null);
  const characterRef  = useRef<HTMLDivElement>(null);
  const fragmentsRef  = useRef<HTMLDivElement>(null);


  /* ---- Ref-callback for per-line spans ---- */
  const setLineRef = useCallback(
    (i: number) => (el: HTMLSpanElement | null) => {
      terminalLines.current[i] = el;
    },
    []
  );

  /* ============================================================
     ANIMATION SETUP
     ============================================================ */

  useLayoutEffect(() => {
    const section    = sectionRef.current;
    const terminal   = terminalRef.current;
    const hero       = heroRef.current;
    const mission    = missionRef.current;
    const character  = characterRef.current;
    const fragments  = fragmentsRef.current;

    if (!section || !terminal || !hero || !mission || !character || !fragments) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ----------------------------------------------------------
       REDUCED MOTION — skip all delays; show final composed state
       immediately. CSS media query already handles opacity/transform
       resets; we just ensure the terminal is hidden.
       ---------------------------------------------------------- */
    if (prefersReduced) {
      // Terminal type-out skipped — hide it, rest already visible via CSS
      gsap.set(terminal, { opacity: 0, display: 'none' });
      // Code fragments: static low opacity (CSS handles via media query)
      return;
    }

    /* ----------------------------------------------------------
       FULL MOTION — orchestrated GSAP sequence
       ---------------------------------------------------------- */

    const ctx = gsap.context(() => {

      // --- Initial state ---
      // hero, mission, character start at opacity:0 (CSS sets this).
      // Cursor starts blinking immediately.
      gsap.set(terminal, { opacity: 1 });
      gsap.set(hero,      { opacity: 0, y: 20 });
      gsap.set(mission,   { opacity: 0, y: 10 });
      gsap.set(character, { opacity: 0 });

      // Clear line text before typing starts
      terminalLines.current.forEach((el) => {
        if (el) el.textContent = '';
      });

      /* ---- Step 1: ~400ms initial void pause ---- */
      const masterTl = gsap.timeline({ delay: 0.4 });

      /* ---- Step 2: Type each terminal line ---- */
      TERMINAL_LINES.forEach((line, lineIdx) => {
        const lineEl = terminalLines.current[lineIdx];
        if (!lineEl) return;

        // Stagger each character in
        const chars = line.split('');
        let charDelay = 0;
        const lineStart = lineIdx * 0.9; // offset between lines

        chars.forEach((char, _charIdx) => {
          masterTl.call(
            () => {
              if (lineEl) lineEl.textContent += char;
            },
            undefined,
            lineStart + charDelay
          );
          charDelay += char === ' ' ? 0.055 : 0.062;
        });
      });

      /* ---- Hold ~800ms after typing completes ---- */
      const typingDuration = TERMINAL_LINES.reduce((acc) => acc + 0.9, 0) + 0.8;

      /* ---- Fade out terminal (600ms) ---- */
      masterTl.to(
        terminal,
        { opacity: 0, duration: 0.6, ease: 'power2.inOut' },
        typingDuration
      );

      /* ---- Step 3: Name fades + slides up (900ms) ---- */
      masterTl.to(
        hero,
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'var(--ease-cosmic, cubic-bezier(0.16, 1, 0.3, 1))',
        },
        typingDuration + 0.3  // slight overlap with terminal fade-out
      );

      /* ---- Step 4: Mission label fades in (200ms after name) ---- */
      masterTl.to(
        mission,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
        },
        `>+0.2`  // 200ms after previous tween ends
      );

      /* ---- Step 5: Character fades in last ---- */
      masterTl.to(
        character,
        {
          opacity: 1,
          duration: 0.9,
          ease: 'power2.out',
        },
        `>+0.1`
      );

      /* ---- Code fragments: stagger-in after character appears ---- */
      masterTl.fromTo(
        Array.from(fragments.children),
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          stagger: 0.15,
          ease: 'power2.out',
          // CSS animation takes over from here (floatFragment keyframe)
          onComplete() {
            Array.from(fragments.children).forEach((child) => {
              (child as HTMLElement).style.opacity = '';  // let CSS keyframe control
            });
          },
        },
        `>+0.2`
      );
    }, section);

    return () => ctx.revert();
  }, []);

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Chapter 1: Initialize Protocol"
      data-chapter="1"
    >
      {/* ── Starfield ── */}
      <div className={styles.stars} aria-hidden="true">
        {STARS.map((star) => (
          <span
            key={star.id}
            className={styles.star}
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      {/* ── Distant butterfly galaxy (placeholder radial-gradient) ── */}
      {/*  Swap className to styles.galaxyImg and add src once the  */}
      {/*  real asset src/assets/planets/galaxy-butterfly.png exists */}
      <div className={styles.galaxy} aria-hidden="true" />

      {/* ── Terminal type-out ── */}
      <div
        ref={terminalRef}
        className={styles.terminal}
        aria-live="polite"
        aria-label="System initializing"
      >
        {TERMINAL_LINES.map((_, i) => (
          <span
            key={i}
            ref={setLineRef(i)}
            className={styles.terminalLine}
          />
        ))}
        <span ref={cursorRef} className={styles.terminalCursor} aria-hidden="true" />
      </div>

      {/* ── Hero: Name ── */}
      <div ref={heroRef} className={styles.hero}>
        <h1 className={styles.name}>Arjun</h1>
      </div>

      {/* ── Mission label + scroll hint ── */}
      <div ref={missionRef} className={styles.missionWrap}>
        <p className={styles.missionLabel}>Initialize Mission</p>
        <p className={styles.missionSub}>Scroll to Begin</p>
        <div className={styles.chevron} aria-hidden="true">
          &#8964; {/* ⌄ downward chevron */}
        </div>
      </div>

      {/* ── Engineer character (placeholder silhouette) ── */}
      {/*  Replace .characterPlaceholder with <img> once            */}
      {/*  src/assets/characters/engineer.png is available.         */}
      <div ref={characterRef} className={styles.character} aria-hidden="true">
        <div className={styles.characterPlaceholder} />
      </div>

      {/* ── Floating code fragments ── */}
      <div
        ref={fragmentsRef}
        className={styles.codeFragments}
        aria-hidden="true"
      >
        {FRAGMENTS.map((frag) => (
          <span
            key={frag.id}
            className={styles.codeFragment}
            style={{
              left: frag.left,
              bottom: frag.bottom,
              '--dur':   frag.dur,
              '--delay': frag.delay,
              '--drift': frag.drift,
            } as React.CSSProperties}
          >
            {frag.label}
          </span>
        ))}
      </div>

      {/* ── Foreground cloud layer (placeholder gradient) ── */}
      {/*  Replace .cloudPlaceholder with real cloud PNGs once       */}
      {/*  src/assets/clouds/* assets are available.                 */}
      <div className={styles.clouds} aria-hidden="true">
        <div className={styles.cloudPlaceholder} />
      </div>
    </section>
  );
}
