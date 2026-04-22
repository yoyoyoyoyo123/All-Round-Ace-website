import { useState } from 'react'
import Loader     from './components/Loader/Loader'
import Deal       from './components/Deal/Deal'
import Suits      from './components/Suits/Suits'
import Spread     from './components/Spread/Spread'
import RoyalFlush from './components/RoyalFlush/RoyalFlush'
import AllIn      from './components/AllIn/AllIn'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <Loader onComplete={() => setLoaded(true)} />
      <main style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        <Deal />
        <Suits />
        <Spread />
        <RoyalFlush />
        <AllIn />
      </main>
    </>
  )
}
