import { useState } from 'react'
import Loader     from './components/Loader/Loader'
import Header     from './components/Header/Header'
import Deal       from './components/Deal/Deal'
import Suits      from './components/Suits/Suits'
import Spread     from './components/Spread/Spread'
import RoyalFlush from './components/RoyalFlush/RoyalFlush'
import AllIn      from './components/AllIn/AllIn'

export default function App() {
  const [loaded,      setLoaded]      = useState(false)
  const [dealStarted, setDealStarted] = useState(false)

  const handleLoaderComplete = () => {
    setLoaded(true)
    // Wait for main opacity transition (0.6s) + buffer, then trigger deal animation
    setTimeout(() => setDealStarted(true), 900)
  }

  return (
    <>
      <Loader onComplete={handleLoaderComplete} />
      {loaded && <Header />}
      <main style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        <Deal shouldDeal={dealStarted} />
        <Suits />
        <Spread />
        <RoyalFlush />
        <AllIn />
      </main>
    </>
  )
}
