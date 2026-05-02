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
        <Spread />
        <RoyalFlush />
        <AllIn />
      </main>
    </>
  )
}
