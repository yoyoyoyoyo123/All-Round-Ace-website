import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import logo from '../../assets/logo.png'
import './Deal.css'

gsap.registerPlugin(ScrollToPlugin)

const PILES = [
  { id: 'top',    suit: '♠', slogan: 'We Engineer\nthe Impossible',   isRed: false },
  { id: 'right',  suit: '♥', slogan: 'We Feel What\nOthers Code',      isRed: true  },
  { id: 'bottom', suit: '♦', slogan: 'We Create What\nOthers Imagine', isRed: true  },
  { id: 'left',   suit: '♣', slogan: 'We Play a\nDifferent Game',      isRed: false },
]

const CARDS_PER_PILE = 5
// Round-robin deal order: 0,1,2,3, 0,1,2,3, ...
const DEAL_ORDER = Array.from({ length: CARDS_PER_PILE * PILES.length }, (_, i) => i % PILES.length)

export default function Deal({ shouldDeal }) {
  const sectionRef  = useRef(null)
  const tableRef    = useRef(null)
  const deckRef     = useRef(null)
  const pileRefs    = useRef([])
  const cardRefs    = useRef([])   // cardRefs[pileIdx][cardIdx]
  const copyRef     = useRef(null)
  const pickRef     = useRef(null)

  const [phase,    setPhase]    = useState('idle')
  const [hovered,  setHovered]  = useState(null)
  const [deckDone, setDeckDone] = useState(false)

  // --- Deal animation (triggered by parent after Loader + fade-in) ---
  const runDeal = useCallback(() => {
    setPhase('dealing')

    const deckEl = deckRef.current
    if (!deckEl) return

    const deckRect = deckEl.getBoundingClientRect()
    const pileCount = [0, 0, 0, 0]

    const tl = gsap.timeline({
      onComplete: () => {
        // Clear GSAP inline transforms so CSS hover fan can take over
        const allCards = cardRefs.current.flat().filter(Boolean)
        gsap.set(allCards, { clearProps: 'x,y,rotation,transform' })
        setPhase('ready')
        setDeckDone(true)
        gsap.to([copyRef.current, pickRef.current], {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.2, ease: 'power2.out',
        })
      },
    })

    tl.to(tableRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' })

    DEAL_ORDER.forEach((pileIdx, dealIdx) => {
      const cardSlot = pileCount[pileIdx]
      pileCount[pileIdx]++

      const cardEl = cardRefs.current[pileIdx]?.[cardSlot]
      if (!cardEl) return

      const cardRect = cardEl.getBoundingClientRect()
      const fromX = deckRect.left + deckRect.width  / 2 - (cardRect.left + cardRect.width  / 2)
      const fromY = deckRect.top  + deckRect.height / 2 - (cardRect.top  + cardRect.height / 2)

      // Snap card to opacity:1 at deck pos, then fly to pile
      tl.fromTo(
        cardEl,
        { x: fromX, y: fromY, opacity: 1, rotation: gsap.utils.random(-10, 10) },
        { x: 0,     y: 0,     opacity: 1, rotation: 0, duration: 0.35, ease: 'power3.out' },
        0.15 + dealIdx * 0.1,
      )
    })
  }, [])

  // Initial state — hide everything until deal starts
  useEffect(() => {
    gsap.set(tableRef.current, { opacity: 0 })
    gsap.set(copyRef.current,  { opacity: 0, y: 24 })
    gsap.set(pickRef.current,  { opacity: 0, y: 20 })
    const allCards = cardRefs.current.flat().filter(Boolean)
    gsap.set(allCards, { opacity: 0 })
  }, [])

  // Trigger deal when parent signals ready
  useEffect(() => {
    if (shouldDeal && phase === 'idle') runDeal()
  }, [shouldDeal, phase, runDeal])

  // --- Pile selection: move pile to bottom-center ---
  const handlePick = (pileIdx) => {
    if (phase !== 'ready') return
    setPhase('selected')
    setHovered(null)

    const pileEl    = pileRefs.current[pileIdx]
    const sectionEl = sectionRef.current
    if (!pileEl || !sectionEl) return

    const pileRect    = pileEl.getBoundingClientRect()
    const sectionRect = sectionEl.getBoundingClientRect()

    // Fade others
    pileRefs.current.forEach((p, i) => {
      if (i !== pileIdx) gsap.to(p, { opacity: 0, scale: 0.8, duration: 0.4, ease: 'power2.in' })
    })
    gsap.to([copyRef.current, pickRef.current], { opacity: 0, duration: 0.3 })

    // Target: bottom-center of section
    const targetCX = sectionRect.left + sectionRect.width  / 2
    const targetCY = sectionRect.top  + sectionRect.height - pileRect.height / 2 - 60

    // Current center
    const currentCX = pileRect.left + pileRect.width  / 2
    const currentCY = pileRect.top  + pileRect.height / 2

    gsap.to(pileEl, {
      x: `+=${targetCX - currentCX}`,
      y: `+=${targetCY - currentCY}`,
      scale: 1.25,
      duration: 0.85,
      ease: 'power3.inOut',
      onComplete: () => {
        gsap.to(sectionEl, {
          opacity: 0, duration: 0.5, ease: 'power2.inOut',
          onComplete: () => {
            gsap.to(window, { scrollTo: { y: '#suits' }, duration: 0.01 })
            gsap.set(sectionEl, { opacity: 1 })
          },
        })
      },
    })
  }

  return (
    <section ref={sectionRef} id="deal" className="deal">

      <div ref={tableRef} className="deal__table">
        <div className="deal__felt" />

        <div className="deal__center">
          <img src={logo} alt="ARA Studio" className="deal__logo" />
        </div>

        {/* Dealer deck — bottom-right */}
        <div ref={deckRef} className={`deal__deck${deckDone ? ' is-done' : ''}`}>
          {[0,1,2,3,4].map(i => (
            <div key={i} className="deal__deck-card" style={{ '--i': i }} />
          ))}
        </div>

        {/* Four piles */}
        {PILES.map((pile, pIdx) => (
          <div
            key={pile.id}
            ref={el => (pileRefs.current[pIdx] = el)}
            className={`deal__pile deal__pile--${pile.id}${hovered === pIdx ? ' is-hovered' : ''}${phase === 'ready' ? ' is-active' : ''}`}
            onMouseEnter={() => phase === 'ready' && setHovered(pIdx)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handlePick(pIdx)}
          >
            <div className="deal__cards">
              {Array.from({ length: CARDS_PER_PILE }, (_, cIdx) => (
                <div
                  key={cIdx}
                  ref={el => {
                    if (!cardRefs.current[pIdx]) cardRefs.current[pIdx] = []
                    cardRefs.current[pIdx][cIdx] = el
                  }}
                  className={`deal__card${cIdx === CARDS_PER_PILE - 1 ? ' deal__card--top' : ''}`}
                  style={{ '--c': cIdx }}
                >
                  {cIdx === CARDS_PER_PILE - 1 && (
                    <span className={`deal__suit${pile.isRed ? ' is-red' : ''}`}>{pile.suit}</span>
                  )}
                </div>
              ))}
            </div>
            <p className="deal__slogan">
              {pile.slogan.split('\n').map((line, i) => <span key={i}>{line}</span>)}
            </p>
          </div>
        ))}
      </div>

      {/* Mafia copy */}
      <div className="deal__copy" ref={copyRef}>
        <p className="deal__copy-tag">ALL ROUND ACE STUDIO</p>
        <p className="deal__copy-sub">Every project is a game.<br />We don't play safe.</p>
      </div>

      <div className="deal__pick-wrap" ref={pickRef}>
        <h1 className="deal__pick">PICK<br /><em>ONE</em></h1>
      </div>

    </section>
  )
}
