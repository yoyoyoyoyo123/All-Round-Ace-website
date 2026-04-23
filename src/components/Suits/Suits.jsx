import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Suits.css'

gsap.registerPlugin(ScrollTrigger)

const CARDS = [
  {
    id: 'joker',
    rank: 'JOKER',
    suit: '★',
    isRed: false,
    isJoker: true,
    title: 'Our Story',
    sub: 'Brand · Vision · Core',
    desc: 'We don\'t fit a single category. We engineer, feel, create, and play — all at once. ARA Studio is where technology meets art meets game.',
  },
  {
    id: 'spade',
    rank: 'A',
    suit: '♠',
    isRed: false,
    isJoker: false,
    title: 'Interactive\nInstallation',
    sub: '互動裝置',
    desc: 'Spaces that respond to presence. Environments that blur the digital and physical — you don\'t just see them, you inhabit them.',
  },
  {
    id: 'heart',
    rank: 'A',
    suit: '♥',
    isRed: true,
    isJoker: false,
    title: 'Software\nDevelopment',
    sub: '軟體開發',
    desc: 'From embedded firmware to full-stack web — precision-engineered software that feels as good as it performs.',
  },
  {
    id: 'diamond',
    rank: 'A',
    suit: '♦',
    isRed: true,
    isJoker: false,
    title: 'Game\nDevelopment',
    sub: '遊戲開發',
    desc: 'Rules exist to be rewritten. We design worlds with consequence — where every choice matters and every player is the protagonist.',
  },
  {
    id: 'club',
    rank: 'A',
    suit: '♣',
    isRed: false,
    isJoker: false,
    title: 'Art\nInstallation',
    sub: '藝術裝置',
    desc: 'Light, form, and material become language. We sculpt space into statements — work that demands presence.',
  },
]

export default function Suits() {
  const sectionRef = useRef(null)
  const colRefs    = useRef([])   // outer col — receives hover lift
  const innerRefs  = useRef([])   // card-inner — receives rotateY flip
  const flippedRef = useRef(false)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const inners = innerRefs.current.filter(Boolean)

    // Start face-down
    gsap.set(inners, { rotateY: 0 })

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 60%',
      once: true,
      onEnter: () => {
        flippedRef.current = true
        gsap.to(inners, {
          rotateY: 180,
          duration: 0.85,
          stagger: 0.2,
          ease: 'power2.inOut',
        })
      },
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  const handleEnter = useCallback((idx) => {
    if (!flippedRef.current) return
    setHovered(idx)
    gsap.to(colRefs.current[idx], { y: -22, duration: 0.35, ease: 'power2.out' })
    colRefs.current.forEach((c, i) => {
      if (i !== idx && c) gsap.to(c, { opacity: 0.32, duration: 0.25 })
    })
  }, [])

  const handleLeave = useCallback((idx) => {
    setHovered(null)
    gsap.to(colRefs.current[idx], { y: 0, duration: 0.35, ease: 'power2.out' })
    colRefs.current.forEach(c => { if (c) gsap.to(c, { opacity: 1, duration: 0.25 }) })
  }, [])

  return (
    <section ref={sectionRef} id="suits" className="suits">

      <div className="suits__header">
        <p className="suits__scene-label">SCENE II</p>
        <h2 className="suits__title">THE SUITS</h2>
        <p className="suits__tagline">Choose your game</p>
      </div>

      <div className="suits__row">
        {CARDS.map((card, idx) => (
          <div
            key={card.id}
            ref={el => (colRefs.current[idx] = el)}
            className={['suits__col', hovered === idx ? 'is-hovered' : ''].filter(Boolean).join(' ')}
            onMouseEnter={() => handleEnter(idx)}
            onMouseLeave={() => handleLeave(idx)}
          >
            <div
              ref={el => (innerRefs.current[idx] = el)}
              className="suits__card-inner"
            >
              {/* ── Back face ── */}
              <div className="suits__card-back">
                <div className="suits__back-pattern" />
              </div>

              {/* ── Front face ── */}
              <div className={[
                'suits__card-front',
                card.isRed   ? 'is-red'   : '',
                card.isJoker ? 'is-joker' : '',
              ].filter(Boolean).join(' ')}>

                <div className="suits__corner suits__corner--tl">
                  <span className="suits__rank">{card.rank}</span>
                  <span className="suits__suit-sm">{card.suit}</span>
                </div>

                <div className="suits__face">
                  <div className="suits__suit-lg">{card.suit}</div>
                  <div className="suits__info">
                    <h3 className="suits__card-title">
                      {card.title.split('\n').map((line, i) => <span key={i}>{line}</span>)}
                    </h3>
                    <p className="suits__card-sub">{card.sub}</p>
                  </div>
                  <p className="suits__desc">{card.desc}</p>
                </div>

                <div className="suits__corner suits__corner--br">
                  <span className="suits__rank">{card.rank}</span>
                  <span className="suits__suit-sm">{card.suit}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="suits__caption">Hover to reveal · Click the Joker to read our story</p>

    </section>
  )
}
