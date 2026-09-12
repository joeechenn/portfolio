import { Component, Suspense, lazy } from 'react'
import { motion as Motion } from 'motion/react'
import { TopScreen, SoftwareMenu } from './components/console/Screens'
import { useConsoleControls } from './components/console/useConsoleControls'

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
  render() { return this.state.failed ? <FlatScreens controls={this.props.controls} /> : this.props.children }
}

export default function App() {
  const controls = useConsoleControls()
  return (
    <main className="portfolio">
      <Motion.div className="console-stage" style={{ '--open-progress': controls.progress }} data-console-phase={controls.phase} aria-label="Joe’s Nintendo 3DS inspired portfolio">
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
