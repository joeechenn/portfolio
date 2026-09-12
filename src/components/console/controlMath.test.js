import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clampPad, directionForKey, moveSelection, scrollVelocity } from './controlMath.js'

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
