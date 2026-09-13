import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { clampPad, directionForKey, moveSelection, scrollVelocity } from './controlMath'
import { software } from './software'

// The drop is expressed as a fraction of the console's travel rather than in world
// units, because the scene is orthographic and its visible height varies with the
// viewport: 1 is just clear of the top edge, 0 is resting on the ground. The scene
// converts this to world units. The ground shadow tracks the whole descent, so there
// is a landing spot on the stage before the console arrives.
const DROP_HEIGHT = 1
const DROP_DURATION = 0.95
// Beat between the hinge coming to rest and the screens lighting up, so the console
// looks like it settles before it wakes.
const SCREEN_WAKE = 100
// Fractions of DROP_DURATION at which the console meets the ground, and how hard.
const CONTACTS = [[0.5, 1], [0.86, 0.42]]
// Roughly quadratic ease-in, so the descent reads as gravity rather than a UI slide.
const GRAVITY = [0.55, 0, 1, 0.45]

function introState() {
  if (typeof window === 'undefined') return 'done'
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'done' : 'waiting'
}

export function useConsoleControls() {
  // 'waiting' holds the stage empty until the 3D scene reports it can paint, 'dropping'
  // runs the fall, 'done' is the normal interactive console.
  const [intro, setIntro] = useState(introState)
  const introActive = intro !== 'done'
  const [isOpen, setIsOpen] = useState(!introActive)
  const [phase, setPhase] = useState(introActive ? 'closed' : 'open')
  const [highlight, setHighlight] = useState(0)
  const [activeSection, setActiveSection] = useState('home')
  const [contentVersion, setContentVersion] = useState(0)
  const [gallerySelection, setGallerySelection] = useState(0)
  const focusContentRef = useRef(false)
  const [pressedDirection, setPressedDirection] = useState(null)
  const progress = useMotionValue(introActive ? 0 : 1)
  const fall = useMotionValue(introActive ? DROP_HEIGHT : 0)
  const squash = useMotionValue(0)
  const tilt = useMotionValue(introActive ? 1 : 0)
  const landing = useTransform(fall, value => Math.min(Math.max(1 - value, 0), 1))
  const padX = useMotionValue(0), padY = useMotionValue(0)
  const reducedMotion = useReducedMotion()
  const scrollRef = useRef(null)
  const focusMenuRef = useRef(false)
  const targetOpen = useRef(!introActive)
  const ready = useRef(!introActive)
  const introAnimations = useRef([])
  const introTimers = useRef([])
  const impactListeners = useRef(new Set())
  const dragging = useRef(false)
  const dragPoint = useRef({ x: 0, y: 0 })
  const scrollFrame = useRef(0)
  const heldKeys = useRef(new Map())
  const animations = useRef([])
  const releaseTimer = useRef(0)

  const setPad = useCallback((x, y) => {
    const point = clampPad(x, y)
    animations.current.forEach(animation => animation.stop())
    if (reducedMotion) {
      padX.set(point.x)
      padY.set(point.y)
    } else {
      animations.current = [animate(padX, point.x, { duration: 0.12 }), animate(padY, point.y, { duration: 0.12 })]
    }
  }, [padX, padY, reducedMotion])

  const endPad = useCallback(() => {
    dragging.current = false
    dragPoint.current = { x: 0, y: 0 }
    cancelAnimationFrame(scrollFrame.current)
    scrollFrame.current = 0
    setPad(0, 0)
  }, [setPad])

  const stopInput = useCallback(() => {
    heldKeys.current.clear()
    clearTimeout(releaseTimer.current)
    setPressedDirection(null)
    endPad()
  }, [endPad])

  const activate = useCallback((section) => {
    if (!ready.current || (section !== 'home' && !software.some(item => item.id === section))) return
    stopInput()
    focusMenuRef.current = false
    focusContentRef.current = true
    setActiveSection(section)
    setContentVersion(value => value + 1)
    setHighlight(Math.max(0, software.findIndex(item => item.id === section)))
  }, [stopInput])

  const select = useCallback((index) => {
    if (ready.current) setHighlight(index)
  }, [])

  const move = useCallback((direction, focusMenu = false) => {
    if (!ready.current) return
    focusMenuRef.current = focusMenu
    setHighlight(index => moveSelection(index, direction))
    setPressedDirection(direction)
  }, [])

  const releaseDirection = useCallback(() => {
    setPressedDirection([...heldKeys.current.values()].at(-1) ?? null)
  }, [])

  const pulseDirection = useCallback((direction) => {
    move(direction)
    clearTimeout(releaseTimer.current)
    releaseTimer.current = setTimeout(releaseDirection, 140)
  }, [move, releaseDirection])

  const track = useCallback(({ x, y }) => {
    if (ready.current && !dragging.current) setPad(x, y)
  }, [setPad])

  const leaveScreen = useCallback(() => {
    if (!dragging.current) setPad(0, 0)
  }, [setPad])

  const movePad = useCallback((point) => {
    if (!dragging.current) return
    dragPoint.current = clampPad(point.x, point.y)
    setPad(dragPoint.current.x, dragPoint.current.y)
  }, [setPad])

  const beginPad = useCallback((point) => {
    if (!ready.current) return
    cancelAnimationFrame(scrollFrame.current)
    dragging.current = true
    movePad(point)
    let previousTime = performance.now()
    const tick = (now) => {
      if (!dragging.current || !ready.current) return
      const elapsed = Math.min((now - previousTime) / 1000, 0.05)
      previousTime = now
      if (scrollRef.current) scrollRef.current.scrollTop += scrollVelocity(dragPoint.current.y) * elapsed
      scrollFrame.current = requestAnimationFrame(tick)
    }
    scrollFrame.current = requestAnimationFrame(tick)
  }, [movePad])

  const toggle = useCallback(() => {
    targetOpen.current = !targetOpen.current
    ready.current = false
    stopInput()
    setIsOpen(targetOpen.current)
    setPhase(targetOpen.current ? 'opening' : 'closing')
    if (targetOpen.current) {
      setActiveSection('home')
      setContentVersion(value => value + 1)
      focusContentRef.current = false
      setHighlight(0)
      if (scrollRef.current) scrollRef.current.scrollTop = 0
    }
  }, [stopInput])

  // Hand control back to the normal open/close machinery.
  const settle = useCallback(() => {
    targetOpen.current = true
    setIsOpen(true)
    setIntro('done')
  }, [])

  // Lets the background field react to the console hitting the ground without
  // re-rendering the app on every contact.
  const onImpact = useCallback((listener) => {
    impactListeners.current.add(listener)
    return () => impactListeners.current.delete(listener)
  }, [])

  // Cut the intro short and drop straight to the resting pose: either the visitor
  // gave input, or there is no canvas to drop onto.
  const skipIntro = useCallback(() => {
    introAnimations.current.forEach(animation => animation.stop())
    introAnimations.current = []
    introTimers.current.forEach(clearTimeout)
    introTimers.current = []
    fall.set(0)
    squash.set(0)
    tilt.set(0)
    settle()
  }, [fall, squash, tilt, settle])

  // Called once the 3D scene has painted, so the drop never plays behind the fallback.
  const sceneReady = useCallback(() => {
    setIntro(current => (current === 'waiting' ? 'dropping' : current))
  }, [])

  useEffect(() => {
    if (intro !== 'waiting') return
    // The scene signals readiness from a rAF callback, which a hidden tab never runs.
    // Only run the grace period while the page is actually on screen, so a portfolio
    // opened in a background tab still drops when the visitor switches to it.
    let timer = 0
    const arm = () => {
      clearTimeout(timer)
      if (!document.hidden) timer = setTimeout(skipIntro, 1800)
    }
    arm()
    document.addEventListener('visibilitychange', arm)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', arm)
    }
  }, [intro, skipIntro])

  useEffect(() => {
    if (intro !== 'dropping') return
    introAnimations.current = [
      animate(fall, [DROP_HEIGHT, 0, 0.085, 0, 0.021, 0], {
        duration: DROP_DURATION,
        times: [0, 0.5, 0.72, 0.86, 0.94, 1],
        ease: [GRAVITY, 'easeOut', GRAVITY, 'easeOut', GRAVITY],
        onComplete: settle,
      }),
      // Squash spikes on each contact and recovers, giving the shell some mass.
      animate(squash, [0, 0, 1, 0, 0, 0.42, 0], {
        duration: DROP_DURATION,
        times: [0, 0.48, 0.515, 0.62, 0.84, 0.872, 0.94],
        ease: ['linear', 'easeOut', 'easeOut', 'linear', 'easeOut', 'easeOut'],
      }),
      animate(tilt, [1, 0.1, -0.05, 0.02, 0], {
        duration: DROP_DURATION,
        times: [0, 0.5, 0.72, 0.88, 1],
        ease: 'easeOut',
      }),
    ]
    introTimers.current = CONTACTS.map(([at, strength]) => setTimeout(
      () => impactListeners.current.forEach(listener => listener(strength)),
      at * DROP_DURATION * 1000,
    ))
    const animations = introAnimations.current
    const timers = introTimers.current
    return () => {
      animations.forEach(animation => animation.stop())
      timers.forEach(clearTimeout)
    }
  }, [intro, fall, squash, tilt, settle])

  useEffect(() => {
    if (intro === 'done') return
    const skip = () => skipIntro()
    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    window.addEventListener('wheel', skip, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('wheel', skip)
    }
  }, [intro, skipIntro])

  useEffect(() => {
    const destination = isOpen ? 1 : 0
    let wakeTimer = 0
    const animation = animate(progress, destination, {
      duration: reducedMotion ? 0 : 0.7 * Math.abs(destination - progress.get()),
      ease: [0.4, 0, 0.2, 1],
      onComplete: () => {
        const wake = () => {
          ready.current = isOpen
          setPhase(isOpen ? 'open' : 'closed')
        }
        // Only opening gets the pause; closing must blank the screens at once.
        if (isOpen && !reducedMotion) wakeTimer = setTimeout(wake, SCREEN_WAKE)
        else wake()
      },
    })
    return () => {
      animation.stop()
      clearTimeout(wakeTimer)
    }
  }, [isOpen, progress, reducedMotion])

  useEffect(() => {
    const keydown = (event) => {
      if (!ready.current || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return
      if (event.key === 'Enter' && (event.target === document.body || event.target instanceof HTMLCanvasElement)) {
        event.preventDefault()
        activate(software[highlight].id)
        return
      }
      const direction = directionForKey(event.key)
      if (!direction) return
      const target = event.target
      if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"], [data-scroll-control], a')) return
      if (target instanceof Element && target.closest('[data-screen-content]')) {
        // Mirror native vertical scrolling without consuming the key or moving the menu.
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          heldKeys.current.set(event.code || event.key, direction)
          setPressedDirection(direction)
        }
        return
      }
      event.preventDefault()
      heldKeys.current.set(event.code || event.key, direction)
      move(direction, true)
    }
    const keyup = (event) => {
      heldKeys.current.delete(event.code || event.key)
      releaseDirection()
    }
    const visibility = () => { if (document.hidden) stopInput() }
    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    window.addEventListener('blur', stopInput)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
      window.removeEventListener('blur', stopInput)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [move, releaseDirection, stopInput, activate, highlight])

  useEffect(() => () => {
    cancelAnimationFrame(scrollFrame.current)
    clearTimeout(releaseTimer.current)
    animations.current.forEach(animation => animation.stop())
  }, [])

  return { activeSection, contentVersion, activate, focusContentRef, gallerySelection, setGallerySelection, isOpen, phase, highlight, pressedDirection, progress, padX, padY, reducedMotion,
    scrollRef, focusMenuRef, select, move, releaseDirection, pulseDirection, track, leaveScreen,
    beginPad, movePad, endPad, toggle, intro, fall, squash, tilt, landing, sceneReady, skipIntro, onImpact }
}
