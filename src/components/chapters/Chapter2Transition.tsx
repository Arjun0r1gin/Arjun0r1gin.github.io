/**
 * Chapter 2: Transition Protocol
 *
 * A scroll-scrubbed, pinned 250vh sequence that transitions the universe
 * from deep-space black → full whiteout → word convergence → merge phrase
 * → black hand-off to Chapter 3.
 *
 * Timeline map (scrollTrigger scrub: 1, end: "+=250%", total = 1.0):
 *
 *  0.00 – 0.20   Stage 1  clouds ramp up, stars fade out
 *  0.20 – 0.45   Stage 2  whiteout hold (background → white)
 *                         Ambient cloud drift starts (not scroll-tied)
 *  0.45 – 0.75   Stage 3  words converge, terminal types
 *  0.75 – 1.00   Stage 4  words out, merged phrase in, fade to black
 *
 * Import pattern specified by the project: `../../lib/scroll`
 */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from '../../lib/scroll';
// ScrollTrigger is registered inside ../../lib/scroll; the plugin is
// consumed via gsap.timeline({ scrollTrigger: {...} }) — no direct ref needed.
import { useAnimationReady } from '../../animations/hooks/useAnimationReady';
import { useReducedMotion } from '../../animations/hooks/useReducedMotion';
import TerminalText from '../common/TerminalText';
import styles from './Chapter2Transition.module.css';

/* ────────────────────────────────────────────────────────────
   CONSTANTS
──────────────────────────────────────────────────────────── */

// Total timeline duration in "GSAP units" (maps to 250vh of scroll)
const T = 12; // arbitrary units; scroll maps 0 → T

// Stage boundaries in 0-1 progress, scaled to T
const S1_START = 0.00 * T;
const S1_END   = 0.20 * T;
const S2_START = S1_END;
const S2_END   = 0.45 * T;
const S3_START = S2_END;
const S3_END   = 0.75 * T;
const S4_START = S3_END;
// S4 ends at T (1.0)

const TERMINAL_LINES = [
  'Synchronizing...',
  'Connection Established...',
  'Decrypting...',
];

const WORDS = ['Wonder', 'Expansion', 'Depth'];

/* ────────────────────────────────────────────────────────────
   COMPONENT
──────────────────────────────────────────────────────────── */

