import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../../animations/hooks/useReducedMotion';
import { useSectionProgress } from '../../animations/hooks/useSectionProgress';
import { useAnimationReady } from '../../animations/hooks/useAnimationReady';
import styles from './Chapter8Docking.module.css';
import ufoImg from '../../assets/ui/ufo.png';
import { useCms } from '../../providers/CmsProvider';

gsap.registerPlugin(ScrollTrigger);

// UFO Interface helper

/* ── Minimal SVG Icons using the shared Pink-Purple Gradient ── */
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="url(#pinkPurpleGrad)">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="url(#pinkPurpleGrad)">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="url(#pinkPurpleGrad)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="url(#pinkPurpleGrad)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="url(#pinkPurpleGrad)">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// UFO fleet items are built dynamically within the component body using useCms()

/* ── Canvas Space Dust ── */
const SpaceDustCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    class Particle {
      x: number = Math.random() * width;
      y: number = Math.random() * height;
      size: number = Math.random() * 1.2 + 0.3;
      speedX: number = (Math.random() - 0.5) * 0.08;
      speedY: number = -Math.random() * 0.15 - 0.05;
      opacity: number = Math.random() * 0.35 + 0.08;

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.y < 0) {
          this.y = height;
          this.x = Math.random() * width;
        }
        if (this.x < 0 || this.x > width) {
          this.x = Math.random() * width;
          this.y = height;
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
      }
    }

    const particles: Particle[] = Array.from({ length: 25 }, () => new Particle());

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.update();
        p.draw(ctx);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvasDust} />;
};

