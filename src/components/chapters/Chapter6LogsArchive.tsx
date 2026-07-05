/**
 * Chapter 6: Logs Archive
 *
 * Parallax asteroid field where each asteroid represents one dev-log entry.
 * Three depth layers (far/mid/near) with GSAP ScrollTrigger-scrubbed parallax.
 * Hover: TerminalText scramble-then-resolve preview.
 * Click: fade+scale modal with full entry details.
 * Prefers-reduced-motion: asteroids static; hover/click still work.
 */
import { useLayoutEffect, useRef, useState, useEffect, useCallback } from 'react';
import { gsap } from '../../lib/scroll';
import { useAnimationReady } from '../../animations/hooks/useAnimationReady';
import { useReducedMotion } from '../../animations/hooks/useReducedMotion';
import TerminalText from '../common/TerminalText';
import { devlogs, type DevLog } from '../../data/devlogs';
import styles from './Chapter6LogsArchive.module.css';

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

/** Deterministic pseudo-random seeded with a string seed */
function seededRng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return () => {
    h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5;
    return ((h >>> 0) / 0xffffffff);
  };
}

/** Assign each log to a layer and scatter positions. */
function buildPlacements(logs: DevLog[]): AsteroidPlacement[] {
  const layers: LayerName[] = ['far', 'mid', 'near'];
  return logs.map((log, i) => {
    const rng = seededRng(log.id);
    return {
      log,
      layer: layers[i % 3],
      x: 8 + rng() * 80,        // 8%–88% from left
      y: 5 + rng() * 85,        // 5%–90% from section top
      rotation: rng() * 40 - 20, // ±20deg
    };
  });
}

const PLACEMENTS = buildPlacements(devlogs as DevLog[]);

/** Parallax speed per layer — far slowest, near fastest */
const PARALLAX: Record<LayerName, number> = { far: 0.2, mid: 0.4, near: 0.6 };

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
  onClick: (log: DevLog) => void;
}

function Asteroid({ placement, onClick }: AsteroidProps) {
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
      {/* The actual asteroid shape */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Dev log: ${log.title} — click to expand`}
        className={`${styles.asteroid} ${sizeClass}`}
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
  const sectionRef    = useRef<HTMLElement>(null);
  const layerFarRef   = useRef<HTMLDivElement>(null);
  const layerMidRef   = useRef<HTMLDivElement>(null);
  const layerNearRef  = useRef<HTMLDivElement>(null);

  const isReady        = useAnimationReady();
  const prefersReduced = useReducedMotion();

  const [activeLog, setActiveLog] = useState<DevLog | null>(null);

  const handleOpen  = useCallback((log: DevLog) => setActiveLog(log), []);
  const handleClose = useCallback(() => setActiveLog(null), []);

  /* ── Parallax ScrollTrigger (skipped if reduced-motion) ── */
  useLayoutEffect(() => {
    if (!isReady || prefersReduced) return;

    const section  = sectionRef.current;
    const layerFar  = layerFarRef.current;
    const layerMid  = layerMidRef.current;
    const layerNear = layerNearRef.current;
    if (!section || !layerFar || !layerMid || !layerNear) return;

    // Section height determines max parallax travel distance
    const ctx = gsap.context(() => {
      const layers: [HTMLDivElement, LayerName][] = [
        [layerFar,  'far'],
        [layerMid,  'mid'],
        [layerNear, 'near'],
      ];

      layers.forEach(([el, name]) => {
        const speed = PARALLAX[name];
        // Negative: element moves upward slower than scroll = classic depth parallax
        const travel = -(section.offsetHeight * speed);

        gsap.to(el, {
          y: travel,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, [isReady, prefersReduced]);

  /* ── Group placements by layer for rendering ── */
  const byLayer = (layer: LayerName) =>
    PLACEMENTS.filter((p) => p.layer === layer);

  return (
    <>
      <section
        ref={sectionRef}
        className={styles.section}
        aria-label="Chapter 6: Logs Archive"
        data-chapter="6"
      >
        {/* Sticky header */}
        <div className={styles.header}>
          <p className={styles.chapterLabel}>[ Chapter 06 ]</p>
          <h2 className={styles.title}>Logs Archive</h2>
        </div>

        {/* Parallax layer container */}
        <div className={styles.layerContainer} aria-hidden="false">
          {/* Far layer — slowest (data-layer attr preserved for asset swap) */}
          <div
            ref={layerFarRef}
            className={styles.layer}
            data-layer="far"
          >
            {byLayer('far').map((p) => (
              <Asteroid key={p.log.id} placement={p} onClick={handleOpen} />
            ))}
          </div>

          {/* Mid layer */}
          <div
            ref={layerMidRef}
            className={styles.layer}
            data-layer="mid"
          >
            {byLayer('mid').map((p) => (
              <Asteroid key={p.log.id} placement={p} onClick={handleOpen} />
            ))}
          </div>

          {/* Near layer — fastest */}
          <div
            ref={layerNearRef}
            className={styles.layer}
            data-layer="near"
          >
            {byLayer('near').map((p) => (
              <Asteroid key={p.log.id} placement={p} onClick={handleOpen} />
            ))}
          </div>
        </div>
      </section>

      {/* Modal — rendered outside section so it can use fixed positioning */}
      <Modal log={activeLog} onClose={handleClose} />
    </>
  );
}
