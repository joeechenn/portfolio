import { Vector3 } from 'three'

// Orthographic projection of a plane is affine: three corners determine the
// entire CSS matrix. Keep coordinates in CSS pixels, independent of canvas DPR.
export function createSurfaceProjector() {
  const corners = [new Vector3(), new Vector3(), new Vector3()]
  const result = new Array(6)
  return (matrixWorld, camera, viewport, width, height, pixelsPerUnit) => {
    corners[0].set(-width / 2, height / 2, 0)
    corners[1].set(width / 2, height / 2, 0)
    corners[2].set(-width / 2, -height / 2, 0)
    for (const corner of corners) {
      corner.applyMatrix4(matrixWorld).project(camera)
      corner.x = (corner.x + 1) * viewport.width / 2
      corner.y = (1 - corner.y) * viewport.height / 2
    }
    const [origin, right, bottom] = corners
    result[0] = (right.x - origin.x) / (width * pixelsPerUnit)
    result[1] = (right.y - origin.y) / (width * pixelsPerUnit)
    result[2] = (bottom.x - origin.x) / (height * pixelsPerUnit)
    result[3] = (bottom.y - origin.y) / (height * pixelsPerUnit)
    result[4] = origin.x
    result[5] = origin.y
    return result
  }
}
