import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import logo from '../../assets/logo.png'
import './Deal.css'

gsap.registerPlugin(ScrollTrigger)

const PILES = [
  { id: 'top',    suit: '♠', slogan: 'We Engineer\nthe Impossible',   isRed: false },
  { id: 'right',  suit: '♥', slogan: 'We Feel What\nOthers Code',      isRed: true  },
  { id: 'bottom', suit: '♦', slogan: 'We Create What\nOthers Imagine', isRed: true  },
  { id: 'left',   suit: '♣', slogan: 'We Play a\nDifferent Game',      isRed: false },
]

const CARDS_PER_PILE = 5
const DEAL_ORDER = Array.from({ length: CARDS_PER_PILE * PILES.length }, (_, i) => i % PILES.length)

export default function Deal({ shouldDeal }) {
  const sectionRef = useRef(null)
  const tableRef   = useRef(null)
  const deckRef    = useRef(null)
  const pileRefs   = useRef([])
  const cardRefs   = useRef([])
  const copyRef    = useRef(null)
  const pickRef    = useRef(null)

  const [phase,    setPhase]    = useState('idle')
  const [hovered,  setHovered]  = useState(null)
  const [deckDone, setDeckDone] = useState(false)

  // ── Deal animation ──
  const runDeal = useCallback(() => {
    setPhase('dealing')
    const deckEl = deckRef.current
    if (!deckEl) return

    const deckRect  = deckEl.getBoundingClientRect()
    const pileCount = [0, 0, 0, 0]

    const tl = gsap.timeline({
      onComplete: () => {
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
      tl.fromTo(
        cardEl,
        { x: fromX, y: fromY, opacity: 1, rotation: gsap.utils.random(-10, 10) },
        { x: 0,     y: 0,     opacity: 1, rotation: 0, duration: 0.35, ease: 'power3.out' },
        0.15 + dealIdx * 0.1,
      )
    })
  }, [])

  // ── Initial state + scroll-back restoration ──
  useEffect(() => {
    gsap.set(tableRef.current, { opacity: 0 })
    gsap.set(copyRef.current,  { opacity: 0, y: 24 })
    gsap.set(pickRef.current,  { opacity: 0, y: 20 })
    const allCards = cardRefs.current.flat().filter(Boolean)
    gsap.set(allCards, { opacity: 0 })

    // When user scrolls back into Deal from Suits — restore full ready state
    const restoreTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      onEnterBack: () => {
        if (phase === 'ready' || phase === 'selected') {
          pileRefs.current.forEach(p => {
            if (p) gsap.set(p, { clearProps: 'x,y,scale,opacity' })
          })
          // Restore copy + pick text (set explicitly — CSS defaults to opacity:0)
          gsap.set([copyRef.current, pickRef.current], { opacity: 1, y: 0 })
          setPhase('ready')
          setHovered(null)
        }
      },
    })

    return () => {
      restoreTrigger.kill()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (shouldDeal && phase === 'idle') runDeal()
  }, [shouldDeal, phase, runDeal])

  // ── Pile selection: 5-card spread → Scene 2 ──
  const handlePick = (pileIdx) => {
    if (phase !== 'ready') return
    setPhase('selected')
    setHovered(null)

    const sectionEl = sectionRef.current
    if (!sectionEl) return

    const vw = window.innerWidth
    const vh = window.innerHeight

    // Lock scroll during transition
    document.body.style.overflow = 'hidden'

    // Fade non-selected piles & UI
    pileRefs.current.forEach((p, i) => {
      if (i !== pileIdx && p) gsap.to(p, { opacity: 0, scale: 0.85, duration: 0.35, ease: 'power2.in' })
    })
    gsap.to([copyRef.current, pickRef.current], { opacity: 0, duration: 0.25 })

    // Create fixed overlay container
    const overlayEl = document.createElement('div')
    overlayEl.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:9998;pointer-events:none;overflow:hidden;'
    document.body.appendChild(overlayEl)

    // Clone 5 cards as overlay divs, positioned exactly over each card
    const pickedCards = (cardRefs.current[pileIdx] || []).filter(Boolean)
    const panelW = vw / 5

    const overlayDivs = pickedCards.map((card) => {
      const rect = card.getBoundingClientRect()
      const div = document.createElement('div')
      div.style.cssText = `
        position:absolute; left:0; top:0;
        width:${rect.width}px; height:${rect.height}px;
        background:linear-gradient(150deg,#200505 0%,#0e0e0e 100%);
        border:1px solid rgba(204,0,0,0.3);
        border-radius:12px;
      `
      overlayEl.appendChild(div)
      // Position at card's current screen location
      gsap.set(div, { x: rect.left, y: rect.top, transformOrigin: 'top left' })
      return { div, rect }
    })

    const tl = gsap.timeline({
      onComplete: () => {
        // Instant scroll to Suits
        const suitsEl = document.getElementById('suits')
        if (suitsEl) window.scrollTo({ top: suitsEl.offsetTop, behavior: 'instant' })

        // Fade out overlays after flip starts (0.4s delay)
        gsap.to(overlayEl, {
          opacity: 0, duration: 0.7, delay: 0.4,
          onComplete: () => { if (overlayEl.parentNode) overlayEl.remove() },
        })

        // Restore Deal for scroll-back
        gsap.set(sectionEl, { opacity: 1 })
        pileRefs.current.forEach(p => { if (p) gsap.set(p, { clearProps: 'x,y,scale,opacity' }) })
        gsap.set([copyRef.current, pickRef.current], { opacity: 1, y: 0 })
        setPhase('ready')
        document.body.style.overflow = ''
      },
    })

    // Fade out deal section
    tl.to(sectionEl, { opacity: 0, duration: 0.55, ease: 'power2.inOut' }, 0.25)

    // Spread each card overlay into its column (left → right stagger)
    overlayDivs.forEach(({ div, rect }, i) => {
      const scaleX = panelW / rect.width
      const scaleY = vh / rect.height
      tl.to(div, {
        x: i * panelW,
        y: 0,
        scaleX,
        scaleY,
        borderRadius: 0,
        duration: 0.9,
        ease: 'power3.inOut',
      }, i * 0.08)
    })
  }

  return (
    <section ref={sectionRef} id="deal" className="deal">

      <div ref={tableRef} className="deal__table">
        <div className="deal__felt" />
        <div className="deal__center">
          <img src={logo} alt="ARA Studio" className="deal__logo" />
        </div>

        <div ref={deckRef} className={`deal__deck${deckDone ? ' is-done' : ''}`}>
          {[0,1,2,3,4].map(i => (
            <div key={i} className="deal__deck-card" style={{ '--i': i }} />
          ))}
        </div>

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
