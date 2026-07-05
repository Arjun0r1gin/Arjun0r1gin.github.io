import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../animations/hooks/useReducedMotion';
import { useSectionProgress } from '../../animations/hooks/useSectionProgress';
import { useAnimationReady } from '../../animations/hooks/useAnimationReady';
import styles from './Chapter8Docking.module.css';

gsap.registerPlugin(ScrollTrigger);

interface SpacecraftLink {
  name: string;
  href: string;
  label: string;
}

const LINKS: SpacecraftLink[] = [
  {
    name: 'GitHub Terminal',
    href: 'https://github.com/Arjun0r1gin', // TODO: Replace with real GitHub URL if changed
    label: 'Open Arjun’s GitHub Profile and explore repositories',
  },
  {
    name: 'LinkedIn Core',
    href: '#', // TODO: Replace with real LinkedIn URL
    label: 'Open Arjun’s LinkedIn Profile to connect professionally',
  },
  {
    name: 'Secure Transmit (Email)',
    href: 'mailto:arjun.v@example.com', // TODO: Replace with real secure email contact link
    label: 'Open default mail client to send an email to Arjun',
  },
];

export const Chapter8Docking: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subTitleRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const prefersReduced = useReducedMotion();
  const isReady = useAnimationReady();

  // Synchronize section progress to the global store
  useSectionProgress(sectionRef, 'Docking Station');

  useLayoutEffect(() => {
    if (!isReady) return;

    const section = sectionRef.current;
    const heading = headingRef.current;
    const subTitle = subTitleRef.current;
    const grid = gridRef.current;

    if (!section || !heading || !subTitle || !grid) return;

    if (prefersReduced) {
      gsap.set([heading, subTitle, grid], { opacity: 1, y: 0 });
      return;
    }

    // ScrollTrigger to fade in the elements when section is mostly in view
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      once: true,
      onEnter: () => {
        const tl = gsap.timeline();

        // Staggered reveal of header and sub
        tl.to(heading, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
        });

        tl.to(
          subTitle,
          {
            opacity: 0.75,
            duration: 0.6,
            ease: 'power2.out',
          },
          '>-0.4'
        );

        // Stagger in links
        tl.fromTo(
          grid.children,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
          },
          '>-0.2'
        );
      },
    });

    return () => {
      trigger.kill();
    };
  }, [isReady, prefersReduced]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Chapter 8: Docking Station"
      data-chapter="8"
    >
      <div ref={containerRef} className={styles.container}>
        <h2 ref={headingRef} className={styles.missionComplete}>
          Mission Complete
        </h2>
        <p ref={subTitleRef} className={styles.subTitle}>
          Docking Station Online / Secure Links Established
        </p>

        {/* Spacecraft link docking bay */}
        <div ref={gridRef} className={styles.linksGrid}>
          {LINKS.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className={styles.linkItem}
              aria-label={link.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{link.name}</span>
              <div className={styles.engineIndicator} aria-hidden="true">
                <span className={styles.engineDot} />
                <span>Dock &raquo;</span>
              </div>
            </a>
          ))}
        </div>

        {/* ── Returning Engineer character placeholder ── */}
        <div className={styles.characterPlaceholder} aria-hidden="true">
          <span>[ Engineer Return Signal ]</span>
        </div>
      </div>
    </section>
  );
};

export default Chapter8Docking;
