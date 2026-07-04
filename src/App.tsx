import React, { useRef, useEffect } from 'react';
import { AnimationProvider } from './providers/AnimationProvider';
import { useScrollProgress } from './animations/hooks/useScrollProgress';
import { useTimeline } from './animations/hooks/useTimeline';
import { useReducedMotion } from './animations/hooks/useReducedMotion';
import { useViewport } from './animations/hooks/useViewport';
import { useSectionProgress } from './animations/hooks/useSectionProgress';
import { useAnimationReady } from './animations/hooks/useAnimationReady';
import { useAnimationStore } from './animations/engine/animationStore';
import gsap from 'gsap';

// Main App wrapped in the AnimationProvider
function App() {
  return (
    <AnimationProvider>
      <DemoContent />
    </AnimationProvider>
  );
}

// Inner content to safely consume hooks under the AnimationProvider context
const DemoContent: React.FC = () => {
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);

  // 1. Initialize section scroll tracking
  useSectionProgress(section1Ref, 'Initialize Protocol');
  useSectionProgress(section2Ref, 'Transition Protocol');
  useSectionProgress(section3Ref, 'Operator Profile');

  // 2. Fetch states from the animation engine
  const isReady = useAnimationReady();
  const { globalProgress, scrollVelocity, scrollDirection } = useScrollProgress();
  const activeSection = useAnimationStore((state) => state.activeSection);
  const activeSectionProgress = useAnimationStore((state) => state.activeSectionProgress);
  const registeredTimelines = useAnimationStore((state) => state.registeredTimelineIds);
  const prefersReducedMotion = useReducedMotion();
  const { width, height } = useViewport();

  const { registerTimeline, killTimeline } = useTimeline();

  // 3. Test timeline registration
  useEffect(() => {
    if (!isReady) return;

    // Create a dummy timeline to test registering capabilities
    const dummyTl = gsap.timeline();
    registerTimeline('TestAssemblyTimeline', dummyTl);

    return () => {
      killTimeline('TestAssemblyTimeline');
    };
  }, [isReady]);

  // 4. Log states to the console on scroll/section changes for verification
  useEffect(() => {
    console.log(`[Animation Engine] Current Section: "${activeSection}" | Progress: ${(activeSectionProgress * 100).toFixed(1)}%`);
  }, [activeSection, activeSectionProgress]);

  useEffect(() => {
    console.log(`[Animation Engine] Global Scroll Progress: ${(globalProgress * 100).toFixed(1)}% | Direction: ${scrollDirection} | Velocity: ${scrollVelocity.toFixed(2)}`);
  }, [globalProgress, scrollDirection, scrollVelocity]);

  useEffect(() => {
    console.log(`[Animation Engine] Timelines Status:`, registeredTimelines);
  }, [registeredTimelines]);

  return (
    <div style={styles.container}>
      {/* Real-time Diagnostics HUD (Cyber/Mission-Control Styled) */}
      <div style={styles.hud}>
        <div style={styles.hudTitle}>SYSTEM DIAGNOSTICS HUD</div>
        <div style={styles.hudRow}>
          <span>Engine Status:</span>
          <span style={isReady ? styles.valueActive : styles.valueInactive}>
            {isReady ? 'ACTIVE_ONLINE' : 'INITIALIZING...'}
          </span>
        </div>
        <div style={styles.hudRow}>
          <span>Active Section:</span>
          <span style={styles.valueHighlight}>{activeSection || 'NONE'}</span>
        </div>
        <div style={styles.hudRow}>
          <span>Section Progress:</span>
          <span style={styles.value}>{(activeSectionProgress * 100).toFixed(1)}%</span>
        </div>
        <div style={styles.hudRow}>
          <span>Global Progress:</span>
          <span style={styles.value}>{(globalProgress * 100).toFixed(1)}%</span>
        </div>
        <div style={styles.hudRow}>
          <span>Scroll Velocity:</span>
          <span style={styles.value}>{scrollVelocity.toFixed(3)} px/s</span>
        </div>
        <div style={styles.hudRow}>
          <span>Scroll Direction:</span>
          <span style={styles.value}>
            {scrollDirection === 1 ? '▼ DOWNWARD' : scrollDirection === -1 ? '▲ UPWARD' : '⧗ IDLE'}
          </span>
        </div>
        <div style={styles.hudRow}>
          <span>Reduced Motion:</span>
          <span style={prefersReducedMotion ? styles.valueActive : styles.value}>
            {prefersReducedMotion ? 'TRUE' : 'FALSE'}
          </span>
        </div>
        <div style={styles.hudRow}>
          <span>Viewport Size:</span>
          <span style={styles.value}>{width}px x {height}px</span>
        </div>
        <div style={styles.hudDivider} />
        <div style={styles.hudRow}>
          <span>Active Timelines:</span>
          <span style={styles.value}>{registeredTimelines.join(', ') || 'NONE'}</span>
        </div>
      </div>

      {/* Fullscreen Sections */}
      <section ref={section1Ref} style={styles.section}>
        <div style={styles.sectionLabel}>[ CHAPTER 01: INITIALIZE PROTOCOL ]</div>
        <div style={styles.sectionSubtitle}>Scroll down to transition protocol</div>
      </section>

      <section ref={section2Ref} style={styles.section}>
        <div style={styles.sectionLabel}>[ CHAPTER 02: TRANSITION PROTOCOL ]</div>
        <div style={styles.sectionSubtitle}>Scroll down to operator profile</div>
      </section>

      <section ref={section3Ref} style={styles.section}>
        <div style={styles.sectionLabel}>[ CHAPTER 03: OPERATOR PROFILE ]</div>
        <div style={styles.sectionSubtitle}>Scroll back up to return</div>
      </section>
    </div>
  );
};

// Clean styling matching Story Bible (matte black void, soft glows)
const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#030308',
    color: '#8fd8d2',
    fontFamily: '"Courier New", Courier, monospace',
    margin: 0,
    padding: 0,
    width: '100vw',
    overflowX: 'hidden',
  },
  hud: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    backgroundColor: 'rgba(3, 3, 8, 0.85)',
    border: '1px solid #8fd8d2',
    borderRadius: '4px',
    padding: '16px',
    width: '320px',
    zIndex: 1000,
    boxShadow: '0 0 15px rgba(143, 216, 210, 0.15)',
    backdropFilter: 'blur(8px)',
  },
  hudTitle: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#e8a24c',
    marginBottom: '12px',
    borderBottom: '1px dashed #8fd8d2',
    paddingBottom: '6px',
    letterSpacing: '1px',
  },
  hudRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    margin: '6px 0',
  },
  hudDivider: {
    borderTop: '1px dashed #8fd8d2',
    margin: '12px 0 8px 0',
  },
  value: {
    color: '#8fd8d2',
  },
  valueHighlight: {
    color: '#8fd8d2',
    fontWeight: 'bold',
  },
  valueActive: {
    color: '#e8a24c',
    fontWeight: 'bold',
  },
  valueInactive: {
    color: '#ff5555',
    fontWeight: 'bold',
  },
  section: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: '1px solid rgba(143, 216, 210, 0.1)',
    position: 'relative',
  },
  sectionLabel: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#8fd8d2',
    letterSpacing: '2px',
    textAlign: 'center',
    marginBottom: '12px',
  },
  sectionSubtitle: {
    fontSize: '12px',
    color: 'rgba(143, 216, 210, 0.5)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
};

export default App;
