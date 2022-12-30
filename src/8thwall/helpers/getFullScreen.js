import * as THREE from 'three'

export function getFullscreenTriangle() {
  const geometry = new THREE.BufferGeometry()
  const vertices = new Float32Array([-1, -1, 3, -1, -1, 3])
  const uvs = new Float32Array([0, 0, 2, 0, 0, 2])

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 2))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

  return geometry
}
