import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAnimationReady } from '../../animations/hooks/useAnimationReady';
import { useReducedMotion } from '../../animations/hooks/useReducedMotion';
import styles from './Chapter1Initialize.module.css';
import astronautImg from '../../assets/ui/astronaut.png';
import { ParallaxStars } from '../common/ParallaxStars';

gsap.registerPlugin(ScrollTrigger);

export default function Chapter1Initialize() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const astronautWrapperRef = useRef<HTMLDivElement>(null);
  const astronautRef = useRef<HTMLImageElement>(null);
  const nebula1Ref = useRef<HTMLImageElement>(null);
  const nebula3Ref = useRef<HTMLImageElement>(null);
  const nebula2Ref = useRef<HTMLImageElement>(null);
  const nebulaWhiteRef = useRef<HTMLImageElement>(null);
  const nebula4Ref = useRef<HTMLImageElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  const isReady = useAnimationReady();
  const prefersReduced = useReducedMotion();

  useLayoutEffect(() => {
    if (!isReady) return;

    const section = sectionRef.current;
    const contentWrapper = contentWrapperRef.current;
    const astronautWrapper = astronautWrapperRef.current;
    const astronaut = astronautRef.current;
    const nebula1 = nebula1Ref.current;
    const nebula3 = nebula3Ref.current;
    const nebula2 = nebula2Ref.current;
    const nebulaWhite = nebulaWhiteRef.current;
    const nebula4 = nebula4Ref.current;
    const heroContent = heroContentRef.current;

    if (
      !section ||
      !contentWrapper ||
      !astronautWrapper ||
      !astronaut ||
      !nebula1 ||
      !nebula3 ||
      !nebula2 ||
      !nebulaWhite ||
      !nebula4 ||
      !heroContent
    )
      return;

    // ── Reduced motion: show settled state immediately ──────────────────────
    if (prefersReduced) {
      gsap.set([nebula2, nebulaWhite, nebula4], { opacity: 0.8, yPercent: 0, scale: 1 });
      gsap.set(heroContent, { opacity: 1, y: 0 });
      gsap.set(astronautWrapper, { opacity: 1, y: 0, rotation: 0 });
      return;
    }

    // Disable lag smoothing for ScrollTrigger alignment
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // 1. Infinite organic floating/bobbing animation for the astronaut
      gsap.to(astronaut, {
        y: 42,
        x: 18,
        rotation: 5,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // 2. Set initial GSAP properties for the astronaut wrapper to prevent jumps
      gsap.set(astronautWrapper, {
        xPercent: -50,
        yPercent: 0,
        rotation: 0,
        opacity: 1,
      });

      // Set cloud transform origin to bottom-center so they scale upward (like rising fog)
      gsap.set([nebula2, nebulaWhite, nebula4], {
        transformOrigin: '50% 100%',
      });

      // 3. Global persistent background drift timeline
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
      .to(nebula1, { scale: 1.8, yPercent: -120, xPercent: -30, rotation: 15, ease: 'none' }, 0)
      .to(nebula3, { scale: 1.9, yPercent: -80, xPercent: -20, rotation: 10, ease: 'none' }, 0);

      // 4. Main pinned scroll-scrub timeline
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
        },
      });

      const isMobile = window.innerWidth < 768;
      const liftY = isMobile ? '-14vh' : -130;
      const driftY = isMobile ? '-7vh' : -70;
      const sinkY = isMobile ? '3vh' : 30;

      // Phase 1 (0% → 15%): Astronaut lifts up to center position
      heroTl.to(astronautWrapper, {
        y: liftY,
        rotation: 0,
        opacity: 1,
        duration: 0.15,
        ease: 'power1.out',
      }, 0);

      // Phase 2 (15% → 25%): Brief still phase — astronaut stays at lifted position
      heroTl.to(astronautWrapper, {
        y: liftY,
        rotation: 0,
        opacity: 1,
        duration: 0.10,
        ease: 'none',
      }, 0.15);


      // Phase 3 (25% → 85%): Astronaut rotates to -40deg and drifts down slightly
      heroTl.to(astronautWrapper, {
        rotation: -40,
        y: driftY, // gentle downward drift relative to its lifted position
        opacity: 1,
        duration: 0.60,
        ease: 'power1.inOut',
      }, 0.25);

      heroTl.to(nebula2, {
        yPercent: -15,
        scale: 1.4,
        opacity: 0.4,
        duration: 0.60,
        ease: 'power2.inOut',
      }, 0.25);

      heroTl.to(nebulaWhite, {
        yPercent: -12,
        scale: 1.5,
        opacity: 0.3,
        duration: 0.60,
        ease: 'power1.inOut',
      }, 0.25);

      heroTl.to(nebula4, {
        yPercent: -12,
        scale: 1.4,
        opacity: 0.4,
        duration: 0.60,
        ease: 'power1.inOut',
      }, 0.25);

      // Phase 4 (85% → 100%): Clouds rise further, astronaut rotates to -70deg and sinks down
      heroTl.to(astronautWrapper, {
        rotation: -70,
        y: sinkY, // sinks into clouds
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in',
      }, 0.85);

      heroTl.to(nebula2, {
        yPercent: -20,
        scale: 1.6,
        opacity: 1, // Fade to full opacity at the very end for screen transition
        duration: 0.15,
        ease: 'power2.in',
      }, 0.85);

      heroTl.to(nebulaWhite, {
        yPercent: -16,
        scale: 1.7,
        opacity: 1,
        duration: 0.15,
        ease: 'power2.in',
      }, 0.85);

      heroTl.to(nebula4, {
        yPercent: -16,
        scale: 1.6,
        opacity: 1,
        duration: 0.15,
        ease: 'power2.in',
      }, 0.85);

      // Fade out space background gradient and stars
      const spaceBg = section.querySelector(`.${styles.spaceBg}`);
      if (spaceBg) {
        heroTl.to(spaceBg, {
          opacity: 0,
          duration: 0.15,
          ease: 'power2.in',
        }, 0.85);
      }

      // Transition outer section background color to pure white
      heroTl.to(section, {
        backgroundColor: '#ffffff',
        duration: 0.15,
        ease: 'power2.in',
      }, 0.85);

      // Hero titles fade out
      heroTl.to(heroContent, {
        opacity: 0,
        y: -50,
        duration: 0.5,
        ease: 'none',
      }, 0);

      ScrollTrigger.refresh();
    }, section);

    return () => ctx.revert();
  }, [isReady, prefersReduced]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className={styles.section}
      aria-label="Landing Page"
    >
      {/* Persistent Space Background */}
      <div className={styles.spaceBg}>
        <img
          ref={nebula1Ref}
          className={`${styles.nebula} ${styles.nebula1}`}
          src="https://static.wixstatic.com/media/c22c23_d819e8b92a894a33a043b793a706120f~mv2.webp"
          alt="Nebula Cloud 1"
          draggable="false"
        />
        <img
          ref={nebula3Ref}
          className={`${styles.nebula} ${styles.nebula3}`}
          src="https://static.wixstatic.com/media/c22c23_8e765412bde541e0b53a8a623dcacb06~mv2.webp"
          alt="Nebula Cloud 3"
          draggable="false"
        />
        <ParallaxStars speed={0.6} zIndex={1} opacity={0.45} />
      </div>

      <div ref={contentWrapperRef} className={styles.contentWrapper}>
        {/* Persistent Astronaut Foreground */}
        <div ref={astronautWrapperRef} className={styles.astronautWrapper}>
          <img
            ref={astronautRef}
            className={styles.astronaut}
            src={astronautImg}
            alt="Floating Astronaut"
            draggable="false"
          />
        </div>

        {/* Persistent Foreground Clouds */}
        <div className={styles.foregroundClouds}>
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
        </div>

        {/* Hero Content */}
        <div ref={heroContentRef} className={styles.heroContent}>
          <div className={styles.titleContainer}>
            <h1 className={styles.name}>
              <span className={styles.titleWord}>ARJUN</span>
              <span className={styles.titleGap}></span>
              <span className={styles.titleWord}>V</span>
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
