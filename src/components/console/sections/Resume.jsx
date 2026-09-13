import { ArrowUpRight } from 'lucide-react'
import { SectionHeading } from './SectionHeading'

export function Resume() {
  return (
    <section className="section-layout resume-section" aria-labelledby="section-heading">
      <SectionHeading>Resume</SectionHeading>
      <div className="resume-action">
        <a className="resume-link" href={`${import.meta.env.BASE_URL}Joe_Chen_Resume.pdf`}
          target="_blank" rel="noopener noreferrer" aria-label="View Resume (PDF, opens in a new tab)">
          View Resume <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
