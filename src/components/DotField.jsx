import { useEffect, useRef } from 'react'

const SPACING = 22
const DOT_RADIUS = 1.05
const DOT_COLOR = '#73808f'
const BASE_ALPHA = 0.52
const DRIFT = 3.8
// A ripple is a band of displacement travelling outward at WAVE_SPEED px/s.
const WAVE_SPEED = 820
const WAVE_WIDTH = 150
const WAVE_LIFETIME = 2
const PUSH = 58
// The displacement profile peaks near 0.27 in practice, so swell is measured against
// that rather than against 1 — otherwise the crest only ever lights up a quarter way.
const SWELL_PEAK = 0.27
const SWELL_ALPHA = 0.45
const SWELL_RADIUS = 1.6
// Crest dots are drawn in a handful of brightness buckets so the whole field is still
// only a few fills per frame, however many dots the ripple is touching.
const BUCKETS = 6
// Idle drift is slow enough that half the display rate still looks smooth, and the
// field costs nothing while nothing is happening.
const IDLE_INTERVAL = 1000 / 30

// Deterministic per-cell jitter, so the scatter survives a resize unchanged.
function hash(column, row, salt) {
  const value = Math.sin(column * 12.9898 + row * 78.233 + salt) * 43758.5453
  return value - Math.floor(value)
}

export function DotField({ onImpact, originRef, reducedMotion }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const start = performance.now()
    let dots = []
    let waves = []
    let width = 0
    let height = 0
    let frame = 0
    let lastDraw = 0

    const layout = () => {
      width = window.innerWidth
      height = window.innerHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      dots = []
      for (let column = 0; column <= Math.ceil(width / SPACING); column++) {
        for (let row = 0; row <= Math.ceil(height / SPACING); row++) {
          dots.push({
            x: column * SPACING + (hash(column, row, 0) - 0.5) * SPACING * 0.85,
            y: row * SPACING + (hash(column, row, 17.3) - 0.5) * SPACING * 0.85,
            phase: hash(column, row, 5.1) * Math.PI * 2,
          })
        }
      }
    }

    const draw = (now) => {
      const seconds = (now - start) / 1000
      waves = waves.filter(wave => seconds - wave.time < WAVE_LIFETIME)
      context.clearRect(0, 0, width, height)
      context.fillStyle = DOT_COLOR

      // Resting dots share one path and one fill; dots the ripple is touching go into
      // brightness buckets, so the idle field stays cheap to draw.
      const crest = Array.from({ length: BUCKETS }, () => [])
      context.globalAlpha = BASE_ALPHA
      context.beginPath()
      for (const dot of dots) {
        let x = dot.x
        let y = dot.y
        if (!reducedMotion) {
          x += Math.sin(seconds * 0.62 + dot.phase) * DRIFT
          y += Math.cos(seconds * 0.51 + dot.phase * 1.3) * DRIFT
        }
        let swell = 0
        for (const wave of waves) {
          const age = seconds - wave.time
          const dx = x - wave.x
          const dy = y - wave.y
          const distance = Math.hypot(dx, dy) || 1
          const phase = (distance - age * WAVE_SPEED) / WAVE_WIDTH
          if (phase > 2.4 || phase < -2.4) continue
          // Odd profile: a crest shoving dots outward, trailed by a trough that
          // draws them back, so the field returns to rest as the band passes.
          const profile = -phase * Math.exp(-phase * phase)
          const amount = profile * Math.exp(-age * 1.35) / (1 + distance / 900) * wave.strength
          x += (dx / distance) * amount * PUSH
          y += (dy / distance) * amount * PUSH
          swell += Math.abs(amount)
        }
        if (swell > 0.002) {
          const level = Math.min(swell / SWELL_PEAK, 1)
          crest[Math.min(BUCKETS - 1, Math.floor(level * BUCKETS))].push(x, y)
          continue
        }
        context.moveTo(x + DOT_RADIUS, y)
        context.arc(x, y, DOT_RADIUS, 0, Math.PI * 2)
      }
      context.fill()

      for (let bucket = 0; bucket < BUCKETS; bucket++) {
        const points = crest[bucket]
        if (!points.length) continue
        const level = (bucket + 0.5) / BUCKETS
        const radius = DOT_RADIUS * (1 + level * SWELL_RADIUS)
        context.globalAlpha = BASE_ALPHA + level * SWELL_ALPHA
        context.beginPath()
        for (let index = 0; index < points.length; index += 2) {
          context.moveTo(points[index] + radius, points[index + 1])
          context.arc(points[index], points[index + 1], radius, 0, Math.PI * 2)
        }
        context.fill()
      }
    }

    const tick = (now) => {
      frame = requestAnimationFrame(tick)
      if (!waves.length && now - lastDraw < IDLE_INTERVAL) return
      lastDraw = now
      draw(now)
    }

    const run = () => {
      if (frame || reducedMotion) return
      lastDraw = 0
      frame = requestAnimationFrame(tick)
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    const resize = () => {
      layout()
      draw(performance.now())
    }

    const splash = (strength) => {
      if (reducedMotion) return
      const rect = originRef.current?.getBoundingClientRect()
      waves.push({
        x: rect ? rect.left + rect.width / 2 : width / 2,
        y: rect ? rect.top + rect.height / 2 : height * 0.7,
        time: (performance.now() - start) / 1000,
        strength,
      })
      run()
    }

    const visibility = () => (document.hidden ? stop() : run())

    layout()
    draw(performance.now())
    run()
    const unsubscribe = onImpact(splash)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      stop()
      unsubscribe()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [onImpact, originRef, reducedMotion])

  return <canvas ref={canvasRef} className="dot-field" aria-hidden="true" />
}
