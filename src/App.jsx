import { Component, Suspense, lazy } from 'react'
import { HomeScreen, SoftwareMenu } from './components/console/Screens'

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
  return (
    <main className="portfolio">
      <div className="console-stage" aria-label="Joe’s Nintendo 3DS inspired portfolio">
        <ConsoleBoundary>
          <Suspense fallback={<FlatScreens />}>
            <ConsoleScene fallback={<FlatScreens />} />
          </Suspense>
        </ConsoleBoundary>
      </div>
    </main>
  )
}
