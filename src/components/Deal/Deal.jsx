import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import logo from '../../assets/logo.png'
import './Deal.css'

gsap.registerPlugin(ScrollTrigger)

// Five royal-flush cards face-down — the hand you're about to play
const CARDS = [
  { suit: '♠', isRed: false },
  { suit: '♥', isRed: true  },
  { suit: '♦', isRed: true  },
  { suit: '♣', isRed: false },
  { suit: '♠', isRed: false },
]

export default function Deal() {
  const sectionRef  = useRef(null)
  const fanRef      = useRef(null)    // rotateX target for the whole fan
  const cardRefs    = useRef([])      // individual card elements (hover pop)
  const brandRef    = useRef(null)
  const hintRef     = useRef(null)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const fan   = fanRef.current
    const cards = cardRefs.current.filter(Boolean)

    // ── Initial 3-D state ──────────────────────────────────────────────────
    // Fan lies ~52° from vertical ("cards on a table").
    // transform-origin near the bottom so top edge lifts when rotateX → 0.
    gsap.set(fan, {
      rotateX:          52,
      transformOrigin:  '50% 88%',
      transformPerspective: 0,   // perspective is on the CSS wrap, not here
    })

    // Brand + hint: start hidden, animate in on mount
    gsap.set([brandRef.current, hintRef.current], { opacity: 0, y: 22 })
    gsap.to([brandRef.current, hintRef.current], {
      opacity: 1, y: 0,
      duration: 1.1,
      stagger:  0.18,
      ease:     'power3.out',
      delay:    0.4,       // let Loader fade finish first
    })

    // Cards: fade in with a brief stagger
    gsap.set(cards, { opacity: 0 })
    gsap.to(cards, {
      opacity:  1,
      stagger:  0.07,
      duration: 0.7,
      ease:     'power2.out',
      delay:    0.5,
    })

    // ── Scroll: lift fan from table angle → fully upright ─────────────────
    //
    //  Section = 250 vh → 150 vh scroll travel (top-top → bottom-bottom).
    //  tl plays 0→1 across that travel.
    //
    //  0 → 80%  rotateX 52 → 0   (cards rise)
    //  0 → 35%  hint text fades out (no longer needed once scrolling)
    //
    const tl = gsap.timeline({ paused: true })

    tl.to(fan, {
      rotateX: 0,
      ease:    'power1.inOut',
      duration: 0.80,
    }, 0)

    tl.fromTo(hintRef.current,
      { opacity: 1 },
      { opacity: 0, ease: 'none', duration: 0.35, immediateRender: false },
      0
    )

    // Subtle spread: cards drift apart a little as they rise,
    // reinforcing the "hand being revealed" feel.
    // We target individual card slots via their CSS var offset ±translateX.
    const SPREAD_X = [-52, -26, 0, 26, 52]  // px
    cards.forEach((card, i) => {
      tl.to(card, {
        x:        SPREAD_X[i],
        ease:     'power1.inOut',
        duration: 0.80,
      }, 0)
    })

    const st = ScrollTrigger.create({
      trigger:   sectionRef.current,
      start:     'top top',
      end:       'bottom bottom',
      scrub:     1.2,
      animation: tl,
    })

    return () => { st.kill(); tl.kill() }
  }, [])

  return (
    <section ref={sectionRef} id="deal" className="deal">
      <div className="deal__sticky">

        {/* ── Spotlight ── */}
        <div className="deal__spotlight" aria-hidden="true" />

        {/* ── Brand ── */}
        <div ref={brandRef} className="deal__brand">
          <img src={logo} alt="All Round Ace Studio" className="deal__logo" />
          <p className="deal__studio-name">ALL ROUND ACE STUDIO</p>
        </div>

        {/* ── 5-card fan ── */}
        {/* perspective is set on the wrap (CSS), rotateX is on the fan (GSAP) */}
        <div className="deal__fan-wrap">
          <div ref={fanRef} className="deal__fan">
            {CARDS.map((card, i) => (
              <div
                key={i}
                className={`deal__slot deal__slot--${i + 1}`}
              >
                <div
                  ref={el => (cardRefs.current[i] = el)}
                  className={[
                    'deal__card',
                    hovered === i                     ? 'is-hovered' : '',
                    hovered !== null && hovered !== i ? 'is-dim'     : '',
                  ].filter(Boolean).join(' ')}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Back face only — cards are unrevealed until you scroll */}
                  <div className="deal__card-back">
                    <div className="deal__back-pattern" />
                    <span className={`deal__back-suit${card.isRed ? ' is-red' : ''}`}>
                      {card.suit}
                    </span>
                    {/* Subtle corner pip */}
                    <span className={`deal__back-pip${card.isRed ? ' is-red' : ''}`}>
                      {card.suit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scroll hint ── */}
        <p ref={hintRef} className="deal__hint">
          <span className="deal__hint-line">scroll to play your hand</span>
          <span className="deal__hint-arrow">↓</span>
        </p>

      </div>
    </section>
  )
}
