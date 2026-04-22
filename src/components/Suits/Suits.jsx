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
    fanX: -220, fanY: 25, fanRot: -18,
  },
  {
    id: 'spade',
    rank: 'A',
    suit: '♠',
    isRed: false,
    isJoker: false,
    title: 'Interactive Installation',
    sub: '互動裝置',
    desc: 'Spaces that respond to presence. Experiences that blur the line between the digital and physical — environments you don\'t just see, you inhabit.',
    fanX: -110, fanY: 10, fanRot: -9,
  },
  {
    id: 'heart',
    rank: 'A',
    suit: '♥',
    isRed: true,
    isJoker: false,
    title: 'Software Development',
    sub: '軟體開發',
    desc: 'From embedded firmware to full-stack web — we engineer software with precision and intention. Code that feels as good as it performs.',
    fanX: 0, fanY: 0, fanRot: 0,
  },
  {
    id: 'diamond',
    rank: 'A',
    suit: '♦',
    isRed: true,
    isJoker: false,
    title: 'Game Development',
    sub: '遊戲開發',
    desc: 'Rules exist to be rewritten. We design worlds with consequence, where every choice matters and every player feels like the protagonist.',
    fanX: 110, fanY: 10, fanRot: 9,
  },
  {
    id: 'club',
    rank: 'A',
    suit: '♣',
    isRed: false,
    isJoker: false,
    title: 'Art Installation',
    sub: '藝術裝置',
    desc: 'Light, form, and material become language. We sculpt space into statements — work that demands presence and refuses to be ignored.',
    fanX: 220, fanY: 25, fanRot: 18,
  },
]

export default function Suits() {
  const sectionRef = useRef(null)
  const cardRefs   = useRef([])
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean)

    // Start stacked at center, below section
    gsap.set(cards, { x: 0, y: 180, rotation: 0, opacity: 0, scale: 1 })

    // Fan out when scrolled into view
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 65%',
      once: true,
      onEnter: () => {
        gsap.to(cards, {
          x: (i) => CARDS[i].fanX,
          y: (i) => CARDS[i].fanY,
          rotation: (i) => CARDS[i].fanRot,
          opacity: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power3.out',
        })
      },
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  const handleEnter = useCallback((idx) => {
    setHovered(idx)
    const card = cardRefs.current[idx]
    gsap.to(card, {
      y: CARDS[idx].fanY - 30,
      scale: 1.06,
      zIndex: 10,
      duration: 0.35,
      ease: 'power2.out',
    })
    cardRefs.current.forEach((c, i) => {
      if (i !== idx && c) gsap.to(c, { opacity: 0.35, duration: 0.25 })
    })
  }, [])

  const handleLeave = useCallback((idx) => {
    setHovered(null)
    const card = cardRefs.current[idx]
    gsap.to(card, {
      y: CARDS[idx].fanY,
      scale: 1,
      zIndex: 1,
      duration: 0.35,
      ease: 'power2.out',
    })
    cardRefs.current.forEach(c => {
      if (c) gsap.to(c, { opacity: 1, duration: 0.25 })
    })
  }, [])

  return (
    <section ref={sectionRef} id="suits" className="suits">

      <div className="suits__header">
        <p className="suits__scene-label">SCENE II</p>
        <h2 className="suits__title">THE SUITS</h2>
        <p className="suits__tagline">Choose your game</p>
      </div>

      <div className="suits__hand">
        {CARDS.map((card, idx) => (
          <div
            key={card.id}
            ref={el => (cardRefs.current[idx] = el)}
            className={[
              'suits__card',
              card.isRed   ? 'is-red'   : '',
              card.isJoker ? 'is-joker' : '',
              hovered === idx ? 'is-hovered' : '',
            ].filter(Boolean).join(' ')}
            onMouseEnter={() => handleEnter(idx)}
            onMouseLeave={() => handleLeave(idx)}
          >
            {/* Top-left corner */}
            <div className="suits__corner suits__corner--tl">
              <span className="suits__rank">{card.rank}</span>
              <span className="suits__suit-sm">{card.suit}</span>
            </div>

            {/* Center face */}
            <div className="suits__face">
              <div className="suits__suit-lg">{card.suit}</div>
              <div className="suits__info">
                <h3 className="suits__card-title">{card.title}</h3>
                <p className="suits__card-sub">{card.sub}</p>
              </div>
              <p className="suits__desc">{card.desc}</p>
            </div>

            {/* Bottom-right corner (inverted) */}
            <div className="suits__corner suits__corner--br">
              <span className="suits__rank">{card.rank}</span>
              <span className="suits__suit-sm">{card.suit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom caption */}
      <p className="suits__caption">Hover to reveal · Click the Joker to read our story</p>

    </section>
  )
}
