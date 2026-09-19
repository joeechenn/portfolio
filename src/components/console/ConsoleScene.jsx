import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { MathUtils, Plane, Raycaster, Shape, Vector2, Vector3 } from 'three'
import { TopScreen, SoftwareMenu } from './Screens'
import { createSurfaceProjector } from './surfaceProjection'
import { consolePixelsPerUnit as pixelsPerUnit, consoleCameraFrame, dropDisplacement } from './sceneLayout'

const DISPLAY = { top: [5.65, 2.96], bottom: [4.88, 2.72] }
const LayoutContext = createContext(null)
const canvasOrigin = () => [0, 0]

function roundedShape(width, height, radius) {
  const x = -width / 2, y = -height / 2
  const shape = new Shape()
  shape.moveTo(x + radius, y)
  shape.lineTo(x + width - radius, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + radius)
  shape.lineTo(x + width, y + height - radius)
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  shape.lineTo(x + radius, y + height)
  shape.quadraticCurveTo(x, y + height, x, y + height - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)
  return shape
}

function Panel({ width, height, depth = 0.08, radius = 0.12, color = '#17191c', roughness = 0.45, metalness = 0.15, ...props }) {
  const shape = useMemo(() => roundedShape(width, height, radius), [width, height, radius])
  return (
    <mesh {...props}>
      <extrudeGeometry args={[shape, { depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.025, bevelThickness: 0.025, curveSegments: 12 }]} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  )
}

function Disc({ radius, depth = 0.04, color = '#101113', ...props }) {
  return <mesh {...props}><cylinderGeometry args={[radius, radius, depth, 40]} /><meshStandardMaterial color={color} roughness={0.44} metalness={0.18} /></mesh>
}

function HtmlSurface({ width, height, children, active = true, controls, screen, planeHandlers, pointerEvents, ...props }) {
  const { size, invalidate, camera, gl } = useThree()
  const { stage } = useContext(LayoutContext)
  const surface = useRef(null)
  const element = useRef(null)
  const projectSurface = useMemo(createSurfaceProjector, [])
  const ray = useMemo(() => new Raycaster(), [])
  const scale = pixelsPerUnit(stage)
  useFrame(() => {
    if (!surface.current || !element.current) return
    camera.updateMatrixWorld()
    surface.current.updateWorldMatrix(true, false)
    const matrix = projectSurface(surface.current.matrixWorld, camera, size, width, height, scale)
    element.current.style.transform = `matrix(${matrix.join(',')})`
  })
  const pointOnScreen = (event) => {
    const rect = gl.domElement.getBoundingClientRect()
    ray.setFromCamera(new Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera)
    surface.current.updateWorldMatrix(true, false)
    const normal = new Vector3(0, 0, 1).transformDirection(surface.current.matrixWorld)
    const origin = new Vector3().setFromMatrixPosition(surface.current.matrixWorld)
    const point = ray.ray.intersectPlane(new Plane().setFromNormalAndCoplanarPoint(normal, origin), new Vector3())
    if (!point) return { x: 0, y: 0 }
    surface.current.worldToLocal(point)
    return { x: point.x / (width / 2), y: -point.y / (height / 2) }
  }
  return (
    <group ref={surface} {...props}>
      <Html calculatePosition={canvasOrigin} style={{ pointerEvents: pointerEvents ?? (active ? 'auto' : 'none') }}>
        <div ref={node => { element.current = node; if (node) invalidate() }} className="html-surface" data-screen={screen} inert={!active} aria-hidden={!active || undefined}
          style={{ position: 'absolute', top: 0, left: 0, transformOrigin: '0 0', width: width * scale, height: height * scale, visibility: active ? 'visible' : 'hidden' }}
          onClick={event => event.stopPropagation()}
          onPointerDown={event => { event.stopPropagation(); planeHandlers?.down?.(event, pointOnScreen(event)) }}
          onPointerMove={event => {
            event.stopPropagation()
            if (screen && event.pointerType === 'mouse') controls?.track(pointOnScreen(event))
            planeHandlers?.move?.(event, pointOnScreen(event))
          }}
          onPointerLeave={() => { if (screen) controls?.leaveScreen() }}
          onPointerUp={event => { event.stopPropagation(); planeHandlers?.up?.(event) }}
          onPointerCancel={() => planeHandlers?.cancel?.()}
          onLostPointerCapture={() => planeHandlers?.cancel?.()}>
          {children}
        </div>
      </Html>
    </group>
  )
}

