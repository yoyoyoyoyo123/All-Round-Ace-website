import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './DealSuits.css'
import BgImg      from '../../assets/LandingPage/Bg.png'
import TableImg   from '../../assets/LandingPage/Table.png'
import MdImg      from '../../assets/LandingPage/MdPeople.png'
import LImg       from '../../assets/LandingPage/LPeople.png'
import RImg       from '../../assets/LandingPage/RPeople.png'
import CardbackImg  from '../../assets/Cardback.png'
import CardfrontImg from '../../assets/cardfront.png'
import SpadeImg    from '../../assets/4suits/spade.svg'
import HeartImg    from '../../assets/4suits/heart.svg'
import DiamondImg  from '../../assets/4suits/diamond.svg'
import ClubImg     from '../../assets/4suits/club.svg'
import S2Img1  from '../../assets/section2img/1.jpg'
import S2Img2  from '../../assets/section2img/2.jpg'
import S2Img3  from '../../assets/section2img/3.jpg'
import S2Img4  from '../../assets/section2img/4.jpg'
import S2Img5  from '../../assets/section2img/5.jpg'
import S2Img6  from '../../assets/section2img/6.jpg'
import S2Img7  from '../../assets/section2img/7.jpg'
import S2Img8  from '../../assets/section2img/8.jpg'
import S2Img9  from '../../assets/section2img/9.jpg'
import S2Img10 from '../../assets/section2img/10.jpg'

const SUIT_IMG = { '♠': SpadeImg, '♥': HeartImg, '♦': DiamondImg, '♣': ClubImg }

gsap.registerPlugin(ScrollTrigger)

const PANELS = [
  {
    id: 'joker', rank: 'JOKER', suit: '★', isRed: false, isJoker: true,
    title: 'ARA Studio', sub: 'BRAND CORE · 品牌核心',
    desc: '當科技能夠感受情緒，當藝術能夠被精準運算——這就是 All Round Ace Studio 存在的理由。我們打破理性工程與感性體驗之間的界線，創造真正能與人對話的互動體驗。',
    tags: ['INTERACTIVE EXPERIENCE', 'CROSS-DISCIPLINARY', 'FULL-STACK CREATIVE'],
    imgs: [S2Img1, S2Img2],
    imgLabels: ['CREATIVE CORE', 'THE STUDIO'],
  },
  {
    id: 'spade', rank: 'A', suit: '♠', isRed: false, isJoker: false,
    title: 'Interactive Installation', sub: '互動裝置',
    desc: "Spaces that respond to presence. Environments that blur the digital and the physical — you don't just see them, you inhabit them.",
    tags: ['SENSORS', 'REAL-TIME', 'PHYSICAL COMPUTING'],
    imgs: [S2Img3, S2Img4],
    imgLabels: ['SENSOR SPACE', 'LIVE SIGNAL'],
  },
  {
    id: 'heart', rank: 'K', suit: '♥', isRed: true, isJoker: false,
    title: 'Software Development', sub: '軟體開發',
    desc: 'From embedded firmware to full-stack web — precision-engineered software that feels as good as it performs.',
    tags: ['FULL-STACK', 'EMBEDDED', 'WEB & MOBILE'],
    imgs: [S2Img5, S2Img6],
    imgLabels: ['SYSTEM LAYER', 'CODE RUNS DEEP'],
  },
  {
    id: 'diamond', rank: 'Q', suit: '♦', isRed: true, isJoker: false,
    title: 'Game Development', sub: '遊戲開發',
    desc: 'Rules exist to be rewritten. We design worlds with consequence — every choice matters, every player is the protagonist.',
    tags: ['UNITY', 'UNREAL', 'CUSTOM ENGINE'],
    imgs: [S2Img7, S2Img8],
    imgLabels: ['WORLD DESIGN', 'PLAYER ZERO'],
  },
  {
    id: 'club', rank: 'J', suit: '♣', isRed: false, isJoker: false,
    title: 'Art Installation', sub: '藝術裝置',
    desc: 'Light, form, and material become language. We sculpt space into statements — work that demands presence.',
    tags: ['GENERATIVE', 'LIGHT & SPACE', 'SCULPTURAL'],
    imgs: [S2Img9, S2Img10],
    imgLabels: ['FORM & VOID', 'LIGHT SCULPT'],
  },
]

const CARD_W = 130
const CARD_H = 195

// ── Transition card definitions (14 cards: indices 0-5 inner ring, 6-13 outer ring) ──
const INNER_N = 6
const OUTER_N = 8
const TC_SUITS = [
  { suit: '♠', rank: 'A',  isRed: false },  // inner 0 — matches Spread card[0] (A♠) → lands on top
  { suit: '♥', rank: 'K',  isRed: true  },  // inner 1
  { suit: '♦', rank: 'Q',  isRed: true  },  // inner 2
  { suit: '♣', rank: 'J',  isRed: false },  // inner 3
  { suit: '♠', rank: '10', isRed: false },  // inner 4
  { suit: '♥', rank: '9',  isRed: true  },  // inner 5
  { suit: '♦', rank: '8',  isRed: true  },  // outer 0
  { suit: '♣', rank: '7',  isRed: false },  // outer 1
  { suit: '♠', rank: '6',  isRed: false },  // outer 2
  { suit: '♥', rank: '5',  isRed: true  },  // outer 3
  { suit: '♦', rank: '4',  isRed: true  },  // outer 4
  { suit: '♣', rank: '3',  isRed: false },  // outer 5
  { suit: '♠', rank: '2',  isRed: false },  // outer 6
  { suit: '★', rank: '',   isRed: false },  // outer 7 — joker star (no rank)
]

