import { software } from '../software'
import { Pictures } from './Pictures'

const blocks = {
  about: ['Biography', 'Education & interests', 'Outside of coding'],
  experience: ['Experience one', 'Experience two', 'Experience three'],
  projects: ['Project one', 'Project two', 'More details'],
  resume: ['Education', 'Experience & projects', 'Skills'],
  contact: ['Email', 'Social links', 'Get in touch'],
}

export function DraftSection({ section, controls }) {
  const label = software.find(item => item.id === section).label
  return (
    <section className={`draft-section ${section === 'pictures' ? 'draft-section--pictures' : ''}`} aria-labelledby="section-heading">
      <header className="section-header"><h1 id="section-heading">{label}</h1><span>Draft</span></header>
      {section === 'pictures' ? <Pictures controls={controls} /> : <>
        <p className="section-summary">{label} content will go here. Scroll to explore this draft.</p>
        {blocks[section].map((title, index) => (
          <article className="draft-card" key={title}>
            <h2>{title}</h2>
            <p>This is placeholder text for {label.toLowerCase()}. The final details and styling will be added in the next checkpoint.</p>
            <p>{index === 2 ? 'You’ve reached the end. Choose another icon below, or press HOME for the introduction.' : 'Keep scrolling with your trackpad, mouse wheel, touch, or Circle Pad. With this screen focused, you can also use the up and down arrows.'}</p>
          </article>
        ))}
      </>}
    </section>
  )
}
