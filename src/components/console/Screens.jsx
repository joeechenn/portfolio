import { BriefcaseBusiness, Camera, FileText, Laptop, Mail, UserRound } from 'lucide-react'

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

export function SoftwareMenu() {
  return (
    <section className="menu-screen" aria-label="Portfolio sections — visual draft">
      <div className="menu-topline" aria-hidden="true"><span>HOME MENU</span><span className="menu-grid-mark">▦</span></div>
      <div className="software-grid">
        {software.map((item, index) => {
          const { id, label, Icon, color } = item
          return (
          <div key={id} className={`software-tile ${index === 0 ? 'software-tile--preview' : ''}`}>
            <div className={`software-art software-art--${color}`}><Icon strokeWidth={1.65} aria-hidden="true" /></div>
            <span className="software-label">{label}</span>
          </div>
          )
        })}
      </div>
    </section>
  )
}
