import { useRef, useCallback } from 'react'
import gsap from 'gsap'
import './Header.css'

const NAV_ITEMS = [
  { label: 'THE DEAL',    key: 'deal'        },
  { label: 'THE SUITS',   key: 'suits'       },
  { label: 'THE SPREAD',  key: 'spread'      },
  { label: 'ROYAL FLUSH', key: 'royal-flush' },
  { label: 'ALL IN',      key: 'all-in'      },
]

// dir 'rtl' → enters from RIGHT, exits to LEFT → black bg, red text
// dir 'ltr' → enters from LEFT,  exits to RIGHT → red bg,   black text
const NAV_TRANSITION = {
  logo:          { text: 'ALL ROUND ACE',   dir: 'rtl' },
  deal:          { text: 'Deal',            dir: 'ltr' },
  suits:         { text: 'Service & Story', dir: 'rtl' },
  spread:        { text: 'Works',           dir: 'ltr' },
  'royal-flush': { text: 'About',           dir: 'rtl' },
  'all-in':      { text: 'Contact',         dir: 'ltr' },
}

function getScrollTarget(key) {
  const vh = window.innerHeight

  switch (key) {
    case 'deal':
      return 0

    case 'suits': {
      const deal = document.querySelector('#deal')
      if (!deal) return 0
      return deal.getBoundingClientRect().top + window.scrollY + vh * 6.4
    }

    case 'spread': {
      const el = document.querySelector('#spread')
      if (!el) return 0
      return el.getBoundingClientRect().top + window.scrollY + vh * 3.6
    }

    case 'royal-flush': {
      const allIn = document.querySelector('#all-in')
      if (!allIn) return 0
      return allIn.getBoundingClientRect().top + window.scrollY - vh
    }

    case 'all-in': {
      const el = document.querySelector('#all-in')
      if (!el) return 0
      return el.getBoundingClientRect().top + window.scrollY + vh * 2
    }

    default:
      return 0
  }
}

export default function Header() {
  const overlayRef    = useRef(null)
  const textRef       = useRef(null)
  const isAnimating   = useRef(false)

  const triggerTransition = useCallback((key) => {
    if (isAnimating.current) return
    isAnimating.current = true

    const config = NAV_TRANSITION[key]
    if (!config) { isAnimating.current = false; return }

    const { text, dir } = config
    const isRtl  = dir === 'rtl'
    const startX = isRtl ? '100%'  : '-100%'
    const endX   = isRtl ? '-100%' : '100%'

    const overlay = overlayRef.current
    const textEl  = textRef.current

    // Apply text + colours
    textEl.textContent          = text
    overlay.style.background    = isRtl ? '#0A0A0A' : 'var(--color-red)'
    textEl.style.color          = isRtl ? 'var(--color-red)' : '#0A0A0A'

    // Dynamic font-size: reset to CSS default, then shrink if text is wider than viewport.
    // Short texts (Deal, Works…) stay at height-based size; long texts scale down to fit width.
    textEl.style.fontSize = ''
    const maxW   = window.innerWidth * 0.90
    const textW  = textEl.scrollWidth
    if (textW > maxW) {
      const base = parseFloat(getComputedStyle(textEl).fontSize)
      textEl.style.fontSize = `${Math.floor(base * maxW / textW)}px`
    }

    // Snap off-screen, make visible
    gsap.set(overlay, { x: startX, autoAlpha: 1 })

    // ── 1. Fast slide in (dealing a card) ──────────────────
    gsap.to(overlay, {
      x: '0%',
      duration: 0.36,
      ease: 'power3.out',
      onComplete() {
        // ── 2. Instant scroll while screen is covered ───────
        window.scrollTo(0, getScrollTarget(key))

        // ── 3. Dwell → then fast slide out ──────────────────
        gsap.to(overlay, {
          x: endX,
          duration: 0.36,
          ease: 'power3.in',
          delay: 1.2,
          onComplete() {
            gsap.set(overlay, { autoAlpha: 0 })
            isAnimating.current = false
          },
        })
      },
    })
  }, [])

  const handleNav = useCallback((e, key) => {
    e.preventDefault()
    triggerTransition(key)
  }, [triggerTransition])

  const handleLogo = useCallback((e) => {
    e.preventDefault()
    triggerTransition('logo')
  }, [triggerTransition])

  return (
    <>
      {/* ── Full-viewport transition overlay ── */}
      <div ref={overlayRef} className="nt__overlay">
        <span ref={textRef} className="nt__text" />
      </div>

      <header className="site-header">
        <a href="#" className="site-header__studio" onClick={handleLogo}>
          ARA STUDIO
        </a>
        <nav className="site-header__nav">
          {NAV_ITEMS.map(item => (
            <a
              key={item.key}
              href={`#${item.key}`}
              className="site-header__link"
              onClick={e => handleNav(e, item.key)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>
    </>
  )
}
