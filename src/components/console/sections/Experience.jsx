import { experience } from '../../../data/experience'
import { SectionHeading } from './SectionHeading'

export function Experience() {
  return (
    <section className="section-layout experience-section" aria-labelledby="section-heading">
      <SectionHeading>Experience</SectionHeading>
      <div className="experience-list">
        {experience.map(entry => (
          <article className="experience-card" key={entry.id} aria-labelledby={`experience-${entry.id}`}>
            <header className="experience-organization">
              <img src={entry.logo} width="28" height="28" alt="" />
              <div>
                <h2 id={`experience-${entry.id}`}>{entry.organization}</h2>
                {entry.affiliation && <p className="experience-affiliation">{entry.affiliation}</p>}
              </div>
            </header>
            <p className="experience-role">{entry.role}</p>
            <p className="experience-dates">{entry.dates}</p>
            <p className="experience-summary">{entry.summary}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
