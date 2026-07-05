import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../animations/hooks/useReducedMotion';
import { useSectionProgress } from '../../animations/hooks/useSectionProgress';
import { useAnimationReady } from '../../animations/hooks/useAnimationReady';
import styles from './Chapter3Operator.module.css';

import coreEngine from '../../assets/rocket/core-engine.png';
import fuelMatrix from '../../assets/rocket/fuel-matrix.png';
import structuralFrame from '../../assets/rocket/structural-frame.png';
import navigationUnit from '../../assets/rocket/navigation-unit.png';
import payloadModule from '../../assets/rocket/payload-module.png';
import aerodynamicShell from '../../assets/rocket/aerodynamic-shell.png';

gsap.registerPlugin(ScrollTrigger);

interface CardData {
  title: string;
  body: string;
}

const PROFILE_CARDS: CardData[] = [
  {
    title: 'Mission',
    body: 'Secure the boundary between space assets and ground-segment infrastructure. We build defense mechanisms that validate and isolate critical satellite command lines, ensuring uninterrupted telemetry.',
  },
  {
    title: 'Background',
    body: 'Second-year Computer Science Engineering student specializing in IoT and Cybersecurity. Co-founder of Powerhouse Tech, developing embedded CanSat flight software and security tools.',
  },
  {
    title: 'Current Objectives',
    body: 'Developing RAKSHASTRA v3.0 to identify anomalies in telemetry stream data using lightweight custom ML models. Validating EP-SAT flight software interfaces for upcoming CanSat launch.',
  },
  {
    title: 'Capabilities',
    body: 'Implementing ground-station protocol analysis, secure telemetry ingestion pipelines, and hardware-in-the-loop testing. Specialized in embedded C and RTOS environment security.',
  },
  {
    title: 'Technologies',
    body: 'Linux kernel hardening, embedded C/C++, Python (ML from scratch), Rust for secure tooling, Wireshark packet analysis, and RTOS communication protocols.',
  },
  {
    title: 'Engineering Philosophy',
    body: 'Build practically rather than theory-first. Focus on working code verified in local Linux sandboxes. Iterate through surges of deep focus, structured pauses, and reflection.',
  },
];

interface PartDef {
  id: string;
  src: string;
  alt: string;
  top: number;
  width: number;
  z: number;
  fromX: number;
  fromY: number;
}

const PARTS: PartDef[] = [
  { id: 'core-engine',       src: coreEngine,       alt: 'Core engine',       top: 400, width: 170, z: 3, fromX: -0.7, fromY:  0.10 },
  { id: 'fuel-matrix',       src: fuelMatrix,       alt: 'Fuel matrix',       top: 285, width: 165, z: 3, fromX:  0.7, fromY: -0.08 },
  { id: 'structural-frame',  src: structuralFrame,  alt: 'Structural frame',  top: 265, width: 225, z: 4, fromX:  0.0, fromY: -0.90 },
  { id: 'navigation-unit',   src: navigationUnit,   alt: 'Navigation unit',   top: 115, width: 150, z: 3, fromX:  0.0, fromY:  0.90 },
  { id: 'payload-module',    src: payloadModule,    alt: 'Payload module',    top: 195, width: 158, z: 3, fromX: -0.7, fromY: -0.12 },
  { id: 'aerodynamic-shell', src: aerodynamicShell, alt: 'Aerodynamic shell', top: -15, width: 145, z: 5, fromX:  0.7, fromY:  0.06 },
];

const PARTICLE_COUNT = 10;
const TEAL = 'var(--signal-teal, #8fd8d2)';
const EMBER = 'var(--ember, #e8a24c)';

