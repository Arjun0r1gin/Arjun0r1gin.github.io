
export interface ScrollState {
  globalProgress: number;
  scrollVelocity: number;
  scrollDirection: 1 | -1 | 0;
  activeSection: string;
  activeSectionProgress: number;
}

export interface AnimationStoreState extends ScrollState {
  isReady: boolean;
  prefersReducedMotion: boolean;
  registeredTimelineIds: string[];
}

export interface AnimationStoreActions {
  setReady: (ready: boolean) => void;
  setScrollState: (progress: number, velocity: number, direction: 1 | -1 | 0) => void;
  setActiveSection: (sectionId: string, progress: number) => void;
  setReducedMotion: (prefers: boolean) => void;
  registerTimelineId: (id: string) => void;
  unregisterTimelineId: (id: string) => void;
}

export type AnimationStore = AnimationStoreState & AnimationStoreActions;
