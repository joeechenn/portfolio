import { useEffect, useLayoutEffect, useRef } from 'react'
import { motion as Motion } from 'motion/react'
import { software } from './software'
import { DraftSection } from './sections/DraftSection'


export function HomeScreen() {
  return (
    <section className="home-screen" aria-label="Introduction">
      <div className="screen-topline" aria-hidden="true"><span>JOE CHEN</span></div>
      <div className="introduction">
        <h1>Hi, I’m Joe<span className="hello-period">.</span></h1>
        <p className="introduction-subtitle">CS student @<br className="mobile-break" /> Northeastern University</p>
      </div>
      <div className="screen-instructions">
        <p>Choose an icon below to explore.</p>
        <p className="keyboard-hint">Click, or use <kbd>WASD</kbd> / <kbd>↑ ↓ ← →</kbd> + <kbd>Enter</kbd></p>
        <p className="touch-hint">Tap an icon below to explore.</p>
      </div>
    </section>
  )
}

export function SoftwareMenu({ controls }) {
  const tiles = useRef([])
  const highlight = controls?.highlight ?? 0
  useEffect(() => {
    if (controls?.focusMenuRef.current) {
      controls.focusMenuRef.current = false
      tiles.current[highlight]?.focus({ preventScroll: true })
    }
  }, [highlight, controls])
  return (
    <section className="menu-screen" aria-label="Portfolio menu">
      <div className="menu-topline" aria-hidden="true"><span>HOME MENU</span><span className="menu-grid-mark">▦</span></div>
      <div className="software-grid">
        {software.map((item, index) => {
          const { id, label, Icon, color } = item
          return (
          <button key={id} type="button" ref={node => { tiles.current[index] = node }} data-menu-item data-menu-index={index}
            aria-label={label} aria-controls="portfolio-content" aria-current={controls?.activeSection === id ? 'page' : undefined} data-highlighted={index === highlight} tabIndex={index === highlight ? 0 : -1}
            onPointerEnter={() => controls?.select(index)} onFocus={() => controls?.select(index)} onClick={() => controls?.activate(id)}
            className={`software-tile ${index === highlight ? 'software-tile--selected' : ''} ${controls?.activeSection === id ? 'software-tile--active' : ''}`}>
            <div className={`software-art software-art--${color}`}><Icon strokeWidth={1.65} aria-hidden="true" /></div>
            <span className="software-label">{label}</span>
          </button>
          )
        })}
      </div>
    </section>
  )
}

export function TopScreen({ controls }) {
  useLayoutEffect(() => {
    const screen = controls.scrollRef.current
    if (!screen) return
    screen.scrollTop = 0
    if (controls.focusContentRef.current) {
      controls.focusContentRef.current = false
      screen.focus({ preventScroll: true })
    }
  }, [controls.activeSection, controls.contentVersion, controls.scrollRef, controls.focusContentRef])
  return (
    <div ref={controls.scrollRef} id="portfolio-content" className="screen-scroll" data-screen-content
      data-section={controls.activeSection} tabIndex={0} role="region"
      aria-label={controls.activeSection === 'home' ? 'Introduction' : `${software.find(item => item.id === controls.activeSection)?.label} content`}>
      <Motion.div key={`${controls.activeSection}-${controls.contentVersion}`} className="screen-page"
        initial={controls.reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.14 }}>
        {controls.activeSection === 'home' ? <HomeScreen /> : <DraftSection section={controls.activeSection} controls={controls} />}
      </Motion.div>
    </div>
  )
}
