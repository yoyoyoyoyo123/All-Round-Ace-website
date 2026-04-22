import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import logo from '../../assets/logo.png'
import './Loader.css'

export default function Loader({ onComplete }) {
  const loaderRef   = useRef(null)
  const spotRef     = useRef(null)
  const logoRef     = useRef(null)
  const textRef     = useRef(null)
  const subtextRef  = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(loaderRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => {
            if (loaderRef.current) loaderRef.current.style.display = 'none'
            onComplete?.()
          },
        })
      },
    })

    tl
      .set([logoRef.current, textRef.current, subtextRef.current], { opacity: 0 })
      .set(spotRef.current, { opacity: 0 })
      // Spotlight slowly brightens
      .to(spotRef.current, { opacity: 1, duration: 1.8, ease: 'power2.inOut' })
      // Logo rises from below
      .to(logoRef.current, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.6')
      // "王牌入座..." text
      .to(textRef.current, { opacity: 1, letterSpacing: '0.3em', duration: 0.8, ease: 'power2.out' }, '-=0.2')
      // Subtitle
      .to(subtextRef.current, { opacity: 0.5, duration: 0.6, ease: 'power2.out' }, '-=0.2')
      // Hold
      .to({}, { duration: 1.4 })

    return () => tl.kill()
  }, [onComplete])

  return (
    <div ref={loaderRef} className="loader">
      <div ref={spotRef} className="loader__spotlight" />
      <div className="loader__content">
        <img
          ref={logoRef}
          src={logo}
          alt="ARA Studio"
          className="loader__logo"
          style={{ transform: 'translateY(30px)' }}
        />
        <p ref={textRef} className="loader__title">王牌入座</p>
        <p ref={subtextRef} className="loader__subtitle">The Winning Hand</p>
      </div>
    </div>
  )
}
