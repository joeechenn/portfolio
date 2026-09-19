import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clampPad, directionForKey, moveSelection, scrollVelocity } from './controlMath.js'
import { Euler, Matrix4, OrthographicCamera, Quaternion, Vector3 } from 'three'
import { createSurfaceProjector } from './surfaceProjection.js'
import { consoleCameraFrame, consolePixelsPerUnit, dropDisplacement, FIRST_BOUNCE_HEIGHT } from './sceneLayout.js'

test('expanding the canvas preserves the stage projection at desktop and mobile sizes', () => {
  for (const [width, height, sw, sh, sx, sy] of [
    [2560, 1440, 1040, 920, 760, 260],
    [3840, 2160, 1040, 920, 1400, 620],
    [1440, 900, 1040, 852, 200, 24],
    [393, 740, 393, 716, 0, 12],
    [740, 728, 692, 680, 24, 24],
  ]) {
    const stage = { width: sw, height: sh }
    const frame = consoleCameraFrame(stage, { width, height }, { x: sx, y: sy })
    const oldZoom = Math.min(sw / 9.05, sh / (sw < 600 ? 10.45 : 8.6))
    assert.equal(frame.zoom, oldZoom)
    for (const [x, y] of [[0, 0], [-4.2, 4.6], [4.2, -4.8], [3.58, -0.66]]) {
      const oldX = sx + sw / 2 + x * oldZoom
      const oldY = sy + sh / 2 - y * oldZoom
      assert.ok(Math.abs(width / 2 + (x - frame.x) * frame.zoom - oldX) < 1e-9)
      assert.ok(Math.abs(height / 2 - (y - frame.y) * frame.zoom - oldY) < 1e-9)
    }
  }
})

test('the initial drop clears the full page while rebound distances stay unchanged', () => {
  for (const [width, height, top] of [[1040, 920, 260], [1040, 920, 620], [1040, 852, 24], [393, 716, 12]]) {
    const stage = { width, height }
    const zoom = consolePixelsPerUnit(stage)
    const oldReach = height / zoom / 2 + 4.6
    for (const fall of [0, 0.021, 0.04, FIRST_BOUNCE_HEIGHT]) {
      assert.equal(dropDisplacement(fall, stage, { y: top }), fall * oldReach)
    }
    assert.ok(Math.abs(dropDisplacement(1, stage, { y: top }) - oldReach - top / zoom) < 1e-9)
    // Conservative bounds of the closed shell, including its initial 7-degree tilt.
    const bottom = -4.9 * Math.cos(7 * Math.PI / 180) - 4.25 * Math.sin(7 * Math.PI / 180)
    const initialBottom = 2.05 + dropDisplacement(1, stage, { y: top }) + bottom
    assert.ok(top + height / 2 - initialBottom * zoom < 0)
  }
})

test('HTML corners and label centers match the 3D projection after resize, tilt, and squash', () => {
  const project = createSurfaceProjector()
  for (const [vw, vh] of [[393, 740], [393, 610], [740, 393], [1040, 920]]) {
    const camera = new OrthographicCamera(-vw / 2, vw / 2, vh / 2, -vh / 2, 0.1, 50)
    camera.position.z = 20
    camera.zoom = Math.min(vw / 9.05, vh / (vw < 600 ? 10.45 : 8.6))
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    for (const squash of [0, 0.8]) {
      const parent = new Matrix4().compose(new Vector3(0, -0.2, 0),
        new Quaternion().setFromEuler(new Euler(-0.21, 0, 0.08)), new Vector3(1 + squash * 0.045, 1 - squash * 0.07, 1))
      for (const [w, h, x, y, z, angle] of [[5.38, 3.37, 0, -2.075, 0.275, 0], [0.28, 0.28, 3.58, -0.66, 0.35, 0], [5.65, 4.16, 0, 2.57, 0.175, 0.436]]) {
        const world = parent.clone().multiply(new Matrix4().compose(new Vector3(x, y, z),
          new Quaternion().setFromEuler(new Euler(angle, 0, 0)), new Vector3(1, 1, 1)))
        const [a, b, c, d, tx, ty] = project(world, camera, { width: vw, height: vh }, w, h, camera.zoom)
        for (const [u, v] of [[0, 0], [1, 0], [0, 1], [1, 1], [0.5, 0.5]]) {
          const expected = new Vector3((u - 0.5) * w, (0.5 - v) * h, 0).applyMatrix4(world).project(camera)
          const px = u * w * camera.zoom, py = v * h * camera.zoom
          assert.ok(Math.abs(a * px + c * py + tx - (expected.x + 1) * vw / 2) < 1e-7)
          assert.ok(Math.abs(b * px + d * py + ty - (1 - expected.y) * vh / 2) < 1e-7)
        }
      }
    }
  }
})

test('WASD and arrows map to the same directions, including uppercase letters', () => {
  for (const [letter, arrow, direction] of [['w', 'ArrowUp', 'up'], ['s', 'ArrowDown', 'down'], ['a', 'ArrowLeft', 'left'], ['d', 'ArrowRight', 'right']]) {
    assert.equal(directionForKey(letter), direction)
    assert.equal(directionForKey(letter.toUpperCase()), direction)
    assert.equal(directionForKey(arrow), direction)
  }
  assert.equal(directionForKey('Enter'), undefined)
})

test('menu navigation stops at every outer edge without wrapping rows', () => {
  for (const index of [0, 1, 2]) assert.equal(moveSelection(index, 'up'), index)
  for (const index of [3, 4, 5]) assert.equal(moveSelection(index, 'down'), index)
  for (const index of [0, 3]) assert.equal(moveSelection(index, 'left'), index)
  for (const index of [2, 5]) assert.equal(moveSelection(index, 'right'), index)
  let index = 0
  for (const direction of ['right', 'down', 'right', 'up', 'left', 'left']) index = moveSelection(index, direction)
  assert.equal(index, 0)
})

test('Circle Pad maintains direction and limits diagonal travel to the disc', () => {
  assert.deepEqual(clampPad(0, 0), { x: 0, y: 0 })
  assert.deepEqual(clampPad(0.2, -0.3), { x: 0.2, y: -0.3 })
  const diagonal = clampPad(2, -2)
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 1) < 1e-10)
  assert.equal(diagonal.x, -diagonal.y)
})

test('scrolling has a neutral zone and bounded, symmetric speed', () => {
  for (const value of [-0.15, 0, 0.15]) assert.equal(scrollVelocity(value), 0)
  assert.equal(scrollVelocity(-1), -420)
  assert.equal(scrollVelocity(1), 420)
  assert.equal(scrollVelocity(10), 420)
  assert.ok(scrollVelocity(0.5) > 0 && scrollVelocity(0.5) < 420)
})
