import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Spread.css'
import CardfrontImg from '../../assets/cardfront.png'
import CardbackImg  from '../../assets/Cardback.png'

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

// ── Visual-magic extra falling cards ──────────────────────────────────────
// Wave 1 (0-31):  edge-heavy, early delays  0.04-0.59
// Wave 2 (32-59): wider spread, late delays 0.48-0.93  → second-text density surge
// Wave 3 (60-79): upper-zone rain — very close to top edge, lands in top-half only
//                 fills the void above that waves 1 & 2 miss
//
// sy  close to viewport top so cards are visible from the moment the fall begins.
// ey  spans 0 → 1.3 so cards are distributed across the FULL screen height.
const EXTRA_N = 96
const _eSeed = (() => {
  let s = 0xb00b1e5 >>> 0
  return () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 4294967296 }
})()
const _XSUITS = ['♠', '♥', '♦', '♣']
const EXTRA_DEFS = Array.from({ length: EXTRA_N }, (_, i) => {
  const wave2 = i >= 32 && i < 60
  const wave3 = i >= 60                         // upper-zone rain

  if (wave3) {
    // Upper-zone: sy hugs the very top edge (-0.01 → -0.18) so cards are
    // VISIBLE from the first scroll pixel and rain downward through the top
    // third of the screen.  Stay on left/right edges (never centre).
    const w3idx  = i - 60                       // 0 … 35
    const w3left = w3idx < 18
    return {
      sx:    w3left ? 0.01 + _eSeed() * 0.28 : 0.71 + _eSeed() * 0.28,
      sy:   -0.01 - _eSeed() * 0.17,            // -0.01 → -0.18 (right at top edge)
      ex:    w3left ? 0.01 + _eSeed() * 0.28 : 0.71 + _eSeed() * 0.28,
      ey:    0.05 + _eSeed() * 0.55,             // 0.05 → 0.60  (upper to mid)
      rotA: (_eSeed() - 0.5) * 45,
      rotB: (_eSeed() - 0.5) * 120,
      delay: _eSeed() * 0.38,                    // 0 → 0.38  all appear early
      sc:    0.48 + _eSeed() * 0.38,
      suit:  _XSUITS[i % 4],
      isRed: i % 2 !== 0,
    }
  }

  const left = wave2 ? i % 2 === 0 : i < 16
  return {
    sx:    left ? _eSeed() * 0.32 : 0.68 + _eSeed() * 0.32,
    sy:   -0.12 - _eSeed() * (wave2 ? 0.90 : 0.72),  // -0.12 → -1.02/-0.84
    ex:    left ? _eSeed() * (wave2 ? 0.44 : 0.36) : (wave2 ? 0.56 : 0.64) + _eSeed() * (wave2 ? 0.44 : 0.36),
    ey:    0.04 + _eSeed() * (wave2 ? 1.28 : 1.05),   // full height + past bottom
    rotA: (_eSeed() - 0.5) * 80,
    rotB: (_eSeed() - 0.5) * (wave2 ? 220 : 160),
    delay: wave2
      ? 0.48 + _eSeed() * 0.45   // wave 2: 0.48 – 0.93
      : 0.04 + _eSeed() * 0.55,  // wave 1: 0.04 – 0.59
    sc:    0.45 + _eSeed() * (wave2 ? 0.52 : 0.42),
    suit:  _XSUITS[i % 4],
    isRed: i % 2 !== 0,
  }
})

