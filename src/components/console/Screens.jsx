import { BriefcaseBusiness, Camera, FileText, Laptop, Mail, UserRound } from 'lucide-react'
import { useEffect, useRef } from 'react'

const software = [
  { id: 'about', label: 'About Me', Icon: UserRound, color: 'blue' },
  { id: 'experience', label: 'Experience', Icon: BriefcaseBusiness, color: 'amber' },
  { id: 'projects', label: 'Projects', Icon: Laptop, color: 'mint' },
  { id: 'resume', label: 'Resume', Icon: FileText, color: 'violet' },
  { id: 'contact', label: 'Contact', Icon: Mail, color: 'coral' },
  { id: 'pictures', label: 'Pictures', Icon: Camera, color: 'slate' },
]

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
            aria-label={label} aria-pressed={index === highlight} tabIndex={index === highlight ? 0 : -1}
            onPointerEnter={() => controls?.select(index)} onFocus={() => controls?.select(index)} onClick={() => controls?.select(index)}
            className={`software-tile ${index === highlight ? 'software-tile--selected' : ''}`}>
            <div className={`software-art software-art--${color}`}><Icon strokeWidth={1.65} aria-hidden="true" /></div>
            <span className="software-label">{label}</span>
          </button>
          )
        })}
      </div>
    </section>
  )
}

export function ScrollDemo() {
  return (
    <section className="scroll-demo" aria-label="Hardware scroll test">
      <h2>Circle Pad test</h2>
      <p>Drag the Circle Pad down to scroll. Move it farther from the center to scroll faster.</p>
      <div className="scroll-demo-card"><h3>Release to stop</h3><p>Let go anywhere, even outside the console. The pad returns to center and scrolling stops.</p></div>
      <div className="scroll-demo-card"><h3>Move back up</h3><p>Drag upward to return to the introduction. A mouse wheel, trackpad, or swipe works here too.</p></div>
      <div className="scroll-demo-card"><h3>End of the test</h3><p>This temporary content only appears in the development scroll demo. Portfolio sections arrive in the next checkpoints.</p></div>
    </section>
  )
}
