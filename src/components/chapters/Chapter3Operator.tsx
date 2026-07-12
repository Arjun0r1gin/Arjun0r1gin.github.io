import React, { useState, useEffect, useRef } from 'react';
import { useSectionProgress } from '../../animations/hooks/useSectionProgress';
import { useCms } from '../../providers/CmsProvider';
import styles from './Chapter3Operator.module.css';
import { FuzzyText } from '../common/FuzzyText';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Chapter3Operator: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [usePixelFont, setUsePixelFont] = useState(true);
  const { activeProfile } = useCms();
  const [isInView, setIsInView] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  
  const fullText = activeProfile.description || '';

  // Track scroll progress of this section
  useSectionProgress(sectionRef, 'Operator Profile');

  const toggleFont = () => {
    setUsePixelFont(!usePixelFont);
  };

  // Stable ref for typewriter state — avoids StrictMode double-render race condition
  const typewriterRef = useRef<{ interval: ReturnType<typeof setInterval> | null; index: number }>({
    interval: null,
    index: 0,
  });

  // Set up ScrollTrigger to detect when section comes into view
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      onEnter: () => setIsInView(true),
      once: true,
    });

    return () => trigger.kill();
  }, []);

  // Typewriter effect — StrictMode-safe via ref-tracked index
  useEffect(() => {
    if (!isInView || !fullText) return;

    const state = typewriterRef.current;

    // Always cancel any previous running interval before starting fresh
    if (state.interval) {
      clearInterval(state.interval);
      state.interval = null;
    }
    state.index = 0;
    setDisplayedText('');

    state.interval = setInterval(() => {
      if (state.index < fullText.length) {
        const char = fullText[state.index];
        state.index++;
        setDisplayedText((prev) => prev + char);
      } else {
        clearInterval(state.interval!);
        state.interval = null;
      }
    }, 14);

    return () => {
      if (state.interval) {
        clearInterval(state.interval);
        state.interval = null;
      }
    };
  }, [isInView, fullText]);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${usePixelFont ? styles.pixelFont : styles.retroMono}`}
      aria-label="Chapter 3: Operator Profile"
      data-chapter="3"
    >
      <button
        className={styles.switchFontBtn}
        onClick={toggleFont}
        aria-label="Switch font style between pixel art and retro monospace"
      >
        <span className={styles.switchIcon}>
          {usePixelFont ? '(•)' : '( )'}
        </span>{' '}
        Switch Font
      </button>

      <div className={styles.headerContainer}>
        <h2 className={styles.name} style={{ display: 'flex', justifyContent: 'center' }}>
          <FuzzyText
            fontSize="clamp(24px, 4.8vw, 52px)"
            fontWeight="normal"
            fontFamily={usePixelFont ? "'Press Start 2P', monospace" : "'Share Tech Mono', monospace"}
            color="#ffffff"
            baseIntensity={0.12}
            hoverIntensity={0.4}
            fuzzRange={10}
            clickEffect={true}
            transitionDuration={150}
            direction="both"
          >
            {activeProfile.name}
          </FuzzyText>
        </h2>
        <p className={styles.tagline}>
          <span className={styles.floatTextSecondary}>{activeProfile.subtitle}</span>
        </p>
      </div>

      {/* Section Content */}
      <div className={styles.contentContainer}>
        <div className={styles.sectionHeader} style={{ display: 'flex', alignItems: 'center' }}>
          <span className={styles.promptSymbol}>&gt;</span>
          <FuzzyText
            fontSize="clamp(18px, 2.5vw, 24px)"
            fontWeight="normal"
            fontFamily={usePixelFont ? "'Rubik Glitch', system-ui" : "'Share Tech Mono', monospace"}
            color="#00ff00"
            baseIntensity={0.18}
            hoverIntensity={0.5}
            fuzzRange={6}
            clickEffect={true}
            transitionDuration={150}
            direction="both"
          >
            INTRODUCTION
          </FuzzyText>
        </div>
        <div className={styles.dividerLine} />

        {/* README.md File Box */}
        <div className={styles.readmeBox}>
          <div className={styles.readmeHeader}>
            <span className={styles.readmeTab}>arjun0r1gin.md</span>
          </div>
          <div className={styles.readmeContent}>
            <div className={styles.briefingContainer}>

              
              <p className={styles.briefingText}>
                {displayedText}
                <span className={styles.cursor}>_</span>
              </p>

              {activeProfile.resumeLink && activeProfile.resumeLink !== '#' && (
                <div className={styles.actionContainer}>
                  <a
                    className={styles.resumeBtn}
                    href={activeProfile.resumeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ACCESS RESUME
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Chapter3Operator;
