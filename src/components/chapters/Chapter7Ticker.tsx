import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../../lib/scroll';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Chapter7Ticker.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function Chapter7Ticker() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      // Calculate scroll travel distance based on track size
      const getTravelDistance = () => {
        return track.scrollWidth - window.innerWidth;
      };

      gsap.to(track, {
        x: () => -getTravelDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${getTravelDistance()}`,
          invalidateOnRefresh: true,
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Ticker Ribbon">
      <div className={styles.trackContainer}>
        <div ref={trackRef} className={styles.track}>
          {/* Phrase segment 1 */}
          <span className={styles.textWord}>In every bottle,</span>

          {/* SVG 1: Floating bottle silhouette with flow wave */}
          <svg className={styles.inlineSvg} viewBox="0 0 100 40" fill="none" style={{ color: '#00ffcc' }}>
            <path d="M 10,20 C 30,5 35,35 60,20 C 75,10 85,25 95,20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M 45,10 L 55,10 L 55,12 L 53,12 L 53,28 L 47,28 L 47,12 L 45,12 Z" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="50" cy="20" r="2" fill="#00ffcc" />
          </svg>

          {/* Phrase segment 2 */}
          <span className={styles.textWord}>discover the undeniable</span>

          {/* SVG 2: Rotating cosmic magic stars */}
          <svg className={styles.inlineSvg} viewBox="0 0 50 40" fill="none" style={{ color: '#ff00ff' }}>
            <path d="M 25,5 L 27,15 L 37,17 L 27,19 L 25,29 L 23,19 L 13,17 L 23,15 Z" fill="currentColor" />
            <path d="M 10,28 L 11,31 L 14,32 L 11,33 L 10,36 L 9,33 L 6,32 L 9,31 Z" fill="#ffffff" />
            <circle cx="38" cy="10" r="2.5" fill="#00ffff" />
          </svg>

          {/* Phrase segment 3 (Highlight: Real Magic) */}
          <span className={`${styles.textWord} ${styles.highlightMagic}`}>Real Magic</span>

          {/* SVG 3: Sinuous fluid transition line */}
          <svg className={styles.inlineSvg} viewBox="0 0 120 40" fill="none" style={{ color: '#ff00ff' }}>
            <path d="M 10,20 Q 35,5 60,20 T 110,20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path d="M 10,20 Q 35,35 60,20 T 110,20" stroke="#00ffff" strokeWidth="1" strokeDasharray="3 3" />
          </svg>

          {/* Phrase segment 4 */}
          <span className={styles.textWord}>of sharing pure</span>

          {/* SVG 4: Floating condensation refreshment bubbles */}
          <svg className={styles.inlineSvg} viewBox="0 0 60 40" fill="none" style={{ color: '#00ffff' }}>
            <circle cx="20" cy="22" r="9" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="20" cy="22" r="5" stroke="#ffffff" strokeWidth="1" />
            <circle cx="42" cy="14" r="6" stroke="#ffffff" strokeWidth="2" />
            <circle cx="10" cy="8" r="3" fill="#00ffcc" />
          </svg>

          {/* Phrase segment 5 (Highlight: Refreshment) */}
          <span className={`${styles.textWord} ${styles.highlightRefreshment}`}>Refreshment</span>

          {/* SVG 5: Connecting ribbon infinity loop */}
          <svg className={styles.inlineSvg} viewBox="0 0 100 40" fill="none" style={{ color: '#ffffff' }}>
            <path d="M 20,20 C 20,10 45,30 50,20 C 55,10 80,30 80,20 C 80,10 55,30 50,20 C 45,10 20,30 20,20 Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="20" r="3.5" fill="#ff3366" />
          </svg>

          {/* Phrase segment 6 */}
          <span className={styles.textWord}>that brings us</span>

          {/* SVG 6: Pulsing nested hearts */}
          <svg className={styles.inlineSvg} viewBox="0 0 50 40" fill="none" style={{ color: '#ff3366' }}>
            <path d="M 25,15 C 21,10 13,12 25,26 C 37,12 29,10 25,15 Z" fill="currentColor" stroke="#ffffff" strokeWidth="1.5" />
            <path d="M 25,18 C 23,15 19,16 25,23 C 31,16 27,15 25,18 Z" fill="#ffffff" />
          </svg>

          {/* Phrase segment 7 (Highlight: Together) */}
          <span className={`${styles.textWord} ${styles.highlightTogether}`}>Together.</span>
        </div>
      </div>
    </section>
  );
}
