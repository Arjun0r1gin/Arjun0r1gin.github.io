import { useEffect } from 'react';
import { AnimationProvider } from './providers/AnimationProvider';
import { gsap } from './lib/scroll';

import Chapter1Initialize from './components/chapters/Chapter1Initialize';
import Chapter2Transition from './components/chapters/Chapter2Transition';
import Chapter3Operator from './components/chapters/Chapter3Operator';
import Chapter5MissionControl from './components/chapters/Chapter5MissionControl';
import Chapter6LogsArchive from './components/chapters/Chapter6LogsArchive';
import Chapter8Docking from './components/chapters/Chapter8Docking';

function App() {
  useEffect(() => {
    const starsA = document.querySelector('.cosmos-universe-stars-a');
    const starsB = document.querySelector('.cosmos-universe-stars-b');
    const dust = document.querySelector('.cosmos-universe-dust');
    if (!starsA && !starsB && !dust) return;

    const ctx = gsap.context(() => {
      // Gentle vertical parallax drift relative to the scroll of the entire cosmic section
      if (starsA) {
        gsap.to(starsA, {
          y: '-130px',
          ease: 'none',
          scrollTrigger: {
            trigger: '.cosmos-universe-theme',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        });
      }
      if (starsB) {
        gsap.to(starsB, {
          y: '-90px',
          ease: 'none',
          scrollTrigger: {
            trigger: '.cosmos-universe-theme',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        });
      }
      if (dust) {
        gsap.to(dust, {
          y: '-50px',
          ease: 'none',
          scrollTrigger: {
            trigger: '.cosmos-universe-theme',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <AnimationProvider>
      {/* Chapter 1: Landing (Initialize Protocol) */}
      <div style={{ position: 'relative', zIndex: 5 }}>
        <Chapter1Initialize />
      </div>

      {/* Chapter 2: Cloud Veil Transition */}
      <div style={{ position: 'relative', zIndex: 5 }}>
        <Chapter2Transition />
      </div>

      {/* Cosmos Universe Theme Container */}
      <div className="cosmos-universe-theme">
        {/* Fixed high-performance cosmic backdrop */}
        <div className="cosmos-universe-bg">
          {/* Star Layer A (Twinkling alternatively) */}
          <div className="cosmos-universe-stars-a" />
          {/* Star Layer B (Twinkling alternatively) */}
          <div className="cosmos-universe-stars-b" />
          {/* Ambient cosmic dust overlay */}
          <div className="cosmos-universe-dust" />
        </div>

        {/* Chapter 3: Operator Profile */}
        <div style={{ position: 'relative', zIndex: 3 }}>
          <Chapter3Operator />
        </div>

        {/* Cinematic spacing buffer between profile console and planets grid */}
        <div style={{ height: '40vh', background: 'linear-gradient(to bottom, #000000 0%, #10211e 100%)', position: 'relative', zIndex: 3 }}>
          <h2 className="c5-title" style={{ bottom: '18vh', top: 'auto', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {"PUBLIC PROJECTS".split("").map((char, index) => (
              <span key={index} className="c5-title-letter">
                <span className="c5-title-letter-float">
                  {char === " " ? "\u00A0" : char}
                </span>
              </span>
            ))}
          </h2>
        </div>

        {/* Chapter 5: pinned horizontal-scroll planetary belt */}
        <div style={{ width: '100%', position: 'relative', zIndex: 3 }}>
          <Chapter5MissionControl />
        </div>

        {/* Chapter 6: Logs Archive — parallax asteroid field */}
        <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <Chapter6LogsArchive />
        </div>

        {/* Chapter 8: Docking Station — Connection */}
        <div style={{ position: 'relative', zIndex: 3 }}>
          <Chapter8Docking />
        </div>
      </div>
    </AnimationProvider>
  );
}

export default App;
