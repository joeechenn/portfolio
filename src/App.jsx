import { Component, Suspense, lazy } from 'react'
import { motion as Motion } from 'motion/react'
import { HomeScreen, SoftwareMenu } from './components/console/Screens'
import { useConsoleControls } from './components/console/useConsoleControls'

const ConsoleScene = lazy(() => import('./components/console/ConsoleScene'))

function FlatScreens() {
  return <div className="flat-screens"><HomeScreen /><SoftwareMenu /></div>
}

class ConsoleBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <FlatScreens /> : this.props.children }
}

export default function App() {
  const controls = useConsoleControls()
  const scrollDemo = import.meta.env.DEV && new URLSearchParams(window.location.search).has('scroll-demo')
  return (
    <main className="portfolio">
      <Motion.div className="console-stage" style={{ '--open-progress': controls.progress }} data-console-phase={controls.phase} aria-label="Joe’s Nintendo 3DS inspired portfolio">
        <ConsoleBoundary>
          <Suspense fallback={<FlatScreens />}>
            <ConsoleScene controls={controls} scrollDemo={scrollDemo} />
          </Suspense>
        </ConsoleBoundary>
        <div className="console-tools">
          <button type="button" className="console-toggle" onClick={controls.toggle} aria-label={controls.isOpen ? 'Close console' : 'Open console'}>
            {controls.isOpen ? 'Close console' : 'Open console'}
          </button>
          {scrollDemo && <span className="scroll-demo-note">Scroll test · drag the Circle Pad</span>}
        </div>
      </Motion.div>
    </main>
  )
}