export const Chapter8Docking: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subTitleRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const prefersReduced = useReducedMotion();
  const isReady = useAnimationReady();

  const [activeUFOId, setActiveUFOId] = useState<string | null>(null);

  const { contacts } = useCms();
  const ufos = contacts.map(c => {
    let icon = <MailIcon />;
    if (c.id === 'linkedin') icon = <LinkedInIcon />;
    if (c.id === 'instagram') icon = <InstagramIcon />;
    if (c.id === 'github') icon = <GitHubIcon />;
    if (c.id === 'x') icon = <XIcon />;
    return {
      ...c,
      icon
    };
  });

  useSectionProgress(sectionRef, 'Docking Station');

  useLayoutEffect(() => {
    if (!isReady) return;

    const section = sectionRef.current;
    const heading = headingRef.current;
    const subTitle = subTitleRef.current;
    const grid = gridRef.current;

    if (!section || !heading || !subTitle || !grid) return;

    if (prefersReduced) {
      gsap.set([heading, subTitle, grid], { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      tl.fromTo(heading,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );

      tl.fromTo(subTitle,
        { opacity: 0, y: 15 },
        { opacity: 0.75, y: 0, duration: 0.6, ease: 'power2.out' },
        '>-0.4'
      );

      tl.fromTo(
        grid.children,
        { opacity: 0, y: 40, scale: 0.85 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.0,
          stagger: 0.15,
          ease: 'power3.out',
        },
        '>-0.2'
      );

      ScrollTrigger.create({
        trigger: section,
        start: 'top 55%',
        once: true,
        onEnter: () => tl.play(),
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, [isReady, prefersReduced]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Chapter 8: Contact Station"
      data-chapter="8"
      onClick={() => setActiveUFOId(null)}
    >
      {/* Shared linear gradient for all SVG icons to blend purple (#A855F7) and pink (#EC4899) */}
      <svg style={{ width: 0, height: 0, position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          <linearGradient id="pinkPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* 1. Sky with mint teal-green gradient & clouds (behind everything) */}
      <div className={styles.sky} />

      {/* Space dust canvas */}
      <SpaceDustCanvas />

      {/* 2. Sleek liquid-metal chrome humanoid entities standing in the field */}
      <div className={styles.entities}>
        {/* Left humanoid (larger, closer) */}
        <svg viewBox="0 0 200 600" className={styles.entityLeft}>
          <defs>
            <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="15%" stopColor="#e1e4e6" />
              <stop offset="30%" stopColor="#7a8286" />
              <stop offset="45%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#454b50" />
              <stop offset="75%" stopColor="#d2d7da" />
              <stop offset="90%" stopColor="#252a2d" />
              <stop offset="100%" stopColor="#121416" />
            </linearGradient>
          </defs>
          <ellipse cx="100" cy="90" rx="16" ry="24" fill="url(#chromeGrad)" />
          <rect x="95" y="110" width="10" height="20" rx="3" fill="url(#chromeGrad)" />
          <path d="M 65 130 C 65 130, 100 125, 135 130 C 144 170, 134 230, 124 290 C 114 330, 100 330, 86 290 C 76 230, 66 170, 65 130 Z" fill="url(#chromeGrad)" />
          <path d="M 65 135 C 50 175, 48 220, 52 275 C 53 283, 58 283, 57 275 C 53 220, 55 175, 68 142 Z" fill="url(#chromeGrad)" />
          <path d="M 135 135 C 150 175, 152 220, 148 275 C 147 283, 142 283, 143 275 C 147 220, 145 175, 132 142 Z" fill="url(#chromeGrad)" />
          <path d="M 86 288 C 81 350, 79 430, 83 510 C 84 520, 90 520, 89 510 C 85 430, 87 350, 93 290 Z" fill="url(#chromeGrad)" />
          <path d="M 114 288 C 119 350, 121 430, 117 510 C 116 520, 110 520, 111 510 C 115 430, 113 350, 107 290 Z" fill="url(#chromeGrad)" />
        </svg>

        {/* Right humanoid (smaller, further back) */}
        <svg viewBox="0 0 200 600" className={styles.entityRight}>
          <ellipse cx="100" cy="90" rx="16" ry="24" fill="url(#chromeGrad)" />
          <rect x="95" y="110" width="10" height="20" rx="3" fill="url(#chromeGrad)" />
          <path d="M 65 130 C 65 130, 100 125, 135 130 C 144 170, 134 230, 124 290 C 114 330, 100 330, 86 290 C 76 230, 66 170, 65 130 Z" fill="url(#chromeGrad)" />
          <path d="M 65 135 C 50 175, 48 220, 52 275 C 53 283, 58 283, 57 275 C 53 220, 55 175, 68 142 Z" fill="url(#chromeGrad)" />
          <path d="M 135 135 C 150 175, 152 220, 148 275 C 147 283, 142 283, 143 275 C 147 220, 145 175, 132 142 Z" fill="url(#chromeGrad)" />
          <path d="M 86 288 C 81 350, 79 430, 83 510 C 84 520, 90 520, 89 510 C 85 430, 87 350, 93 290 Z" fill="url(#chromeGrad)" />
          <path d="M 114 288 C 119 350, 121 430, 117 510 C 116 520, 110 520, 111 510 C 115 430, 113 350, 107 290 Z" fill="url(#chromeGrad)" />
        </svg>
      </div>

      {/* 3. Real photo background of pink grass field and rolling hills */}
      <div className={styles.grassBg} />

      {/* 4. Main page headings, links, and UFO interactions (floats on top) */}
      <div className={styles.container}>
        <h2 ref={headingRef} className={styles.missionComplete}>
          <span className={styles.floatHeading}>MISSION COMPLETE</span>
        </h2>
        <p ref={subTitleRef} className={styles.subTitle}>
          <span className={styles.floatSub}>Docking Station Online / Secure Links Established</span>
        </p>

        {/* UFO Fleet grid container */}
        <div ref={gridRef} className={styles.ufoBay}>
          {ufos.map((ufo) => {
            const isEmail = ufo.id === 'email';
            return (
              <a
                key={ufo.id}
                href={ufo.href}
                target={ufo.href.startsWith('http') ? "_blank" : undefined}
                rel={ufo.href.startsWith('http') ? "noopener noreferrer" : undefined}
                className={`${styles.ufoWrapper} ${styles[ufo.id]} ${
                  isEmail ? styles.primary : styles.secondary
                } ${activeUFOId === ufo.id ? styles.active : ''}`}
                aria-label={ufo.label}
                onClick={(e) => {
                  if (activeUFOId === ufo.id) {
                    if (ufo.href === '#') {
                      e.preventDefault();
                    }
                  } else {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveUFOId(ufo.id);
                  }
                }}
              >
                {/* Floating parent container */}
                <div className={styles.ufoFloat}>
                  {/* Glowing ground lighting cast underneath (visible only on hover) */}
                  <div className={styles.ufoGlow} />

                  {/* Volumetric Tractor Beam (Yellow #E7FF3A, fades in on hover) */}
                  <div className={styles.tractorBeam}>
                    <div className={styles.beamCone} />
                    <div className={styles.beamScanlines} />
                    <div className={styles.beamRays} />
                  </div>

                  {/* High fidelity chrome UFO asset */}
                  <img
                    src={ufoImg}
                    alt={`${ufo.name} Port`}
                    className={styles.ufoImage}
                    draggable={false}
                  />

                  {/* Suspended Holographic Logo Projection (ALWAYS visible, Purple/Pink Grad) */}
                  <div className={styles.hologramLogoContainer}>
                    {/* Suspended icon */}
                    <div className={styles.hologramLogo}>
                      {ufo.icon}
                    </div>

                    {/* Suspension channel title */}
                    <div className={styles.hologramTitle}>
                      {ufo.name}
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Chapter8Docking;
