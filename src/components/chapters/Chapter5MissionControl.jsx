import React, { useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePinnedTimeline } from '../../animations/hooks/usePinnedTimeline';

gsap.registerPlugin(ScrollTrigger);
import { useReducedMotion } from '../../animations/hooks/useReducedMotion';
import { useViewport } from '../../animations/hooks/useViewport';
import { Z_INDEX } from '../../animations/constants';
import { AnimationContext } from '../../providers/AnimationProvider';
import { useCms } from '../../providers/CmsProvider';
import ResolvedImage from '../common/ResolvedImage';
import { ParallaxStars } from '../common/ParallaxStars';
import { FuzzyText } from '../common/FuzzyText';
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
 * The track is 340vw wide. The camera must travel (track.scrollWidth -
 * viewport.width) pixels to bring every planet into view.
 * We supply `end` as a function so GSAP evaluates it at setup AND on
 * every invalidateOnRefresh, giving a pixel-accurate pin duration that
 * adapts to any viewport size without any React re-render involvement.
 * ------------------------------------------------------------------ */
const TRACK_VW = 340;
const TRAVEL_VW = TRACK_VW - 100; // 240 — fallback for pre-mount estimate

// Background grid + ruler move at a slower rate than the planet track
// for parallax depth (distant backdrop).
const GRID_PARALLAX = 0.4;

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export default function Chapter5MissionControl() {
  const reducedMotion = useReducedMotion();
  const { width } = useViewport();

  // Fallback is only used if the user explicitly prefers reduced motion.
  // The full interactive horizontal belt scrolls on all mobile viewports.
  const useFallback = reducedMotion;

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
  const { projects } = useCms();
  const { width } = useViewport();
  const isMobile = width < 768;
  const trackVw = isMobile ? 260 : 340;
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const gridRef = useRef(null);
  const rulerRef = useRef(null);
  const windowRef = useRef(null);
  const softwareTitleRef = useRef(null);
  const hardwareTitleRef = useRef(null);
  const currentCategoryRef = useRef('software');

  const spinTargets = useRef(new Map()); // id -> { el, spinDur }
  const bodyEls = useRef(new Map()); // id -> focusable element
  const [activeId, setActiveId] = useState(null);
  const [activeCategoryState, setActiveCategoryState] = useState('software');

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeId);
  }, [activeId, projects]);

  const triggerCategoryCrossfade = useCallback((activeCategory) => {
    setActiveCategoryState(activeCategory);
    const softEl = softwareTitleRef.current;
    const hardEl = hardwareTitleRef.current;
    if (!softEl || !hardEl) return;

    const softUnderline = softEl.querySelector('.c5-category-underline');
    const hardUnderline = hardEl.querySelector('.c5-category-underline');

    if (activeCategory === 'software') {
      gsap.to(softEl, {
        color: '#00ff00',
        opacity: 1,
        scale: 1,
        fontWeight: '700',
        textShadow: '0 0 10px rgba(0, 255, 0, 0.8), 0 0 20px rgba(0, 255, 0, 0.4)',
        duration: 1,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      if (softUnderline) {
        gsap.to(softUnderline, {
          scaleX: 1,
          opacity: 0.85,
          duration: 1,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        softUnderline.classList.add('c5-category-underline--pulse');
      }

      gsap.to(hardEl, {
        color: '#006600',
        opacity: 0.35,
        scale: 0.95,
        fontWeight: '400',
        textShadow: 'none',
        duration: 1,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      if (hardUnderline) {
        gsap.to(hardUnderline, {
          scaleX: 0,
          opacity: 0,
          duration: 1,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        hardUnderline.classList.remove('c5-category-underline--pulse');
      }
    } else {
      gsap.to(hardEl, {
        color: '#00ff00',
        opacity: 1,
        scale: 1,
        fontWeight: '700',
        textShadow: '0 0 10px rgba(0, 255, 0, 0.8), 0 0 20px rgba(0, 255, 0, 0.4)',
        duration: 1,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      if (hardUnderline) {
        gsap.to(hardUnderline, {
          scaleX: 1,
          opacity: 0.85,
          duration: 1,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        hardUnderline.classList.add('c5-category-underline--pulse');
      }

      gsap.to(softEl, {
        color: '#006600',
        opacity: 0.35,
        scale: 0.95,
        fontWeight: '400',
        textShadow: 'none',
        duration: 1,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      if (softUnderline) {
        gsap.to(softUnderline, {
          scaleX: 0,
          opacity: 0,
          duration: 1,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        softUnderline.classList.remove('c5-category-underline--pulse');
      }
    }
  }, []);

  const handleScrollUpdate = useCallback((self) => {
    const track = trackRef.current;
    if (!track) return;
    const bodies = track.querySelectorAll('.c5-body');
    if (!bodies.length) return;

    let closestIndex = 0;
    let minDistance = Infinity;
    const centerX = window.innerWidth / 2;

    bodies.forEach((body, index) => {
      const rect = body.getBoundingClientRect();
      const bodyCenterX = rect.left + rect.width / 2;
      const distance = Math.abs(bodyCenterX - centerX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    const activeCategory = closestIndex <= 5 ? 'software' : 'hardware';

    if (currentCategoryRef.current !== activeCategory) {
      currentCategoryRef.current = activeCategory;
      triggerCategoryCrossfade(activeCategory);
    }
  }, [triggerCategoryCrossfade]);

  // ONE ScrollTrigger pins the section and scrubs the shared timeline.
  // `end` is a function so GSAP evaluates the pixel distance at setup
  // AND on every resize/invalidateOnRefresh — always pixel-perfect.
  const timeline = usePinnedTimeline(sectionRef, {
    start: 'top top',
    end: () => {
      const track = trackRef.current;
      const isMobileDevice = window.innerWidth < 768;
      const fallbackTravelVw = isMobileDevice ? 160 : 240;
      if (!track) return `+=${Math.round(window.innerWidth * (fallbackTravelVw / 100))}`;
      return `+=${Math.max(track.scrollWidth - window.innerWidth, 0)}`;
    },
    scrollTriggerConfig: {
      onUpdate: (self) => {
        handleScrollUpdate(self);
      }
    }
  });

  const scrollToCategory = useCallback((category) => {
    const st = timeline?.scrollTrigger;
    const track = trackRef.current;
    if (!st || !track) return;

    const targetId = category === 'software' ? 'rakshastra' : 'telemetry-db';
    const el = bodyEls.current.get(targetId);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const trackLeft = track.getBoundingClientRect().left;

    const centerInTrack = rect.left + rect.width / 2 - trackLeft;
    const travel = Math.max(track.scrollWidth - vw, 0);
    const targetX = clamp(centerInTrack - vw / 2, 0, travel);
    const progress = travel > 0 ? targetX / travel : 0;
    const scrollY = st.start + progress * (st.end - st.start);

    if (lenis) {
      lenis.scrollTo(scrollY, {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else {
      window.scrollTo({ top: scrollY, behavior: 'smooth' });
    }
  }, [timeline, lenis]);

  /* ---- The core mechanic: scroll progress -> track translateX ---- */
  useEffect(() => {
    triggerCategoryCrossfade('software');
    if (!timeline) return;
    const track = trackRef.current;
    const grid = gridRef.current;
    const ruler = rulerRef.current;
    const windowEl = windowRef.current;
    const softwareTitleEl = softwareTitleRef.current;
    const hardwareTitleEl = hardwareTitleRef.current;
    if (!track || !grid || !ruler || !windowEl || !softwareTitleEl || !hardwareTitleEl) return;

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

    // Dynamic background color transition inside the horizontal window
    timeline.to(
      windowEl,
      {
        backgroundColor: '#1c152a', // Deep cosmic indigo/purple in the middle
        duration: 0.5,
        ease: 'none',
      },
      0
    );
    timeline.to(
      windowEl,
      {
        backgroundColor: '#020205', // Solid black at the end
        duration: 0.5,
        ease: 'none',
      },
      0.5
    );

    // Entry reveal ScrollTrigger: pops the title as the section scrolls into view
    let entryST = null;
    const titleEl = document.querySelector('.c5-title');
    if (titleEl) {
      // Set initial values
      gsap.set(titleEl, { opacity: 0, scale: 0.8, y: 35, transformOrigin: 'center bottom' });

      entryST = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom', // Starts when the top of Chapter 5 enters the bottom of viewport
        end: 'top 5%',       // Completes just before it pins
        scrub: 0.5,
        animation: gsap.to(
          titleEl,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            ease: 'back.out(2)', // springy bounce pop-out
          }
        )
      });
    }

    // Fade out the entire category header near the end of scroll
    timeline.to(
      '.c5-category-header',
      { opacity: 0, y: -20, ease: 'power2.in', duration: 0.15 },
      0.85
    );

    return () => {
      timeline.clear();
      if (entryST) entryST.kill();
    };
  }, [timeline, triggerCategoryCrossfade, handleScrollUpdate]);

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
    const positions = isMobile 
      ? [15, 45, 75, 105, 135, 165, 195, 225]
      : [15, 55, 95, 135, 175, 215, 260, 310];
      
    const sizes = isMobile
      ? [20, 7, 13, 19, 14, 20, 8, 22] // Reduced sizes for mobile
      : [32, 10, 20, 30, 22, 32, 11, 34];
      
    const verticalOffsets = isMobile
      ? [-4, 4, -4, 4, -4, 4, -4, 4] // Reduced vertical offsets
      : [-7, 7, -7, 7, -7, 7, -7, 7];

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
  }, [projects, isMobile]);

  // Ruler ticks: one every 4vw across the ruler strip.
  const rulerWidthVw = trackVw * GRID_PARALLAX + 100;
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
    onMouseEnter: () => {
      if (window.innerWidth >= 768) {
        setActiveId(p.id);
      }
    },
    onMouseLeave: () => {
      if (window.innerWidth >= 768) {
        setActiveId((cur) => (cur === p.id ? null : cur));
      }
    },
    onFocus: () => {
      setActiveId(p.id);
      revealBody(p.id);
    },
    onBlur: () => {
      if (window.innerWidth >= 768) {
        setActiveId((cur) => (cur === p.id ? null : cur));
      }
    },
    onClick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.innerWidth < 768) {
        if (activeId === p.id) {
          openMission(p.githubUrl);
        } else {
          setActiveId(p.id);
          revealBody(p.id);
        }
      } else {
        openMission(p.githubUrl);
      }
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
      onClick={() => {
        if (window.innerWidth < 768) {
          setActiveId(null);
        }
      }}
    >
      {/* Dynamic sticky Category Header */}
      <div className="c5-category-header">
        <h3
          ref={softwareTitleRef}
          className="c5-category-title c5-category-title--software"
          onClick={() => scrollToCategory('software')}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              scrollToCategory('software');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Navigate to Software Projects"
        >
          <span className="c5-desktop-text" style={{ pointerEvents: 'none' }}>
            <FuzzyText
              fontSize="clamp(1.1rem, 2.2vw, 1.45rem)"
              fontWeight={activeCategoryState === 'software' ? 700 : 400}
              fontFamily="'Rubik Glitch', system-ui"
              color={activeCategoryState === 'software' ? '#00ff00' : '#006600'}
              baseIntensity={activeCategoryState === 'software' ? 0.2 : 0.08}
              hoverIntensity={0.5}
              fuzzRange={5}
              clickEffect={true}
              transitionDuration={150}
              direction="both"
            >
              SOFTWARE PROJECTS
            </FuzzyText>
          </span>
          <span className="c5-mobile-text" style={{ pointerEvents: 'none' }}>
            <FuzzyText
              fontSize="clamp(1.1rem, 2.2vw, 1.45rem)"
              fontWeight={activeCategoryState === 'software' ? 700 : 400}
              fontFamily="'Rubik Glitch', system-ui"
              color={activeCategoryState === 'software' ? '#00ff00' : '#006600'}
              baseIntensity={activeCategoryState === 'software' ? 0.2 : 0.08}
              hoverIntensity={0.5}
              fuzzRange={5}
              clickEffect={true}
              transitionDuration={150}
              direction="both"
            >
              SOFTWARE
            </FuzzyText>
          </span>
          <div className="c5-category-underline" />
        </h3>
        <div className="c5-category-divider">|</div>
        <h3
          ref={hardwareTitleRef}
          className="c5-category-title c5-category-title--hardware"
          onClick={() => scrollToCategory('hardware')}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              scrollToCategory('hardware');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Navigate to Hardware Projects"
        >
          <span className="c5-desktop-text" style={{ pointerEvents: 'none' }}>
            <FuzzyText
              fontSize="clamp(1.1rem, 2.2vw, 1.45rem)"
              fontWeight={activeCategoryState === 'hardware' ? 700 : 400}
              fontFamily="'Rubik Glitch', system-ui"
              color={activeCategoryState === 'hardware' ? '#00ff00' : '#006600'}
              baseIntensity={activeCategoryState === 'hardware' ? 0.2 : 0.08}
              hoverIntensity={0.5}
              fuzzRange={5}
              clickEffect={true}
              transitionDuration={150}
              direction="both"
            >
              HARDWARE PROJECTS
            </FuzzyText>
          </span>
          <span className="c5-mobile-text" style={{ pointerEvents: 'none' }}>
            <FuzzyText
              fontSize="clamp(1.1rem, 2.2vw, 1.45rem)"
              fontWeight={activeCategoryState === 'hardware' ? 700 : 400}
              fontFamily="'Rubik Glitch', system-ui"
              color={activeCategoryState === 'hardware' ? '#00ff00' : '#006600'}
              baseIntensity={activeCategoryState === 'hardware' ? 0.2 : 0.08}
              hoverIntensity={0.5}
              fuzzRange={5}
              clickEffect={true}
              transitionDuration={150}
              direction="both"
            >
              HARDWARE
            </FuzzyText>
          </span>
          <div className="c5-category-underline" />
        </h3>
      </div>

      {/* Horizontal window block framed by solid black top/bottom blocks */}
      <div ref={windowRef} className="c5-window">

        {/* Distant backdrop: blueprint grid, slow parallax layer */}
        <div
          ref={gridRef}
          className="c5-grid-container"
          style={{ width: `${rulerWidthVw}vw`, zIndex: Z_INDEX.BACKGROUND }}
          aria-hidden="true"
        >
          {/* Parallax stars scrolling background */}
          <ParallaxStars speed={0.5} zIndex={1} opacity={0.9} />
          <div className="c5-grid-3d" />
        </div>

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
          style={{ width: `${trackVw}vw`, zIndex: Z_INDEX.FOREGROUND }}
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
                <ResolvedImage
                  ref={(el) => {
                    if (el) spinTargets.current.set(p.id, { el, spinDur });
                    else spinTargets.current.delete(p.id);
                  }}
                  className="c5-body__img"
                  srcPath={p.imagePath}
                  fallbackSrc={resolveImage(p.imagePath)}
                  alt=""
                  loading="lazy"
                  draggable="false"
                />
                {renderCard(p, yOffVh)}
              </a>

              {/* Permanent project title sitting below the planet */}
              <div className="c5-static-title">
                {p.name}
              </div>

              {/* Wix-style Connector Line and Label */}
              {renderConnectorAndLabel(p.id)}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile HUD panel rendered at the root level of BeltScene */}
      {activeProject && (
        <div className="c5-hud-panel" onClick={(e) => e.stopPropagation()}>
          <div className="c5-hud-panel__glow" style={{ backgroundColor: activeProject.accentColor }} />
          <div className="c5-hud-panel__border" style={{ borderColor: activeProject.accentColor }} />
          <div className="c5-hud-panel__header">
            <span className="c5-hud-panel__name">{activeProject.name}</span>
            {activeProject.orbitsParentId && (
              <span className="c5-hud-panel__tag" style={{ color: activeProject.accentColor }}>
                MOON OF {activeProject.orbitsParentId.toUpperCase()}
              </span>
            )}
          </div>
          <p className="c5-hud-panel__blurb">{activeProject.blurb}</p>
          <button
            className="c5-hud-panel__btn"
            style={{ 
              backgroundColor: activeProject.accentColor,
              boxShadow: `0 0 15px ${activeProject.accentColor}`
            }}
            onClick={() => openMission(activeProject.githubUrl)}
          >
            LAUNCH PROJECT
          </button>
        </div>
      )}
    </section>
  );
}

/* ================================================================== *
 * FALLBACK — stacked cards for <768px viewports and reduced motion.
 * No pin, no track, real page scroll. Hover/focus/click still work.
 * ================================================================== */
function FallbackList({ reducedMotion }) {
  const { projects } = useCms();
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
  }, [projects, reducedMotion]);

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
              <ResolvedImage
                className="c5f-card__img"
                srcPath={p.imagePath}
                fallbackSrc={resolveImage(p.imagePath)}
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
