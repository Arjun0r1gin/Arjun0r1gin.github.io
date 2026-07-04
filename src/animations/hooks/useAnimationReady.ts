import { useAnimationStore } from '../engine/animationStore';

/**
 * Hook to check if the global animation system has finished initialization.
 * Useful for mounting animations or delaying transitions until Lenis/GSAP are ready.
 */
export const useAnimationReady = () => {
  return useAnimationStore((state) => state.isReady);
};

export default useAnimationReady;