export default function DealSuits() {
  const sectionRef  = useRef(null)
  const stickyRef   = useRef(null)   // fixed viewport layer — visibility managed via JS
  const cardRefs    = useRef([])     // Scene 2 deal card backs
  const panelElRefs = useRef([])     // ds__panel elements
  const panelsRef   = useRef(null)   // ds__panels container
  const landingRef   = useRef(null)   // landing image layer
  const sloganRef         = useRef(null)   // ring-phase centre slogan
  const sloganBdRef       = useRef(null)   // full-screen fog backdrop
  const ringBgRef         = useRef(null)   // ring-phase background layer
  const canvasRef         = useRef(null)   // Matrix stream canvas
  const canvasRafRef      = useRef(null)   // requestAnimationFrame id
  const canvasMouseRef    = useRef(null)   // mousemove cleanup fn
  const expandedRef  = useRef(false)
  const trCardRefs   = useRef([])     // 14 transition cards
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const VH = vh / 100   // 1 CSS vh in pixels (e.g. 8.42px at 842px viewport)
    const COL_W  = vw / 5
    const COL_CX = PANELS.map((_, i) => (i + 0.5) * COL_W)
    const PILE_CX = vw / 2
    const PILE_CY = vh * 0.75

    const cards    = cardRefs.current.filter(Boolean)
    const panelEls = panelElRefs.current.filter(Boolean)
    const trCards  = trCardRefs.current.filter(Boolean)

    // ── Transition card geometry (matches Spread.jsx pile coords) ──────────
    const TR_W     = 165
    const TR_H     = 248
    const TR_CX    = vw / 2          // pile centre x (matches Spread.jsx)
    const TR_CY    = vh * 0.68       // pile centre y (matches Spread.jsx for seamless handoff)
    const TR_PILE_X = TR_CX - TR_W / 2
    const TR_PILE_Y = TR_CY - TR_H / 2

    // Ring is centred at vh*0.50 so both inner & outer rings fit within the viewport.
    // vh-based radii guarantee the ring is always fully visible regardless of aspect ratio.
    // (RING_CY is separate from TR_CY so the collapse pile still lands at Spread's coords.)
    const RING_CY = vh * 0.46        // slightly above centre so enlarged rings still fit
    const INNER_R = vh * 0.52        // pushed outward to open centre space for slogan
    const OUTER_R = vh * 0.82        // outer cards mostly off-screen — maximum tension

    // Pre-compute clockwise ring target positions (0 = top, increase = CW)
    // Uses RING_CY (vh*0.50) so the full ring fits within the viewport
    const trTargetX = []
    const trTargetY = []
    for (let i = 0; i < INNER_N; i++) {
      const a = (i * 2 * Math.PI / INNER_N) - Math.PI / 2
      trTargetX.push(TR_CX   + INNER_R * Math.cos(a) - TR_W / 2)
      trTargetY.push(RING_CY + INNER_R * Math.sin(a) - TR_H / 2)
    }
    for (let i = 0; i < OUTER_N; i++) {
      const a = (i * 2 * Math.PI / OUTER_N) - Math.PI / 2
      trTargetX.push(TR_CX   + OUTER_R * Math.cos(a) - TR_W / 2)
      trTargetY.push(RING_CY + OUTER_R * Math.sin(a) - TR_H / 2)
    }

    // Pre-compute target rotation for each card (tangent to its ring position)
    // rotation = angle_degrees + 90  →  card's long axis points along the circle tangent
    const trTargetRotation = []
    for (let i = 0; i < INNER_N; i++) {
      const a = (i * 2 * Math.PI / INNER_N) - Math.PI / 2
      trTargetRotation.push(a * 180 / Math.PI + 90)
    }
    for (let i = 0; i < OUTER_N; i++) {
      const a = (i * 2 * Math.PI / OUTER_N) - Math.PI / 2
      trTargetRotation.push(a * 180 / Math.PI + 90)
    }

    // Live angle state for auto-rotation ticker
    const trAngles = [
      ...Array.from({ length: INNER_N }, (_, i) => (i * 2 * Math.PI / INNER_N) - Math.PI / 2),
      ...Array.from({ length: OUTER_N }, (_, i) => (i * 2 * Math.PI / OUTER_N) - Math.PI / 2),
    ]

    // clip-path values for Scene 2 panel animation
    const T = (vh - CARD_H) / 2
    const H = (COL_W - CARD_W) / 2
    const clipClosed = `inset(${T}px ${H}px ${T}px ${H}px)`
    const clipOpen   = 'inset(0px 0px 0px 0px)'

    // ── Initial states ────────────────────────────────────────────────────
    gsap.set(cards, {
      xPercent: -50, yPercent: -50,
      x: PILE_CX, y: PILE_CY,
      scaleX: 1, scaleY: 1,
      zIndex: 20,
    })
    const watermark = panelsRef.current.querySelector('.ds__watermark')
    gsap.set(panelEls, { clipPath: clipClosed, opacity: 0 })
    gsap.set(watermark, { opacity: 0 })
    gsap.set(panelsRef.current, { opacity: 1, pointerEvents: 'none' })

    // Transition cards: hidden at pile
    gsap.set(trCards, {
      x: TR_PILE_X, y: TR_PILE_Y,
      opacity: 0, scale: 0.85,
      zIndex: 18,
    })

    // ══════════════════════════════════════════════════════════════════════
    //  SCENE 2 — card deal reveal  (0 → 600 vh)
    // ══════════════════════════════════════════════════════════════════════
    const tl = gsap.timeline({ paused: true })

    tl.to(cards, { y: vh * 0.5, duration: 0.10, ease: 'power2.out' }, 0)

    cards.forEach((card, i) => {
      tl.to(card, { x: COL_CX[i], duration: 0.28, ease: 'power2.inOut' }, 0.08)
    })

    tl.to(cards, { scaleX: 0, duration: 0.14, ease: 'power2.in', force3D: false }, 0.36)
    tl.set(panelEls, { opacity: 1 }, 0.50)
    tl.to(cards, { opacity: 0, duration: 0.06, ease: 'none', force3D: false }, 0.50)

    panelEls.forEach(panel => {
      tl.fromTo(panel,
        { clipPath: clipClosed },
        { clipPath: clipOpen, duration: 0.45, ease: 'power3.out' },
        0.50
      )
    })

    tl.to(landingRef.current, { opacity: 0, duration: 0.18, ease: 'power1.in' }, 0.47)
    tl.to(watermark, { opacity: 1, duration: 0.12, ease: 'power1.in' }, 0.88)

    const st = ScrollTrigger.create({
      trigger:   sectionRef.current,
      start:     'top top',
      end:       '+=600%',
      scrub:     1.0,
      animation: tl,
      onUpdate(self) {
        const nowExp = self.progress >= 0.97
        if (nowExp !== expandedRef.current) {
          expandedRef.current = nowExp
          gsap.set(panelsRef.current, { pointerEvents: nowExp ? 'auto' : 'none' })
          if (!nowExp) setHovered(null)
        }
      },
    })

    // ══════════════════════════════════════════════════════════════════════
    //  PHASE 1 — panels collapse → pile  (800 → 1050 vh)
    // ══════════════════════════════════════════════════════════════════════
    const p1tl = gsap.timeline({ paused: true })

    panelEls.forEach((panel, i) => {
      // x / y / scale / zIndex only — opacity is bypassed below via onUpdate
      const deltaX = TR_CX - COL_CX[i]
      const deltaY = TR_CY - vh / 2
      const distFromCenter = Math.abs(i - 2)
      p1tl.to(panel, {
        x: deltaX,
        y: deltaY,
        scale: 0.08,
        zIndex: distFromCenter + 1,
        duration: 0.60,
        ease: 'power3.in',
      }, i * 0.05)
    })

    // Transition cards pop in at pile — scale only; opacity controlled via onUpdate
    p1tl.to(trCards, {
      scale: 1,
      duration: 0.22,
      ease: 'back.out(1.3)',
      stagger: 0.016,
    }, 0.52)

    // p1tl total duration = 0.80 (panel 4 ends at 0.20+0.60)
    // Normalised tween boundaries for direct-style opacity (same pattern as setTrOpacity)
    // panel i: start = i*0.05/0.80 = i*0.0625, span = 0.60/0.80 = 0.75   (power3.in)
    // watermark:  start = 0,           span = 0.12/0.80 = 0.15             (linear)
    const setPanelOpacity = prog => {
      panelEls.forEach((el, i) => {
        const t = Math.max(0, Math.min(1, (prog - i * 0.0625) / 0.75))
        el.style.opacity = String(1 - t * t * t)  // power3.in, FROM=1 hardcoded
      })
      const wt = Math.max(0, Math.min(1, prog / 0.15))
      watermark.style.opacity = String(1 - wt)    // linear, FROM=1 hardcoded
    }

    // Helper: set trCards opacity directly (bypasses GSAP tween system)
    const setTrOpacity = op => {
      trCards.forEach(c => { c.style.opacity = String(op) })
    }

    const p1st = ScrollTrigger.create({
      trigger:   sectionRef.current,
      start:     () => `top+=${800 * VH}px top`,
      end:       () => `top+=${1050 * VH}px top`,
      scrub:     1.0,
      animation: p1tl,
      onEnter: () => {
        expandedRef.current = false
        setHovered(null)
        gsap.set(panelsRef.current, { pointerEvents: 'none' })
        // Reverse stacking so Joker (DOM-first = normally bottom) stays on top
        panelEls.forEach((el, i) => gsap.set(el, { zIndex: panelEls.length - i }))
      },
      onLeaveBack: () => {
        // Snap p1tl to start immediately — don't rely on the scrub's 1s ease-back.
        // Without this, panels visually stick mid-collapse for ~1s after the scroll
        // crosses back into the Scene 2 linger zone.
        p1tl.progress(0, true)   // suppressEvents=true, no timeline callbacks
        // Restore panel transforms and state
        expandedRef.current = true
        gsap.set(panelsRef.current, { pointerEvents: 'auto' })
        gsap.set(panelEls, { x: 0, y: 0, scale: 1, zIndex: 'auto' })
        panelEls.forEach(el => { el.style.opacity = '1' })
        watermark.style.opacity = '1'
        setTrOpacity(0)
      },
      onLeave: () => {
        setTrOpacity(1)
        // Re-build p2st if it was killed during a backward scroll journey.
        if (!p2st) {
          if (collapseTween) { collapseTween.kill(); collapseTween = null }
          p2tl.progress(0, true)
          p2st = ScrollTrigger.create({
            trigger:   sectionRef.current,
            start:     () => `top+=${1050 * VH}px top`,
            end:       () => `top+=${1300 * VH}px top`,
            scrub:     1.0,
            animation: p2tl,
          })
        }
      },
      onUpdate: (self) => {
        setPanelOpacity(self.progress)
        const op = self.progress < 0.52 ? 0 : Math.min(1, (self.progress - 0.52) / 0.3)
        setTrOpacity(op)
      },
    })

    // ══════════════════════════════════════════════════════════════════════
    //  PHASE 2 — pile → concentric circles  (1050 → 1300 vh)
    // ══════════════════════════════════════════════════════════════════════
    const p2tl = gsap.timeline({ paused: true })

    trCards.forEach((card, i) => {
      p2tl.to(card, {
        x:        trTargetX[i],
        y:        trTargetY[i],
        rotation: trTargetRotation[i],  // rotate card to follow ring tangent
        duration: 0.62,
        ease:     'power2.out',
      }, i * 0.038)   // clockwise stagger (index order = top → CW)
    })

    let p2st = ScrollTrigger.create({
      trigger:   sectionRef.current,
      start:     () => `top+=${1050 * VH}px top`,
      end:       () => `top+=${1300 * VH}px top`,
      scrub:     1.0,
      animation: p2tl,
    })
    let collapseTween = null   // rings→pile animation (Phase 2 backward)

    // ══════════════════════════════════════════════════════════════════════
    //  PHASE 2.5 — auto-rotation linger  (1300 → 1650 vh)
    //  Inner ring: CCW  |  Outer ring: CW
    // ══════════════════════════════════════════════════════════════════════
    let rotationTickerFn = null

    // ── Ring-bg: card-matrix canvas stream ────────────────────────────────────
    const STREAM_CHARS = ['A','K','Q','J','10','9','8','7','6','5','4','3','2','♠','♥','♦','♣']

    const startRingBg = () => {
      // Kill any in-progress fade-out and immediately start fading in.
      // Do this BEFORE the canvas-running guard so re-entry after a
      // partial fade-out still brings the bg back to full opacity.
      gsap.killTweensOf(ringBgRef.current)
      gsap.to(ringBgRef.current, { opacity: 1, duration: 1.4, ease: 'power2.out' })
      gsap.killTweensOf(sloganBdRef.current)
      gsap.to(sloganBdRef.current, { opacity: 1, duration: 1.0, ease: 'power2.out', delay: 0.3 })

      if (canvasRafRef.current) return   // canvas already running — opacity tweens above are all we need
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width  = vw
      canvas.height = vh
      const ctx    = canvas.getContext('2d')
      const FS     = 14        // font size px — larger = more legible
      const COL_W  = 22        // column width px
      const cols   = Math.ceil(vw / COL_W)
      const INTERACT_R = 150  // mouse repulsion radius px

      // Track mouse position (local to this canvas session)
      let mX = -9999, mY = -9999
      const onMouse = e => { mX = e.clientX; mY = e.clientY }
      window.addEventListener('mousemove', onMouse)
      canvasMouseRef.current = () => window.removeEventListener('mousemove', onMouse)

      const streams = Array.from({ length: cols }, () => {
        const base = 0.04 + Math.random() * 0.07   // slow: ~33–88 px/s at 60fps
        return {
          y:        -Math.floor(Math.random() * 60),
          speed:    base,
          baseSpeed: base,
          len:      9 + Math.floor(Math.random() * 18),
          chars:    Array.from({ length: 26 }, () =>
            STREAM_CHARS[Math.floor(Math.random() * STREAM_CHARS.length)]
          ),
          offsetX: 0,   // horizontal displacement from mouse repulsion
          chaos:   0,   // 0–1: how scrambled (character randomness + colour flash)
        }
      })

      ctx.font = `${FS}px "Courier New", monospace`

      const draw = () => {
        // Fade trail — lower = longer ghost; ~0.05 gives nice trails
        ctx.fillStyle = 'rgba(0,0,0,0.055)'
        ctx.fillRect(0, 0, vw, vh)
        ctx.font = `${FS}px "Courier New", monospace`

        streams.forEach((s, ci) => {
          // ── Mouse repulsion ──
          const colX = ci * COL_W + s.offsetX
          const colY = s.y * FS
          const dist = Math.hypot(colX - mX, colY - mY)

          if (dist < INTERACT_R && dist > 0) {
            const force  = (1 - dist / INTERACT_R)          // 0–1
            const angle  = Math.atan2(colX - mX, colY - mY) // direction away from mouse
            s.offsetX   += Math.sin(angle) * force * 22
            s.chaos      = Math.min(1, s.chaos + force * 0.30)
            s.speed      = s.baseSpeed + force * 0.30        // speed burst
          }

          // ── Damping: slowly return to normal ──
          s.offsetX = s.offsetX * 0.88                       // spring back
          s.chaos   = Math.max(0, s.chaos - 0.012)           // calm down over ~80 frames
          s.speed   = s.speed   * 0.93 + s.baseSpeed * 0.07 // ease back to base speed
          s.offsetX = Math.max(-COL_W * 10, Math.min(COL_W * 10, s.offsetX)) // clamp

          const x = ci * COL_W + 3 + s.offsetX

          // ── Draw character trail ──
          for (let j = 0; j < s.len; j++) {
            const py = (Math.floor(s.y) - j) * FS
            if (py < -FS || py > vh + FS) continue

            // Scramble chars while chaotic
            const char = s.chaos > 0.25
              ? STREAM_CHARS[Math.floor(Math.random() * STREAM_CHARS.length)]
              : s.chars[(Math.floor(s.y) + j) % s.chars.length]

            if (j === 0) {
              // Leading char: bright, flashes whiter when chaotic
              const g = s.chaos > 0.5 ? 200 : 110
              ctx.fillStyle = `rgba(255,${g},${g},0.95)`
            } else if (j === 1) {
              ctx.fillStyle = 'rgba(220,45,45,0.72)'
            } else {
              ctx.fillStyle = `rgba(160,12,12,${Math.max(0, 0.52 - (j / s.len) * 0.50)})`
            }
            ctx.fillText(char, x, py)
          }

          // ── Advance stream ──
          s.y += s.speed
          if (s.y * FS > vh + s.len * FS) {
            const nb   = 0.04 + Math.random() * 0.07
            s.y        = -Math.floor(Math.random() * 35)
            s.baseSpeed = nb
            s.speed    = nb
            s.len      = 9 + Math.floor(Math.random() * 18)
            s.offsetX  = 0
            s.chaos    = 0
          }
        })

        canvasRafRef.current = requestAnimationFrame(draw)
      }

      draw()
      // (ring-bg fade-in already started at the top of startRingBg)

      // Slogan: backdrop fades in first, then lines flip up
      const reveals = sloganRef.current?.querySelectorAll('.ds__slogan-reveal')
      if (reveals?.length) {
        gsap.set(sloganRef.current, { opacity: 1 })
        gsap.set(reveals, { y: '108%' })
        gsap.to(sloganBdRef.current, { opacity: 1, duration: 1.0, ease: 'power2.out', delay: 0.3 })
        gsap.to(reveals, { y: '0%', duration: 0.82, stagger: 0.28, ease: 'power3.out', delay: 0.8 })
      }
    }

    const stopRingBg = () => {
      if (canvasRafRef.current) {
        cancelAnimationFrame(canvasRafRef.current)
        canvasRafRef.current = null
        const canvas = canvasRef.current
        if (canvas) canvas.getContext('2d').clearRect(0, 0, vw, vh)
      }
      if (canvasMouseRef.current) {
        canvasMouseRef.current()
        canvasMouseRef.current = null
      }
      // Hard-reset opacity — safety net for any interrupted tweens
      if (ringBgRef.current)  gsap.set(ringBgRef.current,  { opacity: 0 })
      if (sloganBdRef.current) gsap.set(sloganBdRef.current, { opacity: 0 })
      if (sloganRef.current)  gsap.set(sloganRef.current,  { opacity: 0 })
    }

    const startRotation = () => {
      if (rotationTickerFn) return
      startRingBg()
      rotationTickerFn = (_time, deltaTime) => {
        const dt = Math.min(deltaTime / 1000, 0.05)   // cap to avoid jumps on tab wake
        for (let i = 0; i < INNER_N; i++) {
          trAngles[i] -= 0.28 * dt   // CCW
          const nx = TR_CX   + INNER_R * Math.cos(trAngles[i]) - TR_W / 2
          const ny = RING_CY + INNER_R * Math.sin(trAngles[i]) - TR_H / 2
          gsap.set(trCards[i], {
            x: nx, y: ny,
            rotation: trAngles[i] * 180 / Math.PI + 90,  // tangent rotation
            zIndex: Math.round(10 + (RING_CY + INNER_R * Math.sin(trAngles[i])) / vh * 12),
          })
        }
        for (let i = INNER_N; i < INNER_N + OUTER_N; i++) {
          trAngles[i] += 0.18 * dt   // CW
          const nx = TR_CX   + OUTER_R * Math.cos(trAngles[i]) - TR_W / 2
          const ny = RING_CY + OUTER_R * Math.sin(trAngles[i]) - TR_H / 2
          gsap.set(trCards[i], {
            x: nx, y: ny,
            rotation: trAngles[i] * 180 / Math.PI + 90,  // tangent rotation
            zIndex: Math.round(10 + (RING_CY + OUTER_R * Math.sin(trAngles[i])) / vh * 12),
          })
        }
      }
      gsap.ticker.add(rotationTickerFn)
    }

    const stopRotation = () => {
      if (rotationTickerFn) {
        gsap.ticker.remove(rotationTickerFn)
        rotationTickerFn = null
      }
      // Slogan exit: lines slide down, backdrop lingers then fades
      const reveals = sloganRef.current?.querySelectorAll('.ds__slogan-reveal')
      if (reveals?.length) {
        gsap.to(Array.from(reveals).reverse(), {
          y: '108%', duration: 0.38, stagger: 0.08, ease: 'power2.in',
        })
      }
      gsap.killTweensOf(sloganBdRef.current)   // kill any in-progress fade-in before fading out
      gsap.to(sloganBdRef.current, {
        opacity: 0, duration: 0.55, ease: 'power2.in', delay: 0.42,
        onComplete: () => { if (sloganRef.current) gsap.set(sloganRef.current, { opacity: 0 }) },
      })
      gsap.killTweensOf(ringBgRef.current)   // kill any in-progress fade-in before fading out
      gsap.to(ringBgRef.current, { opacity: 0, duration: 0.9, ease: 'power2.in', onComplete: stopRingBg })
    }

    const p25st = ScrollTrigger.create({
      trigger:     sectionRef.current,
      start:       () => `top+=${1300 * VH}px top`,
      end:         () => `top+=${1650 * VH}px top`,
      onEnter: () => {
        // Kill any in-progress collapse tween, rebuild p2st if needed.
        if (collapseTween) { collapseTween.kill(); collapseTween = null }
        if (!p2st) {
          p2tl.progress(1, true)
          p2st = ScrollTrigger.create({
            trigger:   sectionRef.current,
            start:     () => `top+=${1050 * VH}px top`,
            end:       () => `top+=${1300 * VH}px top`,
            scrub:     1.0,
            animation: p2tl,
          })
        }
        gsap.killTweensOf(p2tl)
        p2tl.progress(1, true)
        // Reset trAngles to initial positions so the first rotation tick
        // starts from where p2tl.progress(1) placed the cards — prevents jump.
        for (let i = 0; i < INNER_N; i++) {
          trAngles[i] = (i * 2 * Math.PI / INNER_N) - Math.PI / 2
        }
        for (let i = 0; i < OUTER_N; i++) {
          trAngles[INNER_N + i] = (i * 2 * Math.PI / OUTER_N) - Math.PI / 2
        }
        startRotation()
      },
      onEnterBack: startRotation,
      onLeave:     () => { stopRotation(); setupPhase3() },
      onLeaveBack: () => {
        stopRotation()
        if (p3st_dyn) { p3st_dyn.kill(); p3st_dyn = null }
        if (p3tl)     { p3tl.kill();     p3tl     = null }
        if (p2st)     { p2st.kill(); p2st = null }
        if (collapseTween) { collapseTween.kill(); collapseTween = null }

        // Force each card back to its true ring position using the last known
        // trAngles state. This corrects for the case where p3tl's scrub lag
        // left cards at the pile position when it was killed during a fast
        // backward scroll — without this gsap.set, collapseTween would start
        // from pile and animate pile→pile with zero visible movement.
        for (let i = 0; i < INNER_N; i++) {
          const nx = TR_CX   + INNER_R * Math.cos(trAngles[i]) - TR_W / 2
          const ny = RING_CY + INNER_R * Math.sin(trAngles[i]) - TR_H / 2
          gsap.set(trCards[i], { x: nx, y: ny, rotation: trAngles[i] * 180 / Math.PI + 90 })
        }
        for (let i = INNER_N; i < INNER_N + OUTER_N; i++) {
          const nx = TR_CX   + OUTER_R * Math.cos(trAngles[i]) - TR_W / 2
          const ny = RING_CY + OUTER_R * Math.sin(trAngles[i]) - TR_H / 2
          gsap.set(trCards[i], { x: nx, y: ny, rotation: trAngles[i] * 180 / Math.PI + 90 })
        }

        collapseTween = gsap.to(trCards, {
          x:        TR_PILE_X,
          y:        TR_PILE_Y,
          rotation: 0,
          duration: 1.2,
          ease:     'power2.inOut',
          stagger:  { amount: 0.4, from: 'random' },
        })
      },
    })

    // ══════════════════════════════════════════════════════════════════════
    //  PHASE 3 — scroll-driven collapse back to pile  (1650 → 1850 vh)
    //  Created dynamically in setupPhase3 so it captures the exact ring
    //  positions at the moment rotation stops, enabling clean scroll-back.
    // ══════════════════════════════════════════════════════════════════════
    let p3tl     = null   // timeline built per Phase-3 entry (positions vary with rotation)
    let p3st_dyn = null   // ScrollTrigger that scrubs p3tl

    const setupPhase3 = () => {
      // Tear down any previous Phase-3 trigger/timeline
      if (p3st_dyn) { p3st_dyn.kill(); p3st_dyn = null }
      if (p3tl)     { p3tl.kill();     p3tl     = null }

      gsap.killTweensOf(p1tl)
      gsap.killTweensOf(p2tl)
      p1tl.progress(1, true)
      p2tl.progress(1, true)

      // Sync GSAP cache (opacity/scale may lag after ticker)
      // NOTE: do NOT killTweensOf(trCards) here — that would kill p2tl's internal
      // tweens on trCards, breaking Phase 2 backward scrub (rings→pile).
      gsap.set(trCards, { opacity: 1, scale: 1 })

      // Build scrub timeline — `to` captures current positions at progress=0 (ring state)
      p3tl = gsap.timeline({ paused: true })
      p3tl.to(trCards, {
        x:        TR_PILE_X,
        y:        TR_PILE_Y,
        rotation: 0,
        zIndex:   (i) => i === 0 ? 25 : 18,  // A♠ on top → matches Spread pile
        duration: 1.0,
        ease:     'power3.in',
        stagger:  { amount: 0.45, from: 'random' },
      })

      // Scroll-driven trigger for Phase 3
      p3st_dyn = ScrollTrigger.create({
        trigger:   sectionRef.current,
        start:     () => `top+=${1650 * VH}px top`,
        end:       () => `top+=${1850 * VH}px top`,
        scrub:     1.0,
        animation: p3tl,

        // Scrolling backward past Phase 3 start → back into Phase 2.5 rotation zone.
        // Kill the Phase 3 trigger/timeline first so the scrub tween stops fighting
        // trCards x/y/rotation before the rotation ticker takes over.
        onLeaveBack: () => {
          if (p3st_dyn) { p3st_dyn.kill(); p3st_dyn = null }
          if (p3tl)     { p3tl.kill();     p3tl     = null }
          startRotation()
        },
      })
    }

    // ── Fixed-layer visibility: show only while DealSuits section overlaps viewport ──
    // position:fixed ignores the parent section, so we manually sync visibility so
    // the fixed layer hides when the user has scrolled past DealSuits into Spread etc.
    const updateVisibility = () => {
      const el = stickyRef.current
      const sec = sectionRef.current
      if (!el || !sec) return
      const r = sec.getBoundingClientRect()
      const inView = r.top < window.innerHeight && r.bottom > 0
      el.style.visibility = inView ? 'visible' : 'hidden'
      el.style.pointerEvents = inView ? '' : 'none'
    }
    updateVisibility()   // set correct state on mount
    window.addEventListener('scroll', updateVisibility, { passive: true })
    ScrollTrigger.addEventListener('refresh', updateVisibility)

    // ── Mouse-move parallax (Scene 1 landing layer) ──────────────────────
    const lnd = landingRef.current
    const LL = {
      bg:     lnd.querySelector('.ds__landing-bg'),
      table:  lnd.querySelector('.ds__landing-table'),
      left:   lnd.querySelector('.ds__landing-left'),
      right:  lnd.querySelector('.ds__landing-right'),
      center: lnd.querySelector('.ds__landing-center'),
    }
    const DEPTH = { bg: 10, table: 20, left: 38, right: 38, center: 30 }

    const onMouseMove = e => {
      const dx = e.clientX / vw - 0.5
      const dy = e.clientY / vh - 0.5
      Object.entries(LL).forEach(([k, el]) => {
        if (!el) return
        const d = DEPTH[k]
        gsap.to(el, { x: dx * d, y: dy * d * 0.55, duration: 1.1, ease: 'power2.out', overwrite: 'auto' })
      })
    }
    const onMouseLeave = () => {
      Object.values(LL).forEach(el => {
        if (!el) return
        gsap.to(el, { x: 0, y: 0, duration: 1.6, ease: 'power3.out', overwrite: 'auto' })
      })
    }
    gsap.set(LL.bg, { scale: 1.04, transformOrigin: '50% 50%' })

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    return () => {
      window.removeEventListener('scroll', updateVisibility)
      ScrollTrigger.removeEventListener('refresh', updateVisibility)
      st.kill();   tl.kill()
      p1st.kill(); p1tl.kill()
      if (p2st)          p2st.kill()
      p2tl.kill()
      if (collapseTween) collapseTween.kill()
      p25st.kill()
      if (p3st_dyn) p3st_dyn.kill()
      if (p3tl)     p3tl.kill()
      stopRotation()
      stopRingBg()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  const handleEnter = useCallback((i) => {
    if (expandedRef.current) setHovered(i)
  }, [])
  const handleLeave = useCallback(() => setHovered(null), [])

  return (
    <section ref={sectionRef} id="deal" className="ds">
      <div ref={stickyRef} className="ds__sticky">

        {/* ── Layer 0: Landing images — visible during Scene 1 ── */}
        <div ref={landingRef} className="ds__landing">
          <img src={BgImg}    className="ds__landing-bg"     alt="" />
          <img src={TableImg} className="ds__landing-table"  alt="" />
          <img src={LImg}     className="ds__landing-left"   alt="" />
          <img src={RImg}     className="ds__landing-right"  alt="" />
          <img src={MdImg}    className="ds__landing-center" alt="" />
        </div>

        {/* ── Ring-phase centre slogan ── */}
        <div ref={sloganBdRef} className="ds__slogan-backdrop" aria-hidden="true" />
        <div ref={sloganRef} className="ds__slogan" aria-hidden="true">
          <div className="ds__slogan-line-wrap">
            <span className="ds__slogan-eyebrow ds__slogan-reveal">BRAND CORE</span>
          </div>
          <div className="ds__slogan-line-wrap">
            <p className="ds__slogan-line ds__slogan-reveal">TECHNOLOGY THAT FEELS.</p>
          </div>
          <div className="ds__slogan-line-wrap">
            <p className="ds__slogan-line ds__slogan-line--accent ds__slogan-reveal">ART THAT COMPUTES.</p>
          </div>
        </div>

        {/* ── Ring-phase background — Matrix stream + ghost suits ── */}
        <div ref={ringBgRef} className="ds__ring-bg" aria-hidden="true">
          <canvas ref={canvasRef} className="ds__ring-canvas" />
          <img src={SpadeImg}   className="ds__ring-suit ds__ring-suit--tl" alt="" draggable={false} />
          <img src={HeartImg}   className="ds__ring-suit ds__ring-suit--tr" alt="" draggable={false} />
          <img src={DiamondImg} className="ds__ring-suit ds__ring-suit--br" alt="" draggable={false} />
          <img src={ClubImg}    className="ds__ring-suit ds__ring-suit--bl" alt="" draggable={false} />
          <div className="ds__ring-glow" />
        </div>

        {/* ── Layer 1 (bottom): Scene 2 panels — always full-size ── */}
        <span id="suits" style={{ position: 'absolute', top: 0 }} />
        <div
          ref={panelsRef}
          className={`ds__panels${hovered !== null ? ' has-hover' : ''}`}
        >
          <div className="ds__watermark">
            <p className="ds__wm-scene">SCENE II</p>
            <h2 className="ds__wm-title">THE SUITS</h2>
          </div>

          {PANELS.map((panel, idx) => (
            <div
              key={panel.id}
              ref={el => (panelElRefs.current[idx] = el)}
              className={[
                'ds__panel',
                panel.isRed   ? 'is-red'   : '',
                panel.isJoker ? 'is-joker' : '',
                hovered === idx                     ? 'is-hovered' : '',
                hovered !== null && hovered !== idx ? 'is-dim'     : '',
              ].filter(Boolean).join(' ')}
              onMouseEnter={() => handleEnter(idx)}
              onMouseLeave={handleLeave}
            >
              <div className="ds__panel-corner ds__panel-corner--tl">
                <span className="ds__panel-rank">{panel.rank}</span>
                {panel.isJoker
                  ? <span className="ds__panel-suit-sm">{panel.suit}</span>
                  : <img src={SUIT_IMG[panel.suit]} className="ds__panel-suit-sm-img" alt="" draggable={false} />
                }
              </div>
              <div className="ds__panel-suit-lg">
                {panel.isJoker
                  ? panel.suit
                  : <img src={SUIT_IMG[panel.suit]} className="ds__panel-suit-lg-img" alt="" draggable={false} />
                }
              </div>
              <div className="ds__panel-content">
                <p className="ds__panel-sub">{panel.sub}</p>
                <h3 className="ds__panel-title">{panel.title}</h3>
                <p className="ds__panel-desc">{panel.desc}</p>
                <div className="ds__panel-tags">
                  {panel.tags.map(t => (
                    <span key={t} className="ds__panel-tag">{t}</span>
                  ))}
                </div>
              </div>

              {/* ── Media block: diagonal-split images on the right ── */}
              <div className="ds__panel-media" aria-hidden="true">
                {/* Vertical meta strip — labels outside clip area */}
                <div className="ds__pm-meta">
                  <span className="ds__pm-label">{panel.imgLabels[0]}</span>
                  <div className="ds__pm-meta-dot" />
                  <span className="ds__pm-label">{panel.imgLabels[1]}</span>
                </div>
                {/* Image frames */}
                <div className="ds__pm-frames">
                  <div className="ds__pm-frame ds__pm-frame--top">
                    <img src={panel.imgs[0]} className="ds__pm-img" alt="" draggable={false} />
                    <div className="ds__pm-vignette" />
                    <div className="ds__pm-grain" />
                    <span className="ds__pm-index">01</span>
                  </div>
                  <div className="ds__pm-frame ds__pm-frame--bot">
                    <img src={panel.imgs[1]} className="ds__pm-img" alt="" draggable={false} />
                    <div className="ds__pm-vignette" />
                    <div className="ds__pm-grain" />
                    <span className="ds__pm-index">02</span>
                  </div>
                </div>
              </div>
              <div className="ds__panel-corner ds__panel-corner--br">
                <span className="ds__panel-rank">{panel.rank}</span>
                {panel.isJoker
                  ? <span className="ds__panel-suit-sm">{panel.suit}</span>
                  : <img src={SUIT_IMG[panel.suit]} className="ds__panel-suit-sm-img" alt="" draggable={false} />
                }
              </div>
            </div>
          ))}
        </div>

        {/* ── Layer 2: Card back visuals — Scene 2 deal animation only ── */}
        {PANELS.map((panel, i) => (
          <div
            key={panel.id}
            ref={el => (cardRefs.current[i] = el)}
            className={`ds__card${panel.isRed ? ' is-red' : ''}${panel.isJoker ? ' is-joker' : ''}`}
          >
            <div className="ds__card-back">
              <img src={CardbackImg} className="ds__card-back-img" alt="" draggable={false} />
            </div>
          </div>
        ))}

        {/* ── Layer 3: Transition cards (Scene 2→3 bridge) ── */}
        {TC_SUITS.map((tc, i) => (
          <div
            key={`tc-${i}`}
            ref={el => (trCardRefs.current[i] = el)}
            className={`ds__tc${tc.isRed ? ' is-red' : ''}`}
          >
            <div className="ds__tc-back">
              <img src={CardfrontImg} className="ds__tc-back-img" alt="" draggable={false} />
            </div>
            {tc.rank && (
              <>
                <div className="ds__tc-corner ds__tc-corner--tl">
                  <span className="ds__tc-rank">{tc.rank}</span>
                  <img src={SUIT_IMG[tc.suit]} className="ds__tc-suit-sm-img" alt="" draggable={false} />
                </div>
                <div className="ds__tc-corner ds__tc-corner--br">
                  <span className="ds__tc-rank">{tc.rank}</span>
                  <img src={SUIT_IMG[tc.suit]} className="ds__tc-suit-sm-img" alt="" draggable={false} />
                </div>
              </>
            )}
          </div>
        ))}

      </div>
    </section>
  )
}
