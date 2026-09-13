import { Github, Instagram, Linkedin } from 'lucide-react'
import { SectionHeading } from './SectionHeading'

const profiles = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/joe-chen-30b568241/', Icon: Linkedin, color: 'blue' },
  { label: 'GitHub', href: 'https://github.com/joeechenn', Icon: Github, color: 'slate' },
  { label: 'Instagram', href: 'https://www.instagram.com/jeoooeo/', Icon: Instagram, color: 'coral' },
]

export function Contact() {
  return (
    <section className="section-layout contact-section" aria-labelledby="section-heading">
      <SectionHeading>Contact</SectionHeading>
      <div className="contact-actions">
        <nav className="contact-grid" aria-label="Social profiles" onKeyDown={event => {
          if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
          const links = [...event.currentTarget.querySelectorAll('a')]
          const index = links.indexOf(event.target)
          if (index < 0) return
          event.preventDefault()
          event.stopPropagation()
          const next = Math.max(0, Math.min(links.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1)))
          links[next].focus({ preventScroll: true })
        }}>
          {profiles.map(profile => {
            const { label, href, Icon, color } = profile
            return (
            <a className="software-tile contact-tile" key={label} href={href} target="_blank" rel="noopener noreferrer"
              aria-label={`${label} (opens in a new tab)`}>
              <div className={`software-art software-art--${color}`}><Icon strokeWidth={1.65} aria-hidden="true" /></div>
              <span className="software-label">{label}</span>
            </a>
            )
          })}
        </nav>
      </div>
    </section>
  )
}
