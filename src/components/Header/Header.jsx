import './Header.css'

const NAV_ITEMS = [
  { label: 'THE DEAL',       href: '#deal'        },
  { label: 'THE SUITS',      href: '#suits'       },
  { label: 'THE SPREAD',     href: '#spread'      },
  { label: 'ROYAL FLUSH',    href: '#royal-flush' },
  { label: 'ALL IN',         href: '#all-in'      },
]

export default function Header() {
  const handleNav = (e, href) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) target.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="site-header">
      <span className="site-header__studio">ARA STUDIO</span>
      <nav className="site-header__nav">
        {NAV_ITEMS.map(item => (
          <a
            key={item.href}
            href={item.href}
            className="site-header__link"
            onClick={e => handleNav(e, item.href)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
