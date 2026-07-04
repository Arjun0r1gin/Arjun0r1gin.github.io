import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Chapter4Assembly.module.css';

import coreEngine from '../../assets/rocket/core-engine.png';
import fuelMatrix from '../../assets/rocket/fuel-matrix.png';
import structuralFrame from '../../assets/rocket/structural-frame.png';
import navigationUnit from '../../assets/rocket/navigation-unit.png';
import payloadModule from '../../assets/rocket/payload-module.png';
import aerodynamicShell from '../../assets/rocket/aerodynamic-shell.png';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Part manifest.                                                      */
/* `top`/`width` define the FINAL locked slot inside the 260x560       */
/* rocket group (stack order: shell / nav / payload / fuel / engine,   */
/* frame wraps the lower stages). `fromX`/`fromY` are viewport-        */
/* relative scatter offsets — alternating directions so convergence    */
/* reads as coming from all sides.                                     */
/* ------------------------------------------------------------------ */
interface PartDef {
  id: string;
  src: string;
  alt: string;
  top: number;
  width: number;
  z: number;
  fromX: number; // fraction of viewport width
  fromY: number; // fraction of viewport height
}

const PARTS: PartDef[] = [
  { id: 'core-engine',       src: coreEngine,       alt: 'Core engine',       top: 400, width: 170, z: 3, fromX: -0.7, fromY:  0.10 }, // from LEFT
  { id: 'fuel-matrix',       src: fuelMatrix,       alt: 'Fuel matrix',       top: 285, width: 165, z: 3, fromX:  0.7, fromY: -0.08 }, // from RIGHT
  { id: 'structural-frame',  src: structuralFrame,  alt: 'Structural frame',  top: 265, width: 225, z: 4, fromX:  0.0, fromY: -0.90 }, // from TOP
  { id: 'navigation-unit',   src: navigationUnit,   alt: 'Navigation unit',   top: 115, width: 150, z: 3, fromX:  0.0, fromY:  0.90 }, // from BOTTOM
  { id: 'payload-module',    src: payloadModule,    alt: 'Payload module',    top: 195, width: 158, z: 3, fromX: -0.7, fromY: -0.12 }, // from LEFT
  { id: 'aerodynamic-shell', src: aerodynamicShell, alt: 'Aerodynamic shell', top: -15, width: 145, z: 5, fromX:  0.7, fromY:  0.06 }, // from RIGHT
];

const PARTICLE_COUNT = 10;
const TEAL = 'var(--signal-teal, #8fd8d2)';
const EMBER = 'var(--ember, #e8a24c)';

/* ------------------------------------------------------------------ */
/* Timeline map (in timeline "seconds", scrub-driven so these are      */
/* proportions, not real time). Assembly spans 0–10 which maps to      */
/* the spec'd 300% of scroll; the finale holds the pin for 10–12,      */
/* i.e. an extra 20% of scroll (total end = "+=360%").                 */
/*                                                                     */
/*   0.0 – 1.5   core-engine converges        readout   0 → 12        */
/*   1.5 – 3.5   fuel-matrix converges        readout  12 → 34        */
/*   3.5 – 5.5   structural-frame converges   readout  34 → 57        */
/*   5.5 – 7.5   nav-unit + payload converge  readout  57 → 81        */
/*   7.5 – 10.0  aerodynamic-shell converges  readout  81 → 100       */
/*  10.0 – 12.0  finale: glow, particles, vibration, text, exit       */
/* ------------------------------------------------------------------ */
const T_TOTAL = 12;
const T_FINALE = 10;
const SEGMENTS: Array<{ parts: string[]; start: number; end: number; from: number; to: number }> = [
  { parts: ['core-engine'],                        start: 0.0, end: 1.5,  from: 0,  to: 12 },
  { parts: ['fuel-matrix'],                        start: 1.5, end: 3.5,  from: 12, to: 34 },
  { parts: ['structural-frame'],                   start: 3.5, end: 5.5,  from: 34, to: 57 },
  { parts: ['navigation-unit', 'payload-module'],  start: 5.5, end: 7.5,  from: 57, to: 81 },
  { parts: ['aerodynamic-shell'],                  start: 7.5, end: 10.0, from: 81, to: 100 },
];

