import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Spread.css'

gsap.registerPlugin(ScrollTrigger)

const WORKS = [
  { id: 0, title: 'Resonance Wall',  medium: 'Interactive Installation', year: '2024', rank: 'A',  suit: '♠', isRed: false },
  { id: 1, title: 'Echo Chamber',    medium: 'Sound · Light',            year: '2023', rank: 'K',  suit: '♥', isRed: true  },
  { id: 2, title: 'Liminal',         medium: 'Video Installation',       year: '2023', rank: 'Q',  suit: '♦', isRed: true  },
  { id: 3, title: 'Void Garden',     medium: 'Generative Art',           year: '2022', rank: 'J',  suit: '♣', isRed: false },
  { id: 4, title: 'Phantom Grid',    medium: 'Mixed Reality',            year: '2024', rank: '10', suit: '♠', isRed: false },
  { id: 5, title: 'Drift',           medium: 'Performance · Tech',       year: '2022', rank: '9',  suit: '♥', isRed: true  },
  { id: 6, title: 'Tessera',         medium: 'Interactive Sculpture',    year: '2023', rank: '8',  suit: '♦', isRed: true  },
  { id: 7, title: 'Signal / Noise',  medium: 'Web Experience',           year: '2024', rank: '7',  suit: '♣', isRed: false },
  { id: 8, title: 'Membrane',        medium: 'Bioart · Sensors',         year: '2022', rank: '6',  suit: '♠', isRed: false },
  { id: 9, title: 'Afterimage',      medium: 'Photography · Code',       year: '2023', rank: '5',  suit: '♥', isRed: true  },
]

const N         = WORKS.length
const CARD_W    = 165
const CARD_H    = 248
const CARD_STEP = CARD_W + 22          // 187px per slot
const CENTER    = 4                    // index of focus card in initial spread
const HALF_W    = (N * CARD_STEP) / 2 // wrap boundary

// Scale by wrapped distance from focus
const DIST_SCALE = [1.10, 0.95, 0.88, 0.82]
function scaleFor(dist) {
  return DIST_SCALE[Math.min(dist, DIST_SCALE.length - 1)]
}

