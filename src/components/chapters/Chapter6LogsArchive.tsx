/**
 * Chapter 6: Logs Archive
 *
 * Parallax asteroid field where each asteroid represents one dev-log entry.
 * Three depth layers (far/mid/near) with GSAP ScrollTrigger-scrubbed parallax.
 * Hover: TerminalText scramble-then-resolve preview.
 * Click: fade+scale modal with full entry details.
 * Prefers-reduced-motion: asteroids static; hover/click still work.
 */
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { gsap } from '../../lib/scroll';
import { useAnimationReady } from '../../animations/hooks/useAnimationReady';
import { useReducedMotion } from '../../animations/hooks/useReducedMotion';
import TerminalText from '../common/TerminalText';
import { type DevLog } from '../../data/devlogs';
import { useCms } from '../../providers/CmsProvider';
import styles from './Chapter6LogsArchive.module.css';
import { FuzzyText } from '../common/FuzzyText';

/* ────────────────────────────────────────────────────────────
   TYPES
──────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────
   LAYER LAYOUT  (seeded positions to be stable across renders)
──────────────────────────────────────────────────────────── */

type LayerName = 'far' | 'mid' | 'near';

interface AsteroidPlacement {
  log: DevLog;
  layer: LayerName;
  /** percent from left */
  x: number;
  /** percent from top of section */
  y: number;
  /** degrees */
  rotation: number;
}

const PLACEMENTS_CONFIG: Array<{ layer: LayerName; x: number; y: number; rotation: number }> = [
  // 0. rakshastra-v1 (large, near)
  { layer: 'near', x: -10, y: 15, rotation: 12 },
  // 1. rakshastra-v2 (large, mid)
  { layer: 'mid', x: 75, y: 10, rotation: -25 },
  // 2. rakshastra-v3 (large, far)
  { layer: 'far', x: 22, y: 45, rotation: 35 },
  // 3. ep-sat-design (medium, near)
  { layer: 'near', x: 15, y: 80, rotation: -18 },
  // 4. ep-sat-pdr (medium, mid)
  { layer: 'mid', x: 70, y: 85, rotation: 22 }
];

/** Assign each log to a layer and scatter positions. */
function buildPlacements(logs: DevLog[]): AsteroidPlacement[] {
  return logs.map((log, i) => {
    const config = PLACEMENTS_CONFIG[i % PLACEMENTS_CONFIG.length];
    return {
      log,
      ...config
    };
  });
}
// Placements are built dynamically within the component body using useCms()

/* ────────────────────────────────────────────────────────────
   SCRAMBLE TEXT HOOK
   Produces an array of random chars, then resolves to real text
──────────────────────────────────────────────────────────── */

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#@ABCDEFabcdef0123456789';

function scramble(target: string): string[] {
  const frames: string[] = [];
  const len = target.length;
  for (let f = 0; f <= len; f++) {
    const resolved = target.slice(0, f);
    const rest = Array.from({ length: len - f }, () =>
      SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
    ).join('');
    frames.push(resolved + rest);
  }
  return frames;
}

/* ────────────────────────────────────────────────────────────
   SINGLE ASTEROID
──────────────────────────────────────────────────────────── */

interface AsteroidProps {
  placement: AsteroidPlacement;
  globalIndex: number;
  onClick: (log: DevLog) => void;
}

