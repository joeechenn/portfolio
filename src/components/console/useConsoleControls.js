import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, useMotionValue, useReducedMotion } from 'motion/react'
import { clampPad, directionForKey, moveSelection, scrollVelocity } from './controlMath'
import { software } from './software'

export function useConsoleControls() {
  const [isOpen, setIsOpen] = useState(true)
  const [phase, setPhase] = useState('open')
  const [highlight, setHighlight] = useState(0)
  const [activeSection, setActiveSection] = useState('home')
  const [contentVersion, setContentVersion] = useState(0)
  const [gallerySelection, setGallerySelection] = useState(0)
  const focusContentRef = useRef(false)
  const [pressedDirection, setPressedDirection] = useState(null)
  const progress = useMotionValue(1)
  const padX = useMotionValue(0), padY = useMotionValue(0)
  const reducedMotion = useReducedMotion()
  const scrollRef = useRef(null)
  const focusMenuRef = useRef(false)
  const targetOpen = useRef(true)
  const ready = useRef(true)
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

  useEffect(() => {
    const destination = isOpen ? 1 : 0
    const animation = animate(progress, destination, {
      duration: reducedMotion ? 0 : 0.7 * Math.abs(destination - progress.get()),
      ease: [0.4, 0, 0.2, 1],
      onComplete: () => {
        ready.current = isOpen
        setPhase(isOpen ? 'open' : 'closed')
      },
    })
    return () => animation.stop()
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
    beginPad, movePad, endPad, toggle }
}
