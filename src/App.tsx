import { AnimationProvider } from './providers/AnimationProvider';
import Chapter1Initialize from './components/chapters/Chapter1Initialize';
import Chapter3Operator from './components/chapters/Chapter3Operator';
import Chapter4Assembly from './components/chapters/Chapter4Assembly';

function App() {
  return (
    <AnimationProvider>
      {/* Chapter 1: Initialize Protocol — full load-in sequence */}
      <Chapter1Initialize />

      {/* Placeholder stubs for Chapter 2 — to be built in later sprints */}
      <section
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--void-0, #030308)',
          fontFamily: 'ui-monospace, monospace',
          fontSize: '12px',
          letterSpacing: '3px',
          color: 'rgba(143,216,210,0.3)',
          textTransform: 'uppercase',
        }}
        aria-label="Chapter 2 placeholder"
      >
        [ CH.02 — TRANSITION PROTOCOL ]
      </section>

      {/* Chapter 3: Operator Profile */}
      <Chapter3Operator />

      {/* Chapter 4: pinned rocket assembly */}
      <div style={{ width: '100%' }}>
        <Chapter4Assembly />
      </div>
    </AnimationProvider>
  );
}

export default App;
