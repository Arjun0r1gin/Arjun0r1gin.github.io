import React, { useState } from 'react';
import { useSectionProgress } from '../../animations/hooks/useSectionProgress';
import { useCms } from '../../providers/CmsProvider';
import styles from './Chapter3Operator.module.css';
import ResolvedImage from '../common/ResolvedImage';
import { FuzzyText } from '../common/FuzzyText';

export const Chapter3Operator: React.FC = () => {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [usePixelFont, setUsePixelFont] = useState(true);
  const { activeProfile } = useCms();

  // Track scroll progress of this section
  useSectionProgress(sectionRef, 'Operator Profile');

  const toggleFont = () => {
    setUsePixelFont(!usePixelFont);
  };

  // Helper to split comma-separated items safely
  const parseTags = (str: string) => {
    if (!str) return [];
    return str
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const skills = parseTags(activeProfile.skills);
  const technologies = parseTags(activeProfile.technologies);

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
            <div className={styles.profileGrid}>
              
              {/* Left Column: Avatar & Meta Data */}
              <div className={styles.avatarColumn}>
                <div className={styles.avatarWrapper}>
                  {activeProfile.profileImage && (
                    <ResolvedImage
                      className={styles.avatarImg}
                      srcPath={activeProfile.profileImage}
                      alt={activeProfile.name}
                      loading="lazy"
                    />
                  )}
                </div>
                
                <div className={styles.metaInfo}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaKey}>STT</span>
                    <span className={styles.metaVal}>{activeProfile.status}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaKey}>EXP</span>
                    <span className={styles.metaVal}>{activeProfile.experience}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaKey}>LOC</span>
                    <span className={styles.metaVal}>{activeProfile.location}</span>
                  </div>
                </div>

                {activeProfile.resumeLink && activeProfile.resumeLink !== '#' && (
                  <a
                    className={styles.resumeBtn}
                    href={activeProfile.resumeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ACCESS RESUME
                  </a>
                )}
              </div>

              {/* Right Column: Title, Subtitle, Bio & Tags */}
              <div className={styles.detailsColumn}>
                <h3 className={styles.dossierTitle}>{activeProfile.title}</h3>
                <p className={styles.dossierSub}>&gt; {activeProfile.subtitle}</p>
                <p className={styles.dossierDesc}>{activeProfile.description}</p>
                
                {skills.length > 0 && (
                  <div className={styles.tagSection}>
                    <div className={styles.tagHeader}>CORE_SKILLS</div>
                    <div className={styles.tagContainer}>
                      {skills.map((skill, index) => (
                        <span key={index} className={styles.tag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {technologies.length > 0 && (
                  <div className={styles.tagSection}>
                    <div className={styles.tagHeader}>TECH_STACK</div>
                    <div className={styles.tagContainer}>
                      {technologies.map((tech, index) => (
                        <span key={index} className={styles.tag}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Chapter3Operator;
