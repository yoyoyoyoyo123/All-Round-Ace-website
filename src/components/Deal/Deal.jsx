import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import './Deal.css'

gsap.registerPlugin(ScrollToPlugin)

const PILES = [
  { id: 'spades',   suit: '♠', position: 'top',    slogan: 'We Engineer the Impossible',   isRed: false },
  { id: 'hearts',   suit: '♥', position: 'right',  slogan: 'We Feel What Others Code',      isRed: true  },
  { id: 'diamonds', suit: '♦', position: 'bottom', slogan: 'We Create What Others Imagine', isRed: true  },
  { id: 'clubs',    suit: '♣', position: 'left',   slogan: 'We Play a Different Game',      isRed: false },
]

export default function Deal() {
  const tableRef    = useRef(null)
  const pickTextRef = useRef(null)
  const pileRefs    = useRef([])
  const [hovered, setHovered] = useState(null)
  const [picked,  setPicked]  = useState(false)

  useEffect(() => {
    const piles = pileRefs.current.filter(Boolean)

    gsap.set(tableRef.current, { scale: 0.6, opacity: 0 })
    gsap.set(piles, { scale: 0, opacity: 0 })
    gsap.set(pickTextRef.current, { opacity: 0, y: 16 })

    const tl = gsap.timeline({ delay: 0.2 })

    tl.to(tableRef.current, { scale: 1, opacity: 1, duration: 0.9, ease: 'power3.out' })
      .to(piles, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.6)', stagger: 0.13 }, '-=0.4')
      .to(pickTextRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.15')

    return () => tl.kill()
  }, [])

  const handlePick = (index) => {
    if (picked) return
    setPicked(true)
    setHovered(null)

    const piles = pileRefs.current.filter(Boolean)

    piles.forEach((pile, i) => {
      if (i !== index) {
        gsap.to(pile, { opacity: 0, scale: 0.75, y: 20, duration: 0.35, ease: 'power2.in' })
      }
    })

    gsap.to(pickTextRef.current, { opacity: 0, duration: 0.25 })
    gsap.to(tableRef.current, { opacity: 0, scale: 0.92, duration: 0.5, delay: 0.35, ease: 'power2.in' })

    gsap.to(piles[index], {
      y: '38vh',
      scale: 1.25,
      duration: 0.7,
      ease: 'power3.inOut',
      delay: 0.1,
      onComplete: () => {
        gsap.to(window, {
          scrollTo: { y: '#suits', offsetY: 0 },
          duration: 1.1,
          ease: 'power3.inOut',
        })
      },
    })
  }

  return (
    <section id="deal" className="section deal">
      <div ref={tableRef} className="deal__table">
        <div className="deal__felt">
          <div className="deal__felt-ring" />
          <span className="deal__felt-label">THE WINNING HAND</span>
        </div>

        {PILES.map((pile, i) => (
          <div
            key={pile.id}
            ref={el => (pileRefs.current[i] = el)}
            className={`deal__pile deal__pile--${pile.position}${hovered === i ? ' is-hovered' : ''}${picked ? ' is-locked' : ''}`}
            onMouseEnter={() => !picked && setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handlePick(i)}
          >
            <div className="deal__cards">
              {[0, 1, 2, 3].map(j => (
                <div key={j} className="deal__card deal__card--back" style={{ '--idx': j }} />
              ))}
              <div className="deal__card deal__card--top">
                <span className={`deal__suit${pile.isRed ? ' is-red' : ''}`}>{pile.suit}</span>
              </div>
            </div>
            <p className="deal__slogan">{pile.slogan}</p>
          </div>
        ))}
      </div>

      <h2 ref={pickTextRef} className="deal__pick-text">PICK ONE</h2>
    </section>
  )
}
