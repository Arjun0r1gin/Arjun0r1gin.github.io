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
 * Instructional callout words — one ordered array, fully independent
 * of projects.js. Edit freely; anchors redistribute automatically.
 * ------------------------------------------------------------------ */
const CALLOUT_WORDS = [
  'KEEP',
  'SCROLLING',
  'TO',
  'EXPLORE',
  'THE',
  'MISSIONS',
  "I'VE",
  'BUILT',
];

/* ------------------------------------------------------------------ *
 * TRACK-WIDTH CALCULATION (the one number everything hangs off)
 *
 * Track width scales with how many bodies exist in the data array:
 *   TRACK_VW = projects.length * 60 (vw), min 200vw
 * so adding a 6th project automatically adds ~60vw of horizontal
 * distance to travel — zero animation-code changes required.
 *
 * Flagships each get an equal slot across that width; moons attach to
 * their parent's slot (they don't get their own slot, but they DO
 * count toward track width, since they add visual density).
 *
 * The pin distance mirrors the travel distance: 1vh of page scroll
 * per 1vw of horizontal camera travel (TRAVEL_VW below).
 * ------------------------------------------------------------------ */
const TRACK_VW = Math.max(projects.length * 60, 200);
const TRAVEL_VW = TRACK_VW - 100; // horizontal distance the camera pans
const PIN_END = `+=${TRAVEL_VW}%`; // ScrollTrigger end (percent of viewport height)

// Background grid + ruler move at a slower rate than the planet track
// for parallax depth (distant backdrop).
const GRID_PARALLAX = 0.4;

const flagships = projects.filter((p) => p.size !== 'moon');
const moonsOf = (parentId) =>
  projects.filter((p) => p.orbitsParentId === parentId);

/* Deterministic per-body layout, derived ONLY from array index + size.
 * Never hand-placed per id. */
