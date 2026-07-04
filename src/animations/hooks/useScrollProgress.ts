import { useAnimationStore } from '../engine/animationStore';

/**
 * Hook to retrieve the global scroll state.
 * Returns progress (0-1), velocity, and direction.
 */
export const useScrollProgress = () => {
  return useAnimationStore((state) => ({
    globalProgress: state.globalProgress,
    scrollVelocity: state.scrollVelocity,
    scrollDirection: state.scrollDirection,
  }));
};

export default useScrollProgress;
