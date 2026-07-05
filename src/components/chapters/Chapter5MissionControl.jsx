import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { usePinnedTimeline } from '../../animations/hooks/usePinnedTimeline';
import { useReducedMotion } from '../../animations/hooks/useReducedMotion';
import { useViewport } from '../../animations/hooks/useViewport';
import { Z_INDEX } from '../../animations/constants';
import { AnimationContext } from '../../providers/AnimationProvider';
import { projects } from '../../data/projects';
import './chapter5-mission-control.css';

/* ------------------------------------------------------------------ *
 * Asset resolution
 * imagePath in projects.js is a "/src/assets/planets/*.png" path.
 * import.meta.glob resolves those to real hashed URLs so the same data
 * contract works in dev AND in the production build.
 * ------------------------------------------------------------------ */
const planetImages = import.meta.glob('/src/assets/planets/*.png', {
  eager: true,
  import: 'default',
});
const resolveImage = (imagePath) => planetImages[imagePath] ?? imagePath;

/* ------------------------------------------------------------------ *
 * TRACK-WIDTH CALCULATION
 *
 * Pinned horizontal track scrolls across 3.4 viewports (340vw).
 * ------------------------------------------------------------------ */
const TRACK_VW = 340;
const TRAVEL_VW = TRACK_VW - 100; // horizontal distance the camera pans
const PIN_END = `+=${TRAVEL_VW}%`; // ScrollTrigger end (percent of viewport height)

// Background grid + ruler move at a slower rate than the planet track
// for parallax depth (distant backdrop).
const GRID_PARALLAX = 0.4;

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export default function Chapter5MissionControl() {
  const reducedMotion = useReducedMotion();
  const { width } = useViewport();

  // Below 768px OR reduced motion: no pin, no track — stacked cards.
  const useFallback = width < 768 || reducedMotion;

  return useFallback ? (
    <FallbackList reducedMotion={reducedMotion} />
  ) : (
    <BeltScene />
  );
}

/* ================================================================== *
 * FULL EXPERIENCE — pinned horizontal-scroll belt (desktop, motion OK)
 * ================================================================== */
