import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAnimationReady } from './useAnimationReady';

gsap.registerPlugin(ScrollTrigger);

interface PinnedTimelineOptions {
  /** ScrollTrigger start string, e.g. "top top" */
  start?: string;
  /**
   * ScrollTrigger end — either a GSAP string (e.g. "+=3840") or a
   * function that returns one. The function is stored in a ref so it
   * can change identity each render without causing effect re-runs.
   */
  end?: string | (() => string | number);
  timelineConfig?: gsap.TimelineVars;
  scrollTriggerConfig?: Omit<
    ScrollTrigger.Vars,
    'trigger' | 'pin' | 'scrub' | 'start' | 'end'
  >;
}

/**
 * Creates a single pinned, scrub-tied GSAP timeline bound to `ref`.
 * Returns the timeline (via state) so downstream effects re-run once
 * the timeline is ready, without triggering any further re-renders.
 *
 * Safe to use without React.StrictMode. Do NOT use inside StrictMode —
 * the double-invoke will create two ScrollTriggers on the same element.
 */
export const usePinnedTimeline = (
  ref: React.RefObject<HTMLElement | null>,
  options: PinnedTimelineOptions = {}
) => {
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);
  const isReady = useAnimationReady();

  // Keep latest option values in refs so the effect dep-array stays stable.
  const endRef      = useRef(options.end);
  const startRef    = useRef(options.start);
  const stConfigRef = useRef(options.scrollTriggerConfig);
  const tlConfigRef = useRef(options.timelineConfig);

  // Keep option refs current without triggering re-runs.
  endRef.current      = options.end;
  startRef.current    = options.start;
  stConfigRef.current = options.scrollTriggerConfig;
  tlConfigRef.current = options.timelineConfig;

  useEffect(() => {
    if (!isReady) return;
    const element = ref.current;
    if (!element) return;

    const tl = gsap.timeline({
      ...tlConfigRef.current,
      scrollTrigger: {
        trigger: element,
        pin: true,
        scrub: 0.8, // Smoothing factor for buttery scroll tracking
        start: startRef.current ?? 'top top',
        end:   endRef.current   ?? 'bottom top',
        invalidateOnRefresh: true,
        anticipatePin: 1,
        ...stConfigRef.current,
      },
    });

    setTimeline(tl);

    return () => {
      tl.kill();
      setTimeline(null);
    };
    // Only re-run if the animation system becomes ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  return timeline;
};

export default usePinnedTimeline;
