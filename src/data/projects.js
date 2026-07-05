/**
 * DATA CONTRACT — Chapter 5 "Mission Control" planetary belt.
 *
 * Every entry in this array becomes one celestial body in the belt.
 * The belt component (Chapter5MissionControl) derives ALL layout from this
 * array — x-position, scale, vertical drift, spin speed — from each entry's
 * index and size. Nothing is hand-placed per id.
 *
 * Shape:
 * {
 *   id:             string  — unique slug, used as React key + moon parent ref
 *   name:           string  — display name shown on the info card
 *   size:           "flagship" | "moon"
 *                     flagship → large planet, gets its own slot on the track
 *                     moon     → small body that orbits its parent planet
 *   accentColor:    string  — CSS color (use design tokens, e.g. var(--ember))
 *   blurb:          string  — one/two sentence mission summary for the card
 *   githubUrl:      string  — opened in a new tab on click / Enter / Space
 *   imagePath:      string  — path under /src/assets/planets/ (resolved via
 *                             import.meta.glob in the component, so it works
 *                             in both dev and production builds)
 *   orbitsParentId: string? — REQUIRED for moons: the id of the flagship this
 *                             moon orbits. Omit for flagships.
 * }
 *
 * TO ADD A PROJECT: append an object here (and drop its image in
 * src/assets/planets/). No animation code changes are needed — the track
 * width, slot positions, and pin distance all recompute from array length.
 */
export const projects = [
  {
    id: 'rakshastra',
    name: 'RAKSHASTRA v3.0',
    size: 'flagship',
    accentColor: 'var(--signal-teal)',
    blurb:
      'Satellite ground-segment cyber defense system using real TLE orbital data, a from-scratch SGP4 propagator, and per-satellite ML anomaly detection.',
    githubUrl: '#',
    imagePath: '/src/assets/planets/rakshastra.png',
  },
  {
    id: 'epsat',
    name: 'EP-SAT',
    size: 'flagship',
    accentColor: 'var(--ember)',
    blurb:
      'CanSat flight software for the IN-SPACe Student CanSat Program — telemetry, state machines, and recovery logic validated through Preliminary Design Review.',
    githubUrl: '#',
    imagePath: '/src/assets/planets/epsat.png',
  },
  {
    id: 'cyberlab',
    name: 'CyberLab',
    size: 'flagship',
    accentColor: 'var(--signal-teal)',
    blurb:
      'Multi-phase SOC simulation platform: staged attack scenarios, live log pipelines, and analyst triage workflows for blue-team training.',
    githubUrl: '#',
    imagePath: '/src/assets/planets/cyberlab.png',
  },
  {
    id: 'guardcharge',
    name: 'GuardCharge',
    size: 'moon',
    orbitsParentId: 'cyberlab',
    accentColor: 'var(--ember)',
    blurb:
      'EV charging station trust-scoring system using RSA challenge-response plus behavioral fingerprinting to flag rogue chargers.',
    githubUrl: '#',
    imagePath: '/src/assets/planets/guardcharge.png',
  },
  {
    id: 'eznotes',
    name: 'EZ Notes 2.0',
    size: 'moon',
    orbitsParentId: 'rakshastra',
    accentColor: 'var(--signal-teal)',
    blurb:
      'Deployed note-taking PWA with Gemini API integration for summarization and recall — shipped, installable, with real daily users.',
    githubUrl: '#',
    imagePath: '/src/assets/planets/eznotes.png',
  },
];

export default projects;