export default function Spread() {
  const sectionRef     = useRef(null)
  const stageRef       = useRef(null)
  const stickyRef      = useRef(null)
  const stickyBgRef    = useRef(null)   // fadeable black backdrop inside sticky
  const cardRefs       = useRef([])
  const exitText1Ref   = useRef(null)   // "STORY & BRAND" block
  const exitText2Ref   = useRef(null)   // "WE ARE ACE" block
  const extraCardRefs  = useRef([])
  const spreadDoneRef  = useRef(false)
  const exitActiveRef  = useRef(false)
  const carouselOffRef = useRef(0)
  const focusIdxRef    = useRef(CENTER)
  const [focusIdx,      setFocusIdx]      = useState(CENTER)
  const [isDone,        setIsDone]        = useState(false)
  const [isExitActive,  setIsExitActive]  = useState(false)

  useEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight

    const PILE_X  = vw / 2 - CARD_W / 2
    const PILE_Y  = vh * 0.68 - CARD_H / 2
    const FINAL_Y = vh * 0.60 - CARD_H / 2

    const cards = cardRefs.current.filter(Boolean)
    const stage = stageRef.current

    // ── Initial pile state — hidden until DealSuits TC pile hands off ──
    gsap.set(cards, {
      x: PILE_X, y: PILE_Y,
      scale: 1,
      opacity: 0,
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
      if (!spreadDoneRef.current || exitActiveRef.current) return
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
      onEnter:     () => gsap.set(cards, { opacity: 1 }),
      onLeaveBack: () => gsap.set(cards, { opacity: 0 }),
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

    // ── Fall phase (700 → 1500 vh) ───────────────────────────────────────
    const t1El    = exitText1Ref.current
    const t2El    = exitText2Ref.current
    const extraEls = extraCardRefs.current.filter(Boolean)

    // Text block children (top-level elements, staggered on entrance)
    const t1Words = Array.from(t1El.children)
    const t2Words = Array.from(t2El.children)

    // Initialise extra cards: hidden, above viewport
    EXTRA_DEFS.forEach((d, i) => {
      if (!extraEls[i]) return
      gsap.set(extraEls[i], {
        x: d.sx * vw - CARD_W / 2,
        y: d.sy * vh,
        rotateZ: d.rotA,
        opacity: 0,
        scale: d.sc,
        force3D: true,
      })
    })

    // Initialise text blocks: containers hidden, children prepped
    gsap.set([t1El, t2El], { opacity: 0 })
    gsap.set([...t1Words, ...t2Words], { opacity: 0, y: 24 })

    // ── Fall timeline — uses only `to` tweens for original cards so GSAP never
    //   pre-applies a "from" state before the trigger fires.
    //   `fromTo` with immediateRender:false is safe for text elements since they
    //   are not animated by the main spread tl.
    const fallTl = gsap.timeline({ paused: true })

    // Left cards (0-3): fall + gentle leftward drift, out of viewport
    const leftDriftX = [-60, -110, -45, -90]
    ;[0, 1, 2, 3].forEach((ci, li) => {
      fallTl.to(cards[ci], {
        x: finalX(ci) + leftDriftX[li],
        y: vh * (1.40 + li * 0.10),
        rotateZ: -(10 + li * 8),
        opacity: 0,
        ease: 'power2.in',
        duration: 0.58,
      }, 0.01 + li * 0.04)
    })

    // Right cards (6-9): fall + gentle rightward drift, out of viewport
    const rightDriftX = [80, 50, 120, 65]
    ;[6, 7, 8, 9].forEach((ci, ri) => {
      fallTl.to(cards[ci], {
        x: finalX(ci) + rightDriftX[ri],
        y: vh * (1.40 + ri * 0.10),
        rotateZ: 10 + ri * 8,
        opacity: 0,
        ease: 'power2.in',
        duration: 0.58,
      }, 0.01 + ri * 0.04)
    })

    // Center cards (4, 5): fall straight down — clears middle for text
    fallTl.to(cards[4], { x: finalX(4) - 50, y: vh * 1.35, rotateZ: -10, opacity: 0, ease: 'power2.in', duration: 0.62 }, 0.16)
    fallTl.to(cards[5], { x: finalX(5) + 50, y: vh * 1.35, rotateZ:  10, opacity: 0, ease: 'power2.in', duration: 0.62 }, 0.20)

    // Extra cards materialise from above and land on sides
    EXTRA_DEFS.forEach((d, i) => {
      if (!extraEls[i]) return
      fallTl.to(extraEls[i], {
        x: d.ex * vw - CARD_W / 2,
        y: d.ey * vh,
        rotateZ: d.rotB,
        opacity: 0.82,
        scale: d.sc,
        ease: 'power1.in',
        duration: 0.50,
      }, d.delay)
    })

    // ── Text block 1 — "STORY & BRAND"  (appears ~0.28, exits ~0.68) ──
    // Container flips visible, then each child staggers up from below.
    // Wave 1 extra cards are raining during this window.
    fallTl.set(t1El, { opacity: 1 }, 0.29)
    fallTl.fromTo(t1Words,
      { immediateRender: false, opacity: 0, y: 24 },
      { opacity: 1, y: 0, ease: 'power2.out', duration: 0.12, stagger: 0.04 },
      0.30
    )
    // Exit: fade + gentle lift
    fallTl.to(t1El, { opacity: 0, ease: 'power1.in', duration: 0.10 }, 0.68)

    // ── Text block 2 — "WE ARE ACE"  (appears ~0.74, exits ~1.18) ──
    // Wave 2 extra cards are surging hard during this window — spectacular density.
    fallTl.set(t2El, { opacity: 1 }, 0.75)
    fallTl.fromTo(t2Words,
      { immediateRender: false, opacity: 0, y: 24 },
      { opacity: 1, y: 0, ease: 'power2.out', duration: 0.12, stagger: 0.05 },
      0.76
    )
    // Exit: fade — wave 2 cards continue raining after text disappears
    fallTl.to(t2El, { opacity: 0, ease: 'power1.in', duration: 0.10 }, 1.18)

    const fallSt = ScrollTrigger.create({
      trigger:            sectionRef.current,
      start:              () => `top+=${vh * 7} top`,
      end:                () => `top+=${vh * 15} top`,   // 800px of scroll for two text windows
      scrub:              1.5,
      animation:          fallTl,
      invalidateOnRefresh: true,
      onEnter: () => {
        // Snap cards to spread positions and reset extras above viewport,
        // then invalidate so `to` tweens re-capture "from" from these values
        cards.forEach((c, i) => gsap.set(c, {
          x: finalX(i), y: FINAL_Y,
          scale: scaleFor(Math.abs(i - CENTER)),
          rotateZ: 0, opacity: 1,
        }))
        EXTRA_DEFS.forEach((d, i) => {
          if (!extraEls[i]) return
          gsap.set(extraEls[i], {
            x: d.sx * vw - CARD_W / 2, y: d.sy * vh,
            rotateZ: d.rotA, opacity: 0, scale: d.sc,
          })
        })
        // Reset text blocks to initial hidden state so fromTo re-captures correctly
        gsap.set([t1El, t2El], { opacity: 0, y: 0 })
        gsap.set([...t1Words, ...t2Words], { opacity: 0, y: 24 })
        fallTl.invalidate()
        carouselOffRef.current = 0
        focusIdxRef.current    = CENTER
        setFocusIdx(CENTER)
        exitActiveRef.current  = true
        setIsExitActive(true)
      },
      onLeaveBack: () => { exitActiveRef.current = false; setIsExitActive(false) },
    })

    // ── Fade-out phase (1500 → 1700 vh) — Scene 4 floats up into view ────────
    // No camera tilt — just a clean dissolve so the RoyalFlush section beneath
    // reveals itself naturally as the user scrolls past.
    const fadeTl = gsap.timeline({ paused: true })

    // Black sticky backdrop fades → Scene 4 (behind, lower z-index) shows through
    fadeTl.to(stickyBgRef.current,  { opacity: 0, ease: 'power1.inOut', duration: 0.80 }, 0)
    // Stage (all cards) dissolves simultaneously
    fadeTl.to(stageRef.current,     { opacity: 0, ease: 'power1.inOut', duration: 0.80 }, 0)
    // Note: text blocks (t1El, t2El) are handled by fallTl — not touched here
    // so scroll-back correctly reverses the text entrance via fallTl scrub

    const fadeSt = ScrollTrigger.create({
      trigger:   sectionRef.current,
      start:     () => `top+=${vh * 14.5} top`,
      end:       () => `top+=${vh * 16.5} top`,
      scrub:     1.5,
      animation: fadeTl,
    })

    return () => {
      st.kill()
      tl.kill()
      fallSt.kill()
      fallTl.kill()
      fadeSt.kill()
      fadeTl.kill()
      cancelAnimationFrame(rafId)
      stage.removeEventListener('pointerdown',   onDown)
      stage.removeEventListener('pointermove',   onMove)
      stage.removeEventListener('pointerup',     onUp)
      stage.removeEventListener('pointercancel', onUp)
    }
  }, [])

  const work = WORKS[focusIdx]

  return (
    <section ref={sectionRef} id="spread" className="sp" style={{ pointerEvents: 'none' }}>
      <div ref={stickyRef} className="sp__sticky" style={{ pointerEvents: 'none' }}>

        {/* Black backdrop — animated to transparent so Scene 4 can show through */}
        <div ref={stickyBgRef} className="sp__bg" aria-hidden="true" />

        {/* Watermark — hidden once falling-card phase begins so it doesn't
             compete with the STORY & BRAND / WE ARE ACE text blocks */}
        <div
          className="sp__watermark"
          style={{ opacity: isExitActive ? 0 : 1, transition: 'opacity 0.55s ease' }}
        >
          <p className="sp__wm-scene">SCENE III</p>
          <h2 className="sp__wm-title">THE SPREAD</h2>
        </div>

        {/* Info bar */}
        <div className="sp__info" style={{ opacity: isExitActive ? 0 : 1, transition: 'opacity 0.5s ease' }}>
          <div key={focusIdx} className="sp__info-content">
            <p className="sp__info-year">{work.year}</p>
            <h2 className="sp__info-title">{work.title}</h2>
            <p className="sp__info-medium">{work.medium}</p>
          </div>
        </div>

        {/* Card stage — pointer events only active during carousel drag phase */}
        <div
          ref={stageRef}
          className="sp__stage"
          style={{
            cursor: isDone ? 'grab' : 'default',
            pointerEvents: isDone && !isExitActive ? 'auto' : 'none',
          }}
        >
          {WORKS.map((w, i) => (
            <div
              key={w.id}
              ref={el => (cardRefs.current[i] = el)}
              className={`sp__card${w.isRed ? ' is-red' : ''}${focusIdx === i ? ' is-focus' : ''}`}
            >
              <div className="sp__card-back">
                <img src={CardfrontImg} className="sp__card-back-img" alt="" draggable={false} />
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

          {/* Visual-magic extra falling cards */}
          {EXTRA_DEFS.map((d, i) => (
            <div
              key={`xcard-${i}`}
              ref={el => { extraCardRefs.current[i] = el }}
              className={`sp__card${d.isRed ? ' is-red' : ''}`}
              style={{ pointerEvents: 'none' }}
            >
              <div className="sp__card-back">
                <img src={CardbackImg} className="sp__card-back-img" alt="" draggable={false} />
              </div>
            </div>
          ))}
        </div>

        {/* Drag hint */}
        <p className="sp__hint" style={{ opacity: isDone && !isExitActive ? 1 : 0 }}>
          ← &nbsp;DRAG TO EXPLORE&nbsp; →
        </p>

        {/* Text block 1 — "STORY & BRAND": appears as cards rain and centre clears */}
        <div ref={exitText1Ref} className="sp__exit-text">
          <p className="sp__exit-scene">ARA STUDIO</p>
          <h2 className="sp__exit-title">STORY<br />&amp; BRAND</h2>
          <div className="sp__exit-divider" />
          <p className="sp__exit-sub">WE CRAFT EXPERIENCE</p>
        </div>

        {/* Text block 2 — "WE ARE ACE": appears amid wave-2 card surge */}
        <div ref={exitText2Ref} className="sp__exit-text">
          <p className="sp__exit-scene">OUR CORE</p>
          <h2 className="sp__exit-title">WE ARE ACE</h2>
          <div className="sp__exit-divider" />
          <p className="sp__exit-sub">ALL ROUND ACE STUDIO</p>
        </div>

      </div>
    </section>
  )
}
