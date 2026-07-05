import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../animations/hooks/useReducedMotion';
import { useSectionProgress } from '../../animations/hooks/useSectionProgress';
import styles from './Chapter3Operator.module.css';

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

export const Chapter3Operator: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalLine1Ref = useRef<HTMLSpanElement>(null);
  const terminalLine2Ref = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingContainerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const prefersReduced = useReducedMotion();
  const [introComplete, setIntroComplete] = useState(false);

  // Track scroll progress of this section using our shared hook
  useSectionProgress(sectionRef, 'Operator Profile');

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const terminal = terminalRef.current;
    const line1 = terminalLine1Ref.current;
    const line2 = terminalLine2Ref.current;
    const content = contentRef.current;
    const heading = headingRef.current;
    const grid = gridRef.current;

    if (!section || !terminal || !line1 || !line2 || !content || !heading || !grid) return;

    if (prefersReduced) {
      setIntroComplete(true);
      return;
    }

    const letters = heading.querySelectorAll(`.${styles.letter}`);

    // Create a ScrollTrigger that fires ONCE when the section enters 50% viewport height
    const introTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      once: true,
      onEnter: () => {
        const tl = gsap.timeline({
          onComplete: () => {
            setIntroComplete(true);
          },
        });

        // 1. Loading Text typing effect
        const text1 = 'LOADING OPERATOR DATA...';
        const text2 = 'ACCESS GRANTED';

        tl.call(() => {
          if (line1) line1.textContent = '';
          if (line2) line2.textContent = '';
        });

        // Type line 1
        text1.split('').forEach((char, index) => {
          tl.call(() => {
            if (line1) line1.textContent += char;
          }, undefined, index * 0.04);
        });

        // Delay and type line 2
        const line2Start = text1.length * 0.04 + 0.4;
        text2.split('').forEach((char, index) => {
          tl.call(() => {
            if (line2) line2.textContent += char;
          }, undefined, line2Start + index * 0.05);
        });

        // Wait and fade out terminal intro
        const fadeStart = line2Start + text2.length * 0.05 + 0.8;
        tl.to(terminal, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
        }, fadeStart);

        // 2. Reveal main content container
        tl.to(content, {
          opacity: 1,
          duration: 0.1,
        }, fadeStart + 0.4);

        // 3. Heading letter assembly
        tl.to(letters, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.03,
          ease: 'power3.out',
        }, fadeStart + 0.5);

        // 4. Heading drift to top-left of its container
        tl.to(heading, {
          left: 0,
          x: 0,
          transform: 'none',
          duration: 0.8,
          ease: 'var(--ease-cosmic, power4.out)',
        }, `>+0.2`);
      },
    });

    // Create a ScrollTrigger specifically for the cards grid reveal
    const gridTrigger = ScrollTrigger.create({
      trigger: grid,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        // Wait until intro / assembly completes if they happen close to each other
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

    return () => {
      introTrigger.kill();
      gridTrigger.kill();
    };
  }, [prefersReduced]);

  // Set up values for initial states
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

      {/* ── Composed Dossier Content ── */}
      <div
        ref={contentRef}
        className={styles.content}
        style={{ opacity: prefersReduced || introComplete ? 1 : 0 }}
      >
        <div ref={headingContainerRef} className={styles.headingContainer}>
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
    </section>
  );
};

export default Chapter3Operator;
