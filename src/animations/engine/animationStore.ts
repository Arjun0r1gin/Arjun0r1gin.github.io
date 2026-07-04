import { create } from 'zustand';
import type { AnimationStore } from '../../types/animation';

export const useAnimationStore = create<AnimationStore>((set) => ({
  // State
  isReady: false,
  globalProgress: 0,
  scrollVelocity: 0,
  scrollDirection: 0,
  activeSection: '',
  activeSectionProgress: 0,
  prefersReducedMotion: false,
  registeredTimelineIds: [],

  // Actions
  setReady: (ready) => set({ isReady: ready }),
  setScrollState: (progress, velocity, direction) =>
    set({
      globalProgress: progress,
      scrollVelocity: velocity,
      scrollDirection: direction,
    }),
  setActiveSection: (sectionId, progress) =>
    set({
      activeSection: sectionId,
      activeSectionProgress: progress,
    }),
  setReducedMotion: (prefers) => set({ prefersReducedMotion: prefers }),
  registerTimelineId: (id) =>
    set((state) => ({
      registeredTimelineIds: state.registeredTimelineIds.includes(id)
        ? state.registeredTimelineIds
        : [...state.registeredTimelineIds, id],
    })),
  unregisterTimelineId: (id) =>
    set((state) => ({
      registeredTimelineIds: state.registeredTimelineIds.filter((tId) => tId !== id),
    })),
}));
