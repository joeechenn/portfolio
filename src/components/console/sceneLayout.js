export const FIRST_BOUNCE_HEIGHT = 0.085

// The stage controls apparent console size; the larger canvas only supplies room
// for the entrance. Never derive the zoom or mobile geometry from canvas bounds.
export const consolePixelsPerUnit = size => Math.min(size.width / 9.05, size.height / (size.width < 600 ? 10.45 : 8.6))

export function consoleCameraFrame(stage, canvas, origin) {
  const zoom = consolePixelsPerUnit(stage)
  return {
    zoom,
    x: (canvas.width / 2 - origin.x - stage.width / 2) / zoom,
    y: (origin.y + stage.height / 2 - canvas.height / 2) / zoom,
  }
}

export function dropDisplacement(fall, stage, origin) {
  const zoom = consolePixelsPerUnit(stage)
  const originalReach = stage.height / zoom / 2 + 4.6
  // Only extend the initial descent. Both rebound peaks (and their entire paths)
  // retain their old distances, with a continuous join near the first landing.
  const extension = Math.max(0, origin.y) / zoom
  const descent = Math.max(0, (fall - FIRST_BOUNCE_HEIGHT) / (1 - FIRST_BOUNCE_HEIGHT))
  return fall * originalReach + descent * extension
}
