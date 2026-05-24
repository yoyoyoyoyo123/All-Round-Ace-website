import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './AllIn.css'
import AceCoin  from '../../assets/acecoin.png'
import CoinSide from '../../assets/coinside.png'

gsap.registerPlugin(ScrollTrigger)

const SCROLL_VH = 3
const N_COINS   = 72

// Seeded PRNG (xorshift)
const _rnd = (() => {
  let s = 0xa11115 >>> 0
  return () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 4294967296 }
})()

const COIN_DEFS = Array.from({ length: N_COINS }, () => {
  const useSide = _rnd() > 0.42
  const mirror  = useSide && _rnd() > 0.5
  const ex      = 0.01 + _rnd() * 0.98
  const ey      = 0.02 + _rnd() * 0.96
  const sx      = Math.max(0.01, Math.min(0.99, ex + (_rnd() - 0.5) * 0.25))
  const sy      = 1.08 + _rnd() * 0.70
  return {
    useSide,
    mirror,
    ex, ey,
    sx, sy,
    rotA:  _rnd() * 360,
    rotB:  (_rnd() - 0.5) * 60,
    size:  Math.round(55 + _rnd() * 90),
    delay: (1 - ey) * 0.65 + _rnd() * 0.30,
  }
})

// ─────────────────────────────────────────────────────────────────────────────
//  ContactModal
// ─────────────────────────────────────────────────────────────────────────────
function ContactModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    onClose()
  }

  return (
    <div className="ai__modal-backdrop" onMouseDown={onClose}>
      <div className="ai__modal" onMouseDown={e => e.stopPropagation()}>
        <button className="ai__modal-close" onClick={onClose} aria-label="Close">✕</button>

        <p className="ai__modal-scene">SCENE V · ALL IN</p>
        <h2 className="ai__modal-title">LET'S<br />TALK.</h2>

        <form className="ai__form" onSubmit={handleSubmit}>
          <div className="ai__field">
            <label className="ai__label" htmlFor="ai-name">NAME</label>
            <input
              id="ai-name"
              className="ai__input"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ai__field">
            <label className="ai__label" htmlFor="ai-email">EMAIL</label>
            <input
              id="ai-email"
              className="ai__input"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ai__field">
            <label className="ai__label" htmlFor="ai-message">MESSAGE</label>
            <textarea
              id="ai-message"
              className="ai__textarea"
              name="message"
              value={form.message}
              onChange={handleChange}
              required
            />
          </div>

          <button className="ai__submit" type="submit">SEND IT →</button>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  AllIn — Scene 5: ALL IN (contact)
// ─────────────────────────────────────────────────────────────────────────────
export default function AllIn() {
  const sectionRef = useRef(null)
  const stickyRef  = useRef(null)
  const stageRef   = useRef(null)
  const coinRefs   = useRef([])
  const contentRef = useRef(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const vh = window.innerHeight
    const vw = window.innerWidth

    // Inject scroll height
    sectionRef.current.style.height = `${(SCROLL_VH + 2) * vh}px`

    // Init coin positions (all below viewport, opacity 0)
    coinRefs.current.forEach((el, i) => {
      const d = COIN_DEFS[i]
      gsap.set(el, {
        x:       d.sx * vw,
        y:       d.sy * vh,
        rotateZ: d.rotA,
        scaleX:  d.mirror ? -1 : 1,
        opacity: 0,
      })
    })

    // Init content
    gsap.set(contentRef.current, { opacity: 0, y: 18 })

    // Build timeline
    const tl = gsap.timeline({ paused: true })

    // Stagger coins in
    coinRefs.current.forEach((el, i) => {
      const d = COIN_DEFS[i]
      tl.to(el, {
        x:       d.ex * vw,
        y:       d.ey * vh,
        rotateZ: d.rotB,
        opacity: 0.88,
        duration: 1,
        ease:    'power2.out',
      }, d.delay * 0.80)
    })

    // Content fade in
    tl.to(contentRef.current, {
      opacity:  1,
      y:        0,
      duration: 0.5,
      ease:     'power2.out',
    }, 0.35)

    const st = ScrollTrigger.create({
      trigger:   sectionRef.current,
      start:     'top top',
      end:       () => `+=${vh * SCROLL_VH}`,
      scrub:     1.5,
      animation: tl,
    })

    const handleResize = () => {
      const nvh = window.innerHeight
      const nvw = window.innerWidth
      sectionRef.current.style.height = `${(SCROLL_VH + 2) * nvh}px`
      coinRefs.current.forEach((el, i) => {
        const d = COIN_DEFS[i]
        gsap.set(el, { x: d.sx * nvw, y: d.sy * nvh })
      })
      st.refresh()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      st.kill()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      <section ref={sectionRef} className="ai" id="all-in">
        <div ref={stickyRef} className="ai__sticky">

          {/* Coin stage */}
          <div ref={stageRef} className="ai__stage" aria-hidden="true">
            {COIN_DEFS.map((d, i) => (
              <img
                key={i}
                ref={el => { coinRefs.current[i] = el }}
                src={d.useSide ? CoinSide : AceCoin}
                className="ai__coin"
                style={{ width: d.size }}
                alt=""
                draggable={false}
              />
            ))}
          </div>

          {/* Dark overlay */}
          <div className="ai__overlay" aria-hidden="true" />

          {/* Content */}
          <div ref={contentRef} className="ai__content">
            <p className="ai__scene">SCENE V</p>
            <h2 className="ai__title">ALL IN.</h2>
            <div className="ai__divider" aria-hidden="true" />
            <button
              className="ai__cta"
              onClick={() => setModalOpen(true)}
            >
              LET'S TALK
            </button>
          </div>

          {/* Footer */}
          <footer className="ai__footer">
            <span className="ai__footer-label">ALL ROUND ACE STUDIO</span>
          </footer>

        </div>
      </section>

      {modalOpen && <ContactModal onClose={() => setModalOpen(false)} />}
    </>
  )
}
