import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../animations/hooks/useReducedMotion';
import { useAnimationReady } from '../../animations/hooks/useAnimationReady';

gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────────────────────────────────
   TerminalText message: types out line-by-line when scrolled
   into view. This is the only moving element in the section.
──────────────────────────────────────────────────────────── */
const LINES = [
  'ENCRYPTED TRANSMISSION INITIATED',
  'RECIPIENT: COMMAND_UNKNOWN',
  'AWAITING SIGNAL...',
];

export default function Chapter7Transmission() {
  const sectionRef  = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const lineRefs    = useRef<(HTMLSpanElement | null)[]>([]);
  const isReady       = useAnimationReady();
  const prefersReduced = useReducedMotion();

  useLayoutEffect(() => {
    if (!isReady) return;

    const section  = sectionRef.current;
    const terminal = terminalRef.current;
    if (!section || !terminal) return;

    /* ── Reduced motion: show lines immediately, skip typing ── */
    if (prefersReduced) {
      lineRefs.current.forEach((el, i) => {
        if (el) el.textContent = LINES[i];
      });
      gsap.set(terminal, { opacity: 1 });
      return;
    }

    /* ── Clear line text before the trigger fires ── */
    lineRefs.current.forEach((el) => { if (el) el.textContent = ''; });
    gsap.set(terminal, { opacity: 0 });

    /*
     * ScrollTrigger: once: true, fires when section top crosses 60% vh.
     * On enter, fade the terminal container in then type each line.
     */
    const tl = gsap.timeline({ paused: true });

    /* Fade in the terminal block */
    tl.to(terminal, { opacity: 1, duration: 0.6, ease: 'power2.out' });

    /* Type each line character by character */
    let cursor = '>+=0.1'; // start after fade-in gap
    LINES.forEach((line, lineIdx) => {
      const el = lineRefs.current[lineIdx];
      if (!el) return;

      line.split('').forEach((char) => {
        tl.call(() => { el.textContent += char; }, undefined, cursor);
        cursor = `>+=${char === ' ' ? 0.05 : 0.055}`;
      });

      /* Pause between lines */
      cursor = `>+=0.55`;
    });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      once: true,
      onEnter: () => tl.play(),
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === section)
        .forEach((st) => st.kill());
    };
  }, [isReady, prefersReduced]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: 'var(--void-0, #030308)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="Chapter 7: Encrypted Transmission"
      data-chapter="7"
    >
      {/*
       * Single distant galaxy — intentionally very faint.
       * data-layer attr preserved for future asset swap.
       * Replace this div with <img> once galaxy-butterfly.png
       * exists at src/assets/planets/galaxy-butterfly.png.
       */}
      <div
        data-layer="single-distant-galaxy"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '18%',
          right: '14%',
          width: '280px',
          height: '160px',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse 60% 45% at 50% 50%, rgba(143,216,210,0.09) 0%, transparent 70%)',
          opacity: 0.15,
          pointerEvents: 'none',
        }}
      />

      {/* TerminalText block — typed on scroll */}
      <div
        ref={terminalRef}
        role="status"
        aria-live="polite"
        aria-label="Encrypted transmission message"
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          opacity: 0,                     /* GSAP reveals on scroll */
          pointerEvents: 'none',
        }}
      >
        {LINES.map((_, i) => (
          <span
            key={i}
            ref={(el) => { lineRefs.current[i] = el; }}
            style={{
              display: 'block',
              fontFamily: 'var(--font-terminal, ui-monospace, "Courier New", monospace)',
              fontSize: 'clamp(11px, 1.3vw, 15px)',
              letterSpacing: '3px',
              color: 'var(--signal-teal, #8fd8d2)',
              textTransform: 'uppercase',
              lineHeight: '2.2',
              whiteSpace: 'pre',
            }}
          />
        ))}
      </div>
    </section>
  );
}
