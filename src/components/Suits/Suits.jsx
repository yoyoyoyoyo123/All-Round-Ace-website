import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Suits.css'

gsap.registerPlugin(ScrollTrigger)

const PANELS = [
  {
    id: 'joker',
    rank: 'JOKER',
    suit: '★',
    isJoker: true,
    isRed: false,
    title: 'ARA Studio',
    sub: 'BRAND CORE · 品牌核心',
    desc: '當科技能夠感受情緒，當藝術能夠被精準運算——這就是 All Round Ace Studio 存在的理由。我們打破理性工程與感性體驗之間的界線，創造真正能與人對話的互動體驗。',
    tags: ['INTERACTIVE EXPERIENCE', 'CROSS-DISCIPLINARY', 'FULL-STACK CREATIVE'],
  },
  {
    id: 'spade',
    rank: 'A',
    suit: '♠',
    isJoker: false,
    isRed: false,
    title: 'Interactive Installation',
    sub: '互動裝置',
    desc: 'Spaces that respond to presence. Environments that blur the digital and the physical — you don\'t just see them, you inhabit them.',
    tags: ['SENSORS', 'REAL-TIME', 'PHYSICAL COMPUTING'],
  },
  {
    id: 'heart',
    rank: 'K',
    suit: '♥',
    isJoker: false,
    isRed: true,
    title: 'Software Development',
    sub: '軟體開發',
    desc: 'From embedded firmware to full-stack web — precision-engineered software that feels as good as it performs.',
    tags: ['FULL-STACK', 'EMBEDDED', 'WEB & MOBILE'],
  },
  {
    id: 'diamond',
    rank: 'Q',
    suit: '♦',
    isJoker: false,
    isRed: true,
    title: 'Game Development',
    sub: '遊戲開發',
    desc: 'Rules exist to be rewritten. We design worlds with consequence — every choice matters, every player is the protagonist.',
    tags: ['UNITY', 'UNREAL', 'CUSTOM ENGINE'],
  },
  {
    id: 'club',
    rank: 'J',
    suit: '♣',
    isJoker: false,
    isRed: false,
    title: 'Art Installation',
    sub: '藝術裝置',
    desc: 'Light, form, and material become language. We sculpt space into statements — work that demands presence.',
    tags: ['GENERATIVE', 'LIGHT & SPACE', 'SCULPTURAL'],
  },
]

export default function Suits() {
  const sectionRef  = useRef(null)
  const panelRefs   = useRef([])
  const innerRefs   = useRef([])
  const flippedRef  = useRef(false)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const inners = innerRefs.current.filter(Boolean)
    // transformPerspective bakes perspective into GSAP's transform matrix
    gsap.set(inners, { rotateY: 0, transformPerspective: 2800 })

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 60%',
      once: true,
      onEnter: () => {
        flippedRef.current = true
        gsap.to(inners, {
          rotateY: 180,
          duration: 1.0,
          stagger: 0.22,
          ease: 'power2.inOut',
        })
      },
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  const handleEnter = useCallback((idx) => {
    if (!flippedRef.current) return
    setHovered(idx)
  }, [])

  const handleLeave = useCallback(() => {
    setHovered(null)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="suits"
      className={`suits${hovered !== null ? ' has-hover' : ''}`}
    >
      {/* Watermark title — fades when a panel is hovered */}
      <div className="suits__watermark">
        <p className="suits__wm-scene">SCENE II</p>
        <h2 className="suits__wm-title">THE SUITS</h2>
      </div>

      <div className="suits__panels">
        {PANELS.map((panel, idx) => (
          <div
            key={panel.id}
            ref={el => (panelRefs.current[idx] = el)}
            className={[
              'suits__panel',
              panel.isRed   ? 'is-red'    : '',
              panel.isJoker ? 'is-joker'  : '',
              hovered === idx                           ? 'is-hovered' : '',
              hovered !== null && hovered !== idx       ? 'is-dim'     : '',
            ].filter(Boolean).join(' ')}
            onMouseEnter={() => handleEnter(idx)}
            onMouseLeave={handleLeave}
          >
            {/* ── 3D flip wrapper ── */}
            <div
              ref={el => (innerRefs.current[idx] = el)}
              className="suits__panel-inner"
            >
              {/* Back face */}
              <div className="suits__panel-back">
                <div className="suits__back-pattern" />
                <div className="suits__back-center">{panel.suit}</div>
              </div>

              {/* Front face */}
              <div className="suits__panel-face">

                {/* Top-left corner */}
                <div className="suits__corner suits__corner--tl">
                  <span className="suits__rank">{panel.rank}</span>
                  <span className="suits__suit-sm">{panel.suit}</span>
                </div>

                {/* Center suit symbol — fades on hover */}
                <div className="suits__suit-lg">{panel.suit}</div>

                {/* Hover content */}
                <div className="suits__content">
                  <p className="suits__content-sub">{panel.sub}</p>
                  <h3 className="suits__content-title">{panel.title}</h3>
                  <p className="suits__content-desc">{panel.desc}</p>
                  <div className="suits__content-tags">
                    {panel.tags.map(tag => (
                      <span key={tag} className="suits__tag">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Bottom-right corner */}
                <div className="suits__corner suits__corner--br">
                  <span className="suits__rank">{panel.rank}</span>
                  <span className="suits__suit-sm">{panel.suit}</span>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
