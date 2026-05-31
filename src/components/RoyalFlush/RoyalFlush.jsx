import { useEffect, useState } from 'react'
import './RoyalFlush.css'
import AceImg      from '../../assets/ace.png'
import CardbackImg from '../../assets/Cardback.png'
import SpadeImg    from '../../assets/4suits/spade.svg'

// ── Ace 1 portrait photos ────────────────────────────────────────────────────
import Ace1P1 from '../../assets/about/ace1/ring1.jpg'
import Ace1P2 from '../../assets/about/ace1/ring2.jpg'
import Ace1P3 from '../../assets/about/ace1/ring3.jpg'
import Ace1P4 from '../../assets/about/ace1/ring4.jpg'

// ── Per-member portrait photo sets (null = use colour flicker until photos ready) ──
const MEMBER_PHOTOS = [
  [Ace1P1, Ace1P2, Ace1P3, Ace1P4],  // KENNY
  [Ace1P3, Ace1P1, Ace1P4, Ace1P2],  // MEMBER 2 — rotated order
  [Ace1P2, Ace1P4, Ace1P1, Ace1P3],  // MEMBER 3 — rotated order
  [Ace1P4, Ace1P3, Ace1P2, Ace1P1],  // MEMBER 4 — reversed order
  [Ace1P2, Ace1P1, Ace1P4, Ace1P3],  // MEMBER 5 — rotated order
]

// ── Member data (placeholder — swap real names/images later) ─────────────────
const MEMBERS = [
  { name: 'KENNY',    role: 'ACE OF SPADES',   title: 'Creative Director',   skills: ['Direction', 'Vision',    'Strategy'], suit: '♠', isRed: false },
  { name: 'MEMBER 2', role: 'ACE OF HEARTS',   title: 'Experience Designer', skills: ['Design',    'UX',        'Motion'],   suit: '♥', isRed: true  },
  { name: 'MEMBER 3', role: 'ACE OF DIAMONDS', title: 'Full-Stack Engineer', skills: ['Frontend',  'Backend',   'Systems'],  suit: '♦', isRed: true  },
  { name: 'MEMBER 4', role: 'ACE OF CLUBS',    title: 'Hardware Engineer',   skills: ['Embedded',  'Sensors',   'Firmware'], suit: '♣', isRed: false },
  { name: 'MEMBER 5', role: 'THE JOKER',       title: 'Wildcard · Generalist', skills: ['Freestyle', 'Cross-Disc', 'Creative'], suit: '★', isRed: false },
]

// ── Scattered background cards (seeded PRNG — 15×11 grid, fills viewport) ────
const _rnd = (() => {
  let s = 0xdeadbeef >>> 0
  return () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 4294967296 }
})()
const _SUITS = ['♠', '♥', '♦', '♣']
const BG_CARDS = []
for (let row = 0; row < 11; row++) {
  for (let col = 0; col < 15; col++) {
    BG_CARDS.push({
      x:     (-12 + col * 8.5) + (_rnd() - 0.5) * 6,
      y:     (-15 + row * 11.5) + (_rnd() - 0.5) * 8,
      rot:   (_rnd() - 0.5) * 72,
      scale: 0.82 + _rnd() * 0.28,
      isRed: _rnd() > 0.5,
      suit:  _SUITS[Math.floor(_rnd() * 4)],
      z:     Math.floor(_rnd() * 4) + 1,
    })
  }
}

// ── Placeholder flash colours for member card portrait ───────────────────────
const FLASH_FRAMES = ['#12121e', '#0e1820', '#1a1226', '#0a1218', '#1e1422', '#0c1a16']

// ─────────────────────────────────────────────────────────────────────────────
//  MemberCard
// ─────────────────────────────────────────────────────────────────────────────
function MemberCard({ member, index, photos }) {
  const frameCount = photos ? photos.length : FLASH_FRAMES.length
  const [frameIdx, setFrameIdx] = useState(index % frameCount)
  const [hovered,  setHovered]  = useState(false)

  // Static when not hovered; flicker on hover
  useEffect(() => {
    if (!hovered) return
    const id = setInterval(() => setFrameIdx(f => (f + 1) % frameCount), 160)
    return () => clearInterval(id)
  }, [frameCount, hovered])

  return (
    <article
      className={`rf__member${member.isRed ? ' is-red' : ''}${hovered ? ' is-hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Portrait — photo cycling or colour flicker */}
      <div
        className="rf__member-face"
        style={photos ? undefined : { backgroundColor: FLASH_FRAMES[frameIdx] }}
      >
        {photos && (
          <img
            src={photos[frameIdx]}
            className="rf__member-face-img"
            alt=""
            draggable={false}
          />
        )}
        {/* Corner marks inside face so scanlines layer over them */}
        <div className="rf__corner rf__corner--tl" aria-hidden="true">
          <img src={SpadeImg} className="rf__corner-suit" alt="" draggable={false} />
        </div>
        <div className="rf__corner rf__corner--br" aria-hidden="true">
          <img src={SpadeImg} className="rf__corner-suit" alt="" draggable={false} />
        </div>
        <div className="rf__member-face-scanlines" aria-hidden="true" />
      </div>

      {/* Info — slides up on hover */}
      <div className="rf__member-info">
        <p  className="rf__member-role">{member.role}</p>
        <h3 className="rf__member-name">{member.name}</h3>
        <p  className="rf__member-title">{member.title}</p>
        <div className="rf__member-skills">
          {member.skills.map(s => <span key={s} className="rf__member-skill">{s}</span>)}
        </div>
      </div>
    </article>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  RoyalFlush — Scene 4: THE ACE (static layout, transition TBD)
// ─────────────────────────────────────────────────────────────────────────────
export default function RoyalFlush() {
  return (
    <section id="royal-flush" className="rf">
      <div className="rf__sticky">

        {/* Scene watermark */}
        <div className="rf__watermark" aria-hidden="true">
          <p className="rf__wm-scene">SCENE IV</p>
          <h2 className="rf__wm-title">THE ACE</h2>
        </div>

        {/* Scattered face-down background cards */}
        <div className="rf__bg" aria-hidden="true">
          {BG_CARDS.map((c, i) => (
            <div
              key={i}
              className={`rf__bg-card${c.isRed ? ' is-red' : ''}`}
              style={{
                left:      `${c.x}%`,
                top:       `${c.y}%`,
                transform: `rotate(${c.rot}deg) scale(${c.scale})`,
                zIndex:    c.z,
              }}
            >
              <img src={CardbackImg} className="rf__bg-card-img" alt="" draggable={false} />
            </div>
          ))}
        </div>

        {/* Section header */}
        <div className="rf__header">
          <p className="rf__header-eyebrow">SCENE IV &nbsp;·&nbsp; THE ACE</p>
          <h2 className="rf__header-title">THE ROYAL FLUSH.</h2>
          <div className="rf__header-rule" />
        </div>

        {/* 5 face-up member cards */}
        <div className="rf__members">
          {MEMBERS.map((m, i) => (
            <MemberCard key={m.name} member={m} index={i} photos={MEMBER_PHOTOS[i]} />
          ))}
        </div>

        {/* Grain overlay — unifies the scene with film texture */}
        <div className="rf__grain" aria-hidden="true" />

        {/* Footer branding */}
        <footer className="rf__footer">
          <span className="rf__footer-label">ALL ROUND ACE STUDIO</span>
        </footer>

      </div>
    </section>
  )
}
