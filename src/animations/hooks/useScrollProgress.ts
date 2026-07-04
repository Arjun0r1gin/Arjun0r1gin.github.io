import { useShallow } from 'zustand/react/shallow';
import { useAnimationStore } from '../engine/animationStore';

/**
 * Hook to retrieve the global scroll state.
 * Returns progress (0-1), velocity, and direction.
 * Uses useShallow so the object selector doesn't create a new reference
 * every render (which causes an infinite update loop in zustand v5).
 */
export const useScrollProgress = () => {
  return useAnimationStore(
    useShallow((state) => ({
      globalProgress: state.globalProgress,
      scrollVelocity: state.scrollVelocity,
      scrollDirection: state.scrollDirection,
    }))
  );
};

export default useScrollProgress;
