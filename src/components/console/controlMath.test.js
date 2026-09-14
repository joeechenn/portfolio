import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clampPad, directionForKey, moveSelection, scrollVelocity } from './controlMath.js'
import { Euler, Matrix4, OrthographicCamera, Quaternion, Vector3 } from 'three'
import { createSurfaceProjector } from './surfaceProjection.js'

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
