import React, { useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAnimationStore } from '../engine/animationStore';

interface SectionProgressOptions {
  start?: string;
  end?: string;
}

/**
 * Hook to track scroll progress for a specific section.
 * Automatically synchronizes current section name and progress to the global store when active.
 *
 * @param ref Element reference of the section.
 * @param sectionId Unique identifier string for the section.
 * @param options ScrollTrigger configuration triggers (start, end).
 */
export const useSectionProgress = (
  ref: React.RefObject<HTMLElement | null>,
  sectionId: string,
  options: SectionProgressOptions = {}
) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Use full viewport dimensions by default since chapters are fullscreen
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: options.start || 'top top',
      end: options.end || 'bottom top',
      onUpdate: (self) => {
        const currentProgress = self.progress;
        setProgress(currentProgress);

        // Update global active section status in the store
        if (self.isActive) {
          useAnimationStore.getState().setActiveSection(sectionId, currentProgress);
        }
      },
      onToggle: (self) => {
        if (self.isActive) {
          useAnimationStore.getState().setActiveSection(sectionId, self.progress);
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, [ref, sectionId, options.start, options.end]);

  return progress;
};

export default useSectionProgress;