function Asteroid({ placement, globalIndex, onClick }: AsteroidProps) {
  const { log, x, y, rotation, layer } = placement;
  const [hovered, setHovered] = useState(false);
  const [previewLines, setPreviewLines] = useState<string[]>([]);
  const scrambleTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearScramble = useCallback(() => {
    scrambleTimers.current.forEach(clearTimeout);
    scrambleTimers.current = [];
  }, []);

  const runScramble = useCallback((title: string) => {
    clearScramble();
    const frames = scramble(title);
    const lines: string[] = [];
    // Display each frame at 40ms intervals, building toward the real title
    frames.forEach((frame, i) => {
      const id = setTimeout(() => {
        lines[0] = frame;
        setPreviewLines([...lines]);
      }, i * 40);
      scrambleTimers.current.push(id);
    });
  }, [clearScramble]);

  const handleEnter = useCallback(() => {
    setHovered(true);
    setPreviewLines([log.title]);
    runScramble(log.title);
  }, [log.title, runScramble]);

  const handleLeave = useCallback(() => {
    setHovered(false);
    clearScramble();
    setPreviewLines([]);
  }, [clearScramble]);

  useEffect(() => () => clearScramble(), [clearScramble]);

  const sizeClass = styles[log.size] ?? styles.medium;
  const imgIndex = (globalIndex % 4) + 1; // 1, 2, 3, 4
  const asteroidImageClass = styles[`asteroid${imgIndex}`];

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotation}deg)`,
        zIndex: layer === 'near' ? 3 : layer === 'mid' ? 2 : 1,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`Dev log: ${log.title} — click to expand`}
        className={`${styles.asteroid} ${sizeClass} ${asteroidImageClass}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        onClick={() => onClick(log)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(log);
          }
        }}
      />

      {/* Project name label below the asteroid */}
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: `translateX(-50%) translateY(10px) rotate(${-rotation}deg)`,
          fontFamily: `var(--font-terminal, ui-monospace, monospace)`,
          fontSize: '9px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          color: '#ffffff',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          pointerEvents: 'none',
        }}
      >
        {log.project || log.title}
      </div>

      {/* Hover preview — TerminalText scramble */}
      {hovered && previewLines.length > 0 && (
        <div
          className={styles.preview}
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-8px)',
          }}
          aria-hidden="true"
        >
          <div className={styles.previewTitle}>{log.id.replace(/-/g, '_').toUpperCase()}</div>
          {/* Fast scramble-then-resolve using TerminalText */}
          <TerminalText
            lines={previewLines}
            charDelay={0}
            lineDelay={0}
            style={{
              color: 'var(--signal-teal, #8fd8d2)',
              fontSize: '11px',
              letterSpacing: '2px',
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MODAL
──────────────────────────────────────────────────────────── */

interface ModalProps {
  log: DevLog | null;
  onClose: () => void;
}

function Modal({ log, onClose }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef    = useRef<HTMLDivElement>(null);

  // Animate open/close
  useLayoutEffect(() => {
    const backdrop = backdropRef.current;
    const panel    = panelRef.current;
    if (!backdrop || !panel) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (log) {
      if (prefersReduced) {
        backdrop.style.opacity = '1';
        backdrop.style.pointerEvents = 'auto';
        panel.style.transform = 'scale(1)';
      } else {
        gsap.fromTo(
          backdrop,
          { opacity: 0 },
          { opacity: 1, duration: 0.2, ease: 'none',
            onStart: () => { backdrop.style.pointerEvents = 'auto'; }
          }
        );
        gsap.fromTo(
          panel,
          { scale: 0.92, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.25, ease: 'power3.out' }
        );
      }
    } else {
      // Already closed — reset
      backdrop.style.opacity = '0';
      backdrop.style.pointerEvents = 'none';
    }
  }, [log]);

  // Escape key listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className={styles.backdrop}
      style={{ opacity: 0, pointerEvents: 'none' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={log ? `Dev log: ${log.title}` : 'Dev log'}
      aria-hidden={!log}
    >
      <div ref={panelRef} className={styles.panel}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close log entry"
        >
          ESC / CLOSE
        </button>

        {log && (
          <>
            <div className={styles.panelMeta}>
              <span>LOGS_ARCHIVE</span>
              <span className={styles.panelMetaDivider} />
              <span>{log.date}</span>
              <span className={styles.panelMetaDivider} />
              <span>{log.size.toUpperCase()}</span>
            </div>
            <h2 className={styles.panelTitle}>{log.title}</h2>
            <p className={styles.panelBody}>{log.summary}</p>
          </>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
──────────────────────────────────────────────────────────── */

export default function Chapter6LogsArchive() {
  const sectionRef        = useRef<HTMLElement>(null);
  const layerFarRef       = useRef<HTMLDivElement>(null);
  const layerMidRef       = useRef<HTMLDivElement>(null);
  const layerNearRef      = useRef<HTMLDivElement>(null);
  const headerRef         = useRef<HTMLDivElement>(null);

  // New refs for typography transition integration
  const textContainerRef  = useRef<HTMLDivElement>(null);
  const line1Ref          = useRef<HTMLHeadingElement>(null);
  const line2Ref          = useRef<HTMLDivElement>(null);
  const line3Ref          = useRef<HTMLHeadingElement>(null);
  const transitionBgRef   = useRef<HTMLDivElement>(null);

  const isReady        = useAnimationReady();
  const prefersReduced = useReducedMotion();
  
  const { devlogs } = useCms();
  const placements = buildPlacements(devlogs);

  const [activeLog, setActiveLog] = useState<DevLog | null>(null);

  const handleOpen  = useCallback((log: DevLog) => setActiveLog(log), []);
  const handleClose = useCallback(() => setActiveLog(null), []);

  /* ── Parallax ScrollTrigger (skipped if reduced-motion) ── */
  useEffect(() => {
    if (!isReady) return;

    const section = sectionRef.current;
    const layerFar = layerFarRef.current;
    const layerMid = layerMidRef.current;
    const layerNear = layerNearRef.current;
    const header = headerRef.current;
    const textContainer = textContainerRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    const line3 = line3Ref.current;
    const transitionBg = transitionBgRef.current;

    if (!section || !layerFar || !layerMid || !layerNear || !header || !textContainer || !line1 || !line2 || !line3 || !transitionBg) return;

    if (prefersReduced) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=200%',
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
          }
        });

        // 1. Headers fade in then out
        tl.fromTo(header, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        tl.to(header, { opacity: 0, duration: 0.3 }, '+=0.4');

        // 2. Typography fades in then out sequentially
        gsap.set(line1, { opacity: 0, scale: 1, xPercent: 0, y: 0 });
        tl.to(line1, { opacity: 1, duration: 0.8 });
        tl.to(line1, { opacity: 0, duration: 0.5 }, '+=0.5');
      }, section);

      return () => ctx.revert();
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=520%', // Expanded scroll space for highly paced Apple-style cinematic transitions
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        }
      });

      // 1. Initially fade in the headers (Chapter title)
      tl.fromTo(header,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, ease: 'power1.out', duration: 0.06 },
        0
      );

      // 2. Animate the parallax layers up from bottom of viewport to top of viewport (ends by 0.22 progress)
      // Far layer
      tl.fromTo(layerFar,
        { y: '90vh' },
        { y: '-90vh', ease: 'none', duration: 0.20 },
        0.02
      );
      // Mid layer
      tl.fromTo(layerMid,
        { y: '100vh' },
        { y: '-140vh', ease: 'none', duration: 0.20 },
        0.02
      );
      // Near layer
      tl.fromTo(layerNear,
        { y: '110vh' },
        { y: '-190vh', ease: 'none', duration: 0.20 },
        0.02
      );

      // 3. Fade out the header as asteroids are scrolling away
      tl.to(header,
        { opacity: 0, y: -20, ease: 'power1.in', duration: 0.06 },
        0.18
      );

      // 4. Initially set all elements (typography off-screen right, invisible by default to prevent overflow, overlay bg invisible)
      gsap.set(line1, { xPercent: 100, opacity: 0 });
      gsap.set(line2, { xPercent: 100, opacity: 0 });
      gsap.set(line3, { xPercent: 100, opacity: 0, scale: 0.95, color: '#F8F8F8' });
      gsap.set(transitionBg, { opacity: 0, backgroundColor: '#F9F9F9' });

      // 5. ── PHASE 1: LINE 1 (SINGLE CONTINUOUS HORIZONTAL TEXT FLOW) ──
      // Instantly make Line 1 visible at start of Phase 1 (0.24)
      tl.set(line1, { opacity: 1 }, 0.24);
      // Glides continuously across the screen from 100% (right) to -135% (left) from 0.24 to 0.85 progress
      tl.fromTo(line1,
        { xPercent: 100 },
        { xPercent: -135, ease: 'none', duration: 0.61 },
        0.24
      );
      // Instantly hide Line 1 when it completes its exit
      tl.set(line1, { opacity: 0 }, 0.85);

      // 8. ── BACKGROUND & COLOR MORPH TRANSITIONS ──
      // As the sentence glides past (around 0.60 progress), morph the background overlay
      // from transparent to solid white, and smoothly transition the text colors from white to black
      // to maintain perfect readability.
      tl.fromTo(transitionBg,
        { opacity: 0, backgroundColor: '#F9F9F9' },
        { opacity: 1, ease: 'none', duration: 0.08 },
        0.60
      );
      tl.to(line1,
        { color: '#111111', ease: 'none', duration: 0.08 },
        0.60
      );

      // Transition the background color from white to mint teal (#9fd5ca) from 0.85 to 1.00 progress.
      // This matches Chapter 8's top background color exactly for a seamless scroll handoff.
      tl.to(transitionBg,
        { backgroundColor: '#9fd5ca', ease: 'none', duration: 0.15 },
        0.85
      );

    }, section);

    return () => ctx.revert();
  }, [isReady, prefersReduced]);

  /* ── Group placements by layer for rendering ── */
  const byLayer = (layer: LayerName) =>
    placements.filter((p) => p.layer === layer);

  return (
    <>
      <section
        ref={sectionRef}
        className={styles.section}
        aria-label="Chapter 6: Logs Archive"
        data-chapter="6"
      >
        {/* Sticky header */}
        <div ref={headerRef} className={styles.header}>
          <p className={styles.chapterLabel}>
            <span className={styles.floatText}>[ Chapter 06 ]</span>
          </p>
          <h2 className={styles.title} style={{ display: 'flex', justifyContent: 'center' }}>
            <FuzzyText
              fontSize="clamp(28px, 4vw, 44px)"
              fontWeight={300}
              fontFamily="'Rubik Glitch', system-ui"
              color="#00ff00"
              baseIntensity={0.18}
              hoverIntensity={0.5}
              fuzzRange={8}
              clickEffect={true}
              transitionDuration={150}
              direction="both"
            >
              LOGS ARCHIVE
            </FuzzyText>
          </h2>
        </div>

        {/* Parallax layer container */}
        <div className={styles.layerContainer} aria-hidden="false">
          {/* Far layer — slowest (data-layer attr preserved for asset swap) */}
          <div
            ref={layerFarRef}
            className={styles.layer}
            data-layer="far"
          >
            {byLayer('far').map((p) => {
              const globalIndex = devlogs.findIndex((d) => d.id === p.log.id);
              return <Asteroid key={p.log.id} globalIndex={globalIndex} placement={p} onClick={handleOpen} />;
            })}
          </div>

          {/* Mid layer */}
          <div
            ref={layerMidRef}
            className={styles.layer}
            data-layer="mid"
          >
            {byLayer('mid').map((p) => {
              const globalIndex = devlogs.findIndex((d) => d.id === p.log.id);
              return <Asteroid key={p.log.id} globalIndex={globalIndex} placement={p} onClick={handleOpen} />;
            })}
          </div>

          {/* Near layer — fastest */}
          <div
            ref={layerNearRef}
            className={styles.layer}
            data-layer="near"
          >
            {byLayer('near').map((p) => {
              const globalIndex = devlogs.findIndex((d) => d.id === p.log.id);
              return <Asteroid key={p.log.id} globalIndex={globalIndex} placement={p} onClick={handleOpen} />;
            })}
          </div>
        </div>

        {/* Transition background overlay — fades in to blend with Chapter 8 sky */}
        <div ref={transitionBgRef} className={styles.transitionBg} />

        {/* Integrated Typography Overlay — fades in as asteroids exit */}
        <div ref={textContainerRef} className={styles.textContainer}>
          <h3 ref={line1Ref} className={`${styles.line} ${styles.line1}`}>
            AND IF SOME IDEA EXCITES YOU, THAT DOESN'T LET YOU SLEEP, THEN WE SHOULD MEET.
          </h3>
          <div ref={line2Ref} style={{ display: 'none' }} />
          <div ref={line3Ref} style={{ display: 'none' }} />
        </div>
      </section>

      {/* Modal — rendered outside section so it can use fixed positioning */}
      <Modal log={activeLog} onClose={handleClose} />
    </>
  );
}
