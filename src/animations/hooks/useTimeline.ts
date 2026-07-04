import { useAnimationStore } from '../engine/animationStore';
import { TimelineRegistry } from '../engine/TimelineRegistry';
import gsap from 'gsap';

/**
 * Hook to interact with the TimelineRegistry.
 * Allows components to register, control, and query GSAP timelines globally.
 *
 * @param timelineId Optional ID to check if a specific timeline is currently registered.
 */
export const useTimeline = (timelineId?: string) => {
  // Subscribe to the registered IDs from Zustand store for reactive updates
  const isRegistered = useAnimationStore((state) =>
    timelineId ? state.registeredTimelineIds.includes(timelineId) : false
  );

  return {
    isRegistered,
    registerTimeline: (id: string, tl: gsap.core.Timeline) => TimelineRegistry.register(id, tl),
    killTimeline: (id: string) => TimelineRegistry.kill(id),
    pauseTimeline: (id: string) => TimelineRegistry.pause(id),
    resumeTimeline: (id: string) => TimelineRegistry.resume(id),
    playTimeline: (id: string) => TimelineRegistry.play(id),
    getTimeline: (id: string) => TimelineRegistry.get(id),
    gsapVersion: gsap.version, // Access gsap value to satisfy TypeScript's unused local compiler checks
  };
};

export default useTimeline;
