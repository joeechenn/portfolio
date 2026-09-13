import { Component, Suspense, lazy, useRef } from 'react'
import { motion as Motion } from 'motion/react'
import { TopScreen, SoftwareMenu } from './components/console/Screens'
import { useConsoleControls } from './components/console/useConsoleControls'
import { DotField } from './components/DotField'

const ConsoleScene = lazy(() => import('./components/console/ConsoleScene'))

function FlatScreens({ controls }) {
  return <div className="flat-screens" inert={controls.phase !== 'open'} aria-hidden={controls.phase !== 'open' || undefined} style={{ visibility: controls.phase === 'open' ? 'visible' : 'hidden' }}>
    <TopScreen controls={controls} /><SoftwareMenu controls={controls} />
    <button className="console-toggle" onClick={() => controls.activate('home')}>HOME: return to introduction</button>
  </div>
}

class ConsoleBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  // Without a canvas there is nothing to drop, so release the console immediately.
  componentDidCatch() { this.props.controls.skipIntro() }
  render() { return this.state.failed ? <FlatScreens controls={this.props.controls} /> : this.props.children }
}

export default function App() {
  const controls = useConsoleControls()
  const shadow = useRef(null)
  return (
    <main className="portfolio">
      <DotField onImpact={controls.onImpact} originRef={shadow} reducedMotion={controls.reducedMotion} />
      <Motion.div className="console-stage" style={{ '--open-progress': controls.progress, '--landing': controls.landing }}
        data-console-phase={controls.phase} data-console-intro={controls.intro} aria-label="Joe’s Nintendo 3DS inspired portfolio">
        <div ref={shadow} className="console-shadow" aria-hidden="true" />
        <ConsoleBoundary controls={controls}>
          <Suspense fallback={<FlatScreens controls={controls} />}>
            <ConsoleScene controls={controls} />
          </Suspense>
        </ConsoleBoundary>
        <div className="console-tools">
          <button type="button" className="console-toggle" onClick={controls.toggle} aria-label={controls.isOpen ? 'Close console' : 'Open console'}>
            {controls.isOpen ? 'Close console' : 'Open console'}
          </button>
        </div>
      </Motion.div>
    </main>
  )
}
