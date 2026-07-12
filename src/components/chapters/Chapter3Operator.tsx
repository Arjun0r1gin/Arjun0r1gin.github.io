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

  // Typewriter effect triggered once scrolled into view
  useEffect(() => {
    if (!isInView) return;

    let index = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText((prev) => prev + fullText[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 12); // Speed adjusted for organic cyber-dossier reading speed

    return () => clearInterval(interval);
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
            fontFamily="inherit"
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
            fontFamily="'Rubik Glitch', system-ui"
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
            <span className={styles.readmeTab}>ARJUN_DOSSIER.md</span>
          </div>
          <div className={styles.readmeContent}>
            <div className={styles.briefingContainer}>
              <h3 className={styles.briefingHeader}>
                OPERATOR DOSSIER // SECURE TERMINAL
              </h3>
              <p className={styles.briefingSubtitle}>
                &gt; {activeProfile.subtitle}
              </p>
              
              <div className={styles.briefingDivider} />
              
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