function HardwareLabel({ children, width = 0.7, height = 0.18, ...props }) {
  return <HtmlSurface width={width} height={height} pointerEvents="none" {...props}><span className="hardware-label" aria-hidden="true">{children}</span></HtmlSurface>
}

function Camera() {
  const { camera, size, invalidate, gl } = useThree()
  const { stage, origin } = useContext(LayoutContext)
  useLayoutEffect(() => {
    const frame = consoleCameraFrame(stage, size, origin)
    camera.zoom = frame.zoom
    camera.position.set(frame.x, frame.y, 20)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    invalidate()
  }, [camera, size, stage, origin, invalidate])

  // frameloop="demand" means a frame drawn against a stale viewport stays on screen
  // until something asks for another one, while the HTML overlays (screens, button
  // letters) reflow immediately — so the two layers visibly drift apart. Mobile
  // browsers resize late and often: toolbars slide away, fonts land, the device
  // rotates, the tab comes back from the background. R3F handles remeasurement;
  // ask for a repaint on each of those without introducing another zoom source.
  useEffect(() => {
    const canvas = gl.domElement
    const sync = () => {
      // The measured stage is the shared source for zoom and HTML dimensions.
      // A second measurement must never update only the camera's scale.
      invalidate()
    }
    const observer = new ResizeObserver(sync)
    observer.observe(canvas)
    window.addEventListener('orientationchange', sync)
    window.addEventListener('pageshow', sync)
    document.addEventListener('visibilitychange', sync)
    document.fonts?.ready.then(sync).catch(() => {})
    return () => {
      observer.disconnect()
      window.removeEventListener('orientationchange', sync)
      window.removeEventListener('pageshow', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [gl, invalidate])
  return null
}

function Lid({ controls }) {
  const { stage: size } = useContext(LayoutContext)
  const extra = size.width < 600 ? 1.2 : 0
  const lid = useRef(null)
  useFrame(() => {
    const progress = controls.progress.get()
    lid.current.rotation.x = MathUtils.degToRad(180 - 155 * progress)
    lid.current.position.z = 0.68 * (1 - progress)
    lid.current.scale.y = MathUtils.lerp((4 + (size.width < 600 ? 0.65 : 0)) / (4 + extra), 1, progress)
  }, -1)
  return (
    <group name="lid" ref={lid} rotation={[25 * Math.PI / 180, 0, 0]} onClick={event => { event.stopPropagation(); controls.toggle() }}>
      <Panel width={8.28} height={3.88 + extra} radius={0.3} depth={0.18} position={[0, 2.05 + extra / 2, -0.13]} color="#080a0d" />
      <Panel width={8.15} height={3.72 + extra} radius={0.24} depth={0.045} position={[0, 2.05 + extra / 2, 0.065]} color="#202226" roughness={0.28} />
      <Panel width={5.92} height={3.2 + extra} radius={0.06} depth={0.018} position={[0, 1.97 + extra / 2, 0.12]} color="#07080a" />
      <HtmlSurface width={DISPLAY.top[0]} height={DISPLAY.top[1] + extra} position={[0, 1.97 + extra / 2, 0.175]} controls={controls} screen="top" active={controls.phase === 'open'}>
        <TopScreen controls={controls} />
      </HtmlSurface>
      <Panel width={7.98} height={3.58 + extra} radius={0.24} depth={0.02} position={[0, 2.05 + extra / 2, -0.17]} rotation={[Math.PI, 0, 0]} color="#111318" roughness={0.25} />
      {[-0.78, 0.78].map(x => (
        <group key={x}>
          <Disc radius={0.13} depth={0.02} rotation={[Math.PI / 2, 0, 0]} position={[x, 3.56 + extra, -0.23]} color="#353b42" />
          <Disc radius={0.085} depth={0.025} rotation={[Math.PI / 2, 0, 0]} position={[x, 3.56 + extra, -0.248]} color="#050a12" />
        </group>
      ))}
      <Disc radius={0.095} rotation={[Math.PI / 2, 0, 0]} position={[0, 3.77 + extra, 0.14]} color="#080a0e" />
      <Disc radius={0.044} rotation={[Math.PI / 2, 0, 0]} position={[0, 3.77 + extra, 0.168]} color="#18232c" />
      {[-1, 1].map((side) => (
        <group key={side}>
          {[[0, 0], [-0.12, 0], [0.12, 0], [0, 0.12], [0, -0.12], [-0.12, -0.12]].map(([x, y], index) => (
            <Disc key={index} radius={0.028} depth={0.01} rotation={[Math.PI / 2, 0, 0]} position={[side * 3.42 + x, 2.03 + extra / 2 + y, 0.138]} color="#020303" />
          ))}
          <Panel width={0.055} height={0.32} depth={0.015} radius={0.025} position={[side * 3.63, 3.48 + extra, 0.14]} color="#101114" />
        </group>
      ))}
      <HardwareLabel active={controls.phase === 'open'} position={[3.4, 1.22, 0.17]}>3D</HardwareLabel>
      <HardwareLabel active={controls.phase === 'open'} position={[3.4, 0.92, 0.17]}>OFF</HardwareLabel>
      <Panel width={0.065} height={0.36} depth={0.035} radius={0.02} position={[4.14, 1.3, 0.04]} color="#696b70" />
    </group>
  )
}

function PadControl({ controls, x, radius }) {
  return (
    <HtmlSurface width={radius * 2.1} height={radius * 2.1} position={[x, -0.95, 0.43]} active={controls.phase === 'open'}
      planeHandlers={{
        down: (event, point) => {
          if (event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          controls.beginPad(point)
        },
        move: (_, point) => controls.movePad(point),
        up: event => {
          controls.endPad()
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
        },
        cancel: controls.endPad,
      }}>
      <button type="button" className="pad-hitarea" data-scroll-control aria-label="Circle Pad: drag to scroll, or focus and use up and down arrows"
        onBlur={controls.endPad}
        onKeyDown={event => {
          if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
          event.preventDefault()
          event.stopPropagation()
          controls.beginPad({ x: 0, y: event.key === 'ArrowUp' ? -1 : 1 })
        }}
        onKeyUp={event => {
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') controls.endPad()
        }} />
    </HtmlSurface>
  )
}

function DpadControl({ controls, x, scale }) {
  return (
    <HtmlSurface width={1.08 * scale} height={1.08 * scale} position={[x, -2.44, 0.43]} active={controls.phase === 'open'}>
      <div className="dpad-hitarea">
        {['up', 'left', 'right', 'down'].map(direction => (
          <button key={direction} type="button" className={`dpad-direction dpad-direction--${direction}`} data-direction={direction} aria-label={`D-pad ${direction}`}
            onPointerDown={event => {
              if (event.button !== 0) return
              event.stopPropagation()
              event.currentTarget.setPointerCapture(event.pointerId)
              controls.move(direction)
            }}
            onPointerUp={event => {
              controls.releaseDirection()
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
            }}
            onPointerCancel={controls.releaseDirection} onLostPointerCapture={controls.releaseDirection}
            onClick={event => { if (event.detail === 0) controls.pulseDirection(direction) }} />
        ))}
      </div>
    </HtmlSurface>
  )
}

function Base({ controls }) {
  const { stage: size } = useContext(LayoutContext)
  const mobile = size.width < 600
  const extra = mobile ? 0.65 : 0
  const wider = mobile ? 0.5 : 0
  // Keep a visible casing gutter between the screen frame and both control groups.
  const controlX = mobile ? 3.56 : 3.45
  const circleRadius = mobile ? 0.4 : 0.49
  const dpadScale = mobile ? 0.83 : 1
  const faceX = mobile ? 3.58 : 3.48
  const faceSpacing = mobile ? 0.25 : 0.31
  const pad = useRef(null), dpad = useRef(null)
  const { invalidate } = useThree()
  useFrame((_, delta) => {
    pad.current.position.x = controls.padX.get() * 0.15
    pad.current.position.y = -controls.padY.get() * 0.15
    const direction = controls.pressedDirection
    const x = direction === 'up' ? -0.14 : direction === 'down' ? 0.14 : 0
    const y = direction === 'left' ? -0.14 : direction === 'right' ? 0.14 : 0
    const z = direction ? 0.2 : 0.23
    const damp = (current, target) => controls.reducedMotion ? target : MathUtils.damp(current, target, 28, Math.min(delta, 0.05))
    dpad.current.rotation.x = damp(dpad.current.rotation.x, x)
    dpad.current.rotation.y = damp(dpad.current.rotation.y, y)
    dpad.current.position.z = damp(dpad.current.position.z, z)
    if (Math.abs(dpad.current.rotation.x - x) + Math.abs(dpad.current.rotation.y - y) + Math.abs(dpad.current.position.z - z) > 0.0001) invalidate()
  })
  return (
    <group name="base">
      <Panel width={8.4} height={4.05 + extra} depth={0.22} radius={0.36} position={[0, -2.065 - extra / 2, -0.24]} color="#090b0d" />
      <Panel width={8.37} height={3.98 + extra} depth={0.065} radius={0.32} position={[0, -2.035 - extra / 2, 0.015]} color="#3a3c40" roughness={0.48} />
      <Panel width={8.28} height={3.87 + extra} depth={0.05} radius={0.29} position={[0, -1.995 - extra / 2, 0.105]} color="#111317" roughness={0.6} />
      <Panel width={5.23 + wider} height={3.07 + extra} depth={0.04} radius={0.08} position={[0, -1.75 - extra / 2, 0.172]} color="#0c0e10" />
      <Panel width={5.03 + wider} height={2.87 + extra} depth={0.015} radius={0.035} position={[0, -1.75 - extra / 2, 0.23]} color="#45474b" />
      <HtmlSurface width={DISPLAY.bottom[0] + wider} height={DISPLAY.bottom[1] + extra} position={[0, -1.75 - extra / 2, 0.275]} controls={controls} screen="bottom" active={controls.phase === 'open'}><SoftwareMenu controls={controls} /></HtmlSurface>
      <Disc radius={circleRadius} depth={0.07} rotation={[Math.PI / 2, 0, 0]} position={[-controlX, -0.95, 0.22]} color="#090b0e" />
      <group ref={pad}>
      <Disc radius={circleRadius * 0.82} depth={0.09} rotation={[Math.PI / 2, 0, 0]} position={[-controlX, -0.95, 0.31]} color="#95979a" />
      <Disc radius={circleRadius * 0.67} depth={0.025} rotation={[Math.PI / 2, 0, 0]} position={[-controlX, -0.95, 0.37]} color="#b4b6b7" />
      </group>
      <PadControl controls={controls} x={-controlX} radius={circleRadius} />
      <group ref={dpad} position={[-controlX, -2.44, 0.23]}>
      <Panel width={0.3 * dpadScale} height={0.99 * dpadScale} depth={0.09} radius={0.035} position={[0, 0, 0]} color="#111316" />
      <Panel width={0.99 * dpadScale} height={0.3 * dpadScale} depth={0.092} radius={0.035} position={[0, 0, 0]} color="#111316" />
      {[[0, 0.3, 0.015, 0.15], [0, -0.3, 0.015, 0.15], [-0.3, 0, 0.15, 0.015], [0.3, 0, 0.15, 0.015]].map(([x, y, w, h], index) => (
        <Panel key={index} width={w * dpadScale} height={h * dpadScale} depth={0.005} radius={0.005} position={[x * dpadScale, y * dpadScale, 0.115]} color="#62666b" />
      ))}
      </group>
      <DpadControl controls={controls} x={-controlX} scale={dpadScale} />
      {[['X', faceX, -0.66], ['Y', faceX - faceSpacing, -1.05], ['A', faceX + faceSpacing, -1.05], ['B', faceX, -1.45]].map(([label, x, y]) => (
        <group key={label}>
          <Disc radius={mobile ? 0.18 : 0.218} depth={0.05} rotation={[Math.PI / 2, 0, 0]} position={[x, y, 0.24]} color="#0b0d0f" />
          <Disc radius={mobile ? 0.15 : 0.18} depth={0.075} rotation={[Math.PI / 2, 0, 0]} position={[x, y, 0.3]} color="#2f3236" />
          <HardwareLabel active={controls.phase === 'open'} width={0.28} height={0.28} position={[x, y, 0.35]}><span className="face-letter">{label}</span></HardwareLabel>
        </group>
      ))}
      {[['SELECT', -1.68], ['⌂ HOME', 0], ['START', 1.68]].map(([label, x]) => (
        <group key={label}>
          <Panel width={1.35} height={0.28} depth={0.012} radius={0.04} position={[x, -3.58 - extra, 0.18]} color="#1b1d21" />
          {x === 0 ? (
            <HtmlSurface active={controls.phase === 'open'} width={1.35} height={0.28} position={[x, -3.58 - extra, 0.24]}>
              <button type="button" className="home-button" aria-label="HOME: return to introduction" onClick={() => controls.activate('home')}>⌂ HOME</button>
            </HtmlSurface>
          ) : <HardwareLabel active={controls.phase === 'open'} width={1.3} position={[x, -3.58 - extra, 0.23]}>{label}</HardwareLabel>}
        </group>
      ))}
      <Panel width={0.24} height={0.24} depth={0.04} radius={0.05} position={[3.17, -3.17 - extra, 0.2]} color="#15171a" />
      <HardwareLabel active={controls.phase === 'open'} width={0.2} height={0.2} position={[3.17, -3.17 - extra, 0.27]}>⏻</HardwareLabel>
      <HardwareLabel active={controls.phase === 'open'} width={0.7} position={[3.7, -3.17 - extra, 0.23]}>POWER</HardwareLabel>
      <Panel width={0.11} height={0.04} depth={0.01} radius={0.01} position={[3.04, -3.86 - extra, 0.07]} color="#69b7f4" />
      <Panel width={0.08} height={0.04} depth={0.01} radius={0.01} position={[3.32, -3.86 - extra, 0.07]} color="#b5bbbf" />
    </group>
  )
}

function Hardware({ controls }) {
  const { invalidate } = useThree()
  const { stage: size, origin } = useContext(LayoutContext)
  const hardware = useRef(null)
  const { progress, padX, padY, fall, squash, tilt } = controls
  useEffect(() => {
    const subscriptions = [progress, padX, padY, fall, squash, tilt].map(value => value.on('change', invalidate))
    invalidate()
    return () => subscriptions.forEach(unsubscribe => unsubscribe())
  }, [progress, padX, padY, fall, squash, tilt, invalidate])
  useEffect(() => { invalidate() }, [controls.pressedDirection, controls.phase, invalidate])

  // Apply the parent pose before the lid (-1) and HTML projections (0), so
  // WebGL and HTML use the same pose even on the last on-demand frame.
  useFrame(() => {
    const progress = controls.progress.get()
    const mobile = size.width < 600
    const squash = controls.squash.get()
    const scaleY = 1 - squash * 0.07
    // Scaling happens around the hinge at the origin, so shift the group back down by
    // however far the compression would otherwise lift its feet off the ground.
    const feet = -4.1 - (mobile ? 0.65 : 0)
    hardware.current.rotation.x = MathUtils.degToRad(mobile ? -12 : -17) * progress
    hardware.current.rotation.z = MathUtils.degToRad(7) * controls.tilt.get()
    hardware.current.scale.set(1 + squash * 0.045, scaleY, 1)
    hardware.current.position.y = (2.05 + (mobile ? 0.325 : 0)) * (1 - progress) + dropDisplacement(controls.fall.get(), size, origin) + feet * (1 - scaleY)
  }, -2)
  return (
    <group ref={hardware} rotation={[(size.width < 600 ? -12 : -17) * Math.PI / 180, 0, 0]}>
      <Lid controls={controls} />
      <Base controls={controls} />
      <mesh position={[0, 0.03, 0.01]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.19, 0.19, 7.5, 40]} /><meshStandardMaterial color="#35383d" roughness={0.3} metalness={0.55} /></mesh>
      {[-3.88, 3.88].map((x) => <Panel key={x} width={0.58} height={0.39} depth={0.2} radius={0.1} position={[x, 0.02, -0.05]} color="#25282c" />)}
    </group>
  )
}

// The drop must not start until this canvas has actually painted a frame, or it would
// play out of sight behind the Suspense fallback.
function SceneReady({ onReady }) {
  const { invalidate } = useThree()
  useEffect(() => {
    invalidate()
    const frame = requestAnimationFrame(onReady)
    return () => cancelAnimationFrame(frame)
  }, [onReady, invalidate])
  return null
}

export default function ConsoleScene({ controls }) {
  const area = useRef(null)
  const [layout, setLayout] = useState(null)
  useLayoutEffect(() => {
    const stage = area.current.parentElement
    const page = stage.closest('.portfolio')
    const measure = () => {
      const s = stage.getBoundingClientRect()
      const p = page.getBoundingClientRect()
      const next = {
        stage: { width: s.width, height: s.height },
        canvas: { width: p.width, height: p.height },
        origin: { x: s.left - p.left, y: s.top - p.top },
      }
      setLayout(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    observer.observe(page)
    window.addEventListener('resize', measure)
    return () => { observer.disconnect(); window.removeEventListener('resize', measure) }
  }, [])
  return (
    <div ref={area} className="console-render-area" style={layout ? {
      left: -layout.origin.x, top: -layout.origin.y,
      width: layout.canvas.width, height: layout.canvas.height,
    } : undefined}>
      {layout && <LayoutContext.Provider value={layout}>
        <Canvas orthographic camera={{ position: [0, 0, 20], zoom: 90, near: 0.1, far: 50 }} frameloop="demand" dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <Camera />
          <SceneReady onReady={controls.sceneReady} />
          <ambientLight intensity={1.4} />
          <directionalLight position={[-4, 7, 10]} intensity={3} />
          <directionalLight position={[5, -2, 5]} intensity={0.5} />
          <Hardware controls={controls} />
        </Canvas>
      </LayoutContext.Provider>}
    </div>
  )
}
