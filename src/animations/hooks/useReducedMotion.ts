import { useAnimationStore } from '../engine/animationStore';

/**
 * Hook to check if the user has requested reduced motion at the OS level.
 * Updates reactively when preferences change during the session.
 */
export const useReducedMotion = () => {
  return useAnimationStore((state) => state.prefersReducedMotion);
};

export default useReducedMotion;