const bodyLayout = (globalIndex, size) => ({
  // Diameter in vw — flagships large (some crop off viewport edges), moons small
  sizeVw: size === 'flagship' ? 32 + ((globalIndex * 23) % 3) * 8 : 9,
  // Vertical drift in vh so the belt isn't mechanically flat
  yOffVh: ((globalIndex * 53) % 29) - 14,
  // Self-rotation period, 40–70s
  spinDur: 40 + ((globalIndex * 7) % 31),
  // Moon orbit period + starting angle
  orbitDur: 24 + ((globalIndex * 11) % 20),
  orbitPhase: (globalIndex * 137) % 360,
});

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
  const wordRefs = useRef([]);
  const spinTargets = useRef(new Map()); // id -> { el, spinDur }
  const orbitTargets = useRef(new Map()); // id -> { rotor, inner, orbitDur, orbitPhase }
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

    // Word callouts fade in/out from the SAME driving value (timeline
    // progress), each around its anchor's focus-zone crossing.
    const win = 0.5 / CALLOUT_WORDS.length;
    CALLOUT_WORDS.forEach((_, i) => {
      const el = wordRefs.current[i];
      if (!el) return;
      const p = (i + 0.5) / CALLOUT_WORDS.length;
      gsap.set(el, { autoAlpha: i === 0 ? 1 : 0 });
      if (i !== 0) {
        timeline.to(
          el,
          { autoAlpha: 1, duration: win, ease: 'none' },
          clamp(p - win * 1.6, 0, 1 - win)
        );
      }
      timeline.to(
        el,
        { autoAlpha: 0, duration: win, ease: 'none' },
        clamp(p + win * 0.6, 0, 1 - win)
      );
    });

    return () => {
      // usePinnedTimeline kills the timeline + ScrollTrigger on unmount;
      // here we only remove the tweens we added (mode switches re-add them).
      timeline.clear();
    };
  }, [timeline]);

  /* ---- Ambient motion: shared gsap.ticker (scroll-independent) ----
   * Planets self-rotate (40–70s per index) and moons orbit their parent
   * continuously, regardless of scroll position or direction. */
  useEffect(() => {
    const tick = (time) => {
      spinTargets.current.forEach(({ el, spinDur }) => {
        gsap.set(el, { rotation: ((time * 360) / spinDur) % 360 });
      });
      orbitTargets.current.forEach(({ rotor, inner, orbitDur, orbitPhase }) => {
        const angle = orbitPhase + ((time * 360) / orbitDur) % 360;
        gsap.set(rotor, { rotation: angle });
        // Counter-rotate the moon itself so it doesn't tumble with the rotor.
        gsap.set(inner, { rotation: -angle });
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick); // clean up ticker callback on unmount
  }, []);

  /* ---- Keyboard reachability: focusing an off-screen body advances
   * the pinned track's scroll position so it becomes visible. ---- */
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

  /* ---- Derived layout (index/size driven — see bodyLayout) ---- */
  const slots = useMemo(() => {
    const slotVw = TRACK_VW / flagships.length;
    return flagships.map((p, fi) => {
      const globalIndex = projects.indexOf(p);
      return {
        project: p,
        layout: bodyLayout(globalIndex, p.size),
        centerVw: (fi + 0.5) * slotVw,
        moons: moonsOf(p.id).map((m) => ({
          project: m,
          layout: bodyLayout(projects.indexOf(m), m.size),
        })),
      };
    });
  }, []);

  // Ruler ticks: one every 4vw across the ruler strip.
  const rulerWidthVw = TRACK_VW * GRID_PARALLAX + 100;
  const ticks = useMemo(
    () => Array.from({ length: Math.ceil(rulerWidthVw / 4) + 1 }, (_, i) => i),
    [rulerWidthVw]
  );

  const sharedBodyProps = (p, moonInner) => ({
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
    }${moonInner ? ' c5-body--orbiting' : ''}`,
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

  const renderCard = (p) => (
    <span className="c5-card" aria-hidden="true">
      <span className="c5-card__name">{p.name}</span>
      <span className="c5-card__blurb">{p.blurb}</span>
    </span>
  );

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

      {/* THE TRACK — wider than the viewport, panned via translateX */}
      <div
        ref={trackRef}
        className="c5-track"
        style={{ width: `${TRACK_VW}vw`, zIndex: Z_INDEX.FOREGROUND }}
      >
        {/* Word callouts: anchored dots + leader lines along the track */}
        {CALLOUT_WORDS.map((word, i) => {
          const p = (i + 0.5) / CALLOUT_WORDS.length;
          // Positioned so the word is screen-centered exactly when the
          // track progress reaches its anchor point.
          const leftVw = 50 + p * TRAVEL_VW;
          return (
            <span
              key={word + i}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              className="c5-word"
              style={{ left: `${leftVw}vw` }}
              aria-hidden="true"
            >
              {word}
              <i className="c5-word__line" />
              <i className="c5-word__dot" />
            </span>
          );
        })}

        {/* Planets: one slot per flagship, moons nested on orbit rotors */}
        {slots.map(({ project: p, layout, centerVw, moons }) => (
          <div
            key={p.id}
            className="c5-slot"
            style={{
              left: `${centerVw}vw`,
              top: `calc(50% + ${layout.yOffVh}vh)`,
              width: `${layout.sizeVw}vw`,
              height: `${layout.sizeVw}vw`,
            }}
          >
            <a {...sharedBodyProps(p, false)}>
              <img
                ref={(el) => {
                  if (el) spinTargets.current.set(p.id, { el, spinDur: layout.spinDur });
                  else spinTargets.current.delete(p.id);
                }}
                className="c5-body__img"
                src={resolveImage(p.imagePath)}
                alt=""
                loading="lazy"
                draggable="false"
              />
              {renderCard(p)}
            </a>

            {moons.map(({ project: m, layout: ml }) => (
              <div
                key={m.id}
                className="c5-rotor"
                ref={(rotor) => {
                  if (!rotor) {
                    orbitTargets.current.delete(m.id);
                    return;
                  }
                  const inner = rotor.querySelector('.c5-rotor__seat');
                  orbitTargets.current.set(m.id, {
                    rotor,
                    inner,
                    orbitDur: ml.orbitDur,
                    orbitPhase: ml.orbitPhase,
                  });
                }}
              >
                <div
                  className="c5-rotor__seat"
                  style={{ width: `${ml.sizeVw}vw`, height: `${ml.sizeVw}vw` }}
                >
                  <a {...sharedBodyProps(m, true)}>
                    <img
                      ref={(el) => {
                        if (el) spinTargets.current.set(m.id, { el, spinDur: ml.spinDur });
                        else spinTargets.current.delete(m.id);
                      }}
                      className="c5-body__img"
                      src={resolveImage(m.imagePath)}
                      alt=""
                      loading="lazy"
                      draggable="false"
                    />
                    {renderCard(m)}
                  </a>
                </div>
              </div>
            ))}
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