export default function Chapter4Assembly() {
  const sectionRef = useRef<HTMLElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);      // outer group: scrubbed exit transform + glow filter
  const rocketInnerRef = useRef<HTMLDivElement>(null); // inner group: transient vibration jitter only
  const readoutRef = useRef<HTMLSpanElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const partRefs = useRef<Record<string, HTMLImageElement | null>>({});

  // Reduced-motion finale stage: 0 = idle, 1 = SYSTEM READY, 2 = LAUNCH AUTHORIZED
  const [rmActive, setRmActive] = useState(false);
  const [rmStage, setRmStage] = useState(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const rocket = rocketRef.current;
    const inner = rocketInnerRef.current;
    if (!section || !rocket || !inner) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* -------------------------------------------------------------- */
    /* REDUCED MOTION: no pin, no scrub. Parts render pre-assembled    */
    /* (their default CSS positions ARE the locked positions). A       */
    /* one-shot IntersectionObserver triggers a CSS-transition finale. */
    /* -------------------------------------------------------------- */
    if (prefersReduced) {
      setRmActive(true);
      let t1: ReturnType<typeof setTimeout> | undefined;
      let t2: ReturnType<typeof setTimeout> | undefined;
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            // Glow + particles fade in via CSS transitions, then text swaps.
            setRmStage(1);
            t1 = setTimeout(() => setRmStage(2), 1200);
          }
        },
        { threshold: 0.5 }
      );
      io.observe(section);
      return () => {
        io.disconnect();
        if (t1) clearTimeout(t1);
        if (t2) clearTimeout(t2);
      };
    }

    /* -------------------------------------------------------------- */
    /* FULL MOTION: one pinned, scrubbed master timeline.              */
    /* -------------------------------------------------------------- */
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const parts = PARTS.map((p) => partRefs.current[p.id]).filter(Boolean) as HTMLImageElement[];

    // Live readout driven by a plain object mutated by GSAP (no React
    // re-renders per frame — we write straight to the DOM text node).
    const counter = { val: 0 };

    const ctx = gsap.context(() => {
      // Scatter all parts off-screen at low opacity before first paint.
      // xPercent:-50 centers each part on its slot; x/y are the scatter offsets.
      PARTS.forEach((p) => {
        const el = partRefs.current[p.id];
        if (!el) return;
        gsap.set(el, {
          xPercent: -50,
          x: p.fromX * vw,
          y: p.fromY * vh,
          opacity: 0.4,
          scale: 0.85,
        });
      });

      const tl = gsap.timeline({
        defaults: { ease: 'power4.out' }, // GSAP equivalent of cubic-bezier(0.16,1,0.3,1)
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: '+=360%', // 300% assembly + extra 20% finale hold (see timeline map above)
          // Only hint the compositor while the pinned sequence is live.
          onToggle: (self) => {
            parts.forEach((el) => {
              el.style.willChange = self.isActive ? 'transform' : 'auto';
            });
          },
        },
      });

      // Updates the terminal readout every scrub tick, in both directions.
      const updateReadout = () => {
        const el = readoutRef.current;
        if (!el) return;
        const p = tl.progress() * T_TOTAL;
        if (p >= 10.9) {
          el.textContent = 'LAUNCH AUTHORIZED';
          el.style.color = EMBER;
        } else if (p >= T_FINALE) {
          el.textContent = 'SYSTEM READY';
          el.style.color = TEAL;
        } else {
          el.textContent = `ASSEMBLY: ${Math.round(counter.val)}%`;
          el.style.color = TEAL;
        }
      };
      tl.eventCallback('onUpdate', updateReadout);

      // Brief non-scrubbed "lock" pulse fired via callback the moment a
      // part reaches its final position (~150ms total, independent of scroll).
      const lockPulse = (el: HTMLImageElement) => {
        gsap.fromTo(
          el,
          { scale: 1 },
          { scale: 1.05, duration: 0.075, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: 'auto' }
        );
      };

      /* ---- Convergence segments (see timeline map above) ---------- */
      SEGMENTS.forEach((seg) => {
        const dur = seg.end - seg.start;
        seg.parts.forEach((id) => {
          const el = partRefs.current[id];
          if (!el) return;
          tl.to(el, { x: 0, y: 0, opacity: 1, scale: 1, duration: dur }, seg.start);
          tl.call(() => lockPulse(el), undefined, seg.end);
        });
        // Counter ticks linearly within the segment so readout and
        // convergence can never drift apart — same timeline, same scrub.
        tl.to(counter, { val: seg.to, duration: dur, ease: 'none' }, seg.start);
      });

      /* ---- FINALE (10 → 12): glow, particles, vibration, exit ----- */

      // Scrubbed: ember glow ramps up on the completed rocket group.
      tl.fromTo(
        rocket,
        { filter: 'drop-shadow(0 0 0px rgba(232,162,76,0))' },
        { filter: 'drop-shadow(0 0 32px rgba(232,162,76,0.75))', duration: 0.6, ease: 'power2.out' },
        T_FINALE
      );

      // Non-scrubbed one-shots fired the instant progress crosses 10:
      // exhaust particles + launch vibration (jitter lives on the INNER
      // wrapper so it can't fight the outer group's scrubbed exit tween).
      tl.call(
        () => {
          const container = particlesRef.current;
          if (container) {
            gsap.fromTo(
              container.children,
              { y: 0, opacity: 0.9, x: () => gsap.utils.random(-70, 70) },
              { y: 130, opacity: 0, duration: 0.8, stagger: 0.05, ease: 'power1.in', overwrite: 'auto' }
            );
          }
          // 2–4px randomized jitter for ~400ms, then settle back to rest.
          gsap.to(inner, {
            x: () => gsap.utils.random(-3, 3),
            y: () => gsap.utils.random(-3, 3),
            duration: 0.04,
            repeat: 9,
            repeatRefresh: true,
            ease: 'none',
            overwrite: 'auto',
            onComplete: () => gsap.set(inner, { x: 0, y: 0 }),
          });
        },
        undefined,
        T_FINALE
      );

      // Scrubbed exit: rocket lifts off and recedes (camera-follow feel)
      // while the whole section fades out, handing off to the next chapter.
      tl.to(rocket, { y: -0.6 * vh, scale: 0.7, duration: 1.2, ease: 'power2.in' }, T_FINALE + 0.8);
      tl.to(section, { opacity: 0, duration: 0.9, ease: 'none' }, T_FINALE + 1.1);
    }, section);

    // Revert kills the timeline, its ScrollTrigger/pin, and all gsap.set
    // inline styles if the component unmounts mid-scroll.
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Chapter 4: Rocket assembly">
      <div className={styles.stage}>
        <p className={styles.hint}>[ CHAPTER 04: ASSEMBLY SEQUENCE ]</p>

        {/* Outer group = scrubbed exit transform + glow. Inner = vibration only. */}
        <div
          ref={rocketRef}
          className={`${styles.rocket} ${rmActive ? styles.rmRocket : ''} ${rmActive && rmStage >= 1 ? styles.rmGlow : ''}`}
        >
          <div ref={rocketInnerRef} className={styles.rocketInner}>
            {PARTS.map((p) => (
              <img
                key={p.id}
                ref={(el) => {
                  partRefs.current[p.id] = el;
                }}
                src={p.src}
                alt={p.alt}
                className={styles.part}
                draggable={false}
                style={{
                  top: p.top,
                  width: p.width,
                  zIndex: p.z,
                  // Static centering for the reduced-motion (pre-assembled)
                  // render; the full-motion path overrides via xPercent:-50.
                  transform: 'translateX(-50%)',
                }}
              />
            ))}

            {/* Exhaust particles, hidden until the finale fires them */}
            <div ref={particlesRef} className={styles.particles} aria-hidden="true">
              {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className={`${styles.particle} ${rmActive ? styles.rmParticle : ''} ${rmActive && rmStage >= 1 ? styles.rmParticleOn : ''}`}
                  style={{ left: `${8 + i * 9}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Terminal readout — mutated directly by GSAP onUpdate, not React state */}
        <div className={styles.readout} role="status" aria-live="polite">
          <span ref={readoutRef} className={rmActive && rmStage >= 2 ? styles.readoutEmber : ''}>
            {rmActive
              ? rmStage >= 2
                ? 'LAUNCH AUTHORIZED'
                : rmStage >= 1
                  ? 'SYSTEM READY'
                  : 'ASSEMBLY: 100%'
              : 'ASSEMBLY: 0%'}
          </span>
        </div>
      </div>
    </section>
  );
}