export const Chapter3Operator: React.FC = () => {
  const isReady = useAnimationReady();
  const sectionRef = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalLine1Ref = useRef<HTMLSpanElement>(null);
  const terminalLine2Ref = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Rocket Refs
  const rocketRef = useRef<HTMLDivElement>(null);
  const rocketInnerRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const partRefs = useRef<Record<string, HTMLImageElement | null>>({});

  const prefersReduced = useReducedMotion();
  const [introComplete, setIntroComplete] = useState(false);

  // Track scroll progress of this section
  useSectionProgress(sectionRef, 'Operator Profile');

  useLayoutEffect(() => {
    if (!isReady) return;
    const section = sectionRef.current;
    if (!section) return;

    if (prefersReduced) {
      setIntroComplete(true);
      return;
    }

    const ctx = gsap.context(() => {
      const letters = headingRef.current?.querySelectorAll(`.${styles.letter}`);
      const terminal = terminalRef.current;
      const line1 = terminalLine1Ref.current;
      const line2 = terminalLine2Ref.current;
      const content = contentRef.current;
      const heading = headingRef.current;
      const grid = gridRef.current;

      const rocket = rocketRef.current;
      const inner = rocketInnerRef.current;

      if (!terminal || !line1 || !line2 || !content || !heading || !grid || !rocket || !inner) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const parts = PARTS.map((p) => partRefs.current[p.id]).filter(Boolean) as HTMLImageElement[];
      const counter = { val: 0 };

      // ── 1. Mount Intro Typing Timeline (Access dossier splash) ──
      const introTl = gsap.timeline({
        paused: true,
        onComplete: () => {
          setIntroComplete(true);
        },
      });

      const text1 = 'LOADING OPERATOR DATA...';
      const text2 = 'ACCESS GRANTED';

      introTl.call(() => {
        if (line1) line1.textContent = '';
        if (line2) line2.textContent = '';
      });

      text1.split('').forEach((char, index) => {
        introTl.call(() => {
          if (line1) line1.textContent += char;
        }, undefined, index * 0.04);
      });

      const line2Start = text1.length * 0.04 + 0.4;
      text2.split('').forEach((char, index) => {
        introTl.call(() => {
          if (line2) line2.textContent += char;
        }, undefined, line2Start + index * 0.05);
      });

      const fadeStart = line2Start + text2.length * 0.05 + 0.8;
      introTl.to(terminal, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
      }, fadeStart);

      introTl.to(content, {
        opacity: 1,
        duration: 0.1,
      }, fadeStart + 0.4);

      if (letters) {
        introTl.to(letters, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.03,
          ease: 'power3.out',
        }, fadeStart + 0.5);
      }

      introTl.to(heading, {
        left: 0,
        x: 0,
        transform: 'none',
        duration: 0.8,
        ease: 'var(--ease-cosmic, power4.out)',
      }, `>+0.2`);

      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        once: true,
        onEnter: () => introTl.play(),
      });

      // Grid Cards Entrance on enter
      ScrollTrigger.create({
        trigger: grid,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(grid, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          });

          gsap.fromTo(
            grid.children,
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power2.out',
            }
          );
        },
      });

      // ── 2. Scroll-Scrub Rocket Assembly Master Timeline ──
      // Scatter all parts initially off-screen before scrolling.
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

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: '+=320%',
          onToggle: (self) => {
            parts.forEach((el) => {
              el.style.willChange = self.isActive ? 'transform' : 'auto';
            });
          },
        },
      });

      // Convergence segments (Scroll Progress: 0.0 to 10.0 timeline time)
      // Assembly spans 2.5 to 7.5 (25% to 75% scroll).
      const SEGMENTS = [
        { id: 'core-engine',       start: 2.5, end: 3.5, from: 0,  to: 20 },
        { id: 'fuel-matrix',       start: 3.5, end: 4.5, from: 20, to: 40 },
        { id: 'structural-frame',  start: 4.5, end: 5.5, from: 40, to: 60 },
        { id: 'navigation-unit',   start: 5.5, end: 6.5, from: 60, to: 70 },
        { id: 'payload-module',    start: 5.5, end: 6.5, from: 70, to: 80 },
        { id: 'aerodynamic-shell', start: 6.5, end: 7.5, from: 80, to: 100 },
      ];

      SEGMENTS.forEach((seg) => {
        const el = partRefs.current[seg.id];
        if (!el) return;
        const dur = seg.end - seg.start;
        scrollTl.to(el, { x: 0, y: 0, opacity: 1, scale: 1, duration: dur }, seg.start);
        scrollTl.call(() => {
          // Subtle assembly lock scale pulse
          gsap.fromTo(
            el,
            { scale: 1 },
            { scale: 1.05, duration: 0.075, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: 'auto' }
          );
        }, undefined, seg.end);
      });

      // Readout counter matching linear progress of assembly segments
      scrollTl.to(counter, { val: 20, duration: 1, ease: 'none' }, 2.5);
      scrollTl.to(counter, { val: 40, duration: 1, ease: 'none' }, 3.5);
      scrollTl.to(counter, { val: 60, duration: 1, ease: 'none' }, 4.5);
      scrollTl.to(counter, { val: 80, duration: 1, ease: 'none' }, 5.5);
      scrollTl.to(counter, { val: 100, duration: 1, ease: 'none' }, 6.5);

      // Glow ramps up as assembly completes (7.5 -> 9.0)
      scrollTl.fromTo(
        rocket,
        { filter: 'drop-shadow(0 0 0px rgba(143,216,210,0))' },
        { filter: 'drop-shadow(0 0 32px rgba(143,216,210,0.65))', duration: 1.5, ease: 'power2.out' },
        7.5
      );

      // Ignition hot glow transitions to ember (9.0 -> 10.0)
      scrollTl.to(
        rocket,
        { filter: 'drop-shadow(0 0 36px rgba(232,162,76,0.85))', duration: 1.0, ease: 'power1.in' },
        9.0
      );

      // Rocket acceleration upward off screen (9.0 -> 10.0)
      scrollTl.to(rocket, { y: -0.95 * vh, scale: 0.7, duration: 1.0, ease: 'power2.in' }, 9.0);

      // Fade out the entire operator profile section to hand over to Mission Control
      scrollTl.to(section, { opacity: 0, duration: 0.8, ease: 'none' }, 9.2);

      // Synchronize readout text changes, engine rumbles, and exhaust particles directly to scroll progress
      const updateReadoutAndEffects = () => {
        const el = readoutRef.current;
        if (!el) return;
        const p = scrollTl.progress(); // 0.0 to 1.0

        // 1. Text Readout Updates
        if (p >= 0.90) {
          el.textContent = 'LAUNCH AUTHORIZED';
          el.style.color = EMBER;
        } else if (p >= 0.75) {
          el.textContent = 'SYSTEM READY';
          el.style.color = TEAL;
        } else if (p >= 0.25) {
          el.textContent = `ASSEMBLY: ${Math.round(counter.val)}%`;
          el.style.color = TEAL;
        } else {
          el.textContent = 'ASSEMBLY: 0%';
          el.style.color = TEAL;
        }

        // 2. Engine vibration shake (between 90% and 99% progress)
        if (p >= 0.90 && p < 0.99) {
          gsap.set(inner, {
            x: gsap.utils.random(-3, 3),
            y: gsap.utils.random(-3, 3),
          });
        } else {
          gsap.set(inner, { x: 0, y: 0 });
        }

        // 3. Exhaust Particle emission
        const particleContainer = particlesRef.current;
        if (particleContainer) {
          if (p >= 0.90) {
            gsap.set(particleContainer, { opacity: 1 });
            const progressInIgnition = (p - 0.90) / 0.10; // 0.0 to 1.0
            Array.from(particleContainer.children).forEach((child, index) => {
              const pOffset = (index * 0.05) % 0.3;
              const localProgress = Math.max(0, Math.min(1, (progressInIgnition - pOffset) / 0.7));
              gsap.set(child, {
                y: localProgress * 150,
                opacity: (1 - localProgress) * 0.9,
                x: Math.sin(index * 12 + p * 100) * 15,
              });
            });
          } else {
            gsap.set(particleContainer, { opacity: 0 });
          }
        }
      };

      scrollTl.eventCallback('onUpdate', updateReadoutAndEffects);

    }, section);

    return () => {
      ctx.revert();
    };
  }, [isReady, prefersReduced]);

  const headingText = 'OPERATOR PROFILE';

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Chapter 3: Operator Profile"
      data-chapter="3"
    >
      {/* ── Terminal Intro ── */}
      {!introComplete && !prefersReduced && (
        <div ref={terminalRef} className={styles.terminalIntro}>
          <div>
            <span ref={terminalLine1Ref} />
          </div>
          <div>
            <span ref={terminalLine2Ref} />
            <span className={styles.terminalCursor} />
          </div>
        </div>
      )}

      {/* ── Dossier + Rocket Grid Content ── */}
      <div
        ref={contentRef}
        className={styles.content}
        style={{ opacity: prefersReduced || introComplete ? 1 : 0 }}
      >
        {/* Left pane: Profile dossier */}
        <div className={styles.dossier}>
          <div className={styles.headingContainer}>
            <h2
              ref={headingRef}
              className={styles.heading}
              style={
                prefersReduced || introComplete
                  ? { left: 0, transform: 'none' }
                  : { left: '50%', transform: 'translateX(-50%)' }
              }
            >
              {prefersReduced
                ? headingText
                : headingText.split('').map((char, index) => (
                    <span
                      key={index}
                      className={styles.letter}
                      style={introComplete ? { opacity: 1, transform: 'none' } : {}}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
            </h2>
          </div>

          <div
            ref={gridRef}
            className={styles.grid}
            style={prefersReduced ? { opacity: 1, transform: 'none' } : {}}
          >
            {PROFILE_CARDS.map((card, index) => (
              <div key={index} className={styles.card}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardBody}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right pane: Rocket assembly stage */}
        {!prefersReduced && (
          <div className={styles.rocketStage} aria-hidden="true">
            <p className={styles.rocketHint}>[ ROCKET ASSEMBLY MODULE ]</p>

            <div ref={rocketRef} className={styles.rocketContainer}>
              <div ref={rocketInnerRef} className={styles.rocketInner}>
                {PARTS.map((p) => (
                  <img
                    key={p.id}
                    ref={(el) => {
                      partRefs.current[p.id] = el;
                    }}
                    src={p.src}
                    alt={p.alt}
                    className={styles.rocketPart}
                    draggable={false}
                    style={{
                      top: p.top,
                      width: p.width,
                      zIndex: p.z,
                      transform: 'translateX(-50%)',
                    }}
                  />
                ))}

                {/* Ignition particles */}
                <div ref={particlesRef} className={styles.particles}>
                  {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
                    <div
                      key={i}
                      className={styles.particle}
                      style={{ left: `${8 + i * 9}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Live readout telemetry */}
            <div className={styles.readout} role="status">
              <span ref={readoutRef} className={styles.readoutText}>
                ASSEMBLY: 0%
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Chapter3Operator;
