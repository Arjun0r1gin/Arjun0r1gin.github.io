import { useEffect } from 'react';
import { AnimationProvider } from './providers/AnimationProvider';
import { gsap } from './lib/scroll';

import Chapter1Initialize from './components/chapters/Chapter1Initialize';
import Chapter2Transition from './components/chapters/Chapter2Transition';
import Chapter3Operator from './components/chapters/Chapter3Operator';
import Chapter5MissionControl from './components/chapters/Chapter5MissionControl';
import Chapter6LogsArchive from './components/chapters/Chapter6LogsArchive';
import Chapter8Docking from './components/chapters/Chapter8Docking';
import Chapter7Ticker from './components/chapters/Chapter7Ticker';
import { ParallaxStars } from './components/common/ParallaxStars';
import { FuzzyText } from './components/common/FuzzyText';

function App() {
  useEffect(() => {
    const starsA = document.querySelector('.stars-parallax-far');
    const starsB = document.querySelector('.stars-parallax-mid');
    const starsC = document.querySelector('.stars-parallax-near');
    const dust = document.querySelector('.cosmos-universe-dust');
    if (!starsA && !starsB && !starsC && !dust) return;

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
      if (starsC) {
        gsap.to(starsC, {
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
      if (dust) {
        gsap.to(dust, {
          y: '-30px',
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
          <ParallaxStars speed={0.8} zIndex={1} opacity={0.9} />
          {/* Ambient cosmic dust overlay */}
          <div className="cosmos-universe-dust" />
        </div>

        {/* Chapter 3: Operator Profile */}
        <div style={{ position: 'relative', zIndex: 3 }}>
          <Chapter3Operator />
        </div>

        {/* Cinematic spacing buffer between profile console and planets grid */}
        <div style={{ height: '40vh', background: 'linear-gradient(to bottom, #000000 0%, #10211e 100%)', position: 'relative', zIndex: 3, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '18vh', boxSizing: 'border-box' }}>
          <h2 className="c5-title" style={{ margin: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
            <FuzzyText
              fontSize="clamp(2.5rem, 8vw, 5.5rem)"
              fontWeight={900}
              fontFamily="'Outfit', sans-serif"
              color="#ffffff"
              baseIntensity={0.15}
              hoverIntensity={0.5}
              fuzzRange={15}
              clickEffect={true}
              transitionDuration={200}
              direction="both"
            >
              PUBLIC PROJECTS
            </FuzzyText>
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

        {/* Chapter 7: Ticker tape text scroll ribbon */}
        <div style={{ width: '100%', position: 'relative', zIndex: 3 }}>
          <Chapter7Ticker />
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
