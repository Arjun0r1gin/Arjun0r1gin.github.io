import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAnimationReady } from './useAnimationReady';

interface PinnedTimelineOptions {
  start?: string;
  end?: string;
  timelineConfig?: gsap.TimelineVars;
  scrollTriggerConfig?: Omit<gsap.plugins.ScrollTriggerStaticVars, 'trigger' | 'pin' | 'scrub' | 'start' | 'end'>;
}

/**
 * Hook to set up a pinned and scroll-scrubbed GSAP timeline.
 * Handles timeline creation and automatic cleanup (killing ScrollTriggers/instances) on unmount.
 *
 * @param ref Element reference of the section to pin.
 * @param options Timing, start/end bounds, and GSAP/ScrollTrigger overrides.
 */
export const usePinnedTimeline = (
  ref: React.RefObject<HTMLElement | null>,
  options: PinnedTimelineOptions = {}
) => {
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isReady = useAnimationReady();

  useEffect(() => {
    if (!isReady) return;
    const element = ref.current;
    if (!element) return;

    // Create the pinned and scrubbed timeline
    const tl = gsap.timeline({
      ...options.timelineConfig,
      scrollTrigger: {
        trigger: element,
        pin: true,
        scrub: true,
        start: options.start || 'top top',
        end: options.end || 'bottom top',
        ...options.scrollTriggerConfig,
      },
    });

    timelineRef.current = tl;
    setTimeline(tl);

    // Cleanup on unmount
    return () => {
      if (timelineRef.current) {
        // Killing the timeline also kills its associated ScrollTrigger
        timelineRef.current.kill();
        timelineRef.current = null;
        setTimeline(null);
      }
    };
  }, [ref, options.start, options.end, isReady]);

  return timeline;
};

export default usePinnedTimeline;
