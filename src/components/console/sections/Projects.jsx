import { ExternalLink, Github } from 'lucide-react'
import { projects } from '../../../data/projects'
import { SectionHeading } from './SectionHeading'

export function Projects() {
  return (
    <section className="section-layout projects-section" aria-labelledby="section-heading">
      <SectionHeading>Projects</SectionHeading>
      <p className="section-lead">What I&rsquo;m building right now. I don&rsquo;t believe a project is ever truly finished; there&rsquo;s always a next step to take.</p>
      <div className="project-list">
        {projects.map(project => (
          <article className="project-card" key={project.id} aria-labelledby={`project-${project.id}`}>
            <div className="project-image">
              <img className="project-image-backdrop" src={`${import.meta.env.BASE_URL}${project.image}`} alt="" aria-hidden="true" />
              <img className="project-image-cover" src={`${import.meta.env.BASE_URL}${project.image}`} alt={`${project.title} preview`} />
            </div>
            <div className="project-details">
              <h2 id={`project-${project.id}`}>{project.title}</h2>
              <p>{project.description}</p>
              <div className="project-links">
                {project.url && <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.title}`}><ExternalLink size={15} aria-hidden="true" />Visit project</a>}
                {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} on GitHub`}><Github size={15} aria-hidden="true" />GitHub</a>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
