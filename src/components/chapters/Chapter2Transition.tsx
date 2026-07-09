import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAnimationReady } from '../../animations/hooks/useAnimationReady';
import { useReducedMotion } from '../../animations/hooks/useReducedMotion';
import styles from './Chapter2Transition.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function Chapter2Transition() {
  const sectionRef = useRef<HTMLElement>(null);
  const nebula2Ref = useRef<HTMLImageElement>(null);
  const nebulaWhiteRef = useRef<HTMLImageElement>(null);
  const nebula4Ref = useRef<HTMLImageElement>(null);

  const spaceRef = useRef<HTMLSpanElement>(null);
  const meetsRef = useRef<HTMLSpanElement>(null);
  const codeRef = useRef<HTMLSpanElement>(null);

  const isReady = useAnimationReady();
  const prefersReduced = useReducedMotion();

  useLayoutEffect(() => {
    if (!isReady) return;

    const section = sectionRef.current;
    const nebula2 = nebula2Ref.current;
    const nebulaWhite = nebulaWhiteRef.current;
    const nebula4 = nebula4Ref.current;

    const spaceWord = spaceRef.current;
    const meetsWord = meetsRef.current;
    const codeWord = codeRef.current;

    if (
      !section ||
      !nebula2 ||
      !nebulaWhite ||
      !nebula4 ||
      !spaceWord ||
      !meetsWord ||
      !codeWord
    )
      return;

    if (prefersReduced) {
      gsap.set([nebula2, nebulaWhite, nebula4], { y: 0, opacity: 0.8 });
      gsap.set([spaceWord, meetsWord, codeWord], { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      // Single master timeline pinned for a 180vh scroll range
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=180%',
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        }
      });

      // 1. Cloud Parallax transitions (simulating 3D camera zoom and drift)
      tl.fromTo(nebula2, { y: 0, scale: 1 }, { y: '-10vh', scale: 1.08, ease: 'none' }, 0);
      tl.fromTo(nebulaWhite, { y: 0, scale: 1 }, { y: '-20vh', scale: 1.15, ease: 'none' }, 0);
      tl.fromTo(nebula4, { y: 0, scale: 1 }, { y: '-35vh', scale: 1.25, ease: 'none' }, 0);

      // 2. Word 1: SPΛCE
      // Enters (0.0 to 0.25 progress)
      tl.fromTo(spaceWord,
        { scale: 0.15, opacity: 0, x: '-20vw', y: '15vh', rotation: -25 },
        { scale: 1, opacity: 1, x: '0vw', y: '0vh', rotation: -10, ease: 'power1.out', duration: 0.25 },
        0.0
      );
      // Exits (0.35 to 0.6 progress)
      tl.to(spaceWord,
        { scale: 3.5, opacity: 0, x: '-55vw', y: '-30vh', rotation: 12, ease: 'power1.in', duration: 0.25 },
        0.35
      );

      // 3. Word 2: MEETS
      // Enters (0.22 to 0.47 progress)
      tl.fromTo(meetsWord,
        { scale: 0.15, opacity: 0, x: '25vw', y: '18vh', rotation: 20 },
        { scale: 1, opacity: 1, x: '0vw', y: '0vh', rotation: 5, ease: 'power1.out', duration: 0.25 },
        0.22
      );
      // Exits (0.57 to 0.82 progress)
      tl.to(meetsWord,
        { scale: 3.5, opacity: 0, x: '55vw', y: '-25vh', rotation: -18, ease: 'power1.in', duration: 0.25 },
        0.57
      );

      // 4. Word 3: CODE
      // Enters (0.45 to 0.7 progress)
      tl.fromTo(codeWord,
        { scale: 0.15, opacity: 0, x: '-8vw', y: '25vh', rotation: -15 },
        { scale: 1.1, opacity: 1, x: '0vw', y: '0vh', rotation: 0, ease: 'power1.out', duration: 0.25 },
        0.45
      );
      // Exits (0.78 to 0.98 progress)
      tl.to(codeWord,
        { scale: 3.8, opacity: 0, x: '0vw', y: '-40vh', rotation: 10, ease: 'power1.in', duration: 0.2 },
        0.78
      );

      // 5. Section reveal: fade background and clouds to transparent (0.8 to 0.98 progress)
      tl.to(section, { backgroundColor: 'rgba(255, 255, 255, 0)', ease: 'none', duration: 0.18 }, 0.8);
      tl.to([nebula2, nebulaWhite, nebula4], { opacity: 0, ease: 'none', duration: 0.18 }, 0.8);

    }, section);

    return () => ctx.revert();
  }, [isReady, prefersReduced]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Chapter 2: Cloud Veil"
      data-chapter="2"
    >
      <img
        ref={nebula2Ref}
        className={`${styles.nebula} ${styles.nebula2}`}
        src="https://static.wixstatic.com/media/c22c23_9a1b1bb5f049443588d24db8db7e5f2f~mv2.webp"
        alt="Nebula Cloud 2"
        draggable="false"
      />
      <img
        ref={nebulaWhiteRef}
        className={`${styles.nebula} ${styles.nebulaWhite}`}
        src="https://static.wixstatic.com/media/c22c23_8f37a335d68a40549a38de362bb0f454~mv2.webp"
        alt="White Cloud"
        draggable="false"
      />
      <img
        ref={nebula4Ref}
        className={`${styles.nebula} ${styles.nebula4}`}
        src="https://static.wixstatic.com/media/c22c23_30cd5e6319c54527b06e1c517fa0b36c~mv2.webp"
        alt="Nebula Cloud 4"
        draggable="false"
      />

      {/* Word assembly overlay */}
      <div className={styles.textContainer}>
        <span ref={spaceRef} className={`${styles.word} ${styles.space}`}>SPΛCE</span>
        <span ref={meetsRef} className={`${styles.word} ${styles.meets}`}>MEETS</span>
        <span ref={codeRef} className={`${styles.word} ${styles.code}`}>CODE</span>
      </div>
    </section>
  );
}
