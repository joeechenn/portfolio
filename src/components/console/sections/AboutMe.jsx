import { useEffect, useRef, useState } from 'react'
import headshot from '../../headshot.jpg'
import friendshot from '../../friendshot.jpg'
import { SectionHeading } from './SectionHeading'

// Order matters: these are listed the way Joe wants them played.
const tracks = ['50mzwHrUSmAlnOnNphNp1W', '0I4CicY6MftmDgdd76LXss', '3heQu7YLQFf0WY4Z2giXhk']

function SpotifySong({ track, index, scrollRef }) {
  const container = useRef(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    if (visible) return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true)
        observer.disconnect()
      }
    }, { root: scrollRef.current, rootMargin: '80px' })
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [visible, scrollRef])
  return (
    <div ref={container} className="about-song">
      <div className="spotify-slot">
        {visible && <iframe
          src={`https://open.spotify.com/embed/track/${track}?utm_source=generator`}
          width="100%" height="80" title={`Spotify song ${index + 1}`}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen />}
      </div>
    </div>
  )
}

export function AboutMe({ controls }) {
  return (
    <section className="section-layout about-me" aria-labelledby="section-heading">
      <SectionHeading>About Me</SectionHeading>
      <figure className="section-photo about-photo">
        <img src={headshot} width="512" height="384" alt="Joe at graduation" />
        <figcaption>Me at my highschool graduation</figcaption>
      </figure>
      <div className="section-prose">
      <p className="about-intro">My name is Joe and I’m currently studying CS, with a minor in Math and concentration in AI at Northeastern University. I’m interested in developing intelligent, multifunctional agents that can learn and interact with the real world.</p>
      <p className="about-aside">like the Androids in <em>Detroit: Become Human</em> (one of my favorite games)</p>
      <p>Last summer, I was an SDE intern at Amazon. Outside of the internship, I frequently ran 5Ks, went on hikes, and got a kitten named Goober (check the <button type="button" className="inline-section-link" onClick={() => controls.activate('pictures')}>Pictures section</button>).</p>
      <p>Right now, I’m taking classes, continuing research at Northeastern’s Visual Intelligence Lab, and doing much cooler stuff (check out the <button type="button" className="inline-section-link" onClick={() => controls.activate('projects')}>Projects section</button>).</p>
      <hr className="section-rule" />
      <figure className="section-photo about-photo">
        <img src={friendshot} width="2592" height="1944" alt="Joe with friends at graduation" />
        <figcaption>Me at my friend’s graduation (on the left)</figcaption>
      </figure>
      <p>I love playing and talking about games like <em>Detroit: Become Human</em>, <em>Equilinox</em> and <em>Pokémon Black and Pokémon White</em>. I enjoy both listening and talking about music and clothes/fashion. Here are some songs I’ve been listening to (and I think you should listen too):</p>
      </div>
      <div className="about-songs" aria-label="Songs I’ve been listening to">
        {tracks.map((track, index) => <SpotifySong key={track} track={track} index={index} scrollRef={controls.scrollRef} />)}
      </div>
    </section>
  )
}
