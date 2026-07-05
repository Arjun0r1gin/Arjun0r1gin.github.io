/**
 * TerminalText
 *
 * A shared component that types out an array of lines, one character at a
 * time, then blinks a cursor.  Used by multiple chapters.
 *
 * Props
 * ──────────────────────────────────────────────────────────────────────────
 * lines        string[]   Lines to type out (each on its own row)
 * charDelay?   number     ms between each character (default 55)
 * lineDelay?   number     ms pause between lines (default 600)
 * startDelay?  number     ms before typing begins (default 0)
 * style?       CSSProperties  forwarded to the root <div>
 * className?   string         forwarded to the root <div>
 * onComplete?  () => void     called once all lines have been typed
 *
 * Reduced-motion: if window.matchMedia('prefers-reduced-motion') is set,
 * all lines are shown at once without animation.
 * ──────────────────────────────────────────────────────────────────────────
 */
import React, { useEffect, useLayoutEffect, useRef } from 'react';

interface TerminalTextProps {
  lines: string[];
  charDelay?: number;
  lineDelay?: number;
  startDelay?: number;
  style?: React.CSSProperties;
  className?: string;
  onComplete?: () => void;
}

// Track scheduled timers so cleanup is guaranteed
type TimerHandle = ReturnType<typeof setTimeout>;

const TerminalText: React.FC<TerminalTextProps> = ({
  lines,
  charDelay = 55,
  lineDelay = 600,
  startDelay = 0,
  style,
  className,
  onComplete,
}) => {
  const rootRef    = useRef<HTMLDivElement>(null);
  const cursorRef  = useRef<HTMLSpanElement>(null);
  const timers     = useRef<TimerHandle[]>([]);

  // Clear all pending timers on unmount / re-run
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const schedule = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timers.current.push(id);
    return id;
  };

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Reduced motion: dump all lines instantly ──────────────────────────
    if (prefersReduced) {
      root.innerHTML = '';
      lines.forEach((line) => {
        const span = document.createElement('span');
        span.textContent = line;
        span.style.display = 'block';
        root.appendChild(span);
      });
      if (cursorRef.current) cursorRef.current.style.display = 'none';
      onComplete?.();
      return;
    }

    // ── Full motion: type character by character ───────────────────────────
    // Build DOM structure first so React doesn't fight us
    root.innerHTML = '';
    const lineEls: HTMLSpanElement[] = lines.map(() => {
      const span = document.createElement('span');
      span.style.display = 'block';
      root.appendChild(span);
      return span;
    });

    let elapsed = startDelay;

    lines.forEach((line, lineIdx) => {
      const el = lineEls[lineIdx];
      [...line].forEach((char) => {
        schedule(() => {
          el.textContent += char;
        }, elapsed);
        elapsed += charDelay;
      });
      elapsed += lineDelay;
    });

    // Fire onComplete after the last character
    schedule(() => onComplete?.(), elapsed);

    return clearTimers;
  }, [lines.join('|'), charDelay, lineDelay, startDelay]);

  useEffect(() => clearTimers, []);

  const rootStyle: React.CSSProperties = {
    fontFamily: 'var(--font-terminal, ui-monospace, "Courier New", monospace)',
    fontSize: 'clamp(11px, 1.3vw, 15px)',
    letterSpacing: '3px',
    color: 'var(--signal-teal, #8fd8d2)',
    textTransform: 'uppercase',
    lineHeight: 2,
    ...style,
  };

  return (
    <div ref={rootRef} style={rootStyle} className={className} aria-live="polite">
      {/* Lines injected imperatively to avoid React reconciler conflicts */}
      <span
        ref={cursorRef}
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: 2,
          height: '1.1em',
          background: 'currentColor',
          marginLeft: 3,
          verticalAlign: 'middle',
          animation: 'terminalBlink 1.1s step-end infinite',
        }}
      />
    </div>
  );
};

export default TerminalText;
