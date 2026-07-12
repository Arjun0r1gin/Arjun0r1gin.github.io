import React, { useMemo } from 'react';

// Types for the component props
export interface ParallaxStarsProps {
  /**
   * Speed multiplier for the animation
   * @default 1
   */
  speed?: number;
  /**
   * Opacity of the star layers
   * @default 0.9
   */
  opacity?: number;
  /**
   * Z-index for the container
   * @default -1
   */
  zIndex?: number;
}

// Helper to generate random box shadows over a 2000px grid
const generateBoxShadows = (n: number) => {
  let value = `${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`;
  for (let i = 2; i <= n; i++) {
    value += `, ${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`;
  }
  return value;
};

export const ParallaxStars: React.FC<ParallaxStarsProps> = ({
  speed = 1,
  opacity = 0.9,
  zIndex = -1
}) => {
  // Memoize shadows so they don't regenerate on every re-render
  const shadowsSmall = useMemo(() => generateBoxShadows(700), []);
  const shadowsMedium = useMemo(() => generateBoxShadows(200), []);
  const shadowsBig = useMemo(() => generateBoxShadows(100), []);

  return (
    <div 
      style={{ 
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex,
        opacity 
      }}
    >
      {/* Inline styles for infinite vertical scroll and twinkling animations */}
      <style>{`
        @keyframes animStarScroll {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }
        @keyframes twinkleFar {
          0%, 100% { opacity: 0.15; }
          30% { opacity: 1.0; }
          55% { opacity: 0.30; }
          80% { opacity: 0.95; }
        }
        @keyframes twinkleMid {
          0%, 100% { opacity: 0.90; }
          25% { opacity: 0.20; }
          60% { opacity: 1.00; }
          75% { opacity: 0.15; }
        }
        @keyframes twinkleNear {
          0%, 100% { opacity: 0.35; }
          40% { opacity: 1.00; }
          50% { opacity: 0.10; }
          85% { opacity: 0.80; }
        }
      `}</style>

      {/* Stars Layer 1 (Small / Far) */}
      <div className="stars-parallax-far" style={{ position: 'absolute', inset: 0 }}>
        <div 
          style={{ 
            position: 'absolute',
            left: 0,
            top: 0,
            width: '1px',
            height: '1px',
            backgroundColor: 'transparent',
            boxShadow: shadowsSmall,
            animation: `animStarScroll ${50 / speed}s linear infinite, twinkleFar 8.5s ease-in-out infinite`
          }}
        >
          <div 
            style={{ 
              position: 'absolute',
              left: 0,
              top: '2000px',
              width: '1px',
              height: '1px',
              backgroundColor: 'transparent',
              boxShadow: shadowsSmall
            }}
          />
        </div>
      </div>

      {/* Stars Layer 2 (Medium / Mid) */}
      <div className="stars-parallax-mid" style={{ position: 'absolute', inset: 0 }}>
        <div 
          style={{ 
            position: 'absolute',
            left: 0,
            top: 0,
            width: '2px',
            height: '2px',
            backgroundColor: 'transparent',
            boxShadow: shadowsMedium,
            animation: `animStarScroll ${100 / speed}s linear infinite, twinkleMid 12.5s ease-in-out infinite`
          }}
        >
          <div 
            style={{ 
              position: 'absolute',
              left: 0,
              top: '2000px',
              width: '2px',
              height: '2px',
              backgroundColor: 'transparent',
              boxShadow: shadowsMedium
            }}
          />
        </div>
      </div>

      {/* Stars Layer 3 (Big / Near) */}
      <div className="stars-parallax-near" style={{ position: 'absolute', inset: 0 }}>
        <div 
          style={{ 
            position: 'absolute',
            left: 0,
            top: 0,
            width: '3px',
            height: '3px',
            backgroundColor: 'transparent',
            boxShadow: shadowsBig,
            animation: `animStarScroll ${150 / speed}s linear infinite, twinkleNear 16.0s ease-in-out infinite`
          }}
        >
          <div 
            style={{ 
              position: 'absolute',
              left: 0,
              top: '2000px',
              width: '3px',
              height: '3px',
              backgroundColor: 'transparent',
              boxShadow: shadowsBig
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ParallaxStars;