export default function Spread() {
  const sectionRef     = useRef(null)
  const stageRef       = useRef(null)
  const cardRefs       = useRef([])
  const spreadDoneRef  = useRef(false)
  const carouselOffRef = useRef(0)
  const focusIdxRef    = useRef(CENTER)
  const [focusIdx, setFocusIdx] = useState(CENTER)
  const [isDone, setIsDone]     = useState(false)

  useEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight

    const PILE_X  = vw / 2 - CARD_W / 2
    const PILE_Y  = vh * 0.68 - CARD_H / 2
    const FINAL_Y = vh * 0.60 - CARD_H / 2

    const cards = cardRefs.current.filter(Boolean)
    const stage = stageRef.current

    // ── Initial pile state ────────────────────────────────────────
    gsap.set(cards, {
      x: PILE_X, y: PILE_Y,
      scale: 1,
      zIndex: i => N - i,
      force3D: true,
    })

    const finalX = i => vw / 2 - CARD_W / 2 + (i - CENTER) * CARD_STEP

    // ── Apply depth-of-field scales from a focus index ────────────
    const applyScales = (fi, animate = true) => {
      cards.forEach((card, i) => {
        const wrapDist = Math.min(Math.abs(i - fi), N - Math.abs(i - fi))
        const s = scaleFor(wrapDist)
        if (animate) gsap.to(card,  { scale: s, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
        else         gsap.set(card, { scale: s })
      })
    }

    // ── Update card positions during carousel drag ────────────────
    const updatePositions = () => {
      const off = carouselOffRef.current
      let closest = 0, closestDist = Infinity

      cards.forEach((card, i) => {
        let voff = (i - CENTER) * CARD_STEP + off
        while (voff >= HALF_W)  voff -= N * CARD_STEP
        while (voff < -HALF_W)  voff += N * CARD_STEP
        gsap.set(card, { x: vw / 2 - CARD_W / 2 + voff, force3D: true })

        if (Math.abs(voff) < closestDist) {
          closestDist = Math.abs(voff)
          closest = i
        }
      })

      if (closest !== focusIdxRef.current) {
        focusIdxRef.current = closest
        setFocusIdx(closest)
        applyScales(closest, true)
      }
    }

    // ── Animate carousel to a specific card index ────────────────
    let clickTween = null

    const animateToCard = targetIdx => {
      // Visual offset of targetIdx at current carousel state
      let voff = (targetIdx - CENTER) * CARD_STEP + carouselOffRef.current
      // Normalise to shortest path: wrap into (-HALF_W, HALF_W]
      while (voff >  HALF_W) voff -= N * CARD_STEP
      while (voff < -HALF_W) voff += N * CARD_STEP
      // Target carousel offset that brings voff to 0
      const targetOff = carouselOffRef.current - voff
      if (clickTween) clickTween.kill()
      clickTween = gsap.to(carouselOffRef, {
        current:  targetOff,
        duration: 0.55,
        ease:     'power3.out',
        onUpdate: updatePositions,
      })
    }

    // ── Drag logic ────────────────────────────────────────────────
    let isDragging = false
    let didDrag    = false
    let startX = 0, lastX = 0, velX = 0, rafId = null

    const onDown = e => {
      if (!spreadDoneRef.current) return
      isDragging = true
      didDrag    = false
      startX = lastX = e.clientX
      velX = 0
      cancelAnimationFrame(rafId)
      if (clickTween) clickTween.kill()
      stage.setPointerCapture(e.pointerId)
    }

    const onMove = e => {
      if (!isDragging) return
      if (Math.abs(e.clientX - startX) > 6) didDrag = true
      const dx = e.clientX - lastX
      carouselOffRef.current += dx
      velX = dx
      lastX = e.clientX
      updatePositions()
    }

    const onUp = e => {
      if (!isDragging) return
      isDragging = false

      if (!didDrag) {
        // Pure click — use elementFromPoint because setPointerCapture makes e.target always the stage
        const el = document.elementFromPoint(e.clientX, e.clientY)
        const cardEl = el?.closest('.sp__card')
        if (cardEl) {
          const idx = cardRefs.current.findIndex(r => r === cardEl)
          if (idx !== -1 && idx !== focusIdxRef.current) {
            animateToCard(idx)
          }
        }
        return
      }

      // Momentum scroll
      const tick = () => {
        if (Math.abs(velX) < 0.3) return
        carouselOffRef.current += velX
        velX *= 0.94
        updatePositions()
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    }

    stage.addEventListener('pointerdown',   onDown)
    stage.addEventListener('pointermove',   onMove)
    stage.addEventListener('pointerup',     onUp)
    stage.addEventListener('pointercancel', onUp)

    // ── Spread timeline ───────────────────────────────────────────
    const tl = gsap.timeline({ paused: true })

    cards.forEach((card, i) => {
      tl.to(card, {
        x: finalX(i),
        y: FINAL_Y,
        duration: 0.80,
        ease: 'power3.out',
        force3D: true,
      }, Math.abs(i - CENTER) * 0.025)
    })

    // ── ScrollTrigger ─────────────────────────────────────────────
    const st = ScrollTrigger.create({
      trigger:   sectionRef.current,
      start:     'top top',
      end:       '+=350%',
      scrub:     1.0,
      animation: tl,
      onUpdate(self) {
        const done = self.progress >= 0.98
        if (done === spreadDoneRef.current) return

        if (done) {
          spreadDoneRef.current = true
          setIsDone(true)
          applyScales(CENTER, true)
        } else {
          spreadDoneRef.current = false
          setIsDone(false)
          carouselOffRef.current = 0
          focusIdxRef.current = CENTER
          setFocusIdx(CENTER)
          gsap.to(cards, { scale: 1, duration: 0.3, overwrite: 'auto' })
        }
      },
    })

    return () => {
      st.kill()
      tl.kill()
      cancelAnimationFrame(rafId)
      stage.removeEventListener('pointerdown',   onDown)
      stage.removeEventListener('pointermove',   onMove)
      stage.removeEventListener('pointerup',     onUp)
      stage.removeEventListener('pointercancel', onUp)
    }
  }, [])

  const work = WORKS[focusIdx]

  return (
    <section ref={sectionRef} id="spread" className="sp">
      <div className="sp__sticky">

        {/* Watermark */}
        <div className="sp__watermark">
          <p className="sp__wm-scene">SCENE III</p>
          <h2 className="sp__wm-title">THE SPREAD</h2>
        </div>

        {/* Info bar */}
        <div className="sp__info">
          <div key={focusIdx} className="sp__info-content">
            <p className="sp__info-year">{work.year}</p>
            <h2 className="sp__info-title">{work.title}</h2>
            <p className="sp__info-medium">{work.medium}</p>
          </div>
        </div>

        {/* Card stage */}
        <div
          ref={stageRef}
          className="sp__stage"
          style={{ cursor: isDone ? 'grab' : 'default' }}
        >
          {WORKS.map((w, i) => (
            <div
              key={w.id}
              ref={el => (cardRefs.current[i] = el)}
              className={`sp__card${w.isRed ? ' is-red' : ''}${focusIdx === i ? ' is-focus' : ''}`}
            >
              <div className="sp__card-back">
                <div className="sp__card-back-pattern" />
                <span className={`sp__card-back-suit${w.isRed ? ' is-red' : ''}`}>
                  {w.suit}
                </span>
              </div>
              <div className="sp__card-corner sp__card-corner--tl">
                <span className="sp__card-rank">{w.rank}</span>
                <span className="sp__card-suit-sm">{w.suit}</span>
              </div>
              <div className="sp__card-corner sp__card-corner--br">
                <span className="sp__card-rank">{w.rank}</span>
                <span className="sp__card-suit-sm">{w.suit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Drag hint */}
        <p className="sp__hint" style={{ opacity: isDone ? 1 : 0 }}>
          ← &nbsp;DRAG TO EXPLORE&nbsp; →
        </p>

      </div>
    </section>
  )
}
