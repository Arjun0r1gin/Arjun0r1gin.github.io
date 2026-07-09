/**
 * src/data/devlogs.ts
 *
 * Placeholder dev-log entries for Chapter 6: Logs Archive.
 * Each entry maps to one asteroid in the parallax field.
 *
 * Replace summary content with real copy once dev-log writing is locked.
 * size: "small" | "medium" | "large" — controls asteroid visual scale.
 */

export interface DevLog {
  id: string;
  title: string;
  date: string;
  summary: string;
  size: 'small' | 'medium' | 'large';
  url: string;
  project?: string;
}

export const devlogs: DevLog[] = [
  {
    id: 'rakshastra-v1',
    title: 'RAKSHASTRA v1.0',
    date: '2024-03',
    summary:
      'Initial proof-of-concept for satellite ground-segment threat detection. ' +
      'Built a basic TLE ingestion pipeline and ran first anomaly-flagging tests ' +
      'against simulated telemetry. Confirmed the hypothesis that orbital-data ' +
      'patterns could expose injection attempts.',
    size: 'large',
    url: 'https://github.com/Arjun0r1gin/RAKSHASTRA',
    project: 'RAKSHASTRA',
  },
  {
    id: 'rakshastra-v2',
    title: 'RAKSHASTRA v2.0',
    date: '2024-08',
    summary:
      'Rewrote the anomaly-detection layer from scratch using a lightweight ' +
      'ML model trained on real orbital data. Replaced the rule-based flagging ' +
      'engine with a probability-weighted scoring system. First live test against ' +
      'public TLE feeds returned 94% precision on synthetic injections.',
    size: 'large',
    url: 'https://github.com/Arjun0r1gin/RAKSHASTRA',
    project: 'RAKSHASTRA',
  },
  {
    id: 'rakshastra-v3',
    title: 'RAKSHASTRA v3.0',
    date: '2025-01',
    summary:
      'Production milestone. Integrated real orbital data from Celestrak, added ' +
      'a SOC-style dashboard interface, and hardened the ingestion pipeline against ' +
      'spoofed uplink frames. ML model re-trained on expanded dataset. Writeup ' +
      'submitted for internal review.',
    size: 'large',
    url: 'https://github.com/Arjun0r1gin/RAKSHASTRA',
    project: 'RAKSHASTRA',
  },
  {
    id: 'ep-sat-design',
    title: 'EP-SAT — Design Phase',
    date: '2024-06',
    summary:
      'Initiated embedded flight software design for a CanSat-class satellite. ' +
      'Defined sensor fusion architecture, selected RTOS, and produced the first ' +
      'draft of the interface control document. Telemetry packet format locked.',
    size: 'medium',
    url: 'https://github.com/Arjun0r1gin/EP-SAT',
    project: 'EP-SAT',
  },
  {
    id: 'ep-sat-pdr',
    title: 'EP-SAT — PDR Milestone',
    date: '2024-11',
    summary:
      'Preliminary Design Review validated. Flight software interfaces confirmed ' +
      'against hardware-in-loop test bench. Attitude-determination module passed ' +
      'simulation at ±2° accuracy. Launch campaign timeline set.',
    size: 'medium',
    url: 'https://github.com/Arjun0r1gin/EP-SAT',
    project: 'EP-SAT',
  },
  {
    id: 'powerhouse-tech',
    title: 'Powerhouse Tech — Co-Founded',
    date: '2024-04',
    summary:
      'Co-founded a digital solutions agency focused on security tooling and ' +
      'embedded systems. First client project delivered: a network monitoring ' +
      'dashboard for a local ISP. Established Linux-first development workflow ' +
      'across the team.',
    size: 'small',
    url: 'https://github.com/Arjun0r1gin',
    project: 'POWERHOUSE',
  },
];

export default devlogs;
