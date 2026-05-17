import { useState } from 'react'
import Loader     from './components/Loader/Loader'
import Header     from './components/Header/Header'
import DealSuits  from './components/DealSuits/DealSuits'
import Spread     from './components/Spread/Spread'
import RoyalFlush from './components/RoyalFlush/RoyalFlush'
import AllIn      from './components/AllIn/AllIn'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  const handleLoaderComplete = () => {
    setLoaded(true)
  }

  return (
    <>
      <Loader onComplete={handleLoaderComplete} />
      {loaded && <Header />}
      <main style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        <DealSuits />

        {/*
          Scene 3 → 4 reveal layer
          ─────────────────────────────────────────────────────────────────
          RoyalFlush (z:1) sits as a persistent sticky backdrop behind Spread (z:2).
          As Spread's black bg + cards fade out, RoyalFlush is revealed in place —
          it was always there, just hidden behind the black layer.

          Layout math (all relative to this wrapper):
            sticky bg   = 100 vh  (in normal flow)
            Spread      = 1800 vh with margin-top:-100vh  → net flow = 1700 vh
            paddingBottom = 100 vh  (holds sticky through Spread's last scroll px)
            ──────────────────────────────────────────────────────────────
            wrapper total ≈ 1900 vh
            sticky holds from 0 → 1800 vh (wrapper_height − 100 vh)   ✓
        */}
        <div style={{ position: 'relative', paddingBottom: '100vh' }}>
          {/* Scene 4 — sticky, always present in the background */}
          <div style={{ position: 'sticky', top: 0, height: '100vh', zIndex: 1 }}>
            <RoyalFlush />
          </div>
          {/* Scene 3 — on top (z:2), scrolls normally, fades its own black bg at exit */}
          <div style={{ position: 'relative', zIndex: 2, marginTop: '-100vh' }}>
            <Spread />
          </div>
        </div>

        <AllIn />
      </main>
    </>
  )
}
