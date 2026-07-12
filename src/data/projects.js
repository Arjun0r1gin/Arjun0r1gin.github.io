export const projects = [
  {
    id: 'rakshastra',
    name: 'RAKSHASTRA',
    size: 'flagship',
    accentColor: 'var(--signal-teal)',
    blurb:
      'Satellite ground-segment cyber defense system using real TLE orbital data, a from-scratch SGP4 propagator, and per-satellite ML anomaly detection.',
    githubUrl: 'https://github.com/Arjun0r1gin/RAKSHASTRA',
    imagePath: '/src/assets/planets/rakshastra.png',
  },
  {
    id: 'eznotes',
    name: 'EZ Notes',
    size: 'moon',
    orbitsParentId: 'rakshastra',
    accentColor: 'var(--signal-teal)',
    blurb:
      'Deployed note-taking PWA with Gemini API integration for summarization and recall — shipped, installable, with real daily users.',
    githubUrl: 'https://github.com/Arjun0r1gin/EZ-NOTES',
    imagePath: '/src/assets/planets/eznotes.png',
  },
  {
    id: 'epsat',
    name: 'EP-SAT',
    size: 'flagship',
    accentColor: 'var(--ember)',
    blurb:
      'CanSat flight software for the IN-SPACe Student CanSat Program — telemetry, state machines, and recovery logic validated through Preliminary Design Review.',
    githubUrl: 'https://github.com/Arjun0r1gin/EP-SAT',
    imagePath: '/src/assets/planets/epsat.png',
  },
  {
    id: 'cyberlab',
    name: 'CyberLab',
    size: 'flagship',
    accentColor: 'var(--signal-teal)',
    blurb:
      'Multi-phase SOC simulation platform: staged attack scenarios, live log pipelines, and analyst triage workflows for blue-team training.',
    githubUrl: 'https://github.com/Arjun0r1gin/CyberLab',
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
    id: 'orbit-alert',
    name: 'OrbitAlert',
    size: 'flagship',
    accentColor: 'var(--ember)',
    blurb:
      'Modular shell scripting ground alerts that parse incoming telemetry streams, flagging latency anomalies and command execution failures.',
    githubUrl: '#',
    imagePath: '/src/assets/planets/epsat.png',
  },
  {
    id: 'telemetry-db',
    name: 'MIDI-THEREMIN',
    size: 'moon',
    orbitsParentId: 'cyberlab',
    accentColor: 'var(--signal-teal)',
    blurb:
      'MIDI - THEREMIN\nA gesture-controlled, contact-free MIDI controller. Move your hands in the air, an Arduino tracks them with ultrasonic sensors, and the result comes out as real MIDI playable through any DAW, on any virtual instrument.',
    githubUrl: 'https://github.com/Arjun0r1gin/MIDI-THEREMIN',
    imagePath: '/src/assets/planets/eznotes.png',
  },
  {
    id: 'payload-triage',
    name: 'JALTANTRA',
    size: 'flagship',
    accentColor: 'var(--signal-teal)',
    blurb:
      'jaltantra is an IoT + AI powered smart irrigation system designed to optimise water usage in agriculture.\nIt predicts rainfall, monitors soil and water levels, and automates irrigation decisions in real-time.',
    githubUrl: 'https://github.com/Scam0p/JalaTantra',
    imagePath: '/src/assets/planets/rakshastra.png',
  },
];

export default projects;