export default function Chapter2Transition() {
  const sectionRef    = useRef<HTMLElement>(null);
  const cloudFarRef   = useRef<HTMLDivElement>(null);
  const cloudMidRef   = useRef<HTMLDivElement>(null);
  const cloudNearRef  = useRef<HTMLDivElement>(null);
  const terminalRef   = useRef<HTMLDivElement>(null);
  const wordsRef      = useRef<HTMLDivElement>(null);
  const wordRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const mergedRef     = useRef<HTMLDivElement>(null);

  // Ambient drift tweens stored so we can kill them on cleanup
  const driftTweens   = useRef<gsap.core.Tween[]>([]);

  const isReady        = useAnimationReady();
  const prefersReduced = useReducedMotion();

  /* ============================================================
     REDUCED MOTION PATH
     No pin, no scrub — simple IntersectionObserver fade-in for
     each stage element.
  ============================================================ */
  useEffect(() => {
    if (!prefersReduced) return;

    const section = sectionRef.current;
    if (!section) return;

    // Show cloud layers at rest opacity
    [cloudFarRef, cloudMidRef, cloudNearRef].forEach((r) => {
      if (r.current) gsap.set(r.current, { opacity: 0.25 });
    });

    // Scroll-reveal words with a simple fade
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          if (wordsRef.current) gsap.to(wordsRef.current, { opacity: 1, duration: 0.8, ease: 'power2.out' });
          if (terminalRef.current) gsap.to(terminalRef.current, { opacity: 1, duration: 0.8, ease: 'power2.out' });
        }
      },
      { threshold: 0.3 }
    );
    io.observe(section);

    return () => io.disconnect();
  }, [prefersReduced]);

  /* ============================================================
     FULL MOTION PATH — pinned scrub timeline
  ============================================================ */
  useLayoutEffect(() => {
    if (!isReady || prefersReduced) return;

    const section   = sectionRef.current;
    const cloudFar  = cloudFarRef.current;
    const cloudMid  = cloudMidRef.current;
    const cloudNear = cloudNearRef.current;
    const words     = wordsRef.current;
    const merged    = mergedRef.current;
    const terminal  = terminalRef.current;

    if (!section || !cloudFar || !cloudMid || !cloudNear || !words || !merged || !terminal) return;

    /* ── Initial GSAP state ──────────────────────────────── */
    gsap.set([cloudFar, cloudMid, cloudNear], { opacity: 0 });
    gsap.set(words, { opacity: 0 });
    gsap.set(terminal, { opacity: 0 });
    gsap.set(merged, { opacity: 0 });

    // Word slots: start off-screen in their approach directions
    if (wordRefs.current[0]) gsap.set(wordRefs.current[0], { x: '-120%', opacity: 0 }); // slot 1 from left
    if (wordRefs.current[1]) gsap.set(wordRefs.current[1], { y: '-80px',  opacity: 0 }); // slot 2 from top
    if (wordRefs.current[2]) gsap.set(wordRefs.current[2], { x:  '120%', opacity: 0 }); // slot 3 from right

    /* ── Master scrubbed timeline ────────────────────────── */
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: '+=250%',
          // Hint compositor while pinned
          onToggle: (self) => {
            const clouds = [cloudFar, cloudMid, cloudNear];
            clouds.forEach((el) => {
              el.style.willChange = self.isActive ? 'transform, opacity' : 'auto';
            });
          },
        },
      });

      /* ── Stage 1 (0 → 20%): clouds up, stars fade ─────── */
      tl.to(cloudFar,  { opacity: 0.6, duration: S1_END - S1_START, ease: 'none' }, S1_START);
      tl.to(cloudMid,  { opacity: 0.7, duration: S1_END - S1_START, ease: 'none' }, S1_START);
      tl.to(cloudNear, { opacity: 0.85,duration: S1_END - S1_START, ease: 'none' }, S1_START);

      /* Background ramps from black toward white */
      tl.to(section, { backgroundColor: '#ffffff', duration: S2_END - S1_START, ease: 'none' }, S1_START);

      /* ── Stage 2 (20 → 45%): whiteout hold ─────────────── */
      // Clouds are already at their peak opacity — hold is implicit.
      // Ambient drift kicks off as a non-scrubbed callback at 20% mark.
      tl.call(() => {
        const drift = (el: HTMLDivElement, xRange: number, dur: number) =>
          gsap.to(el, {
            x: xRange,
            duration: dur,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            overwrite: 'auto',
          });

        driftTweens.current = [
          drift(cloudFar,  18, 14),
          drift(cloudMid, -24, 11),
          drift(cloudNear, 30,  9),
        ];
      }, undefined, S2_START);

      /* ── Stage 3 (45 → 75%): words converge, terminal ─── */
      // Reveal the words container
      tl.to(words, { opacity: 1, duration: 0.5, ease: 'none' }, S3_START);
      // Reveal terminal overlay
      tl.to(terminal, { opacity: 1, duration: 0.5, ease: 'none' }, S3_START);

      // Word slot convergence (each on its own offset within stage 3)
      const S3_DUR = S3_END - S3_START;
      if (wordRefs.current[0]) {
        tl.to(wordRefs.current[0], { x: 0, opacity: 1, duration: S3_DUR * 0.45, ease: 'power3.out' }, S3_START);
      }
      if (wordRefs.current[1]) {
        tl.to(wordRefs.current[1], { y: 0, opacity: 1, duration: S3_DUR * 0.45, ease: 'power3.out' }, S3_START + S3_DUR * 0.15);
      }
      if (wordRefs.current[2]) {
        tl.to(wordRefs.current[2], { x: 0, opacity: 1, duration: S3_DUR * 0.45, ease: 'power3.out' }, S3_START + S3_DUR * 0.30);
      }

      /* ── Stage 4 (75 → 100%): merge + black hand-off ─── */
      const S4_DUR = T - S4_START;

      // Words fade out
      tl.to(words,    { opacity: 0, duration: S4_DUR * 0.30, ease: 'none' }, S4_START);
      tl.to(terminal, { opacity: 0, duration: S4_DUR * 0.30, ease: 'none' }, S4_START);

      // Merged phrase fades in, then holds
      tl.to(merged, { opacity: 1, duration: S4_DUR * 0.35, ease: 'power2.out' }, S4_START + S4_DUR * 0.20);
      // Brief hold then fade out
      tl.to(merged, { opacity: 0, duration: S4_DUR * 0.25, ease: 'none' }, S4_START + S4_DUR * 0.65);

      // Final fade to black — section bg back to void
      tl.to(section, { backgroundColor: 'var(--void-0, #030308)', duration: S4_DUR * 0.30, ease: 'none' }, S4_START + S4_DUR * 0.70);
    }, section);

    return () => {
      driftTweens.current.forEach((t) => t.kill());
      driftTweens.current = [];
      ctx.revert();
    };
  }, [isReady, prefersReduced]);

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Chapter 2: Transition Protocol"
      data-chapter="2"
    >
      {/* ── Cloud layers (near/mid/far) — data-layer attributes
           match the spec for future asset swap ──────────── */}
      <div
        ref={cloudFarRef}
        data-layer="clouds-far"
        className={`${styles.cloudLayer} ${styles.cloudFar}`}
        aria-hidden="true"
      />
      <div
        ref={cloudMidRef}
        data-layer="clouds-mid"
        className={`${styles.cloudLayer} ${styles.cloudMid}`}
        aria-hidden="true"
      />
      <div
        ref={cloudNearRef}
        data-layer="clouds-near"
        className={`${styles.cloudLayer} ${styles.cloudNear}`}
        aria-hidden="true"
      />

      {/* ── Stage content ──────────────────────────────────── */}
      <div className={styles.stage}>
        {/* Stage 3: TerminalText (dark text on white bg) */}
        <div ref={terminalRef} className={styles.terminal} aria-live="polite">
          {/* Only mount TerminalText when this div is visible to avoid
              typing before the stage is reached.  GSAP opacity controls
              visibility; TerminalText types immediately on mount. */}
          <TerminalText
            lines={TERMINAL_LINES}
            charDelay={60}
            lineDelay={500}
            style={{
              color: '#0b0e1c',        // dark text on white whiteout bg
              letterSpacing: '3px',
              fontSize: 'clamp(10px, 1.2vw, 13px)',
            }}
          />
        </div>

        {/* Stage 3: Three converging word slots */}
        <div ref={wordsRef} className={styles.words} aria-label="Transition words">
          {WORDS.map((word, i) => (
            <div
              key={word}
              ref={(el) => { wordRefs.current[i] = el; }}
              className={styles.wordSlot}
              data-word-slot={String(i + 1)}
              aria-hidden="true"   /* decorative — meaning conveyed by merged phrase */
            >
              {word}
            </div>
          ))}
        </div>

        {/* Stage 4: Merged phrase */}
        <div ref={mergedRef} className={styles.mergedPhrase} aria-label="Curiosity Meets Reality">
          Curiosity Meets Reality
        </div>
      </div>
    </section>
  );
}