function BeltScene() {
  const { lenis } = useContext(AnimationContext);
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const gridRef = useRef(null);
  const rulerRef = useRef(null);
  const spinTargets = useRef(new Map()); // id -> { el, spinDur }
  const bodyEls = useRef(new Map()); // id -> focusable element
  const [activeId, setActiveId] = useState(null);

  // ONE ScrollTrigger pins the section and scrubs the shared timeline.
  const timeline = usePinnedTimeline(sectionRef, {
    start: 'top top',
    end: PIN_END,
    scrollTriggerConfig: { invalidateOnRefresh: true, anticipatePin: 1 },
  });

  /* ---- The core mechanic: scroll progress -> track translateX ---- */
  useEffect(() => {
    if (!timeline) return;
    const track = trackRef.current;
    const grid = gridRef.current;
    const ruler = rulerRef.current;
    if (!track || !grid || !ruler) return;

    // Travel = full track width minus one viewport; recomputed on refresh.
    const travel = () => Math.max(track.scrollWidth - window.innerWidth, 0);

    // Planet track: 0 -> -(trackWidth - viewportWidth), linear with scroll.
    timeline.to(
      track,
      { x: () => -travel(), ease: 'none', duration: 1 },
      0
    );
    // Grid + light-year ruler pan together at 0.4x — distant backdrop parallax.
    timeline.to(
      [grid, ruler],
      { x: () => -travel() * GRID_PARALLAX, ease: 'none', duration: 1 },
      0
    );

    return () => {
      timeline.clear();
    };
  }, [timeline]);

  /* ---- Ambient motion: shared gsap.ticker (scroll-independent) ---- */
  useEffect(() => {
    const tick = (time) => {
      spinTargets.current.forEach(({ el, spinDur }) => {
        gsap.set(el, { rotation: ((time * 360) / spinDur) % 360 });
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick); // clean up ticker callback on unmount
  }, []);

  /* ---- Keyboard reachability: focusing an off-screen body advances ---- */
  const revealBody = (id) => {
    const st = timeline?.scrollTrigger;
    const el = bodyEls.current.get(id);
    const track = trackRef.current;
    if (!st || !el || !track) return;

    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    // Already comfortably on screen? Don't hijack the scroll position.
    if (rect.left >= vw * 0.1 && rect.right <= vw * 0.9) return;

    const trackLeft = track.getBoundingClientRect().left;
    const centerInTrack = rect.left + rect.width / 2 - trackLeft;
    const travel = Math.max(track.scrollWidth - vw, 0);
    const targetX = clamp(centerInTrack - vw / 2, 0, travel);
    const progress = travel > 0 ? targetX / travel : 0;
    const scrollY = st.start + progress * (st.end - st.start);

    if (lenis) lenis.scrollTo(scrollY, { duration: 0.8 });
    else window.scrollTo({ top: scrollY, behavior: 'smooth' });
  };

  const openMission = (url) =>
    window.open(url, '_blank', 'noopener,noreferrer');

  /* ---- Flat horizontal slots layout matching the Wix Studio reference ---- */
  const slots = useMemo(() => {
    // 8 celestial bodies with decreased gaps and wave-like vertical alignment
    const positions = [15, 55, 95, 135, 175, 215, 260, 310];
    const sizes = [32, 10, 20, 30, 22, 32, 11, 34];
    const verticalOffsets = [-7, 7, -7, 7, -7, 7, -7, 7];
    const desktopIds = [
      'rakshastra',
      'eznotes',
      'epsat',
      'cyberlab',
      'guardcharge',
      'orbit-alert',
      'telemetry-db',
      'payload-triage',
    ];

    return desktopIds.map((id, index) => {
      const p = projects.find((proj) => proj.id === id);
      if (!p) return null;
      return {
        project: p,
        sizeVw: sizes[index],
        yOffVh: verticalOffsets[index],
        centerVw: positions[index],
        spinDur: 40 + (index * 7) % 31,
      };
    }).filter(Boolean);
  }, []);

  // Ruler ticks: one every 4vw across the ruler strip.
  const rulerWidthVw = TRACK_VW * GRID_PARALLAX + 100;
  const ticks = useMemo(
    () => Array.from({ length: Math.ceil(rulerWidthVw / 4) + 1 }, (_, i) => i),
    [rulerWidthVw]
  );

  const sharedBodyProps = (p) => ({
    ref: (el) => {
      if (el) bodyEls.current.set(p.id, el);
      else bodyEls.current.delete(p.id);
    },
    href: p.githubUrl,
    target: '_blank',
    rel: 'noopener noreferrer',
    tabIndex: 0,
    'aria-label': `${p.name} — ${p.blurb}`,
    style: { '--accent': p.accentColor },
    className: `c5-body c5-body--${p.size}${
      activeId === p.id ? ' is-active' : ''
    }`,
    onMouseEnter: () => setActiveId(p.id),
    onMouseLeave: () => setActiveId((cur) => (cur === p.id ? null : cur)),
    onFocus: () => {
      setActiveId(p.id);
      revealBody(p.id);
    },
    onBlur: () => setActiveId((cur) => (cur === p.id ? null : cur)),
    onClick: (e) => {
      e.preventDefault();
      openMission(p.githubUrl);
    },
    onKeyDown: (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        openMission(p.githubUrl);
      }
    },
  });

  const renderCard = (p, yOffVh) => (
    <span className={`c5-card${yOffVh < 0 ? ' c5-card--below' : ''}`} aria-hidden="true">
      <span className="c5-card__name">{p.name}</span>
      <span className="c5-card__blurb">{p.blurb}</span>
    </span>
  );

  const renderConnectorAndLabel = (id) => {
    // Connector mapping matching Wix Studio composition across 8 planets
    const connectorData = {
      rakshastra: {
        label: 'KEEP',
        x1: '70%',
        y1: '70%',
        x2: '85%',
        y2: '130%',
        labelLeft: '85%',
        labelTop: '130%',
      },
      eznotes: {
        label: 'SCROLLING',
        x1: '70%',
        y1: '70%',
        x2: '130%',
        y2: '130%',
        labelLeft: '130%',
        labelTop: '130%',
      },
      epsat: {
        label: 'TO',
        x1: '70%',
        y1: '30%',
        x2: '120%',
        y2: '-30%',
        labelLeft: '120%',
        labelTop: '-30%',
      },
      cyberlab: {
        label: 'SEE',
        x1: '70%',
        y1: '70%',
        x2: '95%',
        y2: '130%',
        labelLeft: '95%',
        labelTop: '130%',
      },
      guardcharge: {
        label: 'WHAT',
        x1: '70%',
        y1: '30%',
        x2: '125%',
        y2: '-25%',
        labelLeft: '125%',
        labelTop: '-25%',
      },
      'orbit-alert': {
        label: 'IDEAS',
        x1: '70%',
        y1: '70%',
        x2: '95%',
        y2: '130%',
        labelLeft: '95%',
        labelTop: '130%',
      },
      'telemetry-db': {
        label: 'I',
        x1: '70%',
        y1: '30%',
        x2: '130%',
        y2: '-30%',
        labelLeft: '130%',
        labelTop: '-30%',
      },
      'payload-triage': {
        label: 'BUILT',
        x1: '70%',
        y1: '70%',
        x2: '90%',
        y2: '130%',
        labelLeft: '90%',
        labelTop: '130%',
      },
    };

    const data = connectorData[id];
    if (!data) return null;

    return (
      <>
        <svg className="c5-connector-svg" aria-hidden="true">
          <line
            x1={data.x1}
            y1={data.y1}
            x2={data.x2}
            y2={data.y2}
            className="c5-connector-line"
          />
        </svg>
        <div
          className="c5-wix-label"
          style={{ left: data.labelLeft, top: data.labelTop }}
          aria-hidden="true"
        >
          <span className="c5-wix-label__dot" />
          <span className="c5-wix-label__text">{data.label}</span>
        </div>
      </>
    );
  };

  return (
    <section
      ref={sectionRef}
      className={`c5 ${activeId ? 'c5--has-active' : ''}`}
      aria-label="Chapter 5: Mission Control — project belt"
    >
      {/* Distant backdrop: blueprint grid, slow parallax layer */}
      <div
        ref={gridRef}
        className="c5-grid"
        style={{ width: `${rulerWidthVw}vw`, zIndex: Z_INDEX.BACKGROUND }}
        aria-hidden="true"
      />

      {/* Light-year distance readout ruler — same parallax rate as the grid */}
      <div
        ref={rulerRef}
        className="c5-ruler"
        style={{ width: `${rulerWidthVw}vw`, zIndex: Z_INDEX.MIDGROUND }}
        aria-hidden="true"
      >
        {ticks.map((i) => (
          <span className="c5-ruler__tick" key={i}>
            <i />
            {(i * 0.4).toFixed(1)} LY
          </span>
        ))}
      </div>

      {/* Ambient chrome: radar rings fixed in a corner, not track-bound */}
      <div
        className="c5-radar"
        style={{ zIndex: Z_INDEX.UI_LAYER }}
        aria-hidden="true"
      >
        <i />
        <i />
        <i />
      </div>

      {/* "Built on WIX STUDIO" Badge in the bottom-right corner */}
      <div className="c5-badge" style={{ zIndex: Z_INDEX.UI_LAYER }} aria-hidden="true">
        <i />
        Built on <strong>WIX STUDIO</strong>
      </div>

      {/* THE TRACK — wider than the viewport, panned via translateX */}
      <div
        ref={trackRef}
        className="c5-track"
        style={{ width: `${TRACK_VW}vw`, zIndex: Z_INDEX.FOREGROUND }}
      >
        {slots.map(({ project: p, sizeVw, yOffVh, centerVw, spinDur }) => (
          <div
            key={p.id}
            className="c5-slot"
            style={{
              left: `${centerVw}vw`,
              top: `calc(50% + ${yOffVh}vh)`,
              width: `${sizeVw}vw`,
              height: `${sizeVw}vw`,
            }}
          >
            <a {...sharedBodyProps(p)}>
              <img
                ref={(el) => {
                  if (el) spinTargets.current.set(p.id, { el, spinDur });
                  else spinTargets.current.delete(p.id);
                }}
                className="c5-body__img"
                src={resolveImage(p.imagePath)}
                alt=""
                loading="lazy"
                draggable="false"
              />
              {renderCard(p, yOffVh)}
            </a>

            {/* Wix-style Connector Line and Label */}
            {renderConnectorAndLabel(p.id)}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================================================================== *
 * FALLBACK — stacked cards for <768px viewports and reduced motion.
 * No pin, no track, real page scroll. Hover/focus/click still work.
 * ================================================================== */
function FallbackList({ reducedMotion }) {
  const listRef = useRef(null);

  // Simple scroll-reveal fade per card (opacity only), skipped entirely
  // when the user prefers reduced motion.
  useEffect(() => {
    if (reducedMotion) return;
    const cards = listRef.current?.querySelectorAll('.c5f-card') ?? [];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.15 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [reducedMotion]);

  return (
    <section
      className={`c5f ${reducedMotion ? 'c5f--static' : ''}`}
      aria-label="Chapter 5: Mission Control — project list"
    >
      <h2 className="c5f-title">MISSION CONTROL</h2>
      <ul ref={listRef} className="c5f-list">
        {projects.map((p) => (
          <li key={p.id}>
            <a
              className="c5f-card"
              style={{ '--accent': p.accentColor }}
              href={p.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="c5f-card__img"
                src={resolveImage(p.imagePath)}
                alt=""
                loading="lazy"
              />
              <span className="c5f-card__text">
                <span className="c5f-card__name">
                  {p.name}
                  {p.orbitsParentId ? (
                    <span className="c5f-card__tag">
                      MOON OF {p.orbitsParentId.toUpperCase()}
                    </span>
                  ) : null}
                </span>
                <span className="c5f-card__blurb">{p.blurb}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
