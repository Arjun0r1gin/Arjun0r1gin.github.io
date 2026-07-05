import { AnimationProvider } from './providers/AnimationProvider';
import Chapter1Initialize from './components/chapters/Chapter1Initialize';
import Chapter2Transition from './components/chapters/Chapter2Transition';
import Chapter3Operator from './components/chapters/Chapter3Operator';
import Chapter5MissionControl from './components/chapters/Chapter5MissionControl';
import Chapter6LogsArchive from './components/chapters/Chapter6LogsArchive';
import Chapter7Transmission from './components/chapters/Chapter7Transmission';
import Chapter8Docking from './components/chapters/Chapter8Docking';

function App() {
  return (
    <AnimationProvider>
      {/* Chapter 1: Initialize Protocol */}
      <Chapter1Initialize />

      {/* Chapter 2: Transition Protocol — pinned scroll-scrub sequence */}
      <div style={{ width: '100%' }}>
        <Chapter2Transition />
      </div>

      {/* Chapter 3: Operator Profile */}
      <Chapter3Operator />

      {/* Chapter 5: pinned horizontal-scroll planetary belt */}
      <div style={{ width: '100%' }}>
        <Chapter5MissionControl />
      </div>

      {/* Chapter 6: Logs Archive — parallax asteroid field */}
      <Chapter6LogsArchive />

      {/* Chapter 7: Encrypted Transmission — intentionally quiet */}
      <Chapter7Transmission />

      {/* Chapter 8: Docking Station — Connection */}
      <Chapter8Docking />
    </AnimationProvider>
  );
}

export default App;
