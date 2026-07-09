import React, { createContext, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { useAnimationStore } from '../animations/engine/animationStore';
import { TimelineRegistry } from '../animations/engine/TimelineRegistry';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Configure ScrollTrigger mobile normalizations
ScrollTrigger.config({ ignoreMobileResize: true });

// Configure ScrollTrigger defaults
ScrollTrigger.defaults({
  markers: false,
});

export const AnimationContext = createContext<{
  lenis: Lenis | null;
}>({
  lenis: null,
});

interface AnimationProviderProps {
  children: React.ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const store = useAnimationStore();

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,             // Buttery smooth physics-based inertia
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,   // Standard wheel sensitivity
      touchMultiplier: 1.0,   // Standard touch/trackpad sensitivity
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // 2. Sync Lenis scrolling events with ScrollTrigger
    lenis.on('scroll', (e: any) => {
      ScrollTrigger.update();
      
      // Update global scroll state in Zustand store
      store.setScrollState(
        e.progress,
        e.velocity,
        e.direction as (1 | -1 | 0)
      );
    });

    // 3. Connect GSAP ticker to drive Lenis updates
    const tickerCallback = (time: number) => {
      // lenis.raf expects time in milliseconds
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // 4. Expose prefers-reduced-motion configuration
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    store.setReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      store.setReducedMotion(e.matches);
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // 5. Handle document visibility changes (CPU performance optimizer)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lenis.stop();
        gsap.ticker.sleep();
      } else {
        lenis.start();
        gsap.ticker.wake();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 6. Signal that the animation system is fully ready
    store.setReady(true);

    // Cleanup on unmount
    return () => {
      store.setReady(false);
      
      // Stop and destroy Lenis
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
      
      // Remove ticker callback and clean up GSAP/ScrollTrigger
      gsap.ticker.remove(tickerCallback);
      ScrollTrigger.killAll();
      TimelineRegistry.killAll();
      
      // Remove listeners
      motionQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <AnimationContext.Provider value={{ lenis: lenisInstance }}>
      {children}
    </AnimationContext.Provider>
  );
};

export default AnimationProvider;
