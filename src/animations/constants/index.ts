/**
 * Reusable animation constants for Project COSMOS.
 * Ensures consistent timing, easings, and layers across chapters.
 */

// Cosmic Easing: "Slow-in, settle" (custom-ease or power4.out matching cubic-bezier(0.16, 1, 0.3, 1))
export const EASE_COSMIC = 'power4.out';
export const EASE_SETTLE = 'power3.out';
export const EASE_DRIFT = 'power1.inOut';
export const EASE_SNAP = 'back.out(1.7)';

// Timing Durations (in seconds)
export const DUR_FAST = 0.3;
export const DUR_MED = 0.6;
export const DUR_SLOW = 1.2;
export const DUR_CINEMATIC = 2.0;

// Parallax multipliers
export const PARALLAX_SLOW = 0.2;
export const PARALLAX_MED = 0.5;
export const PARALLAX_FAST = 0.8;

// Scroll thresholds
export const SCROLL_THRESHOLD = 0.005;

// Layer depth z-indices
export const Z_INDEX = {
  BACKGROUND: 0,
  MIDGROUND: 10,
  FOREGROUND: 20,
  UI_LAYER: 30,
  OVERLAY: 40,
  MODAL: 50,
};
