import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Spread.css'

gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  {
    id: '01', suit: '♠', isRed: false,
    title: 'Resonance Wall',
    cat: 'Interactive Installation',
    desc: 'A sound-reactive installation that transforms ambient noise into visual patterns across a 4m LED matrix.',
    tags: ['Arduino', 'P5.js', 'LED Matrix'],
  },
  {
    id: '02', suit: '♥', isRed: true,
    title: 'Echo Chamber',
    cat: 'Software Development',
    desc: 'Real-time collaborative audio synthesis platform with WebRTC-powered session sharing.',
    tags: ['WebRTC', 'Web Audio API', 'React'],
  },
  {
    id: '03', suit: '♦', isRed: true,
    title: 'Liminal',
    cat: 'Game Development',
    desc: 'A narrative puzzle game exploring the boundary between memory and imagination.',
    tags: ['Unity', 'C#', 'Shader Graph'],
  },
  {
    id: '04', suit: '♣', isRed: false,
    title: 'Void Garden',
    cat: 'Art Installation',
    desc: 'Generative light sculptures that grow and decay in response to live environmental data.',
    tags: ['TouchDesigner', 'OSC', 'LED'],
  },
  {
    id: '05', suit: '♠', isRed: false,
    title: 'Phantom Grid',
    cat: 'Interactive Installation',
    desc: 'Floor-projection system that reacts to footsteps with procedural visual feedback.',
    tags: ['OpenCV', 'Processing', 'Projection'],
  },
  { id: '06', suit: '♥', isRed: true,  coming: true },
  { id: '07', suit: '♦', isRed: true,  coming: true },
  { id: '08', suit: '♣', isRed: false, coming: true },
  { id: '09', suit: '♠', isRed: false, coming: true },
  { id: '10', suit: '♥', isRed: true,  coming: true },
]

function getSpreadPositions(count) {
  const vw = window.innerWidth
  return Array.from({ length: count }, (_, i) => {
    const t   = i / (count - 1)
    const cx  = (t - 0.5) * vw * 0.84
    const cy  = -Math.sin(t * Math.PI) * 28
    const rot = (t - 0.5) * 18
    return { x: cx, y: cy, rotation: rot }
  })
}

export default function Spread() {
  const sectionRef = useRef(null)
  const cardRefs   = useRef([])
  const spreadRef  = useRef(false)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean)
    gsap.set(cards, { x: 0, y: 0, rotation: 0, opacity: 0, scale: 1 })

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 65%',
      onEnter: () => {
        if (spreadRef.current) return
        spreadRef.current = true
        const pos = getSpreadPositions(cards.length)

        // Step 1 — pile appears
        gsap.to(cards, { opacity: 1, duration: 0.4, stagger: 0.03, ease: 'power2.out' })

        // Step 2 — spread from pile
        gsap.to(cards, {
          x: (i) => pos[i].x,
          y: (i) => pos[i].y,
          rotation: (i) => pos[i].rotation,
          delay: 0.3,
          duration: 0.85,
          stagger: 0.07,
          ease: 'power3.out',
        })
      },
      onLeaveBack: () => {
        spreadRef.current = false
        setHovered(null)
        const cards2 = cardRefs.current.filter(Boolean)
        gsap.to(cards2, {
          x: 0, y: 0, rotation: 0, opacity: 0,
          duration: 0.5,
          stagger: { each: 0.05, from: 'end' },
          ease: 'power2.in',
        })
      },
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  const handleEnter = useCallback((idx) => {
    if (!spreadRef.current) return
    setHovered(idx)
    gsap.to(cardRefs.current[idx], { y: '-=32', scale: 1.14, zIndex: 50, duration: 0.3, ease: 'power2.out' })
    cardRefs.current.forEach((c, i) => { if (i !== idx && c) gsap.to(c, { opacity: 0.28, duration: 0.22 }) })
  }, [])

  const handleLeave = useCallback((idx) => {
    setHovered(null)
    const pos = getSpreadPositions(cardRefs.current.filter(Boolean).length)
    gsap.to(cardRefs.current[idx], { y: pos[idx]?.y ?? 0, scale: 1, zIndex: idx + 1, duration: 0.3, ease: 'power2.out' })
    cardRefs.current.forEach(c => { if (c) gsap.to(c, { opacity: 1, duration: 0.22 }) })
  }, [])

  return (
    <section ref={sectionRef} id="spread" className="spread">

      <div className="spread__header">
        <p className="spread__scene-label">SCENE III</p>
        <h2 className="spread__title">THE SPREAD</h2>
        <p className="spread__tagline">All cards on the table.</p>
      </div>

      <div className="spread__stage">
        {PROJECTS.map((proj, idx) => (
          <div
            key={proj.id}
            ref={el => (cardRefs.current[idx] = el)}
            className={[
              'spread__card',
              proj.isRed  ? 'is-red'    : '',
              proj.coming ? 'is-coming' : '',
              hovered === idx ? 'is-hovered' : '',
            ].filter(Boolean).join(' ')}
            style={{ zIndex: idx + 1 }}
            onMouseEnter={() => handleEnter(idx)}
            onMouseLeave={() => handleLeave(idx)}
          >
            {/* Card back (always visible behind) */}
            <div className="spread__card-back">
              <div className="spread__back-pattern" />
            </div>

            {/* Card face */}
            <div className="spread__card-face">

              <div className="spread__corner spread__corner--tl">
                <span className="spread__rank">{proj.id}</span>
                <span className="spread__suit-sm">{proj.suit}</span>
              </div>

              <div className="spread__suit-lg">{proj.coming ? '?' : proj.suit}</div>

              {!proj.coming ? (
                <div className="spread__content">
                  <p className="spread__content-cat">{proj.cat}</p>
                  <h3 className="spread__content-title">{proj.title}</h3>
                  <p className="spread__content-desc">{proj.desc}</p>
                  <div className="spread__tags">
                    {proj.tags.map(t => <span key={t} className="spread__tag">{t}</span>)}
                  </div>
                  <span className="spread__cta">VIEW PROJECT →</span>
                </div>
              ) : (
                <div className="spread__content spread__content--coming">
                  <p className="spread__coming-text">COMING<br />SOON</p>
                </div>
              )}

              <div className="spread__corner spread__corner--br">
                <span className="spread__rank">{proj.id}</span>
                <span className="spread__suit-sm">{proj.suit}</span>
              </div>

            </div>
          </div>
        ))}
      </div>

      <p className="spread__hint">Hover a card to reveal the project</p>

    </section>
  )
}
