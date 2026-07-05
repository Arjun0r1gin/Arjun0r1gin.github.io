/**
 * src/lib/scroll.ts
 *
 * Centralised re-export of gsap + ScrollTrigger so all chapter files can
 * use a single, consistent import path and are guaranteed that the plugin
 * has been registered exactly once.
 *
 *   import { gsap, ScrollTrigger } from '../../lib/scroll';
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
