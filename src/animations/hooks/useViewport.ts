import { useState, useEffect } from 'react';
import { debounce } from '../utils/performance';

/**
 * Hook to retrieve current viewport dimensions.
 * Includes a debounced resize listener to avoid performance spikes.
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = debounce(() => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 150); // 150ms debounce threshold

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return viewport;
};

export default useViewport;
