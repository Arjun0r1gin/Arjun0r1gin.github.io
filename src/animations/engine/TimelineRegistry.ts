import gsap from 'gsap';
import { useAnimationStore } from './animationStore';

/**
 * Reusable Registry for managing GSAP Timeline instances.
 * Stores raw instances in a Map to avoid React re-renders, while
 * mirroring the registration keys in the Zustand store for reactive queries.
 */
export class TimelineRegistry {
  private static timelines = new Map<string, gsap.core.Timeline>();

  public static register(id: string, timeline: gsap.core.Timeline): void {
    if (this.timelines.has(id)) {
      const prev = this.timelines.get(id);
      prev?.kill();
    }
    this.timelines.set(id, timeline);
    useAnimationStore.getState().registerTimelineId(id);
  }

  public static unregister(id: string): void {
    const timeline = this.timelines.get(id);
    if (timeline) {
      timeline.kill();
      this.timelines.delete(id);
    }
    useAnimationStore.getState().unregisterTimelineId(id);
  }

  public static get(id: string): gsap.core.Timeline | undefined {
    return this.timelines.get(id);
  }

  public static pause(id: string): void {
    this.timelines.get(id)?.pause();
  }

  public static resume(id: string): void {
    this.timelines.get(id)?.resume();
  }

  public static play(id: string): void {
    this.timelines.get(id)?.play();
  }

  public static kill(id: string): void {
    this.unregister(id);
  }

  public static getGsapVersion(): string {
    return gsap.version;
  }

  public static killAll(): void {
    this.timelines.forEach((tl) => tl.kill());
    this.timelines.clear();
    
    // Clean up IDs in Zustand store
    const registeredIds = [...useAnimationStore.getState().registeredTimelineIds];
    registeredIds.forEach((id) => {
      useAnimationStore.getState().unregisterTimelineId(id);
    });
  }
}
export default TimelineRegistry;
