export const directionForKey = (key) => ({
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
})[key.length === 1 ? key.toLowerCase() : key]

export function moveSelection(index, direction) {
  const row = Math.floor(index / 3), col = index % 3
  if (direction === 'up') return row > 0 ? index - 3 : index
  if (direction === 'down') return row < 1 ? index + 3 : index
  if (direction === 'left') return col > 0 ? index - 1 : index
  if (direction === 'right') return col < 2 ? index + 1 : index
  return index
}

export function clampPad(x, y) {
  const length = Math.max(1, Math.hypot(x, y))
  return { x: x / length, y: y / length }
}

export function scrollVelocity(y) {
  const magnitude = Math.min(1, Math.abs(y))
  return magnitude <= 0.15 ? 0 : Math.sign(y) * ((magnitude - 0.15) / 0.85) * 420
}
