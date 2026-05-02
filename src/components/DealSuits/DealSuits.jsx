import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './DealSuits.css'

gsap.registerPlugin(ScrollTrigger)

const PANELS = [
  {
    id: 'joker', rank: 'JOKER', suit: '★', isRed: false, isJoker: true,
    title: 'ARA Studio', sub: 'BRAND CORE · 品牌核心',
    desc: '當科技能夠感受情緒，當藝術能夠被精準運算——這就是 All Round Ace Studio 存在的理由。我們打破理性工程與感性體驗之間的界線，創造真正能與人對話的互動體驗。',
    tags: ['INTERACTIVE EXPERIENCE', 'CROSS-DISCIPLINARY', 'FULL-STACK CREATIVE'],
  },
  {
    id: 'spade', rank: 'A', suit: '♠', isRed: false, isJoker: false,
    title: 'Interactive Installation', sub: '互動裝置',
    desc: "Spaces that respond to presence. Environments that blur the digital and the physical — you don't just see them, you inhabit them.",
    tags: ['SENSORS', 'REAL-TIME', 'PHYSICAL COMPUTING'],
  },
  {
    id: 'heart', rank: 'K', suit: '♥', isRed: true, isJoker: false,
    title: 'Software Development', sub: '軟體開發',
    desc: 'From embedded firmware to full-stack web — precision-engineered software that feels as good as it performs.',
    tags: ['FULL-STACK', 'EMBEDDED', 'WEB & MOBILE'],
  },
  {
    id: 'diamond', rank: 'Q', suit: '♦', isRed: true, isJoker: false,
    title: 'Game Development', sub: '遊戲開發',
    desc: 'Rules exist to be rewritten. We design worlds with consequence — every choice matters, every player is the protagonist.',
    tags: ['UNITY', 'UNREAL', 'CUSTOM ENGINE'],
  },
  {
    id: 'club', rank: 'J', suit: '♣', isRed: false, isJoker: false,
    title: 'Art Installation', sub: '藝術裝置',
    desc: 'Light, form, and material become language. We sculpt space into statements — work that demands presence.',
    tags: ['GENERATIVE', 'LIGHT & SPACE', 'SCULPTURAL'],
  },
]

const CARD_W = 130
const CARD_H = 195

export default function DealSuits() {
  const sectionRef  = useRef(null)
  const cardRefs    = useRef([])    // card back visuals
  const panelElRefs = useRef([])   // individual ds__panel elements (for clip-path)
  const panelsRef   = useRef(null) // ds__panels container
  const expandedRef = useRef(false)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const COL_W  = vw / 5
    const COL_CX = PANELS.map((_, i) => (i + 0.5) * COL_W)
    const PILE_CX = vw / 2
    const PILE_CY = vh * 0.75

    const cards    = cardRefs.current.filter(Boolean)
    const panelEls = panelElRefs.current.filter(Boolean)

    // clip-path that crops each panel to exactly one card-sized rectangle at center
    const T = (vh - CARD_H) / 2
    const H = (COL_W - CARD_W) / 2
    const clipClosed = `inset(${T}px ${H}px ${T}px ${H}px)`
    const clipOpen   = 'inset(0px 0px 0px 0px)'

    // ── Initial state ────────────────────────────────────────────────
    gsap.set(cards, {
      xPercent: -50, yPercent: -50,
      x: PILE_CX, y: PILE_CY,
      scaleX: 1, scaleY: 1,
      zIndex: 20,
    })
    const watermark = panelsRef.current.querySelector('.ds__watermark')

    // Panels: card-sized clip, invisible. Watermark hidden until scene 2 fully reveals.
    gsap.set(panelEls, { clipPath: clipClosed, opacity: 0 })
    gsap.set(watermark, { opacity: 0 })
    gsap.set(panelsRef.current, { opacity: 1, pointerEvents: 'none' })

    // ── Master timeline ──────────────────────────────────────────────
    const tl = gsap.timeline({ paused: true })

    // Phase 1 (0.00 → 0.10): pile floats up to vertical centre
    tl.to(cards, { y: vh * 0.5, duration: 0.10, ease: 'power2.out' }, 0)

    // Phase 2 (0.08 → 0.36): fan out to column positions
    cards.forEach((card, i) => {
      tl.to(card, { x: COL_CX[i], duration: 0.28, ease: 'power2.inOut' }, 0.08)
    })

    // Phase 3a (0.36 → 0.50): card backs squish away — force2D avoids GPU blur at scaleX≈0
    tl.to(cards, { scaleX: 0, duration: 0.14, ease: 'power2.in', force3D: false }, 0.36)

    // Phase 3 midpoint (0.50): panels appear at card footprint — no gap before expansion
    tl.set(panelEls, { opacity: 1 }, 0.50)

    // Phase 3b (0.50 → 0.56): card backs fade out simultaneously
    tl.to(cards, { opacity: 0, duration: 0.06, ease: 'none', force3D: false }, 0.50)

    // Phase 4 (0.50 → 0.95): clip-path bursts open immediately — power3.out starts at full speed
    panelEls.forEach(panel => {
      tl.fromTo(panel,
        { clipPath: clipClosed },
        { clipPath: clipOpen, duration: 0.45, ease: 'power3.out' },
        0.50
      )
    })

    // Watermark fades in near end of reveal
    tl.to(watermark, { opacity: 1, duration: 0.12, ease: 'power1.in' }, 0.88)

    // ── ScrollTrigger ────────────────────────────────────────────────
    // end at +=600% so animation completes at 600vh, remaining 300vh = linger on Scene 2
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

    return () => { st.kill(); tl.kill() }
  }, [])

  const handleEnter = useCallback((i) => {
    if (expandedRef.current) setHovered(i)
  }, [])
  const handleLeave = useCallback(() => setHovered(null), [])

  return (
    <section ref={sectionRef} id="deal" className="ds">
      <div className="ds__sticky">

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
                <span className="ds__panel-suit-sm">{panel.suit}</span>
              </div>
              <div className="ds__panel-suit-lg">{panel.suit}</div>
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
              <div className="ds__panel-corner ds__panel-corner--br">
                <span className="ds__panel-rank">{panel.rank}</span>
                <span className="ds__panel-suit-sm">{panel.suit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Layer 2 (top): Card back visuals — Phases 1-3 only ── */}
        {PANELS.map((panel, i) => (
          <div
            key={panel.id}
            ref={el => (cardRefs.current[i] = el)}
            className={`ds__card${panel.isRed ? ' is-red' : ''}${panel.isJoker ? ' is-joker' : ''}`}
          >
            <div className="ds__card-back">
              <div className="ds__card-back-pattern" />
              <span className={`ds__card-back-suit${panel.isRed ? ' is-red' : ''}`}>
                {panel.suit}
              </span>
            </div>
          </div>
        ))}

      </div>
    </section>
  )
}
